'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Filter, Download, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { getPersons, deletePerson } from '../services/personService';
import { getAccessLevels } from '../services/accessLevelService';
import { getBranches, BranchHierarchy } from '../services/branchService';
import { Person, AccessLevel } from '../types/api';
import { TableSkeleton } from './Skeleton';

interface UserManagementProps {
  onUserSelect?: (user: Person) => void;
  onUserEdit?: (user: Person) => void;
  onUserDelete?: (user: Person) => void;
  onAddUser?: () => void;
  refreshTrigger?: number; // Prop to trigger refresh from parent
  onUserAdded?: (user: Person) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onAddUser,
  refreshTrigger
}) => {
  const [users, setUsers] = useState<Person[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Person[]>([]);
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [branches, setBranches] = useState<BranchHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCouples, setShowCouples] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [deleteConfirm, setDeleteConfirm] = useState<{ user: Person | null; show: boolean }>({ user: null, show: false });

  const pageSize = 10;

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchUsers(1, true); // Reset to first page on refresh
      fetchAccessLevels(); // Also refresh access levels
      setLastRefresh(Date.now());
    }
  }, [refreshTrigger]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) { // Only auto-refresh if not currently loading
        fetchUsers(currentPage, false);
        setLastRefresh(Date.now());
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentPage, loading]);

  // Fetch users from API
  const fetchUsers = async (page = 1, resetPagination = false) => {
    setLoading(true);
    try {
      const response = await getPersons(page, pageSize);
      setUsers(response);
      setFilteredUsers(response);
      setTotalPages(Math.ceil(response.length / pageSize)); // This should come from API
      if (resetPagination) {
        setCurrentPage(1);
      } else {
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data (used for manual refresh)
  const refreshAllData = async () => {
    await Promise.all([
      fetchUsers(1, true),
      fetchAccessLevels(),
      fetchBranches()
    ]);
    setSelectedUsers(new Set()); // Clear selections on refresh
    setLastRefresh(Date.now());
  };

  // Fetch access levels
  const fetchAccessLevels = async () => {
    try {
      const levels = await getAccessLevels();
      setAccessLevels(levels);
    } catch (error) {
      console.error('Failed to fetch access levels:', error);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const branchData = await getBranches();
      setBranches(branchData);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  // Get access level name by ID
  const getAccessLevelName = (levelId: string) => {
    const level = accessLevels.find(al => al.id === levelId);
    return level ? level.name : levelId;
  };

  // Get branch name by code
  const getBranchName = (deptCode: string) => {
    // Flatten branches for lookup
    const flattenedBranches: BranchHierarchy[] = [];
    const flatten = (branchList: BranchHierarchy[]) => {
      branchList.forEach(branch => {
        flattenedBranches.push(branch);
        if (branch.children) {
          flatten(branch.children);
        }
      });
    };
    flatten(branches);

    const branch = flattenedBranches.find(b => b.code === deptCode);
    return branch ? branch.fullPath : deptCode || 'N/A';
  };

  // Initial data load
  useEffect(() => {
    fetchUsers();
    fetchAccessLevels();
    fetchBranches();
    setLastRefresh(Date.now());
  }, []);

  // Filter users based on search, status, and couple settings
  useEffect(() => {
    let filtered = users;

    // Couple filter - show only principals when showCouples is false
    if (!showCouples) {
      filtered = filtered.filter(user => !user.pin.endsWith('s1'));
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
        user.pin.toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.mobilePhone && user.mobilePhone.toLowerCase().includes(searchLower)) ||
        (user.deptCode && user.deptCode.toLowerCase().includes(searchLower))
      );
    }

    // Status filter (you might need to add status field to Person type)
    // For now, we'll assume all users are active
    if (statusFilter !== 'all') {
      // filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, showCouples]);

  const handleUserSelect = (user: Person, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(user.pin);
    } else {
      newSelected.delete(user.pin);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map(user => user.pin)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const exportUsers = () => {
    const csvContent = [
      ['PIN', 'First Name', 'Last Name', 'Email', 'Phone', 'Department Code', 'Department Name', 'Access Level', 'Card Number', 'Status', 'Type'].join(','),
      ...filteredUsers.map(user => [
        user.pin,
        `"${user.name}"`,
        `"${user.lastName || ''}"`,
        user.email || '',
        user.mobilePhone || '',
        user.deptCode || '',
        `"${getBranchName(user.deptCode || '')}"`,
        user.accLevelIds ? getAccessLevelName(user.accLevelIds) : 'No Access',
        user.cardNo || '',
        'Active',
        user.pin.endsWith('s1') ? 'Spouse' : 'Principal'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  // Delete functions
  const confirmDelete = (user: Person) => {
    setDeleteConfirm({ user, show: true });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ user: null, show: false });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.user) return;

    try {
      await deletePerson(deleteConfirm.user.pin);
      await refreshAllData();
      setDeleteConfirm({ user: null, show: false });
    } catch (error) {
      console.error('Failed to delete user:', error);
      // You might want to show a notification here
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={exportUsers}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button
              onClick={onAddUser}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, PIN, email, phone, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCouples"
                checked={showCouples}
                onChange={(e) => setShowCouples(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="showCouples" className="text-sm text-gray-700 font-medium">
                Show Couples
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={pageSize} columns={6} />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === getCurrentPageUsers().length && getCurrentPageUsers().length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIN
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageUsers().map((user) => (
                <tr key={user.pin} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.pin)}
                      onChange={(e) => handleUserSelect(user, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono text-xs">{user.pin}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          user.pin.endsWith('s1')
                            ? 'bg-gradient-to-br from-pink-400 to-pink-600'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}>
                          <span className="text-xs font-medium text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name} {user.lastName || ''}
                          {user.pin.endsWith('s1') && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              Spouse
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">PIN: {user.pin}</div>
                      </div>
                    </div>
                  </td>
                   <td className="px-4 py-4 whitespace-nowrap">
                     <div className="text-xs text-gray-900">
                       {user.email && (
                         <div className="flex items-center">
                           <span className="text-xs">📧</span>
                           <span className="ml-1 truncate max-w-32" title={user.email}>{user.email}</span>
                         </div>
                       )}
                       {user.mobilePhone && user.mobilePhone.trim() && (
                         <div className="flex items-center mt-0.5">
                           <span className="text-xs">📱</span>
                           <span className="ml-1 text-gray-600">{user.mobilePhone}</span>
                         </div>
                       )}
                       {!user.email && (!user.mobilePhone || !user.mobilePhone.trim()) && (
                         <span className="text-gray-400 text-xs">No contact</span>
                       )}
                     </div>
                   </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium text-xs">{getBranchName(user.deptCode || '')}</div>
                        {user.deptCode && (
                          <div className="text-xs text-gray-500">
                            Code: {user.deptCode}
                          </div>
                        )}
                      </div>
                    </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {user.accLevelIds ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        {getAccessLevelName(user.accLevelIds)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Shield className="w-3 h-3 mr-1" />
                        No Access
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono text-xs">
                      {user.cardNo || <span className="text-gray-400 text-xs">No card</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </td>
                   <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex items-center justify-end space-x-1">
                       <button
                         onClick={() => onUserSelect?.(user)}
                         className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                         title="View Details"
                       >
                         <Users className="w-3 h-3" />
                       </button>
                       <button
                         onClick={() => onUserEdit?.(user)}
                         className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                         title="Edit User"
                       >
                         <Edit className="w-3 h-3" />
                       </button>
                       <button
                         onClick={() => confirmDelete(user)}
                         className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                         title="Delete User"
                       >
                         <Trash2 className="w-3 h-3" />
                       </button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new user.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && deleteConfirm.user && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={cancelDelete}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete User
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{deleteConfirm.user.name} {deleteConfirm.user.lastName || ''}</strong> (PIN: {deleteConfirm.user.pin})?
                  This action cannot be undone and will perform a personnel dismissal.
                </p>
              </div>
              <div className="flex items-center px-4 py-3 space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * pageSize, filteredUsers.length)}</span> of{' '}
                <span className="font-medium">{filteredUsers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 px-4 py-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-blue-700">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Bulk Edit
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                Bulk Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
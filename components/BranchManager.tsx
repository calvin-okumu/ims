'use client';

import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, ChevronRight, ChevronDown, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { getBranches, createBranch, BranchHierarchy, Branch } from '../services/branchService';
import BranchCreator from './BranchCreator';
import { TableSkeleton } from './Skeleton';

interface BranchManagerProps {
  onBranchSelect?: (branch: BranchHierarchy) => void;
  onBranchEdit?: (branch: BranchHierarchy) => void;
  onBranchDelete?: (branch: BranchHierarchy) => void;
}

const BranchManager: React.FC<BranchManagerProps> = ({
  onBranchSelect,
  onBranchEdit,
  onBranchDelete
}) => {
  const [branches, setBranches] = useState<BranchHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [showBranchCreator, setShowBranchCreator] = useState(false);
  const [selectedParentBranch, setSelectedParentBranch] = useState<BranchHierarchy | undefined>();
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await getBranches(true); // Force refresh
      setBranches(data);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (branchCode: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchCode)) {
      newExpanded.delete(branchCode);
    } else {
      newExpanded.add(branchCode);
    }
    setExpandedBranches(newExpanded);
  };

  const handleBranchCreated = async (newBranch: Branch) => {
    setShowBranchCreator(false);
    setSelectedParentBranch(undefined);
    await fetchBranches(); // Refresh the list
  };

  const handleCreateSubBranch = (parentBranch: BranchHierarchy) => {
    setSelectedParentBranch(parentBranch);
    setShowBranchCreator(true);
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderBranchRow = (branch: BranchHierarchy, level = 0) => {
    const isExpanded = expandedBranches.has(branch.code);
    const hasChildren = branch.children && branch.children.length > 0;

    return (
      <React.Fragment key={branch.code}>
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-3 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(branch.code)}
                  className="mr-2 text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}
              <Building className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{branch.name}</span>
            </div>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{branch.code}</span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <span className="text-sm text-gray-900 dark:text-white">{branch.description || 'No description'}</span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              branch.isActive
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {branch.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <span className="text-sm text-gray-500">Level {branch.level}</span>
          </td>
          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end space-x-1">
              <button
                onClick={() => onBranchSelect?.(branch)}
                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                title="View Details"
              >
                <Building className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleCreateSubBranch(branch)}
                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                title="Create Sub-branch"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onBranchEdit?.(branch)}
                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                title="Edit Branch"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => onBranchDelete?.(branch)}
                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                title="Delete Branch"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && hasChildren && branch.children!.map(child => renderBranchRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Branch Management</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </p>
            </div>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
              {branches.length} branches
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchBranches}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={() => setShowBranchCreator(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Root Branch
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search branches by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Branch Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBranches.length > 0 ? (
                filteredBranches.map(branch => renderBranchRow(branch))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No branches found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new branch.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Branch Creator Modal */}
      <BranchCreator
        isOpen={showBranchCreator}
        onClose={() => {
          setShowBranchCreator(false);
          setSelectedParentBranch(undefined);
        }}
        onBranchCreated={handleBranchCreated}
        parentBranch={selectedParentBranch}
      />
    </div>
  );
};

export default BranchManager;
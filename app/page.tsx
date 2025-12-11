'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Fingerprint, DoorOpen, Users, Database, CheckCircle, XCircle, AlertCircle, Shield, Plus, Trash2, MapPin, Clock, Activity, RefreshCw } from 'lucide-react';
import { useAreaBasedDoorSelection } from '../hooks/useAreaBasedDoorSelection';
import { getAccessLevels } from '../services/accessLevelService';
import { getPersons } from '../services/personService';
import { getReaders } from '../services/readerService';
import { AccessLevel, Person, Reader, AccessLog } from '../types/api';
import Notification from '../components/Notification';
import Skeleton from '../components/Skeleton';
import ApiConnectivityTest from '../components/ApiConnectivityTest';
import UserManagement from '../components/UserManagement';
import AddUserModal from '../components/AddUserModal';

// Form interfaces
interface FormData {
  accountNumber: string;
  firstName: string;
  lastName: string;
  userType: 'principal' | 'spouse';
  email: string;
  phone: string;
  cardNo: string;
  gender: 'M' | 'F';
  fingerprintData: {
    template: string;
    quality: number;
    capturedAt: string;
    bioType: number;
    version: string;
    templateNo: string;
  } | null;
  selectedAccessLevel: string;
  selectedDoors: number[];
  fingerIndex: string;
  customFields: {
    occupation: string;
    nationality: string;
    idNumber: string;
    idType: string;
    idExpiry: string;
  };
}

interface AccessLevelForm {
  name: string;
  description: string;
  selectedDoors: number[];
}

export default function BiometricAccessApp() {
  const [activeTab, setActiveTab] = useState('register');
  const [users, setUsers] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning' | 'info' | 'loading'; message: string } | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);

  // Loading states
  const [loading, setLoading] = useState({
    accessLevels: false,
    persons: false,
    readers: false,
    registration: false,
    accessLevelCreation: false
  });

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Refresh triggers
  const [userRefreshTrigger, setUserRefreshTrigger] = useState(0);

  // Use area-based door selection hook
  const {
    areas,
    filteredDoors,
    selectedArea,
    loading: doorsLoading,
    error: doorsError,
    setSelectedArea
  } = useAreaBasedDoorSelection();

  // Form states
  const [formData, setFormData] = useState<FormData>({
    accountNumber: '',
    firstName: '',
    lastName: '',
    userType: 'principal',
    email: '',
    phone: '',
    cardNo: '',
    gender: 'M',
    fingerprintData: null,
    selectedAccessLevel: '',
    selectedDoors: [],
    fingerIndex: '0',
    customFields: {
      occupation: '',
      nationality: '',
      idNumber: '',
      idType: 'Passport',
      idExpiry: ''
    }
  });

  const [accessLevelForm, setAccessLevelForm] = useState<AccessLevelForm>({
    name: '',
    description: '',
    selectedDoors: []
  });

  // Fetch access levels on component mount
  useEffect(() => {
    fetchAccessLevels();
  }, []);

  const fetchAccessLevels = async () => {
    setLoading(prev => ({ ...prev, accessLevels: true }));
    try {
      const levels = await getAccessLevels();
      setAccessLevels(levels);
    } catch (error) {
      console.error('Failed to fetch access levels:', error);
      setNotification({ message: 'Failed to load access levels from API', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, accessLevels: false }));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  // User management handlers
  const handleUserAdded = (newUser: any) => {
    showNotification(`User ${newUser.name} created successfully`, 'success');
    // Trigger refresh of user list
    setUserRefreshTrigger(prev => prev + 1);
  };

  const handleUserSelect = (user: any) => {
    showNotification(`Selected user: ${user.name}`, 'info');
  };

  const handleUserEdit = (user: any) => {
    showNotification(`Edit functionality for ${user.name} - coming soon`, 'info');
  };

  const handleUserDelete = (user: any) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      showNotification(`Delete functionality for ${user.name} - coming soon`, 'warning');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccessLevelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccessLevelForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccessLevelDoorSelection = (doorId: number) => {
    setAccessLevelForm(prev => ({
      ...prev,
      selectedDoors: prev.selectedDoors.includes(doorId)
        ? prev.selectedDoors.filter(id => id !== doorId)
        : [...prev.selectedDoors, doorId]
    }));
  };

  const simulateFingerprintCapture = () => {
    const mockFingerprintData = {
      template: 'mock_fingerprint_template_data_base64_encoded_string',
      quality: 95,
      capturedAt: new Date().toISOString(),
      bioType: 1,
      version: '10.0',
      templateNo: '3'
    };
    setFormData(prev => ({
      ...prev,
      fingerprintData: mockFingerprintData
    }));
    showNotification('Fingerprint captured successfully', 'success');
  };

  const registerUser = async () => {
    setLoading(prev => ({ ...prev, registration: true }));
    // Validation checks with detailed error messages
    const errors = [];
    
    if (!formData.accountNumber.trim()) {
      errors.push('Account number is required');
    } else if (!/^[A-Z]{2}-\d{6}$/.test(formData.accountNumber.trim())) {
      errors.push('Account number must be in format: PB-123456');
    }
    
    if (!formData.firstName.trim()) {
      errors.push('First name is required');
    } else if (formData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    
    if (!formData.lastName.trim()) {
      errors.push('Last name is required');
    } else if (formData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (!formData.fingerprintData) {
      errors.push('Please capture fingerprint before registration');
    }
    
    if (!formData.selectedAccessLevel) {
      errors.push('Please select an access level');
    }

    if (errors.length > 0) {
      showNotification(errors.join('; '), 'error');
      return;
    }

    try {
      // Here you would integrate with your API
      const response = await fetch('/api/person/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          pin: formData.accountNumber,
          email: formData.email,
          gender: formData.gender,
          deptCode: '1'
        })
      });

      if (response.ok) {
        const newUser = {
          id: Date.now(),
          ...formData,
          registeredAt: new Date().toISOString(),
          status: 'active',
          syncStatus: 'success'
        };
        setUsers(prev => [...prev, newUser]);
        showNotification('User registered successfully', 'success');
        
        // Reset form
        setFormData({
          accountNumber: '',
          firstName: '',
          lastName: '',
          userType: 'principal',
          email: '',
          phone: '',
          cardNo: '',
          gender: 'M',
          fingerprintData: null,
          selectedAccessLevel: '',
          selectedDoors: [],
          fingerIndex: '0',
          customFields: {
            occupation: '',
            nationality: '',
            idNumber: '',
            idType: 'Passport',
            idExpiry: ''
          }
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showNotification('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setLoading(prev => ({ ...prev, registration: false }));
    }
  };

  const createAccessLevel = async () => {
    setLoading(prev => ({ ...prev, accessLevelCreation: true }));
    if (!accessLevelForm.name.trim()) {
      showNotification('Access level name is required', 'error');
      return;
    }

    if (!accessLevelForm.description.trim()) {
      showNotification('Access level description is required', 'error');
      return;
    }

    if (accessLevelForm.selectedDoors.length === 0) {
      showNotification('Please select at least one door for this access level', 'error');
      return;
    }

    try {
      // Here you would integrate with your API
      const response = await fetch('/api/accLevel/addLevel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`
        },
        body: JSON.stringify([{
          name: accessLevelForm.name,
          timeSegName: 'General Access'
        }])
      });

      if (response.ok) {
        const newLevel = {
          LevelID: Date.now(),
          Name: accessLevelForm.name,
          Description: accessLevelForm.description,
          DoorIds: accessLevelForm.selectedDoors
        };
        setAccessLevels(prev => [...prev, newLevel]);
        showNotification('Access level created successfully', 'success');
        
        // Reset form
        setAccessLevelForm({
          name: '',
          description: '',
          selectedDoors: []
        });
      } else {
        throw new Error('Failed to create access level');
      }
    } catch (error) {
      console.error('Access level creation error:', error);
      showNotification('Failed to create access level: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setLoading(prev => ({ ...prev, accessLevelCreation: false }));
    }
  };

  const syncWithZKBio = async () => {
    try {
      showNotification('Syncing with ZKBio...', 'info');
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('Sync completed successfully', 'success');
    } catch (error) {
      showNotification('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    }
  };

  const fetchAccessLogs = async (accountNumber: string) => {
    try {
      // Here you would integrate with your API
      const response = await fetch(`/api/transaction/person/${accountNumber}?pageNo=1&pageSize=50`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ZKBIO_API_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAccessLogs(data.data || []);
      } else {
        throw new Error('Failed to fetch access logs');
      }
    } catch (error) {
      console.error('Error fetching access logs:', error);
      showNotification('Failed to fetch access logs', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">ZKBio Security Access Control</h1>
              <p className="text-slate-400 text-sm sm:text-base">Private Banking Customer Management</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setUserRefreshTrigger(prev => prev + 1);
                  fetchAccessLevels();
                  showNotification('Data refreshed from API', 'success');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Refresh Data</span>
                <span className="sm:hidden">Refresh</span>
              </button>
              <button
                onClick={syncWithZKBio}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <Database size={18} />
                <span className="hidden sm:inline">Sync with ZKBio</span>
                <span className="sm:hidden">Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-200' :
            notification.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-200' :
            'bg-blue-900/50 border border-blue-700 text-blue-200'
          }`}>
            {notification.type === 'success' && <CheckCircle size={20} />}
            {notification.type === 'error' && <XCircle size={20} />}
            {notification.type === 'info' && <AlertCircle size={20} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 sm:px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <UserPlus size={18} />
            Register User
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 sm:px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Users size={18} />
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('accessLevels')}
            className={`px-4 sm:px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'accessLevels'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Shield size={18} />
            Access Levels ({accessLevels.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              if (users.length > 0) fetchAccessLogs(users[0].accountNumber);
            }}
            className={`px-4 sm:px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Database size={18} />
            Access Logs
          </button>
          <button
            onClick={() => setActiveTab('api-test')}
            className={`px-4 sm:px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
              activeTab === 'api-test'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Activity size={18} />
            API Test
          </button>
        </div>

        {/* Registration Form */}
        {activeTab === 'register' && (
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Register New User</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  placeholder="PB-123456"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 mb-2 text-sm">User Type *</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                >
                  <option value="principal">Principal Account Holder</option>
                  <option value="spouse">Spouse</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-slate-300 mb-2 text-sm">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm">Card Number</label>
                <input
                  type="text"
                  name="cardNo"
                  value={formData.cardNo}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            {/* Fingerprint Capture */}
            <div className="mb-6 p-4 sm:p-6 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4">Fingerprint Registration (ZKBio)</h3>
              
              <div className="mb-4">
                <label className="block text-slate-300 mb-2 text-sm">Select Finger</label>
                <select
                  name="fingerIndex"
                  value={formData.fingerIndex}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                >
                  <option value="0">Right Thumb</option>
                  <option value="1">Right Index</option>
                  <option value="2">Right Middle</option>
                  <option value="3">Right Ring</option>
                  <option value="4">Right Little</option>
                  <option value="5">Left Thumb</option>
                  <option value="6">Left Index</option>
                  <option value="7">Left Middle</option>
                  <option value="8">Left Ring</option>
                  <option value="9">Left Little</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  {formData.fingerprintData ? (
                    <div className="text-green-400 flex items-center gap-2">
                      <CheckCircle size={24} />
                      <div>
                        <div>Fingerprint captured (Quality: {formData.fingerprintData?.quality || 0}%)</div>
                        <div className="text-sm text-slate-400">Template Version: {formData.fingerprintData?.version || 'N/A'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400">No fingerprint captured</div>
                  )}
                </div>
                <button
                  onClick={simulateFingerprintCapture}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Fingerprint size={20} />
                  Capture Fingerprint
                </button>
              </div>
            </div>

            {/* Access Level Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={20} />
                Select Access Level *
              </h3>
              <select
                name="selectedAccessLevel"
                value={formData.selectedAccessLevel}
                onChange={handleInputChange}
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none mb-4 text-sm sm:text-base"
              >
                <option value="">Choose an access level...</option>
                {accessLevels.map(level => (
                  <option key={level.LevelID || level.Name} value={(level.LevelID || 0).toString()}>
                    {level.Name} - {level.Description}
                  </option>
                ))}
              </select>
              
              {formData.selectedAccessLevel && (
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <h4 className="text-white font-medium mb-3">Door Access Included:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(() => {
                      const selectedLevel = accessLevels.find(level => level.LevelID === parseInt(formData.selectedAccessLevel));
                      return selectedLevel ? selectedLevel.DoorIds?.map(doorId => {
                        const door = filteredDoors.find(d => d.ReaderID === doorId);
                        return (
                          <div key={doorId} className="flex items-center gap-2 text-slate-300">
                            <DoorOpen size={16} className="text-blue-400" />
                            <span>{door?.name || `Door ${doorId}`}</span>
                          </div>
                        );
                      }) : [];
                    })()}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={registerUser}
              disabled={loading.registration}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors text-sm sm:text-base flex items-center justify-center"
            >
              {loading.registration ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </>
              ) : (
                'Register User & Sync to ZKBio'
              )}
            </button>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <UserManagement
            onUserSelect={handleUserSelect}
            onUserEdit={handleUserEdit}
            onUserDelete={handleUserDelete}
            onAddUser={() => setShowAddUserModal(true)}
            refreshTrigger={userRefreshTrigger}
          />
        )}

        {/* Access Levels Management */}
        {activeTab === 'accessLevels' && (
          <div className="space-y-6">
            {/* Create New Access Level */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus size={24} />
                Create New Access Level
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Access Level Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={accessLevelForm.name}
                    onChange={handleAccessLevelInputChange}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    placeholder="e.g., Premium Customer Access"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Description *</label>
                  <input
                    type="text"
                    name="description"
                    value={accessLevelForm.description}
                    onChange={handleAccessLevelInputChange}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                    placeholder="e.g., Access to main areas and VIP lounge"
                  />
                </div>
              </div>

              {/* Door Selection for Access Level */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DoorOpen size={20} />
                  Select Doors for this Access Level *
                </h3>
                
                {/* Area Filter Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Area (Optional)</label>
                  <select
                    value={selectedArea || ''}
                    onChange={(e) => setSelectedArea(e.target.value ? Number(e.target.value) : null)}
                    className="w-full p-2 border border-slate-600 rounded bg-slate-700 text-white text-sm sm:text-base"
                  >
                    <option value="">All Areas</option>
                    {areas.map((area) => (
                      <option key={area.AreaID} value={area.AreaID}>
                        {area.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  {doorsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }, (_, i) => (
                        <Skeleton key={i} variant="rectangular" height="80px" />
                      ))}
                    </div>
                  ) : doorsError ? (
                    <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-800 font-medium">{doorsError}</p>
                    </div>
                  ) : filteredDoors.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-lg">
                      <DoorOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">No doors found for this area</p>
                      <p className="text-slate-500 text-sm mt-2">Try selecting a different area or check if doors are properly configured</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDoors.map(door => {
                        const isSelected = accessLevelForm.selectedDoors.includes(door.ReaderID || 0);
                        return (
                          <label
                            key={door.ReaderID}
                            className={`relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                              isSelected
                                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-lg transform scale-105'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`relative w-5 h-5 rounded border-2 transition-colors ${
                                  isSelected
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-slate-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010-1.414 1.414l-8 8a1 1 0 010-1.414 1.414l8-8a1 1 0 010-1.414 1.414z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold text-sm mb-1 ${
                                  isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-700'
                                }`}>
                                  {door.name}
                                </h4>
                                {door.deviceSn && (
                                  <div className={`text-xs ${
                                    isSelected ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-600'
                                  }`}>
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {door.deviceSn}
                                  </div>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={createAccessLevel}
                disabled={loading.accessLevelCreation}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors text-sm sm:text-base flex items-center justify-center"
              >
                {loading.accessLevelCreation ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Access Level & Sync to ZKBio'
                )}
              </button>
            </div>

            {/* Existing Access Levels */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Existing Access Levels</h2>
              
              {loading.accessLevels ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 animate-pulse">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="h-5 bg-slate-600 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-slate-600 rounded w-2/3"></div>
                        </div>
                        <div className="h-8 w-16 bg-slate-600 rounded"></div>
                      </div>
                      <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : accessLevels.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Shield size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No access levels configured yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accessLevels.map(level => (
                    <div key={level.LevelID} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-lg">{level.Name}</h4>
                          <p className="text-slate-400 text-sm">{level.Description}</p>
                        </div>
                        <button
                          onClick={() => {
                            // Here you would integrate with your API to delete the access level
                            setAccessLevels(prev => prev.filter(l => l.LevelID !== level.LevelID));
                            showNotification('Access level deleted successfully', 'success');
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="text-sm text-slate-400">
                        <p>Associated Doors: {level.DoorIds?.length || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Access Logs */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Access Transaction Logs</h2>
            
            {accessLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <p>No access logs available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accessLogs.map(log => (
                  <div key={log.id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-semibold">{log.eventName}</h4>
                        <p className="text-slate-400 text-sm">{log.doorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">{log.eventTime ? new Date(log.eventTime).toLocaleString() : 'N/A'}</p>
                        <p className="text-slate-400 text-xs">{log.verifyModeName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Test */}
        {activeTab === 'api-test' && (
          <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <ApiConnectivityTest />
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
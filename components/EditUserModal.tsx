import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Hash, Save, Loader2 } from 'lucide-react';
import { updatePerson, getPersons } from '../services/personService';
import { Person } from '../types/api';
import BranchSelect from './BranchSelect';
import BranchCreator from './BranchCreator';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Person | null;
  onUserUpdated: (user: Person) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBranchCreator, setShowBranchCreator] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [spouseData, setSpouseData] = useState<Person | null>(null);
  const [spouseFormData, setSpouseFormData] = useState<Partial<Person>>({
    name: '',
    lastName: '',
    email: '',
    mobilePhone: ''
  });

  const [formData, setFormData] = useState<Partial<Person>>({
    name: '',
    lastName: '',
    email: '',
    mobilePhone: '',
    deptCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Person, string>>>({});

  // Fetch spouse data
  const fetchSpouseData = async (spousePin: string) => {
    try {
      // Try to find spouse in current user list (this is a limitation of the current API)
      // In a real implementation, you'd have a proper API endpoint to fetch related users
      const allUsers = await getPersons(1, 1000); // Fetch all users
      const spouse = allUsers.find(u => u.pin === spousePin);
      return spouse || null;
    } catch (error) {
      console.error('Failed to fetch spouse data:', error);
      return null;
    }
  };

  // Populate form when user changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobilePhone: user.mobilePhone || '',
        deptCode: user.deptCode || ''
      });
      setSelectedBranch(user.deptCode || '');
      setErrors({});

      // Check for spouse data
      const isSpouse = user.pin.endsWith('s1');
      if (isSpouse) {
        // This is a spouse, find the principal
        const principalPin = user.pin.slice(0, -2); // Remove 's1'
        // For now, we'll just reset spouse data since we don't have a way to fetch the principal
        setSpouseData(null);
        setSpouseFormData({
          name: '',
          lastName: '',
          email: '',
          mobilePhone: ''
        });
      } else {
        // This is a principal, check if spouse exists
        const spousePin = `${user.pin}s1`;
        fetchSpouseData(spousePin).then(spouse => {
          setSpouseData(spouse);
          if (spouse) {
            setSpouseFormData({
              name: spouse.name || '',
              lastName: spouse.lastName || '',
              email: spouse.email || '',
              mobilePhone: spouse.mobilePhone || ''
            });
          } else {
            setSpouseFormData({
              name: '',
              lastName: '',
              email: '',
              mobilePhone: ''
            });
          }
        });
      }
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Person, string>> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'First name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Person, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // Update principal user
      await updatePerson(user.pin, formData);

      // Update spouse if spouse data exists
      if (spouseData && spouseFormData.name) {
        await updatePerson(spouseData.pin, spouseFormData);
      }

      onUserUpdated({ ...user, ...formData });
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
      // You might want to show an error notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      lastName: '',
      email: '',
      mobilePhone: '',
      deptCode: ''
    });
    setSelectedBranch('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 overflow-y-auto h-full w-full z-[60] flex items-center justify-center backdrop-blur-[2px] bg-black/10" onClick={handleClose}>
        <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-lg bg-white animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Edit User
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* PIN (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={user?.pin || ''}
                    readOnly
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">PIN cannot be changed</p>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.mobilePhone || ''}
                    onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Branch
                </label>
                <BranchSelect
                  value={selectedBranch}
                  onChange={(value) => {
                    setSelectedBranch(value);
                    handleInputChange('deptCode', value);
                  }}
                  onCreateNew={() => setShowBranchCreator(true)}
                />
              </div>

              {/* Spouse Information (if applicable) */}
              {user && !user.pin.endsWith('s1') && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-pink-600" />
                    Spouse Information
                  </h4>

                  {spouseData ? (
                    <div className="space-y-4">
                      {/* Spouse First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Spouse First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={spouseFormData.name || ''}
                            onChange={(e) => setSpouseFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                            placeholder="Enter spouse first name"
                          />
                        </div>
                      </div>

                      {/* Spouse Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Spouse Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={spouseFormData.lastName || ''}
                            onChange={(e) => setSpouseFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                            placeholder="Enter spouse last name"
                          />
                        </div>
                      </div>

                      {/* Spouse Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Spouse Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="email"
                            value={spouseFormData.email || ''}
                            onChange={(e) => setSpouseFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                            placeholder="Enter spouse email address"
                          />
                        </div>
                      </div>

                      {/* Spouse Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Spouse Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="tel"
                            value={spouseFormData.mobilePhone || ''}
                            onChange={(e) => setSpouseFormData(prev => ({ ...prev, mobilePhone: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900"
                            placeholder="Enter spouse phone number"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No spouse information found</p>
                      <p className="text-xs mt-1">Spouse data will appear here if registered</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-none flex items-center transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Branch Creator Modal */}
      {showBranchCreator && (
        <BranchCreator
          isOpen={showBranchCreator}
          onClose={() => setShowBranchCreator(false)}
          onBranchCreated={(branch) => {
            setSelectedBranch(branch.code);
            handleInputChange('deptCode', branch.code);
            setShowBranchCreator(false);
          }}
        />
      )}
    </>
  );
};

export default EditUserModal;
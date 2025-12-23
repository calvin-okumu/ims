import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Hash, Save, Loader2, Shield, Fingerprint } from 'lucide-react';
import { updatePerson, getPersons } from '../services/personService';
import { getAccessLevels } from '../services/accessLevelService';
import { uploadBiometricTemplate } from '../services/biometricService';
import { Person, AccessLevel } from '../types/api';
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
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('');
  const [fingerprintData, setFingerprintData] = useState<{ template: string; fingerIndex: number } | null>(null);
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
  const [submitError, setSubmitError] = useState<string>('');

  // Helper function to split full name into first and last name
  const splitFullName = (fullName: string) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

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

  // Fetch access levels
  useEffect(() => {
    const fetchAccessLevelsData = async () => {
      try {
        const levels = await getAccessLevels();
        setAccessLevels(levels);
      } catch (error) {
        console.error('Failed to fetch access levels:', error);
      }
    };

    fetchAccessLevelsData();
  }, []);

  // Populate form when user changes
  useEffect(() => {
    if (user && isOpen) {
      const { firstName, lastName } = splitFullName(user.name || '');
      setFormData({
        name: firstName,
        lastName: lastName,
        email: user.email || '',
        mobilePhone: user.mobilePhone || '',
        deptCode: user.deptCode || '',
        accLevelIds: user.accLevelIds || ''
      });
      setSelectedBranch(user.deptCode || '');
      setSelectedAccessLevel(user.accLevelIds || '');
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
            const { firstName, lastName } = splitFullName(spouse.name || '');
            setSpouseFormData({
              name: firstName,
              lastName: lastName,
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
      // Prepare principal data with combined name
      const principalData = {
        ...formData,
        name: `${formData.name?.trim() || ''} ${formData.lastName?.trim() || ''}`.trim()
      };

      // Update principal user
      await updatePerson(user.pin, principalData);

      // Upload fingerprint if provided
      if (fingerprintData?.template && fingerprintData.fingerIndex !== undefined) {
        try {
          await uploadBiometricTemplate(parseInt(user.pin), {
            PersonID: 0,
            Template: fingerprintData.template,
            Type: 1 // Fingerprint
          });
        } catch (fingerprintError) {
          console.warn('Fingerprint upload failed, but user was updated successfully');
        }
      }

      // Update spouse if spouse data exists
      if (spouseData && spouseFormData.name) {
        const spouseUpdateData = {
          ...spouseFormData,
          name: `${spouseFormData.name?.trim() || ''} ${spouseFormData.lastName?.trim() || ''}`.trim(),
          deptCode: principalData.deptCode,
          accLevelIds: principalData.accLevelIds
        };
        await updatePerson(spouseData.pin, spouseUpdateData);
      }

      setSubmitError('');
      onUserUpdated({ ...user, ...principalData });
      onClose();
    } catch (error) {
      console.error('Failed to update user:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update user');
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
    setSubmitError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 overflow-y-auto h-full w-full z-[60] flex items-center justify-center backdrop-blur-[2px] bg-black/10" onClick={handleClose}>
        <div className="relative mx-auto p-8 border w-full max-w-2xl shadow-2xl rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 animate-in zoom-in-95 duration-300 border-blue-200 dark:border-gray-600" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                 <User className="w-6 h-6 mr-3 text-blue-600" />
                 Edit User Profile
               </h3>
               <button
                 onClick={handleClose}
                 className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-2 transition-all duration-200 hover:scale-110"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             {submitError && (
               <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                 <p className="text-red-800 dark:text-red-200 text-sm">{submitError}</p>
               </div>
             )}

             <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {/* PIN (Read-only) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={user?.pin || ''}
                      readOnly
                       className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PIN cannot be changed</p>
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
                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 ${
                       errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'
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
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.mobilePhone || ''}
                      onChange={(e) => handleInputChange('mobilePhone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
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

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Access Level
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={selectedAccessLevel}
                      onChange={(e) => {
                        setSelectedAccessLevel(e.target.value);
                        handleInputChange('accLevelIds', e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
                    >
                      <option value="">Select Access Level</option>
                      {accessLevels.map(level => (
                        <option key={level.id || level.LevelID} value={level.id || level.LevelID}>
                          {level.name || level.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fingerprint */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <label className="col-span-2 block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Fingerprint
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={fingerprintData?.fingerIndex || ''}
                      onChange={(e) => {
                        const fingerIndex = parseInt(e.target.value);
                        setFingerprintData(prev => prev ? { ...prev, fingerIndex } : { template: '', fingerIndex });
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
                    >
                      <option value="">Select Finger</option>
                      <option value="0">Right Thumb</option>
                      <option value="1">Right Index</option>
                      <option value="2">Right Middle</option>
                      <option value="3">Right Ring</option>
                      <option value="4">Right Pinky</option>
                      <option value="5">Left Thumb</option>
                      <option value="6">Left Index</option>
                      <option value="7">Left Middle</option>
                      <option value="8">Left Ring</option>
                      <option value="9">Left Pinky</option>
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={fingerprintData?.template || ''}
                      onChange={(e) => {
                        const template = e.target.value;
                        setFingerprintData(prev => prev ? { ...prev, template } : { template, fingerIndex: 0 });
                      }}
                        className="w-full pl-4 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-xs shadow-sm hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-200"
                      placeholder="Enter fingerprint template (Base64)"
                    />
                  </div>
                  {fingerprintData?.template && (
                    <div className="col-span-2">
                      <p className="text-xs text-green-600 dark:text-green-400">Fingerprint template configured</p>
                    </div>
                  )}
                </div>

                {/* Spouse Information (if applicable) */}
                {user && !user.pin.endsWith('s1') && (
                  <div className="col-span-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-pink-600" />
                      Spouse Information
                    </h4>

                    {spouseData ? (
                      <div className="grid grid-cols-2 gap-4">
                        {/* Spouse First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Spouse First Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              value={spouseFormData.name || ''}
                              onChange={(e) => setSpouseFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="Enter spouse first name"
                            />
                          </div>
                        </div>

                        {/* Spouse Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Spouse Last Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              value={spouseFormData.lastName || ''}
                              onChange={(e) => setSpouseFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="Enter spouse last name"
                            />
                          </div>
                        </div>

                        {/* Spouse Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Spouse Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="email"
                              value={spouseFormData.email || ''}
                              onChange={(e) => setSpouseFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="Enter spouse email address"
                            />
                          </div>
                        </div>

                        {/* Spouse Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Spouse Phone
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="tel"
                              value={spouseFormData.mobilePhone || ''}
                              onChange={(e) => setSpouseFormData(prev => ({ ...prev, mobilePhone: e.target.value }))}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="Enter spouse phone number"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <User className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">No spouse information found</p>
                        <p className="text-xs mt-1">Spouse data will appear here if registered</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="col-span-2 flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                 <button
                   type="button"
                   onClick={handleClose}
                   className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors"
                   disabled={isSubmitting}
                 >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                   className="px-4 py-2.5 bg-blue-600 dark:bg-blue-700 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 dark:disabled:hover:bg-blue-700 disabled:hover:shadow-none flex items-center transition-all"
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
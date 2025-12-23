'use client';

import React, { useState } from 'react';
import { X, Building, Save, Loader2 } from 'lucide-react';
import { createBranch } from '../services/branchService';
import { Branch } from '../types/api';

interface BranchCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onBranchCreated: (branch: Branch) => void;
  parentBranch?: Branch;
}

const BranchCreator: React.FC<BranchCreatorProps> = ({
  isOpen,
  onClose,
  onBranchCreated,
  parentBranch
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Branch code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Branch code must be at least 2 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Branch name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const branchData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentCode: parentBranch?.code
      };

      const newBranch = await createBranch(branchData);
      onBranchCreated(newBranch);

      // Reset form
      setFormData({ code: '', name: '', description: '' });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create branch:', error);
      setErrors({ submit: 'Failed to create branch. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-700">
          <div className="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Building className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Create New Branch
                  </h3>
                  <p className="text-sm text-slate-400">
                    {parentBranch ? `Sub-branch under ${parentBranch.name}` : 'Root level branch'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-1">
                  Branch Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-700 text-white px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.code ? 'border-red-300' : 'border-slate-600'
                  }`}
                  placeholder="e.g., MAIN001"
                />
                {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Branch Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-700 text-white px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-slate-600'
                  }`}
                  placeholder="e.g., Main Branch"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-700 text-white px-3 py-2 border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Optional description..."
                />
              </div>

              {errors.submit && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded p-3">
                  {errors.submit}
                </div>
              )}
            </form>
          </div>

          <div className="bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Branch
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mt-3 w-full inline-flex justify-center px-4 py-2 bg-slate-600 border border-slate-500 rounded-md shadow-sm text-sm font-medium text-white hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:ml-3 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchCreator;
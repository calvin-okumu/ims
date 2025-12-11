'use client';

import { useState } from 'react';
import { createPerson } from '../services/personService';
import { createCard } from '../services/cardService';
import { uploadBiometricTemplate } from '../services/biometricService';
import { PersonCreateRequest, Card, BiometricTemplate } from '../types/api';
import BranchSelect from './BranchSelect';
import BranchCreator from './BranchCreator';
import { User, CreditCard, Fingerprint, Users, Loader2, CheckCircle, XCircle } from 'lucide-react';

const RegistrationForm = () => {
  // Principal fields
  const [principalName, setPrincipalName] = useState('');
  const [principalCardNo, setPrincipalCardNo] = useState('');
  const [principalFingerprint, setPrincipalFingerprint] = useState('');

  // Spouse fields
  const [spouseName, setSpouseName] = useState('');
  const [spouseCardNo, setSpouseCardNo] = useState('');
  const [spouseFingerprint, setSpouseFingerprint] = useState('');

  // Common fields
  const [branchCode, setBranchCode] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBranchCreator, setShowBranchCreator] = useState(false);
  const [registrationType, setRegistrationType] = useState<'single' | 'couple'>('single');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Validate required fields
      if (!branchCode) {
        setMessage('Please select a branch for the registration.');
        return;
      }

      if (!principalName.trim()) {
        setMessage('Please enter the principal name.');
        return;
      }

      if (!userId.trim()) {
        setMessage('Please enter a User ID.');
        return;
      }

      // Generate PIN from User ID
      const principalPin = `USR${userId}`;

      // Create principal person
      const principal: PersonCreateRequest = {
        pin: principalPin,
        name: principalName.trim(),
        deptCode: branchCode
      };
      const principalPerson = await createPerson(principal);

      // Create principal card if provided
      if (principalCardNo.trim()) {
        const principalCard: Omit<Card, 'CardID'> = {
          CardNo: principalCardNo.trim(),
          PersonID: principalPerson.PersonID || 0
        };
        await createCard(principalCard);
      }

      // Upload principal fingerprint if provided
      if (principalFingerprint.trim()) {
        const principalBio: Omit<BiometricTemplate, 'TemplateID'> = {
          PersonID: principalPerson.PersonID || 0,
          Template: principalFingerprint.trim(),
          Type: 1 // Fingerprint
        };
        await uploadBiometricTemplate(principalPerson.PersonID || 0, principalBio);
      }

      // Create spouse if provided
      let spousePerson;
      if (spouseName.trim()) {
        const spousePin = `SP${userId}`;
        const spouse: PersonCreateRequest = {
          pin: spousePin,
          name: spouseName.trim(),
          deptCode: branchCode // Same branch as principal
        };
        spousePerson = await createPerson(spouse);

        // Create spouse card if provided
        if (spouseCardNo.trim()) {
          const spouseCard: Omit<Card, 'CardID'> = {
            CardNo: spouseCardNo.trim(),
            PersonID: spousePerson.PersonID || 0
          };
          await createCard(spouseCard);
        }

        // Upload spouse fingerprint if provided
        if (spouseFingerprint.trim()) {
          const spouseBio: Omit<BiometricTemplate, 'TemplateID'> = {
            PersonID: spousePerson.PersonID || 0,
            Template: spouseFingerprint.trim(),
            Type: 1 // Fingerprint
          };
          await uploadBiometricTemplate(spousePerson.PersonID || 0, spouseBio);
        }
      }

      setMessage(`Registration successful! ${spousePerson ? 'Principal and spouse' : 'Principal'} registered with User ID: ${userId}`);

      // Reset form
      setPrincipalName('');
      setPrincipalCardNo('');
      setPrincipalFingerprint('');
      setSpouseName('');
      setSpouseCardNo('');
      setSpouseFingerprint('');
      setBranchCode('');
      setUserId('');
      setRegistrationType('single');
    } catch (error) {
      setMessage('Registration failed. Check console for details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <User className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">User Registration</h2>
          <p className="text-sm text-slate-400">Register new users with branch assignment and biometric data</p>
        </div>
      </div>

      {/* Registration Type Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="flex items-center text-white">
            <input
              type="radio"
              value="single"
              checked={registrationType === 'single'}
              onChange={(e) => setRegistrationType(e.target.value as 'single' | 'couple')}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <User className="w-4 h-4 mr-1 text-blue-400" />
            Single Registration
          </label>
          <label className="flex items-center text-white">
            <input
              type="radio"
              value="couple"
              checked={registrationType === 'couple'}
              onChange={(e) => setRegistrationType(e.target.value as 'single' | 'couple')}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <Users className="w-4 h-4 mr-1 text-blue-400" />
            Couple Registration
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              User ID <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 001234"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Branch <span className="text-red-400">*</span>
            </label>
            <BranchSelect
              value={branchCode}
              onChange={setBranchCode}
              required={true}
              showCreateOption={true}
              onCreateNew={() => setShowBranchCreator(true)}
            />
          </div>
        </div>

        {/* Principal Information */}
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-400" />
            Principal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Card Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={principalCardNo}
                  onChange={(e) => setPrincipalCardNo(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter card number"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Fingerprint Template
            </label>
            <div className="relative">
              <div className="absolute top-2 left-2 pointer-events-none">
                <Fingerprint className="h-5 w-5 text-slate-400" />
              </div>
              <textarea
                value={principalFingerprint}
                onChange={(e) => setPrincipalFingerprint(e.target.value)}
                rows={3}
                className="block w-full pl-10 pr-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter base64 fingerprint template"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Leave empty to register without fingerprint</p>
          </div>
        </div>

        {/* Spouse Information */}
        {registrationType === 'couple' && (
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Spouse Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={spouseName}
                  onChange={(e) => setSpouseName(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter spouse full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={spouseCardNo}
                    onChange={(e) => setSpouseCardNo(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter spouse card number"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Fingerprint Template
              </label>
              <div className="relative">
                <div className="absolute top-2 left-2 pointer-events-none">
                  <Fingerprint className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  value={spouseFingerprint}
                  onChange={(e) => setSpouseFingerprint(e.target.value)}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter spouse base64 fingerprint template"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Leave empty to register spouse without fingerprint</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-600">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Register {registrationType === 'couple' ? 'Couple' : 'User'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-4 rounded-md ${message.includes('successful') ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
          <div className="flex">
            {message.includes('successful') ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <p className={`ml-3 text-sm font-medium ${message.includes('successful') ? 'text-green-200' : 'text-red-200'}`}>
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Branch Creator Modal */}
      <BranchCreator
        isOpen={showBranchCreator}
        onClose={() => setShowBranchCreator(false)}
        onBranchCreated={(branch) => {
          setBranchCode(branch.code);
          setShowBranchCreator(false);
        }}
      />
    </div>
  );
};

export default RegistrationForm;
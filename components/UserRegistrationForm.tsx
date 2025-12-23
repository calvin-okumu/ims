import React, { useState, useEffect } from 'react';
import { User, Users, Fingerprint, Shield, CheckCircle, AlertCircle, MapPin, Clock, Activity, RefreshCw, X } from 'lucide-react';
import { uploadBiometricTemplate } from '../services/biometricService';
import { fingerprintCaptureManager } from '../services/fingerprintCaptureManager';
import ScannerStatusIndicator from '../components/ScannerStatusIndicator';
import BranchSelect from '../components/BranchSelect';
import { getAccessLevels } from '../services/accessLevelService';
import { AccessLevel } from '../types/api';

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
    // Spouse fields
    spouseFirstName?: string;
    spouseLastName?: string;
    spouseEmail?: string;
    spousePhone?: string;
    spouseFingerprintData?: {
        template: string;
        quality: number;
        capturedAt: string;
        bioType: number;
        version: string;
        templateNo: string;
    } | null;
}

interface UserRegistrationFormProps {
    formData: FormData;
    registrationType: 'single' | 'couple';
    accessLevels: any[];
    onFormDataChange: (data: Partial<FormData>) => void;
    onRegistrationTypeChange: (type: 'single' | 'couple') => void;
    onRegister: () => Promise<void>;
    loading: boolean;
    showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
    formData,
    registrationType,
    accessLevels,
    onFormDataChange,
    onRegistrationTypeChange,
    onRegister,
    loading,
    showNotification
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('customFields.')) {
            const field = name.split('.')[1];
            onFormDataChange({
                customFields: {
                    ...formData.customFields,
                    [field]: value
                }
            });
        } else {
            onFormDataChange({ [name]: value });
        }
    };

    const captureFingerprint = async () => {
        try {
            const fingerprintData = await fingerprintCaptureManager.startCapture(
                parseInt(formData.fingerIndex) || 0
            );

            onFormDataChange({ fingerprintData: fingerprintData });

            showNotification(`Fingerprint captured successfully (Quality: ${fingerprintData.quality}%)`, 'success');
        } catch (error) {
            console.error('Fingerprint capture failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to capture fingerprint';
            showNotification(errorMessage, 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation logic here
        const errors: string[] = [];

        if (!formData.accountNumber.trim()) {
            errors.push('Account number (PIN) is required');
        } else if (formData.accountNumber.length > 15) {
            errors.push('Account number (PIN) must be 15 characters or less');
        }

        if (!formData.firstName.trim()) {
            errors.push('Principal first name is required');
        }

        if (!formData.lastName.trim()) {
            errors.push('Principal last name is required');
        }

        if (!formData.selectedAccessLevel) {
            errors.push('Please select an access level');
        }

        if (!formData.customFields.idNumber) {
            errors.push('Please select a branch');
        }

        if (errors.length > 0) {
            showNotification(errors.join('; '), 'error');
            return;
        }

        await onRegister();
    };

    return (
        <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Register New User</h2>
                <div className="flex items-center space-x-2">
                    <div className="text-xs text-slate-400">Progress:</div>
                    <div className="flex space-x-1">
                        {[
                            formData.accountNumber && formData.firstName && formData.lastName,
                            formData.customFields.idNumber,
                            formData.fingerprintData,
                            formData.selectedAccessLevel
                        ].map((completed, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    completed ? 'bg-green-500' : 'bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Registration Type Selector */}
            <div className="mb-6">
                <div className="flex items-center justify-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            value="single"
                            checked={registrationType === 'single'}
                            onChange={(e) => onRegistrationTypeChange(e.target.value as 'single' | 'couple')}
                            className="sr-only"
                        />
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                            registrationType === 'single'
                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                        }`}>
                            <User className="w-5 h-5" />
                        </div>
                        <span className={`ml-3 font-medium transition-colors ${
                            registrationType === 'single' ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                            Single Registration
                        </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            value="couple"
                            checked={registrationType === 'couple'}
                            onChange={(e) => onRegistrationTypeChange(e.target.value as 'single' | 'couple')}
                            className="sr-only"
                        />
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                            registrationType === 'couple'
                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                        }`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <span className={`ml-3 font-medium transition-colors ${
                            registrationType === 'couple' ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                            Couple Registration
                        </span>
                    </label>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Principal Information */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <User size={20} />
                        Principal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="accountNumber"
                            placeholder="Account Number (PIN) *"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                            required
                        />
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name *"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name *"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                            required
                        />
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

                {/* Branch Selection */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MapPin size={20} />
                        Branch Assignment *
                    </h3>
                    <BranchSelect
                        value={formData.customFields.idNumber}
                        onChange={(value) => onFormDataChange({
                            customFields: { ...formData.customFields, idNumber: value }
                        })}
                    />
                </div>

                {/* Fingerprint Capture */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Fingerprint size={20} />
                        Fingerprint Capture (Optional)
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                        <ScannerStatusIndicator />
                        <select
                            name="fingerIndex"
                            value={formData.fingerIndex}
                            onChange={handleInputChange}
                            className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                        >
                            {Array.from({ length: 10 }, (_, i) => (
                                <option key={i} value={i.toString()}>
                                    Finger {i + 1}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={captureFingerprint}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Capturing...
                                </>
                            ) : (
                                'Capture Fingerprint'
                            )}
                        </button>
                    </div>
                    {formData.fingerprintData && (
                        <div className="text-green-400 flex items-center gap-2">
                            <CheckCircle size={24} />
                            <div>
                                <div>Fingerprint captured (Quality: {formData.fingerprintData.quality}%)</div>
                                <div className="text-sm text-slate-400">Template Version: {formData.fingerprintData.version}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Access Level Selection */}
                <div>
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
                        {accessLevels.map((level, index) => (
                            <option key={level.id || level.LevelID || `level-${index}`} value={level.id || level.LevelID || index + 1}>
                                {level.name || level.Name} - {level.Description}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors text-sm sm:text-base flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Registering...
                        </>
                    ) : (
                        `Register ${registrationType === 'couple' ? 'Couple' : 'User'}`
                    )}
                </button>
            </form>
        </div>
    );
};

export default UserRegistrationForm;
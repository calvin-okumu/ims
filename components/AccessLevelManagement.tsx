import React, { useState } from 'react';
import { Shield, Plus, Trash2, CheckCircle, AlertCircle, DoorOpen, MapPin } from 'lucide-react';
import { createAccessLevel, deleteAccessLevel, getAccessLevels } from '../services/accessLevelService';
import { useAreaBasedDoorSelection } from '../hooks/useAreaBasedDoorSelection';

interface AccessLevelManagementProps {
    accessLevels: any[];
    onAccessLevelsChange: (levels: any[]) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const AccessLevelManagement: React.FC<AccessLevelManagementProps> = ({
    accessLevels,
    onAccessLevelsChange,
    showNotification
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        areas,
        doorsByDevice,
        deviceNames,
        selectedDevice,
        loading: doorsLoading,
        error: doorsError,
        setSelectedDevice
    } = useAreaBasedDoorSelection();

    const [selectedDoors, setSelectedDoors] = useState<number[]>([]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            showNotification('Name and description are required', 'error');
            return;
        }

        setLoading(true);
        try {
            await createAccessLevel({
                name: name.trim(),
                description: description.trim()
            });
            showNotification('Access level created successfully', 'success');
            setName('');
            setDescription('');
            setSelectedDoors([]);

            // Refresh access levels
            const updatedLevels = await getAccessLevels();
            onAccessLevelsChange(updatedLevels);
        } catch (error) {
            showNotification('Failed to create access level', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (levelId: string | number) => {
        try {
            await deleteAccessLevel(Number(levelId));
            showNotification('Access level deleted successfully', 'success');

            // Refresh access levels
            const updatedLevels = await getAccessLevels();
            onAccessLevelsChange(updatedLevels);
        } catch (error) {
            showNotification('Failed to delete access level', 'error');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Create New Access Level */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Access Level</h2>
                </div>

                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Access Level Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                                placeholder="e.g., VIP Access"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
                                placeholder="e.g., Access to main areas and VIP lounge"
                            />
                        </div>
                    </div>

                    {/* Door Selection for Access Level */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <DoorOpen size={20} />
                            Select Doors for this Access Level *
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Device (Optional)</label>
                            <select
                                value={selectedDevice || ''}
                                onChange={(e) => setSelectedDevice(e.target.value || null)}
                                className="w-full p-2 border border-slate-600 rounded bg-slate-700 text-white text-sm sm:text-base"
                            >
                                <option value="">All Devices</option>
                                {Object.keys(doorsByDevice).map((deviceId) => (
                                    <option key={deviceId} value={deviceId}>
                                        {deviceNames[deviceId] || `Device ${deviceId.slice(-4)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {doorsLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 4 }, (_, i) => (
                                        <div key={i} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 animate-pulse">
                                            <div className="h-4 bg-slate-600 rounded mb-2"></div>
                                            <div className="h-3 bg-slate-600 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : doorsError ? (
                                <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                    <p className="text-red-800 font-medium">{doorsError}</p>
                                </div>
                            ) : Object.keys(doorsByDevice).length === 0 ? (
                                <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-lg">
                                    <DoorOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 font-medium">No doors found</p>
                                    <p className="text-slate-500 text-sm mt-2">Check if doors are properly configured in the ZKBio system</p>
                                </div>
                            ) : (
                                Object.entries(doorsByDevice)
                                    .filter(([deviceId]) => !selectedDevice || deviceId === selectedDevice)
                                    .map(([deviceId, doors]) => (
                                        <div key={deviceId} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                                <DoorOpen className="w-5 h-5 mr-2 text-blue-400" />
                                                {deviceNames[deviceId] || `Device ${deviceId.slice(-4)}`} ({doors.length} doors)
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {doors.map((door: any) => {
                                                    const isSelected = selectedDoors.includes(door.id);
                                                    return (
                                                        <label
                                                            key={door.id}
                                                            className={`relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${isSelected
                                                                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-lg transform scale-105'
                                                                    : 'bg-slate-700 border-slate-600 hover:border-blue-300 hover:shadow-md'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className={`relative w-5 h-5 rounded border-2 transition-colors ${isSelected
                                                                            ? 'bg-blue-500 border-blue-500'
                                                                            : 'bg-white border-slate-300'
                                                                        }`}>
                                                                        {isSelected && (
                                                                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010-1.414 1.414l-8 8a1 1 0 010-1.414 1.414l-8-8a1 1 0 010-1.414 1.414l8 8a1 1 0 010-1.414 1.414l-8-8z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-700'}`}>
                                                                        {door.name}
                                                                    </h4>
                                                                    {door.deviceSn && (
                                                                        <div className={`text-xs ${isSelected ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-600'}`}>
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
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors text-sm sm:text-base flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Access Level & Sync to ZKBio'
                        )}
                    </button>
                </form>
            </div>

            {/* Existing Access Levels */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Existing Access Levels</h2>

                {accessLevels.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-lg">
                        <Shield className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No access levels found</p>
                        <p className="text-slate-500 text-sm mt-2">Create your first access level above</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {accessLevels.map((level, index) => (
                            <div key={level.id || level.LevelID || `level-${index}`} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-white font-semibold text-lg">{level.name || level.Name}</h4>
                                        <p className="text-slate-400 text-sm">{level.Description}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const levelId = level.id || level.LevelID;
                                            if (levelId) {
                                                handleDelete(levelId);
                                            }
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
    );
};

export default AccessLevelManagement;
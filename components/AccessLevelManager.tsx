'use client';

import { useState, useEffect } from 'react';
import { getAccessLevels, createAccessLevel, deleteAccessLevel, grantAccess, removeAccess } from '../services/accessLevelService';
import { getPersons } from '../services/personService';
import { getReaders } from '../services/readerService';
import { getAccounts, updateAccount } from '../services/accountService';
import { useAreaBasedDoorSelection } from '../hooks/useAreaBasedDoorSelection';
import { AccessLevel, Person, Reader, Account } from '../types/api';

const AccessLevelManager = () => {
  const [levels, setLevels] = useState<AccessLevel[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedReaders, setSelectedReaders] = useState<number[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Use area-based door selection hook
  const {
    areas,
    doorsByDevice,
    deviceNames,
    filteredDoors,
    selectedDevice,
    loading: doorsLoading,
    error: doorsError,
    setSelectedDevice
  } = useAreaBasedDoorSelection();

  

  const fetchLevels = async () => {
    try {
      const data = await getAccessLevels();
      setLevels(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPersons = async () => {
    try {
      const data = await getPersons();
      setPersons(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReaders = async () => {
    try {
      const data = await getReaders();
      // Readers are handled by the hook, but we can log for debugging
      console.log('Readers fetched:', data.length);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchPersons();
    fetchReaders();
    fetchAccounts();
  }, []);

  const handleLevelSelect = (levelId: number) => {
    setSelectedLevel(levelId);
    setSelectedPerson(null);
    setSelectedReaders([]);
    setSelectedAccount(null);
  };

  const handlePersonSelect = (personId: number) => {
    setSelectedPerson(personId);
    setSelectedReaders([]);
    setSelectedAccount(null);
  };

  const handleReaderSelect = (readerId: number) => {
    setSelectedReaders([readerId]);
  };

  const handleAddReader = () => {
    if (selectedPerson && filteredDoors.length > 0) {
      setSelectedReaders([...selectedReaders, filteredDoors[0].ReaderID || 0]);
    }
  };

  const handleRemoveReader = (readerId: number) => {
    setSelectedReaders(selectedReaders.filter(id => id !== readerId));
  };

  const handleAccountSelect = (accountId: number) => {
    setSelectedAccount(accountId);
  };

  const handleGrantAccess = async () => {
    if (!selectedLevel || !selectedPerson || selectedReaders.length === 0) {
      setMessage('Please select a level, person, and at least one reader');
      return;
    }

    setLoading(true);
    try {
      const person = persons.find(p => p.PersonID === selectedPerson);
      if (person && selectedLevel) {
        await grantAccess([selectedLevel], person.pin);
      }
      setMessage('Access granted successfully');
      // Refresh data
      fetchLevels();
      fetchPersons();
    } catch (error) {
      setMessage('Failed to grant access: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccess = async () => {
    if (!selectedLevel || !selectedPerson) {
      setMessage('Please select a level and person');
      return;
    }

    setLoading(true);
    try {
      const person = persons.find(p => p.PersonID === selectedPerson);
      if (person && selectedLevel) {
        await removeAccess([selectedLevel], person.pin);
      }
      setMessage('Access removed successfully');
      // Refresh data
      fetchLevels();
      fetchPersons();
    } catch (error) {
      setMessage('Failed to remove access: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAccessLevel(id);
      setMessage('Access level deleted!');
      fetchLevels();
    } catch (error) {
      setMessage('Failed to delete.');
      console.error(error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setMessage('Name and description are required');
      return;
    }
    
    try {
      await createAccessLevel({
        name: name,
        description: description
      });
      setMessage('Access level created!');
      setName('');
      setDescription('');
      setSelectedReaders([]);
      fetchLevels();
    } catch (error) {
      setMessage('Failed to create access level.');
      console.error(error);
    }
  };

  const handleGrant = async () => {
    if (!selectedPerson || !selectedLevel) return;
    try {
      const person = persons.find(p => p.PersonID === selectedPerson);
      if (person && selectedLevel) {
        await grantAccess([selectedLevel], person.pin);
      }
      setMessage('Access granted!');
    } catch (error) {
      setMessage('Failed to grant access.');
      console.error(error);
    }
  };

  const handleRemove = async () => {
    if (!selectedPerson || !selectedLevel) return;
    try {
      const person = persons.find(p => p.PersonID === selectedPerson);
      if (person && selectedLevel) {
        await removeAccess([selectedLevel], person.pin);
      }
      setMessage('Access removed!');
    } catch (error) {
      setMessage('Failed to remove access.');
      console.error(error);
    }
  };

  const handleRemoveAccountAccess = async () => {
    if (!selectedAccount) return;
    const account = accounts.find(acc => acc.accountId === selectedAccount);
    if (!account) return;
    try {
      // Find persons by ID and get their PINs
      const principalPerson = persons.find(p => p.PersonID === account.principalPersonId);
      const spousePerson = account.spousePersonId ? persons.find(p => p.PersonID === account.spousePersonId) : null;

      // Remove access for principal
      if (principalPerson) {
        await removeAccess([account.accessLevelId], principalPerson.pin);
      }
      // Remove access for spouse if exists
      if (spousePerson) {
        await removeAccess([account.accessLevelId], spousePerson.pin);
      }
      // Update account status to inactive
      await updateAccount(account.accountId, { status: 'inactive' });
      setMessage('Account access removed and status set to inactive!');
      fetchAccounts();
    } catch (error) {
      setMessage('Failed to remove account access.');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Access Level Management</h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="border p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold">Create Access Level</h3>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Device (Optional)</label>
          <select
            value={selectedDevice || ''}
            onChange={(e) => setSelectedDevice(e.target.value || null)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">All Devices</option>
            {Object.keys(doorsByDevice).map((deviceId) => (
              <option key={deviceId} value={deviceId}>
                {deviceNames[deviceId] || `Device ${deviceId.slice(-4)}`}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium mb-2">Assign Doors</label>
          {doorsLoading ? (
            <p>Loading doors...</p>
          ) : doorsError ? (
            <p className="text-red-500">{doorsError}</p>
          ) : (
            Object.entries(doorsByDevice)
              .filter(([deviceId]) => !selectedDevice || deviceId === selectedDevice)
              .map(([deviceId, doors]) => (
                <div key={deviceId} className="mb-4 p-3 border rounded">
                  <h4 className="font-medium mb-2">
                    {deviceNames[deviceId] || `Device ${deviceId.slice(-4)}`} ({doors.length} doors)
                  </h4>
                  <div className="space-y-1">
                    {doors.map(door => (
                      <label key={door.id} className="block">
                        <input
                          type="checkbox"
                          checked={selectedReaders.includes(door.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedReaders([...selectedReaders, door.id]);
                            } else {
                              setSelectedReaders(selectedReaders.filter(id => id !== door.id));
                            }
                          }}
                        />
                        {door.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      </form>

      {/* List */}
      <div className="border p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Access Levels</h3>
        <ul className="space-y-2">
          {levels.map((level, index) => {
            const levelId = level.id || level.LevelID;
            return (
              <li key={`level-${levelId || index}`} className="flex justify-between items-center border p-2 rounded">
                <div>
                  <p><strong>{level.name || level.Name}</strong></p>
                  <p>{level.Description}</p>
                </div>
                <button
                  onClick={() => levelId && handleDelete(Number(levelId))}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Grant/Remove Access */}
      <div className="border p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold">Grant/Remove Access (Individual)</h3>
        <select
          value={selectedPerson || ''}
          onChange={(e) => setSelectedPerson(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Person</option>
          {persons.map((person) => (
            <option key={person.PersonID} value={person.PersonID}>
              {person.name}
            </option>
          ))}
        </select>
        <select
          value={selectedLevel || ''}
          onChange={(e) => setSelectedLevel(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Access Level</option>
          {levels.map((level, index) => {
            const levelId = level.id || level.LevelID;
            return (
              <option key={`level-${levelId || index}`} value={levelId}>
                {level.name || level.Name}
              </option>
            );
          })}
        </select>
        <div className="flex space-x-2">
          <button
            onClick={handleGrant}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Grant Access
          </button>
          <button
            onClick={handleRemove}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Remove Access
          </button>
        </div>
      </div>

      {/* Remove Account Access */}
      <div className="border p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold">Remove Access for Account (Principal & Spouse)</h3>
        <select
          value={selectedAccount || ''}
          onChange={(e) => setSelectedAccount(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Account</option>
          {accounts.filter(acc => acc.status === 'active').map((account) => (
            <option key={account.accountId} value={account.accountId}>
              {account.clientName} - {account.accountNumber}
            </option>
          ))}
        </select>
        <button
          onClick={handleRemoveAccountAccess}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Remove Account Access
        </button>
      </div>

      {message && <p className="text-center text-green-600">{message}</p>}
    </div>
  );
};

export default AccessLevelManager;
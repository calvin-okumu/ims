'use client';

import { useState } from 'react';
import { createPerson } from '../services/personService';
import { createCard } from '../services/cardService';
import { uploadBiometricTemplate } from '../services/biometricService';
import { createAccount } from '../services/accountService';
import { grantAccess } from '../services/accessLevelService';
import { Person, PersonCreateRequest, Card, BiometricTemplate, Account } from '../types/api';
// import { v4 as uuidv4 } from 'uuid'; // Replaced with simple ID

// Note: Install uuid for accountId: npm install uuid @types/uuid

const AccountRegistrationForm = () => {
  const [principalName, setPrincipalName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [principalFingerprint, setPrincipalFingerprint] = useState('');
  const [spouseFingerprint, setSpouseFingerprint] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [spouseCardNo, setSpouseCardNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Validate account number
      if (!/^\d{1,15}$/.test(accountNumber)) {
        setMessage('Account number must be 1-15 digits only.');
        return;
      }

      // Create principal person
      const principal: PersonCreateRequest = {
        pin: `P${accountNumber}`, // Use account number as PIN prefix
        name: principalName
      };
      const principalPerson = await createPerson(principal);

      const accountId = principalPerson.PersonID || 0;
      const accessLevelId = 1; // Assume "VIP Lounge" ID

      // Create spouse if provided
      let spousePerson;
      if (spouseName) {
        const spouse: PersonCreateRequest = {
          pin: `S${accountNumber}`, // Use account number as PIN prefix for spouse
          name: spouseName
        };
        spousePerson = await createPerson(spouse);
      }

       // Create cards if provided
       if (cardNo) {
         const principalCard: Omit<Card, 'CardID'> = { CardNo: cardNo, PersonID: principalPerson.PersonID || 0 };
         await createCard(principalCard);
       }
       if (spouseCardNo && spousePerson) {
         const spouseCard: Omit<Card, 'CardID'> = { CardNo: spouseCardNo, PersonID: spousePerson.PersonID || 0 };
         await createCard(spouseCard);
       }

      // Upload fingerprints
      if (principalFingerprint) {
        const principalBio: Omit<BiometricTemplate, 'TemplateID'> = {
          PersonID: principalPerson.PersonID || 0,
          Template: principalFingerprint,
          Type: 1,
        };
        await uploadBiometricTemplate(principalPerson.PersonID || 0, principalBio);
      }
      if (spouseFingerprint && spousePerson) {
        const spouseBio: Omit<BiometricTemplate, 'TemplateID'> = {
          PersonID: spousePerson.PersonID || 0,
          Template: spouseFingerprint,
          Type: 1,
        };
        await uploadBiometricTemplate(spousePerson.PersonID || 0, spouseBio);
      }

       // Create account
       const account: Omit<Account, 'createdAt' | 'updatedAt'> = {
         accountId,
         principalPersonId: principalPerson.PersonID || 0,
         spousePersonId: spousePerson?.PersonID || undefined,
         accountNumber,
         status: 'active',
         clientName: principalName,
         accessLevelId,
       };
       await createAccount(account);

       // Grant access level to principal and spouse simultaneously
       await grantAccess([accessLevelId], principalPerson.pin);
       // Grant access to spouse if exists
       if (spousePerson) {
         await grantAccess([accessLevelId], spousePerson.pin);
       }

      setMessage('Account registered successfully!');
      // Reset form
      setPrincipalName('');
      setSpouseName('');
      setAccountNumber('');
      setPrincipalFingerprint('');
      setSpouseFingerprint('');
      setCardNo('');
      setSpouseCardNo('');
    } catch (error) {
      setMessage('Registration failed. Check console for details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register Banking Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Principal Name</label>
          <input
            type="text"
            value={principalName}
            onChange={(e) => setPrincipalName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Spouse Name (optional)</label>
          <input
            type="text"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Principal Card Number (optional)</label>
          <input
            type="text"
            value={cardNo}
            onChange={(e) => setCardNo(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Spouse Card Number (optional)</label>
          <input
            type="text"
            value={spouseCardNo}
            onChange={(e) => setSpouseCardNo(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Principal Fingerprint</label>
          <button
            type="button"
            onClick={() => alert('Device integration not implemented yet. Please enter base64 manually.')}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Capture Fingerprint
          </button>
          <textarea
            placeholder="Enter base64 template"
            value={principalFingerprint}
            onChange={(e) => setPrincipalFingerprint(e.target.value)}
            className="w-full p-2 border rounded mt-2"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Spouse Fingerprint (base64, optional)</label>
          <textarea
            value={spouseFingerprint}
            onChange={(e) => setSpouseFingerprint(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Account'}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AccountRegistrationForm;
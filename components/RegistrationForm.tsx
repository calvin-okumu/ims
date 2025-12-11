'use client';

import { useState } from 'react';
import { createPerson } from '../services/personService';
import { createCard } from '../services/cardService';
import { uploadBiometricTemplate } from '../services/biometricService';
import { Person, PersonCreateRequest, Card, BiometricTemplate } from '../types/api';

const RegistrationForm = () => {
  const [name, setName] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [template, setTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Create person
      const person: PersonCreateRequest = { pin: `REG${Date.now()}`, name: name };
      const newPerson = await createPerson(person);

      // Create card
      if (cardNo) {
        const card: Omit<Card, 'CardID'> = { CardNo: cardNo, PersonID: newPerson.PersonID || 0 };
        await createCard(card);
      }

      // Upload biometric template
      if (template) {
        const bioTemplate: Omit<BiometricTemplate, 'TemplateID'> = {
          PersonID: newPerson.PersonID || 0,
          Template: template,
          Type: 1 // Fingerprint
        };
        await uploadBiometricTemplate(newPerson.PersonID || 0, bioTemplate);
      }

      setMessage('Registration successful!');
      setName('');
      setCardNo('');
      setTemplate('');
    } catch (error) {
      setMessage('Registration failed. Check console for details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register Person with Card and Fingerprint</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Card Number (optional)</label>
          <input
            type="text"
            value={cardNo}
            onChange={(e) => setCardNo(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fingerprint Template (base64, optional)</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default RegistrationForm;
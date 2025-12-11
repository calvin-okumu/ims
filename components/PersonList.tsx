'use client';

import { useState, useEffect } from 'react';
import { getPersons } from '../services/personService';
import { Person } from '../types/api';

const PersonList = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const data = await getPersons();
        setPersons(data);
      } catch (err) {
        setError('Failed to fetch persons');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersons();
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Persons from ZKBio CVSecurity</h1>
      <ul className="space-y-2">
        {persons.map((person) => (
          <li key={person.PersonID || person.pin} className="border p-4 rounded shadow">
            <p><strong>PIN:</strong> {person.pin}</p>
            <p><strong>Name:</strong> {person.name}</p>
            {person.gender && <p><strong>Gender:</strong> {person.gender}</p>}
            {person.deptCode && <p><strong>Department:</strong> {person.deptCode}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonList;
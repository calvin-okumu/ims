import apiClient from '../lib/apiClient';
import { Person, PersonCreateRequest, PersonFilters } from '../types/api';

export const getPersons = async (pageNo = 1, pageSize = 50, filters?: PersonFilters): Promise<Person[]> => {
  try {
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch('/api/persons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageNo,
        pageSize,
        deptCodes: filters?.deptCodes,
        pins: filters?.pins
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle ZKBio response format
    if (data.code === 0) {
      return data.data?.data || [];
    } else {
      throw new Error(data.message || 'API Error');
    }
  } catch (error) {
    console.error('Failed to fetch persons:', error);
    throw error;
  }
};

export const getPerson = async (pin: string): Promise<Person> => {
  const response = await apiClient.get(`/api/v2/person/get/${pin}`);
  return response.data;
};

export const createPerson = async (person: PersonCreateRequest): Promise<Person> => {
  try {
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch('/api/persons', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(person)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle ZKBio response format
    if (data.code === 0) {
      return data.data;
    } else {
      throw new Error(data.message || 'API Error');
    }
  } catch (error) {
    console.error('Failed to create person:', error);
    throw error;
  }
};

export const updatePerson = async (pin: string, person: Partial<Person>): Promise<Person> => {
  const response = await apiClient.put(`/api/v2/person/update/${pin}`, person);
  return response.data;
};

export const deletePerson = async (pin: string): Promise<void> => {
  // Use the v1 endpoint for person deletion (personnel dismissal)
  const response = await fetch('/api/persons/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle ZKBio response format
  if (data.code !== 0) {
    throw new Error(data.message || 'API Error');
  }
};
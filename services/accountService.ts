import { Account } from '../types/api';

const API_BASE = '/api/accounts';

export const getAccounts = async (): Promise<Account[]> => {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error('Failed to fetch accounts');
  return response.json();
};

export const getAccount = async (id: number): Promise<Account> => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch account');
  return response.json();
};

export const createAccount = async (account: Omit<Account, 'createdAt' | 'updatedAt'>): Promise<void> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });
  if (!response.ok) throw new Error('Failed to create account');
};

export const updateAccount = async (id: number, updates: Partial<Account>): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update account');
};

export const deleteAccount = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete account');
};
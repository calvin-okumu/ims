'use client';

import { useState, useEffect } from 'react';
import { getAccounts, updateAccount } from '../services/accountService';
import { Account } from '../types/api';

const AccountList = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (accountId: number, newStatus: 'active' | 'inactive') => {
    try {
      await updateAccount(accountId, { status: newStatus, updatedAt: new Date().toISOString() });
      setAccounts(accounts.map(acc => acc.accountId === accountId ? { ...acc, status: newStatus } : acc));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) return <div className="text-center py-4">Loading accounts...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Banking Accounts</h2>
      <div className="space-y-4">
        {accounts.map((account) => (
          <div key={account.accountId} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <p><strong>Account Number:</strong> {account.accountNumber}</p>
              <p><strong>Client:</strong> {account.clientName}</p>
              <p><strong>Status:</strong> 
                <select
                  value={account.status}
                  onChange={(e) => handleStatusChange(account.accountId, e.target.value as 'active' | 'inactive')}
                  className="ml-2 p-1 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </p>
              {account.spousePersonId && <p><strong>Has Spouse</strong></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountList;
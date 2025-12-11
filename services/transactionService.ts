import apiClient from '../lib/apiClient';
import { Transaction, TransactionFilters } from '../types/api';

export const getTransactions = async (
  pageNo = 1,
  pageSize = 50,
  filters?: TransactionFilters
): Promise<Transaction[]> => {
  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    ...(filters?.personPin && { personPin: filters.personPin }),
    ...(filters?.startDate && { startDate: filters.startDate }),
    ...(filters?.endDate && { endDate: filters.endDate })
  });

  const response = await apiClient.get(`/api/v2/transaction/list?${params}`);
  return response.data.data || [];
};

export const getTransactionsByPerson = async (
  pin: string,
  pageNo = 1,
  pageSize = 50,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> => {
  const params = new URLSearchParams({
    pin,
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  const response = await apiClient.get(`/api/v3/transaction/person?${params}`);
  return response.data.data || [];
};

export const getTransactionsByDevice = async (
  deviceSn: string,
  pageNo = 1,
  pageSize = 50,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> => {
  const params = new URLSearchParams({
    deviceSn,
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  const response = await apiClient.get(`/api/v3/transaction/device?${params}`);
  return response.data.data || [];
};

export const getTransactionById = async (id: string): Promise<Transaction> => {
  const response = await apiClient.get(`/api/v2/transaction/getById/${id}`);
  return response.data;
};

export const getFirstInLastOut = async (
  pin: string,
  pageNo = 1,
  pageSize = 50,
  startDate?: string,
  endDate?: string
): Promise<any> => {
  const params = new URLSearchParams({
    pin,
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  const response = await apiClient.get(`/api/v2/transaction/firstInAndLastOut?${params}`);
  return response.data.data || [];
};
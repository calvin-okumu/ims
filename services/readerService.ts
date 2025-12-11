import apiClient from '../lib/apiClient';
import { Reader } from '../types/api';

export const getReaders = async (pageNo = 1, pageSize = 50): Promise<Reader[]> => {
  const response = await apiClient.get(`/api/v2/reader/list?pageNo=${pageNo}&pageSize=${pageSize}`);
  return response.data.data || [];
};

export const getReader = async (id: string): Promise<Reader> => {
  const response = await apiClient.get(`/api/v2/reader/get/${id}`);
  return response.data;
};

export const createReader = async (reader: Omit<Reader, 'ReaderID'>): Promise<Reader> => {
  const response = await apiClient.post('/api/v2/reader/add', reader);
  return response.data;
};

export const updateReader = async (id: string, reader: Partial<Reader>): Promise<Reader> => {
  const response = await apiClient.put(`/api/v2/reader/update/${id}`, reader);
  return response.data;
};

export const deleteReader = async (id: string): Promise<void> => {
  await apiClient.post(`/api/v2/reader/delete/${id}`);
};
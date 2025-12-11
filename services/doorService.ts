import apiClient from '../lib/apiClient';
import { Door } from '../types/api';

export const getDoors = async (pageNo = 1, pageSize = 50): Promise<Door[]> => {
  const response = await apiClient.get(`/api/v2/door/list?pageNo=${pageNo}&pageSize=${pageSize}`);
  return response.data.data || [];
};

export const getDoor = async (id: string): Promise<Door> => {
  const response = await apiClient.get(`/api/v2/door/get?id=${id}`);
  return response.data;
};

export const getDoorState = async (doorId?: string): Promise<any> => {
  const params = doorId ? `?doorId=${doorId}` : '';
  const response = await apiClient.get(`/api/door/doorStateById${params}`);
  return response.data;
};

export const getAllDoorStates = async (): Promise<any> => {
  const response = await apiClient.get('/api/door/allDoorState');
  return response.data;
};

export const remoteOpenDoor = async (doorId: string, interval?: number): Promise<void> => {
  const params = new URLSearchParams({ doorId });
  if (interval) params.append('interval', interval.toString());

  await apiClient.post('/api/door/remoteOpenById', params);
};

export const remoteCloseDoor = async (doorId: string): Promise<void> => {
  await apiClient.post('/api/door/remoteCloseById', null, {
    params: { doorId }
  });
};
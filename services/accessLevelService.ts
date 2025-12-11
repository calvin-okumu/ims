import apiClient from '../lib/apiClient';
import { AccessLevel, AccessLevelCreateRequest } from '../types/api';

export const getAccessLevels = async (pageNo = 1, pageSize = 50): Promise<AccessLevel[]> => {
  const response = await apiClient.get(`/api/v2/accLevel/list?pageNo=${pageNo}&pageSize=${pageSize}`);
  return response.data.data || [];
};

export const createAccessLevel = async (level: AccessLevelCreateRequest): Promise<AccessLevel> => {
  const response = await apiClient.post('/api/accLevel/addLevel', {
    accApiLevelAddItems: [level]
  });
  return response.data;
};

export const updateAccessLevel = async (id: number, level: Partial<AccessLevel>): Promise<AccessLevel> => {
  const response = await apiClient.put(`/api/accLevel/update/${id}`, level);
  return response.data;
};

export const deleteAccessLevel = async (levelId: number): Promise<void> => {
  await apiClient.post('/api/accLevel/deleteLevel', null, {
    params: { levelIds: levelId.toString() }
  });
};

export const getAccessLevelById = async (id: number): Promise<AccessLevel> => {
  const response = await apiClient.get(`/api/v2/accLevel/getById/${id}`);
  return response.data;
};

export const getAccessLevelByName = async (name: string): Promise<AccessLevel> => {
  const response = await apiClient.get(`/api/v2/accLevel/getByName/${name}`);
  return response.data;
};

// For granting/removing access (using v2 endpoints)
export const grantAccess = async (levelIds: number[], pin: string): Promise<void> => {
  await apiClient.post('/api/accLevel/addLevelPerson', null, {
    params: { levelIds: levelIds.join(','), pin }
  });
};

export const removeAccess = async (levelIds: number[], pin: string): Promise<void> => {
  await apiClient.post('/api/accLevel/deleteLevel', null, {
    params: { levelIds: levelIds.join(','), pin }
  });
};
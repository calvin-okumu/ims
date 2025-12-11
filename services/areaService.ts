import apiClient from '../lib/apiClient';
import { Area, Reader } from '../types/api';

// Fallback data for when API is not available
const fallbackAreas: Area[] = [
  { AreaID: 1, Name: 'General', Description: 'General access areas' },
  { AreaID: 2, Name: 'Secure', Description: 'Secure restricted areas' },
  { AreaID: 3, Name: 'Premium', Description: 'Premium customer areas' },
  { AreaID: 4, Name: 'Executive', Description: 'Executive only areas' }
];

export const getAreas = async (): Promise<Area[]> => {
  try {
    const response = await apiClient.get('/area');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch areas from API, using fallback data:', error);
    return fallbackAreas;
  }
};

export const getAreaById = async (id: number): Promise<Area> => {
  try {
    const response = await apiClient.get(`/area/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch area ${id} from API, using fallback:`, error);
    const fallback = fallbackAreas.find(area => area.AreaID === id);
    if (!fallback) {
      throw new Error(`Area with ID ${id} not found`);
    }
    return fallback;
  }
};

export const getDoorsByArea = async (areaId: number): Promise<Reader[]> => {
  try {
    const response = await apiClient.get(`/area/${areaId}/doors`);
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch doors for area ${areaId} from API, returning empty array:`, error);
    return [];
  }
};

export const createArea = async (area: Omit<Area, 'AreaID'>): Promise<Area> => {
  const response = await apiClient.post('/area', area);
  return response.data;
};

export const updateArea = async (id: number, area: Partial<Area>): Promise<Area> => {
  const response = await apiClient.put(`/area/${id}`, area);
  return response.data;
};

export const deleteArea = async (id: number): Promise<void> => {
  await apiClient.delete(`/area/${id}`);
};
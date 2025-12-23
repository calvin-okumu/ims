import apiClient from '../lib/apiClient';
import { Area } from '../types/api';

export const getAreas = async (): Promise<Area[]> => {
  try {
    const response = await apiClient.get('/door/list');
    const doors = response.data;

    // Group doors by deviceId and create areas
    const deviceGroups: { [key: string]: Area } = {};

    doors.forEach((door: any, index: number) => {
      const deviceId = door.deviceId;
      if (!deviceGroups[deviceId]) {
        deviceGroups[deviceId] = {
          AreaID: index + 1,
          Name: `Device ${deviceId.slice(-4)}`, // Use last 4 chars of deviceId as name
          Description: `Doors for device ${deviceId}`
        };
      }
    });

    return Object.values(deviceGroups);
  } catch (error) {
    console.warn('Failed to fetch doors from API:', error);
    return [];
  }
};

export const getDoorsByArea = async (areaId: number): Promise<any[]> => {
  try {
    const response = await apiClient.get('/door/list');
    const doors = response.data;

    // Find the deviceId for this areaId
    const areas = await getAreas();
    const area = areas.find(a => a.AreaID === areaId);

    if (!area) return [];

    // Extract deviceId from area name (we stored it as "Device XXXX")
    const deviceIdMatch = area.Name.match(/Device (\w+)/);
    if (!deviceIdMatch) return [];

    const deviceIdShort = deviceIdMatch[1];
    // Find the full deviceId by matching the last 4 chars
    const deviceId = doors.find((d: any) => d.deviceId.slice(-4) === deviceIdShort)?.deviceId;

    if (!deviceId) return [];

    // Return doors for this device
    return doors.filter((door: any) => door.deviceId === deviceId);
  } catch (error) {
    console.warn(`Failed to fetch doors for area ${areaId} from API:`, error);
    return [];
  }
};
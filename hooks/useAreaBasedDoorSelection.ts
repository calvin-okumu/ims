import { useState, useEffect } from 'react';
import { Area, Reader } from '../types/api';

export const useAreaBasedDoorSelection = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [doorsByDevice, setDoorsByDevice] = useState<{[key: string]: any[]}>({});
  const [deviceNames, setDeviceNames] = useState<{[key: string]: string}>({});
  const [allReaders, setAllReaders] = useState<Reader[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [filteredReaders, setFilteredReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all doors, devices, and readers on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [doorsResponse, devicesResponse, readersResponse] = await Promise.all([
          fetch('/api/doors'),
          fetch('/api/devices'),
          fetch('/api/readers')
        ]);

        if (!doorsResponse.ok || !devicesResponse.ok || !readersResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const doorsData = await doorsResponse.json();
        const devicesData = await devicesResponse.json();
        const readersData = await readersResponse.json();

        // Create device name mapping
        const deviceNameMap: {[key: string]: string} = {};
        devicesData.forEach((device: any) => {
          deviceNameMap[device.id || device.deviceId] = device.name || device.deviceName || `Device ${device.id?.slice(-4) || 'Unknown'}`;
        });

        // Group doors by deviceId
        const groupedDoors: {[key: string]: any[]} = {};
        const deviceAreas: Area[] = [];

        doorsData.forEach((door: any) => {
          const deviceId = door.deviceId;
          if (!groupedDoors[deviceId]) {
            groupedDoors[deviceId] = [];
            // Create area for this device
            deviceAreas.push({
              AreaID: deviceAreas.length + 1,
              Name: deviceNameMap[deviceId] || `Device ${deviceId.slice(-4)}`,
              Description: `Doors for device ${deviceId}`
            });
          }
          groupedDoors[deviceId].push(door);
        });

        setAreas(deviceAreas);
        setDoorsByDevice(groupedDoors);
        setDeviceNames(deviceNameMap);
        setAllReaders(readersData);
        setFilteredReaders(readersData); // Initially show all readers
      } catch (err) {
        setError('Failed to fetch doors, devices and readers');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter readers when device selection changes
  useEffect(() => {
    if (selectedDevice === null) {
      setFilteredReaders(allReaders);
    } else {
      // Filter readers by doors that belong to the selected device
      // This is a simplified version - in practice, we'd need to match doorIds
      setFilteredReaders(allReaders); // For now, show all until we implement proper filtering
    }
  }, [selectedDevice, allReaders]);

  return {
    areas,
    doorsByDevice,
    deviceNames,
    allDoors: allReaders, // Keep the same interface
    selectedDevice,
    filteredDoors: filteredReaders, // Keep the same interface
    loading,
    error,
    setSelectedDevice,
    getUniqueAreasFromDoors: () => [] // Placeholder
  };
};
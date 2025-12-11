import { useState, useEffect } from 'react';
import { getAreas, getDoorsByArea } from '../services/areaService';
import { getReaders } from '../services/readerService';
import { Area, Reader } from '../types/api';

export const useAreaBasedDoorSelection = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [allDoors, setAllDoors] = useState<Reader[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [filteredDoors, setFilteredDoors] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all areas and doors on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [areasData, doorsData] = await Promise.all([
          getAreas(),
          getReaders()
        ]);
        setAreas(areasData);
        setAllDoors(doorsData);
        setFilteredDoors(doorsData); // Initially show all doors
      } catch (err) {
        setError('Failed to fetch areas and doors');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter doors when area selection changes
  useEffect(() => {
    // Show all doors since Reader interface doesn't have area information
    setFilteredDoors(allDoors);
  }, [allDoors]);

  // Get unique device SNs from doors for fallback
  const getUniqueAreasFromDoors = (): string[] => {
    const deviceSns = allDoors
      .map(door => door.deviceSn)
      .filter((sn): sn is string => sn !== undefined);
    return [...new Set(deviceSns)];
  };

  return {
    areas,
    allDoors,
    selectedArea,
    filteredDoors,
    loading,
    error,
    setSelectedArea,
    getUniqueAreasFromDoors
  };
};
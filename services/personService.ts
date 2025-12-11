import apiClient from '../lib/apiClient';
import { Person, PersonCreateRequest, PersonFilters } from '../types/api';

export const getPersons = async (pageNo = 1, pageSize = 50, filters?: PersonFilters): Promise<Person[]> => {
  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
    ...(filters?.deptCodes && { deptCodes: filters.deptCodes }),
    ...(filters?.pins && { pins: filters.pins })
  });

  const response = await apiClient.post(`/api/v2/person/getPersonList?${params}`);
  return response.data.data || [];
};

export const getPerson = async (pin: string): Promise<Person> => {
  const response = await apiClient.get(`/api/v2/person/get/${pin}`);
  return response.data;
};

export const createPerson = async (person: PersonCreateRequest): Promise<Person> => {
  const response = await apiClient.post('/api/v2/person/add', { person });
  return response.data;
};

export const updatePerson = async (pin: string, person: Partial<Person>): Promise<Person> => {
  const response = await apiClient.put(`/api/v2/person/update/${pin}`, person);
  return response.data;
};

export const deletePerson = async (pin: string): Promise<void> => {
  await apiClient.post(`/api/v2/person/delete/${pin}`);
};
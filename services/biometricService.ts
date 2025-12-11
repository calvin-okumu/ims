import apiClient from '../lib/apiClient';
import { BiometricTemplate } from '../types/api';

export const getBiometricTemplates = async (personId: number): Promise<BiometricTemplate[]> => {
  const response = await apiClient.get(`/person/${personId}/biometric`);
  return response.data;
};

export const uploadBiometricTemplate = async (personId: number, template: Omit<BiometricTemplate, 'TemplateID'>): Promise<BiometricTemplate> => {
  const response = await apiClient.post(`/person/${personId}/biometric`, template);
  return response.data;
};

export const updateBiometricTemplate = async (personId: number, templateId: number, template: Partial<BiometricTemplate>): Promise<BiometricTemplate> => {
  const response = await apiClient.put(`/person/${personId}/biometric/${templateId}`, template);
  return response.data;
};

export const deleteBiometricTemplate = async (personId: number, templateId: number): Promise<void> => {
  await apiClient.delete(`/person/${personId}/biometric/${templateId}`);
};
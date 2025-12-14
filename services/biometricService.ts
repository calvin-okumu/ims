import apiClient from '../lib/apiClient';
import { BiometricTemplate } from '../types/api';

export const getBiometricTemplates = async (personId: number): Promise<BiometricTemplate[]> => {
  const response = await apiClient.get(`/person/${personId}/biometric`);
  return response.data;
};

export const uploadBiometricTemplate = async (personId: number, template: Omit<BiometricTemplate, 'TemplateID'>): Promise<BiometricTemplate> => {
  try {
    // Use Next.js API proxy to avoid CORS issues
    const response = await fetch('/api/biometric', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pin: personId.toString(), // Use personId as PIN
        template: template.Template,
        templateNo: 1, // Default template number
        validType: '1', // Default valid type
        version: '10.0' // Default version
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle ZKBio response format
    if (data.code === 0) {
      return data.data;
    } else {
      throw new Error(data.message || 'API Error');
    }
  } catch (error) {
    console.error('Failed to upload biometric template:', error);
    throw error;
  }
};

export const updateBiometricTemplate = async (personId: number, templateId: number, template: Partial<BiometricTemplate>): Promise<BiometricTemplate> => {
  const response = await apiClient.put(`/person/${personId}/biometric/${templateId}`, template);
  return response.data;
};

export const deleteBiometricTemplate = async (personId: number, templateId: number): Promise<void> => {
  await apiClient.delete(`/person/${personId}/biometric/${templateId}`);
};
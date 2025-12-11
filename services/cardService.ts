import apiClient from '../lib/apiClient';
import { Card } from '../types/api';

export const getCards = async (): Promise<Card[]> => {
  const response = await apiClient.get('/card');
  return response.data;
};

export const getCard = async (id: number): Promise<Card> => {
  const response = await apiClient.get(`/card/${id}`);
  return response.data;
};

export const createCard = async (card: Omit<Card, 'CardID'>): Promise<Card> => {
  const response = await apiClient.post('/card', card);
  return response.data;
};

export const updateCard = async (id: number, card: Partial<Card>): Promise<Card> => {
  const response = await apiClient.put(`/card/${id}`, card);
  return response.data;
};

export const deleteCard = async (id: number): Promise<void> => {
  await apiClient.delete(`/card/${id}`);
};
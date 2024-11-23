import { api, initializeCsrfToken } from './axios';
import { Item, CreateItemRequest, CreateItemResponse } from 'types';

const getItems = async (): Promise<Item[]> => {
  await initializeCsrfToken();
  const response = await api.get('/items');
  return response.data;
};

const createItem = async (
  itemData: CreateItemRequest
): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.post('/items', itemData);
  return response.data;
};

const showItem = async (id: number): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.get(`/items/${id}`);
  return response.data.message;
};

const editItem = async (
  id: number,
  itemData: CreateItemRequest
): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.put(`/items/${id}`, itemData);
  return response.data.message;
};

const deleteItem = async (id: number): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

export { getItems, createItem, showItem, editItem, deleteItem };

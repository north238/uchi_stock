import { api, initializeCsrfToken } from './axios';

export type Item = {
  id: number;
  name: string;
  quantity: number;
};

const fetchItems = async (): Promise<Item[]> => {
  await initializeCsrfToken();
  const response = await api.get('/items');
  return response.data;
};

const createItem = async (itemData: {
  name: string;
  quantity: number;
}): Promise<Item> => {
  await initializeCsrfToken();
  const response = await api.post('/items', itemData);
  return response.data;
};

const showItem = async (id: number): Promise<void> => {
  await initializeCsrfToken();
  const response = await api.get(`/items/${id}`);
  return response.data.message;
};

const editItem = async (
  id: number,
  itemData: { name: string }
): Promise<void> => {
  await initializeCsrfToken();
  const response = await api.put(`/items/${id}`, itemData);
  return response.data.message;
};

const deleteItem = async (id: number): Promise<void> => {
  await initializeCsrfToken();
  const response = await api.delete(`/items/${id}`);
  return response.data.message;
};

export { fetchItems, createItem, deleteItem };

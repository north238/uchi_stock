import { api, initializeCsrfToken } from './axios';
import {
  Item,
  CreateItemRequest,
  CreateItemResponse,
  UpdatedItemRequest,
  GenreResponse,
} from 'types';

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

const EditItem = async (
  id: number,
  updatedItem: UpdatedItemRequest
): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.put(`/items/${id}`, updatedItem);
  return response.data;
};

const deleteItem = async (id: number): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

const fetchGenreData = async (): Promise<GenreResponse> => {
  await initializeCsrfToken();
  const response = await api.get('/genres');
  return response.data;
};

const changeColorFavoriteIcon = async (
  id: number,
  isFavorite: number
): Promise<CreateItemResponse> => {
  await initializeCsrfToken();
  const response = await api.post(`/favorites/${id}`, { id, isFavorite });
  return response.data;
};

const fetchFavoriteItems = async (): Promise<Item[]> => {
  await initializeCsrfToken();
  const response = await api.get('/favorites');

  return response.data;
};

export {
  getItems,
  createItem,
  EditItem,
  deleteItem,
  fetchGenreData,
  changeColorFavoriteIcon,
  fetchFavoriteItems,
};

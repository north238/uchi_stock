import { api, initializeCsrfToken } from './axios';
import { NotificationsData } from 'types';

const getGroup = async () => {
  await initializeCsrfToken();
  const response = await api.get('/group');
  return response.data;
};

const createGroup = async (groupData: any) => {
  await initializeCsrfToken();
  const response = await api.post('/group', groupData);
  return response.data;
};

export { getGroup, createGroup };

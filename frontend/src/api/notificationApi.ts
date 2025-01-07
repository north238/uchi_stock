import { api, initializeCsrfToken } from './axios';
import { NotificationsData } from 'types';

const getNotifications = async () => {
  await initializeCsrfToken();
  const response = await api.get('/notifications');
  return response.data;
};

const createNotification = async (notificationsData: NotificationsData) => {
  await initializeCsrfToken();
  const response = await api.post('/notifications', notificationsData);
  return response.data;
};

const updateNotificationStatus = async (id: number, status: number) => {
  await initializeCsrfToken();
  const response = await api.post(`/notifications/${id}/approve`, {
    status,
  });
  return response.data;
};

export { getNotifications, createNotification, updateNotificationStatus };

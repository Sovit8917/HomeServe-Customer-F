import { api } from '@/lib/axios';

export const notificationsService = {
  getAll: (page = 1, limit = 20) =>
    api.get('/notifications', { params: { page, limit } }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
};

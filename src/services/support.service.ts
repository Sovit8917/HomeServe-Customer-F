import { api } from '@/lib/axios';

export const supportService = {
  createTicket: (data: { subject: string; description: string }) =>
    api.post('/support/tickets', data),
  getTickets: () => api.get('/support/tickets'),
  getTicket: (id: string) => api.get(`/support/tickets/${id}`),
  reply: (id: string, message: string) => api.post(`/support/tickets/${id}/reply`, { message }),
};

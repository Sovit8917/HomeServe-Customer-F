import { api } from '@/lib/axios';

export const chatService = {
  getBookingChats: () => api.get('/chat/bookings'),
  getMessages: (bookingId: string, page = 1, limit = 50) =>
    api.get(`/chat/${bookingId}/messages`, { params: { page, limit } }),
  sendMessage: (bookingId: string, message: string) =>
    api.post(`/chat/${bookingId}/messages`, { message }),
  getUnreadCount: (bookingId: string) => api.get(`/chat/${bookingId}/unread`),
};

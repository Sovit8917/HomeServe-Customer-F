import { api } from '@/lib/axios';
import { Booking, BookingStatus } from '@/types';

export const bookingsService = {
  getWorkerBookings: (status?: BookingStatus): Promise<{ data: { data: Booking[] } }> =>
    api.get('/bookings/worker/my', { params: { status } }),

  getTodayJobs: (): Promise<{ data: { data: Booking[] } }> =>
    api.get('/bookings/worker/today'),

  getUpcomingJobs: (): Promise<{ data: { data: Booking[] } }> =>
    api.get('/bookings/worker/upcoming'),

  getPendingRequests: (): Promise<{ data: { data: Booking[] } }> =>
    api.get('/bookings/worker/pending-requests'),

  getOne: (id: string): Promise<{ data: { data: Booking } }> =>
    api.get(`/bookings/${id}`),

  accept: (id: string) => api.put(`/bookings/${id}/accept`),
  reject: (id: string) => api.put(`/bookings/${id}/reject`),
  start: (id: string) => api.put(`/bookings/${id}/start`),
  complete: (id: string) => api.put(`/bookings/${id}/complete`),
  cancel: (id: string, reason: string) => api.put(`/bookings/${id}/cancel`, { reason }),
};

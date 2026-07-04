import { api } from '@/lib/axios';

export const workersService = {
  getProfile: () => api.get('/workers/profile'),
  updateProfile: (data: any) => api.put('/workers/profile', data),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/workers/location', { latitude, longitude }),
  setOnlineStatus: (isOnline: boolean) =>
    api.put('/workers/status', { isOnline }),
  getDocuments: () => api.get('/workers/documents'),
  uploadDocument: (type: string, url: string) =>
    api.post('/workers/documents', { type, url }),
  updateBankDetails: (data: any) => api.put('/workers/bank-details', data),
  updateSkills: (skills: string[]) => api.put('/workers/skills', { skills }),
  updateServices: (serviceIds: string[]) => api.put('/workers/services', { serviceIds }),
  getWorkingHours: () => api.get('/workers/working-hours'),
  setWorkingHours: (hours: any[]) => api.put('/workers/working-hours', { hours }),
  setAvailability: (date: Date, isOff: boolean) =>
    api.post('/workers/availability', { date, isOff }),
  getReviews: (workerId: string, page = 1, limit = 10) =>
    api.get(`/workers/${workerId}/reviews`, { params: { page, limit } }),
};

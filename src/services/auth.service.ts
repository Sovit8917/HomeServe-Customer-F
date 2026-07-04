import { api } from '@/lib/axios';
import { AuthResponse } from '@/types';

export const authService = {
  sendOtp: (phone: string) =>
    api.post('/auth/send-otp', { phone, role: 'WORKER' }),

verifyOtp: (phone: string, otp: string): Promise<{ data: { data: AuthResponse } }> =>
    api.post('/auth/verify-otp', { phone, otp, role: 'WORKER' }),

  getMe: () => api.get('/auth/me'),

  refreshToken: () => api.post('/auth/refresh'),
};

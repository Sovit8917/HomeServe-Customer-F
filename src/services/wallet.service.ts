import { api } from '@/lib/axios';

export const walletService = {
  getWallet: () => api.get('/wallet/worker'),
  getTransactions: (page = 1, limit = 20) =>
    api.get('/wallet/worker/transactions', { params: { page, limit } }),
  getEarnings: (period: 'today' | 'week' | 'month') =>
    api.get('/wallet/worker/earnings', { params: { period } }),
  withdraw: (amount: number) => api.post('/wallet/worker/withdraw', { amount }),
};

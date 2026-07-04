import { api } from '@/lib/axios';

export interface CatalogService {
  id: string;
  name: string;
  categoryId: string;
  category?: { name: string };
}

export const catalogService = {
  // Public endpoint — returns every active bookable service, used so a
  // worker can pick which ones they offer (this is what booking-matching
  // is filtered against in pending-requests).
  getServices: (): Promise<{ data: { data: CatalogService[] } }> =>
    api.get('/services'),
};

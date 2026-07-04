'use client';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StarRating from '@/components/ui/StarRating';
import EmptyState from '@/components/ui/EmptyState';
import { workersService } from '@/services/workers.service';
import { useAuth } from '@/hooks/useAuth';
import { Review } from '@/types';
import { formatDate } from '@/utils';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    workersService.getReviews(user.id)
      .then((r) => setReviews(r.data.data || []))
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <AppLayout>
      <PageHeader title="My Reviews" subtitle="See what customers say about you" />

      {/* Rating summary */}
      <div className="card mb-5">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">{(user?.rating ?? 0).toFixed(1)}</p>
            <StarRating value={user?.rating ?? 0} size={18} />
            <p className="text-xs text-gray-400 mt-1">{user?.totalReviews ?? 0} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <p className="text-xs text-gray-500 w-3">{star}</p>
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="card">
          <EmptyState icon={Star} title="No reviews yet" description="Complete jobs to start receiving reviews from customers." />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {r.user?.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.user?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

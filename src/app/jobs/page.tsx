'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Briefcase, Clock, MapPin, ChevronRight, Check } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { bookingsService } from '@/services/bookings.service';
import { Booking, BookingStatus } from '@/types';
import { formatDate, formatTime, formatCurrency, getBookingStatusLabel, getBookingStatusColor, cn } from '@/utils';
import toast from 'react-hot-toast';

const TABS: { key: string; label: string; status?: BookingStatus; fn: () => Promise<any> }[] = [
  { key: 'all',       label: 'All',       fn: () => bookingsService.getWorkerBookings() },
  { key: 'new',       label: 'New',       fn: () => bookingsService.getPendingRequests() },
  { key: 'upcoming',  label: 'Upcoming',  fn: () => bookingsService.getUpcomingJobs() },
  { key: 'completed', label: 'Completed', status: 'COMPLETED', fn: () => bookingsService.getWorkerBookings('COMPLETED') },
  { key: 'cancelled', label: 'Cancelled', status: 'CANCELLED', fn: () => bookingsService.getWorkerBookings('CANCELLED') },
];

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const initialTab = Math.max(0, TABS.findIndex((t) => t.key === tabParam));
  const [active, setActive] = useState(initialTab === -1 ? 0 : initialTab);
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchJobs = (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    TABS[active].fn()
      .then((r: any) => setJobs(r.data.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs(true);
    // Poll so a customer's new booking (or a status change) shows up without
    // the worker having to manually refresh the page.
    const interval = setInterval(() => fetchJobs(false), 15000);
    return () => clearInterval(interval);
  }, [active]);

  const selectTab = (i: number) => {
    setActive(i);
    router.replace(`/jobs?tab=${TABS[i].key}`);
  };

  const handleAccept = async (id: string) => {
    setActingId(id);
    try {
      await bookingsService.accept(id);
      toast.success('Job accepted!');
      fetchJobs(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept — it may already be taken');
      fetchJobs(false);
    } finally {
      setActingId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="My Jobs" subtitle="Manage all your bookings" />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => selectTab(i)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
              active === i ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card mt-4">
          <EmptyState
            icon={Briefcase}
            title="No jobs found"
            description={
              TABS[active].key === 'new'
                ? 'New booking requests matching your selected services will appear here.'
                : 'Jobs matching this filter will appear here.'
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-md hover:border-blue-100 transition-all">
              <Link href={`/jobs/${job.id}`} className="block cursor-pointer">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-gray-400">#{job.bookingNumber}</p>
                      <span className={cn('badge', getBookingStatusColor(job.status))}>
                        {getBookingStatusLabel(job.status)}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">
                      {job.items?.[0]?.service?.name || 'Home Service'}
                      {(job.items?.length ?? 0) > 1 && <span className="text-gray-400"> +{(job.items?.length ?? 1) - 1} more</span>}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{job.user?.name || 'Customer'}</p>
                  </div>
                  <p className="font-bold text-gray-900 shrink-0">{formatCurrency(job.finalAmount)}</p>
                </div>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={14} />
                    {formatDate(job.scheduledDate)} · {formatTime(job.scheduledTime)}
                  </span>
                  {job.address && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin size={13} /> {job.address.city}
                    </span>
                  )}
                  {TABS[active].key !== 'new' && <ChevronRight size={16} className="text-gray-400" />}
                </div>
              </Link>

              {TABS[active].key === 'new' && (
                <button
                  onClick={() => handleAccept(job.id)}
                  disabled={actingId === job.id}
                  className="btn-primary w-full mt-3 justify-center flex items-center gap-1.5"
                >
                  {actingId === job.id ? 'Accepting…' : <><Check size={16} /> Accept Job</>}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsContent />
    </Suspense>
  );
}

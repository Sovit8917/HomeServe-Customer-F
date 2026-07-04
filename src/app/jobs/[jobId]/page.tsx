'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Phone, MessageCircle, CheckCircle, XCircle, Play, Flag, User } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { bookingsService } from '@/services/bookings.service';
import { Booking } from '@/types';
import { formatDate, formatTime, formatCurrency, getBookingStatusLabel, getBookingStatusColor, cn } from '@/utils';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    bookingsService.getOne(jobId)
      .then((r) => setJob(r.data.data))
      .finally(() => setLoading(false));
  }, [jobId]);

  const doAction = async (action: string, fn: () => Promise<any>) => {
    setActionLoading(action);
    try {
      const res = await fn();
      setJob(res.data.data);
      toast.success(`Job ${action} successfully!`);
    } catch {
      toast.error(`Failed to ${action} job`);
    } finally {
      setActionLoading('');
    }
  };

  if (loading) return <AppLayout><LoadingSpinner className="h-64" /></AppLayout>;
  if (!job) return <AppLayout><p className="text-center text-gray-400 py-16">Job not found</p></AppLayout>;

  const isPending = job.status === 'PENDING';
  const isAccepted = job.status === 'ACCEPTED';
  const isInProgress = job.status === 'IN_PROGRESS';

  return (
    <AppLayout>
      <PageHeader title={`Job #${job.bookingNumber}`} showBack />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Job Status</h2>
              <span className={cn('badge text-sm px-3 py-1.5', getBookingStatusColor(job.status))}>
                {getBookingStatusLabel(job.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-0.5">Scheduled Date</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {formatDate(job.scheduledDate)}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Time</p>
                <p className="font-semibold text-gray-900">{formatTime(job.scheduledTime)}</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Services Requested</h2>
            {job.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.service?.name || 'Service'}</p>
                  {item.service?.duration && <p className="text-xs text-gray-400">{item.service.duration} mins</p>}
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.price)}</p>
              </div>
            ))}
            {!job.items?.length && <p className="text-sm text-gray-400">Service details not available</p>}

            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Amount</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(job.finalAmount)}</span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-2">Customer Note</h2>
              <p className="text-sm text-gray-600">{job.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isPending && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => doAction('accepted', () => bookingsService.accept(job.id))}
                  disabled={!!actionLoading}
                  className="btn-primary"
                >
                  {actionLoading === 'accepted' ? '…' : <><CheckCircle size={18} /> Accept Job</>}
                </button>
                <button
                  onClick={() => doAction('rejected', () => bookingsService.reject(job.id))}
                  disabled={!!actionLoading}
                  className="btn-danger"
                >
                  {actionLoading === 'rejected' ? '…' : <><XCircle size={18} /> Reject</>}
                </button>
              </div>
            )}
            {isAccepted && (
              <button
                onClick={() => doAction('started', () => bookingsService.start(job.id))}
                disabled={!!actionLoading}
                className="btn-primary w-full"
              >
                {actionLoading === 'started' ? '…' : <><Play size={18} /> Start Job</>}
              </button>
            )}
            {isInProgress && (
              <button
                onClick={() => doAction('completed', () => bookingsService.complete(job.id))}
                disabled={!!actionLoading}
                className="btn-primary w-full !bg-green-600 hover:!bg-green-700"
              >
                {actionLoading === 'completed' ? '…' : <><Flag size={18} /> Mark Complete</>}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Customer Info */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{job.user?.name || 'Customer'}</p>
                <p className="text-sm text-gray-500">{job.user?.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${job.user?.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                <Phone size={16} /> Call
              </a>
              <Link href={`/chat/${job.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors">
                <MessageCircle size={16} /> Chat
              </Link>
            </div>
          </div>

          {/* Address */}
          {job.address && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">Service Location</h2>
              <div className="flex gap-2.5">
                <MapPin size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{job.address.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{job.address.fullAddress}</p>
                  {job.address.landmark && <p className="text-xs text-gray-400 mt-0.5">Near: {job.address.landmark}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{job.address.city}, {job.address.state} — {job.address.pincode}</p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${job.address.latitude},${job.address.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <MapPin size={15} /> Navigate
              </a>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

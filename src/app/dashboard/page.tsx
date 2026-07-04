'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Star, Wallet, TrendingUp, Clock, ChevronRight, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useAuth } from '@/hooks/useAuth';
import { bookingsService } from '@/services/bookings.service';
import { walletService } from '@/services/wallet.service';
import { workersService } from '@/services/workers.service';
import { Booking } from '@/types';
import { formatCurrency, formatDate, formatTime, getBookingStatusColor, getBookingStatusLabel, cn } from '@/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [todayJobs, setTodayJobs] = useState<Booking[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [earningsToday, setEarningsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const fetchDashboard = (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    Promise.allSettled([
      bookingsService.getTodayJobs().then((r) => setTodayJobs(r.data.data || [])),
      bookingsService.getPendingRequests().then((r) => setPendingCount(r.data.data?.length || 0)),
      walletService.getWallet().then((r) => setWalletBalance(r.data.data?.balance || 0)),
      walletService.getEarnings('today').then((r) => setEarningsToday(r.data.data?.total || 0)),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard(true);
    // Poll for new job requests so they appear without a manual refresh.
    const interval = setInterval(() => fetchDashboard(false), 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleOnline = async () => {
    if (!user) return;
    setTogglingOnline(true);
    try {
      await workersService.setOnlineStatus(!user.isOnline);
      updateUser({ isOnline: !user.isOnline });
      toast.success(user.isOnline ? 'You are now offline' : 'You are now online! 🟢');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Partner';

  return (
    <AppLayout>
      {/* Hero banner matching screenshot */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-6 sm:p-8 mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm mb-0.5">Welcome back 👋</p>
            <h1 className="text-2xl sm:text-3xl font-bold">{firstName}</h1>
            <div className="flex items-center gap-1.5 mt-2">
              <div className={cn('w-2 h-2 rounded-full', user?.isOnline ? 'bg-green-400' : 'bg-gray-400')} />
              <p className="text-blue-100 text-sm">{user?.isOnline ? 'Online — accepting jobs' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-blue-100 text-xs mb-0.5">Status</p>
              <p className="font-bold text-base">{user?.isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <ToggleSwitch checked={user?.isOnline ?? false} onChange={toggleOnline} disabled={togglingOnline} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Wallet}    label="Today's Earnings" value={formatCurrency(earningsToday)} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard icon={Briefcase} label="Today's Jobs"     value={String(todayJobs.length)}      iconColor="text-blue-600"  iconBg="bg-blue-50" />
        <StatCard icon={AlertCircle} label="New Requests"   value={String(pendingCount)}           iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard icon={Star}      label="Your Rating"      value={`${(user?.rating ?? 0).toFixed(1)}★`} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Jobs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Today's Jobs</h2>
            <Link href="/jobs" className="text-sm font-semibold text-blue-600 flex items-center gap-0.5 hover:underline">
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : todayJobs.length === 0 ? (
            <div className="card">
              <EmptyState icon={CheckCircle2} title="No jobs today" description="New requests will appear here when customers book you." />
            </div>
          ) : (
            <div className="space-y-3">
              {todayJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="card hover:shadow-md hover:border-blue-100 active:scale-[0.99] transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">#{job.bookingNumber}</p>
                        <p className="font-semibold text-gray-900 truncate">
                          {job.items?.[0]?.service?.name || 'Home Service'}
                          {(job.items?.length ?? 0) > 1 && ` +${(job.items?.length ?? 1) - 1}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">{job.user?.name || 'Customer'} · {job.user?.phone}</p>
                      </div>
                      <span className={cn('badge shrink-0', getBookingStatusColor(job.status))}>
                        {getBookingStatusLabel(job.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Clock size={14} /> {formatTime(job.scheduledTime)}
                      </span>
                      {job.address && (
                        <span className="flex items-center gap-1 text-gray-500 truncate max-w-[160px]">
                          <MapPin size={13} /> {job.address.city}
                        </span>
                      )}
                      <span className="font-bold text-gray-900">{formatCurrency(job.finalAmount)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Pending requests alert */}
          {pendingCount > 0 && (
            <Link href="/jobs?tab=new">
              <div className="card bg-amber-50 border-amber-200 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-800">{pendingCount} New Request{pendingCount > 1 ? 's' : ''}</p>
                    <p className="text-xs text-amber-600">Tap to view & accept</p>
                  </div>
                  <ChevronRight size={18} className="text-amber-500 shrink-0" />
                </div>
              </div>
            </Link>
          )}

          {/* Wallet */}
          <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <p className="text-blue-200 text-xs mb-1">Wallet Balance</p>
            <p className="text-2xl font-bold mb-3">{formatCurrency(walletBalance)}</p>
            <Link href="/earnings" className="inline-flex items-center gap-1.5 text-white/80 text-sm font-medium hover:text-white transition-colors">
              View Earnings <ChevronRight size={14} />
            </Link>
          </div>

          {/* Quick links */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { href: '/schedule', label: '📅 My Schedule' },
                { href: '/profile/skills', label: '🛠️ Update Skills' },
                { href: '/reviews', label: '⭐ My Reviews' },
                { href: '/support', label: '💬 Get Support' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                  {l.label} <ChevronRight size={15} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

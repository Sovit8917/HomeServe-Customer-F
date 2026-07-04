'use client';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StarRating from '@/components/ui/StarRating';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Wrench, FileText, Landmark, MapPin, Globe, ChevronRight, LogOut, Star, Briefcase } from 'lucide-react';
import { formatCurrency, getInitials } from '@/utils';

const MENU = [
  { icon: Settings,  label: 'Edit Profile',    href: '/profile/edit' },
  { icon: Wrench,    label: 'Skills & Services', href: '/profile/skills' },
  { icon: FileText,  label: 'My Documents',    href: '/profile/documents' },
  { icon: Landmark,  label: 'Bank Details',    href: '/profile/bank-details' },
  { icon: MapPin,    label: 'Service Radius',  href: '/profile/service-radius' },
  { icon: Star,      label: 'My Reviews',      href: '/reviews' },
  { icon: Briefcase, label: 'Job History',     href: '/jobs' },
  { icon: Globe,     label: 'Support',         href: '/support' },
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <AppLayout>
      <PageHeader title="My Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
            {getInitials(user?.name)}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{user?.name || 'Partner'}</h2>
          <p className="text-sm text-gray-500">{user?.phone}</p>
          {user?.email && <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>}

          <div className="flex justify-center mt-2 mb-3">
            <StarRating value={user?.rating ?? 0} />
          </div>
          <p className="text-xs text-gray-400">{user?.totalReviews ?? 0} reviews</p>

          {/* Online badge */}
          <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${user?.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${user?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            {user?.isOnline ? 'Online' : 'Offline'}
          </div>

          {user?.bio && <p className="text-sm text-gray-500 mt-4 text-left border-t border-gray-50 pt-4">{user.bio}</p>}
        </div>

        {/* Stats + menu */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Jobs',  value: String(user?.totalJobs ?? 0) },
              { label: 'Experience',  value: `${user?.experience ?? 0}y` },
              { label: 'Radius',      value: `${user?.serviceRadius ?? 0}km` },
            ].map((s) => (
              <div key={s.label} className="card text-center !py-4">
                <p className="text-xl font-bold text-blue-600">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Menu */}
          <div className="card divide-y divide-gray-50 !p-0">
            {MENU.map(({ icon: Icon, label, href }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl transition-colors">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-blue-600" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            ))}
          </div>

          <button
            onClick={signOut}
            className="btn-danger w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

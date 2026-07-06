'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, XCircle, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { workersService } from '@/services/workers.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const CONTENT: Record<string, { icon: React.ReactNode; color: string; title: string; body: string }> = {
  PENDING: {
    icon: <Clock size={26} />,
    color: 'text-amber-600 bg-amber-50',
    title: 'Application Under Review',
    body: "Thanks for submitting your documents! Our team is verifying your details and typically approves new partners within 24–48 hours. We'll notify you as soon as you're approved.",
  },
  REJECTED: {
    icon: <XCircle size={26} />,
    color: 'text-red-600 bg-red-50',
    title: 'Application Rejected',
    body: 'Unfortunately, your application was not approved. This is usually due to unclear or invalid documents. Please contact support for details or to reapply.',
  },
  SUSPENDED: {
    icon: <ShieldAlert size={26} />,
    color: 'text-red-600 bg-red-50',
    title: 'Account Suspended',
    body: 'Your account has been temporarily suspended. Please contact support to find out more and resolve this.',
  },
};

export default function PendingReviewPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const status = user?.status || 'PENDING';
  const info = CONTENT[status] || CONTENT.PENDING;

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await workersService.getProfile();
      const fresh = res.data?.data;
      if (fresh) updateUser(fresh);
      if (fresh?.status === 'APPROVED') {
        toast.success('You are approved! Welcome aboard 🎉');
        router.replace('/dashboard');
      } else {
        toast('Still under review — check back later.');
      }
    } catch {
      toast.error('Could not refresh status');
    } finally {
      setChecking(false);
    }
  };

  // Auto-check once on mount in case status changed since login
  useEffect(() => { checkStatus(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">HS</span>
          </div>
          <span className="font-bold text-lg text-gray-900">HomeServe Partner</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${info.color}`}>
            {info.icon}
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{info.body}</p>

          <button onClick={checkStatus} disabled={checking} className="btn-primary w-full flex items-center justify-center gap-2">
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking…' : 'Check Status'}
          </button>

          {status === 'REJECTED' && (
            <button onClick={() => router.push('/auth/documents')} className="w-full mt-3 text-sm font-semibold text-blue-600 py-2">
              Re-upload documents
            </button>
          )}

          <button onClick={() => router.push('/support')} className="w-full mt-1 text-sm font-medium text-gray-500 py-2">
            Contact Support
          </button>

          <button
            onClick={() => { logout(); router.replace('/auth/login'); }}
            className="w-full mt-2 text-sm font-medium text-gray-400 py-2 flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

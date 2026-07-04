'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { isValidIndianPhone } from '@/utils';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: Shield, text: 'Verified platform with secure payments' },
  { icon: Clock,  text: 'Flexible working hours & schedule' },
  { icon: Star,   text: 'Build your rating and grow earnings' },
];

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    const clean = phone.replace(/\s/g, '');
    if (!isValidIndianPhone(clean)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp(`+91${clean}`);
      router.push(`/auth/otp?phone=${encodeURIComponent(`+91${clean}`)}`);
    } catch {
      toast.error('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col lg:flex-row">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="font-bold text-base">HS</span>
            </div>
            <span className="text-xl font-bold">HomeServe</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">Partner</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Grow your business<br />with HomeServe
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Join thousands of skilled professionals earning more with flexible work.
          </p>

          <div className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <p className="text-blue-100 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { val: '5000+', label: 'Partners' },
            { val: '4.8★',  label: 'Avg Rating' },
            { val: '₹25K+', label: 'Avg Monthly' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{s.val}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">HS</span>
            </div>
            <span className="font-bold text-lg text-gray-900">HomeServe</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Partner</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your partner account</p>

          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
            <label className="label">Mobile Number</label>
            <div className="relative mb-5">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium text-sm">🇮🇳 +91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit number"
                className="input-field pl-20"
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending OTP…
                </>
              ) : (
                <>Get OTP <ArrowRight size={18} /></>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5 px-4">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-blue-600 underline">Terms</Link> and{' '}
            <Link href="#" className="text-blue-600 underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Want to book services?{' '}
            <a href="http://localhost:3001" className="text-blue-600 font-semibold hover:underline">Customer App →</a>
          </p>
        </div>
      </div>
    </div>
  );
}

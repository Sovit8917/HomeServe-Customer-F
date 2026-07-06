'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, MapPin, FileText } from 'lucide-react';
import { workersService } from '@/services/workers.service';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', bio: '', experience: '', serviceRadius: '10' });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    setLoading(true);
    try {
      const res = await workersService.updateProfile({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        bio: form.bio.trim() || undefined,
        experience: Number(form.experience) || 0,
        serviceRadius: Number(form.serviceRadius) || 10,
      });
      updateUser(res.data.data);
      toast.success('Profile saved!');
      router.replace('/auth/select-services');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">HS</span>
          </div>
          <span className="font-bold text-lg text-gray-900">HomeServe Partner</span>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
              <User size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Complete your profile</h1>
              <p className="text-sm text-gray-500">Step 1 of 3 — Basic details</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
            <div className="bg-blue-600 h-1.5 rounded-full w-1/3" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Rajesh Kumar" className="input-field" />
            </div>
            <div>
              <label className="label">Email Address <span className="text-gray-400">(optional)</span></label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="rajesh@example.com" className="input-field" />
            </div>
            <div>
              <label className="label">Brief Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell customers about your experience and skills…"
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Experience (years)</label>
                <input type="number" min="0" max="50" value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="e.g. 5" className="input-field" />
              </div>
              <div>
                <label className="label">Service Radius (km)</label>
                <input type="number" min="1" max="100" value={form.serviceRadius} onChange={(e) => set('serviceRadius', e.target.value)} placeholder="10" className="input-field" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !form.name.trim()} className="btn-primary w-full mt-6">
            {loading ? 'Saving…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

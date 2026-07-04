'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { workersService } from '@/services/workers.service';
import { catalogService, CatalogService } from '@/services/catalog.service';
import toast from 'react-hot-toast';

export default function SelectServicesPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    catalogService.getServices()
      .then((r) => setCatalog(r.data.data || []))
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one service you can perform');
      return;
    }
    setSaving(true);
    try {
      await workersService.updateServices(selected);
      toast.success('You’re all set!');
      router.replace('/dashboard');
    } catch {
      toast.error('Failed to save services');
    } finally {
      setSaving(false);
    }
  };

  const grouped = catalog.reduce<Record<string, CatalogService[]>>((acc, s) => {
    const key = s.category?.name || 'Other';
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

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
              <Briefcase size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">What services do you offer?</h1>
              <p className="text-sm text-gray-500">Step 2 of 2 — This decides which jobs you'll see</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
            <div className="bg-blue-600 h-1.5 rounded-full w-full" />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-5 max-h-80 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([category, services]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => {
                      const active = selected.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggle(s.id)}
                          className={`px-3.5 py-2 text-sm font-medium rounded-xl border transition-colors ${
                            active
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleSubmit} disabled={saving || loading} className="btn-primary w-full mt-6">
            {saving ? 'Saving…' : `Finish (${selected.length} selected) →`}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            You can update these anytime from Profile → Skills &amp; Services.
          </p>
        </div>
      </div>
    </div>
  );
}

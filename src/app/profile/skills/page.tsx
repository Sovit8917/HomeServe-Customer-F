'use client';
import { useEffect, useState } from 'react';
import { Plus, X, Briefcase, AlertTriangle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { workersService } from '@/services/workers.service';
import { catalogService, CatalogService } from '@/services/catalog.service';
import toast from 'react-hot-toast';

const SUGGESTED_SKILLS = ['Plumbing', 'Electrical', 'AC Repair', 'Deep Cleaning', 'Painting', 'Carpentry', 'Pest Control', 'Appliance Repair', 'Waterproofing', 'Welding', 'Tiling', 'Interior Design'];

export default function SkillsPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Bookable services this worker offers — this is what actually controls
  // which customer bookings show up under "New" requests, so it must be
  // set or the worker will never see any jobs.
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [savingServices, setSavingServices] = useState(false);

  useEffect(() => {
    workersService.getProfile()
      .then((r) => {
        setSkills(r.data.data?.skills?.map((s: any) => s.skill) || []);
        setSelectedServiceIds(r.data.data?.services?.map((s: any) => s.serviceId) || []);
      })
      .catch(() => {});

    catalogService.getServices()
      .then((r) => setCatalog(r.data.data || []))
      .catch(() => toast.error('Failed to load services list'))
      .finally(() => setServicesLoading(false));
  }, []);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSaveServices = async () => {
    if (selectedServiceIds.length === 0) {
      toast.error('Select at least one service you offer');
      return;
    }
    setSavingServices(true);
    try {
      await workersService.updateServices(selectedServiceIds);
      toast.success('Services updated! You will now receive matching job requests.');
    } catch {
      toast.error('Failed to update services');
    } finally {
      setSavingServices(false);
    }
  };

  const groupedCatalog = catalog.reduce<Record<string, CatalogService[]>>((acc, s) => {
    const key = s.category?.name || 'Other';
    (acc[key] ||= []).push(s);
    return acc;
  }, {});

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (!s || skills.includes(s)) return;
    setSkills((prev) => [...prev, s]);
    setInput('');
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSave = async () => {
    setSaving(true);
    try {
      await workersService.updateSkills(skills);
      toast.success('Skills updated!');
    } catch {
      toast.error('Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Skills & Services" showBack subtitle="Add your expertise to attract more customers" />

      <div className="max-w-2xl space-y-5">
        {/* Bookable services — controls which customer bookings you receive */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Services You Offer</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Select every service you can perform. New booking requests only reach you for the services selected here.
          </p>

          {!servicesLoading && selectedServiceIds.length === 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 mb-4">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>You haven't selected any services yet, so you won't receive any job requests. Pick at least one below.</span>
            </div>
          )}

          {servicesLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-5 mb-5">
              {Object.entries(groupedCatalog).map(([category, services]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => {
                      const active = selectedServiceIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleService(s.id)}
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

          <button onClick={handleSaveServices} disabled={savingServices || servicesLoading} className="btn-primary w-full">
            {savingServices ? 'Saving…' : `Save Services (${selectedServiceIds.length} selected)`}
          </button>
        </div>

        {/* Add skill input */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Add a Skill</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill(input)}
              placeholder="Type a skill and press Enter…"
              className="input-field flex-1"
            />
            <button onClick={() => addSkill(input)} className="btn-primary !px-4 shrink-0">
              <Plus size={18} />
            </button>
          </div>

          {/* Suggestions */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">Suggested:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current skills */}
        {skills.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Your Skills ({skills.length})</h2>
            <div className="flex flex-wrap gap-2 mb-5">
              {skills.map((s) => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-blue-900 transition-colors">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : 'Save Skills'}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

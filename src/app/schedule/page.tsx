'use client';
import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { workersService } from '@/services/workers.service';
import { WorkingHour } from '@/types';
import toast from 'react-hot-toast';

const DEFAULT_HOURS: WorkingHour[] = [
  { day: 'Monday',    isOpen: true,  startTime: '08:00', endTime: '20:00' },
  { day: 'Tuesday',   isOpen: true,  startTime: '08:00', endTime: '20:00' },
  { day: 'Wednesday', isOpen: true,  startTime: '08:00', endTime: '20:00' },
  { day: 'Thursday',  isOpen: true,  startTime: '08:00', endTime: '20:00' },
  { day: 'Friday',    isOpen: true,  startTime: '08:00', endTime: '20:00' },
  { day: 'Saturday',  isOpen: true,  startTime: '09:00', endTime: '18:00' },
  { day: 'Sunday',    isOpen: false, startTime: '09:00', endTime: '18:00' },
];

export default function SchedulePage() {
  const [hours, setHours] = useState<WorkingHour[]>(DEFAULT_HOURS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    workersService.getWorkingHours()
      .then((r) => { if (r.data.data?.length) setHours(r.data.data); })
      .catch(() => {});
  }, []);

  const updateHour = (index: number, field: keyof WorkingHour, value: any) => {
    setHours((prev) => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await workersService.setWorkingHours(hours);
      toast.success('Working hours saved!');
    } catch {
      toast.error('Failed to save working hours');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="My Schedule" subtitle="Set your working hours and availability" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working hours */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Working Hours</h2>
          </div>
          <div className="space-y-4">
            {hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3">
                <ToggleSwitch checked={h.isOpen} onChange={(v) => updateHour(i, 'isOpen', v)} />
                <p className="text-sm font-medium text-gray-700 w-24 shrink-0">{h.day}</p>
                {h.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={h.startTime}
                      onChange={(e) => updateHour(i, 'startTime', e.target.value)}
                      className="input-field !py-1.5 text-sm flex-1"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={h.endTime}
                      onChange={(e) => updateHour(i, 'endTime', e.target.value)}
                      className="input-field !py-1.5 text-sm flex-1"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 flex-1">Closed</p>
                )}
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-5">
            {saving ? 'Saving…' : 'Save Working Hours'}
          </button>
        </div>

        {/* Tips */}
        <div className="card h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Schedule Tips</h2>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Stay consistent', desc: 'Regular availability helps customers plan bookings around your schedule.' },
              { title: 'Peak hours', desc: 'Mornings (9–11am) and evenings (5–7pm) are the busiest booking times.' },
              { title: 'Weekends matter', desc: 'Weekend availability can increase your bookings by up to 40%.' },
            ].map((tip) => (
              <div key={tip.title} className="p-3 bg-blue-50 rounded-xl">
                <p className="text-sm font-semibold text-blue-800 mb-0.5">{tip.title}</p>
                <p className="text-xs text-blue-600">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

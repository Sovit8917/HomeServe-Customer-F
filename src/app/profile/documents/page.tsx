'use client';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { workersService } from '@/services/workers.service';
import { uploadService } from '@/services/upload.service';
import { WorkerDocument } from '@/types';
import { FileText, Camera, CreditCard, CheckCircle2, Clock, Loader2, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface DocSlot {
  type: string;
  label: string;
  icon: React.ReactNode;
  accept: string;
  capture?: 'user' | 'environment';
}

const SLOTS: DocSlot[] = [
  { type: 'SELFIE_PHOTO', label: 'Live Selfie', icon: <Camera size={17} />, accept: 'image/*', capture: 'user' },
  { type: 'AADHAR_CARD', label: 'Aadhar Card', icon: <CreditCard size={17} />, accept: 'image/*,application/pdf' },
  { type: 'PAN_CARD', label: 'PAN Card', icon: <FileText size={17} />, accept: 'image/*,application/pdf' },
];

export default function DocumentsPage() {
  const [docs, setDocs] = useState<WorkerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await workersService.getDocuments();
      setDocs(res.data?.data || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const latestFor = (type: string) =>
    docs.filter((d) => d.type === type).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  const handleUpload = async (slot: DocSlot, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setUploadingType(slot.type);
    try {
      const url = await uploadService.uploadFile(file, 'worker-documents');
      await workersService.uploadDocument(slot.type, url);
      toast.success(`${slot.label} uploaded — pending verification`);
      await load();
    } catch {
      toast.error('Upload failed, please try again');
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="My Documents" subtitle="Upload or update your verification documents" showBack />

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3 max-w-lg">
          {SLOTS.map((slot) => {
            const doc = latestFor(slot.type);
            const isUploading = uploadingType === slot.type;
            return (
              <div key={slot.type} className="card flex items-center gap-3">
                <input
                  ref={(el) => { inputRefs.current[slot.type] = el; }}
                  type="file"
                  accept={slot.accept}
                  capture={slot.capture as any}
                  className="hidden"
                  onChange={(e) => handleUpload(slot, e.target.files?.[0] || null)}
                />
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
                  {doc?.url && doc.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                    <img src={doc.url} alt={slot.label} className="w-11 h-11 object-cover" />
                  ) : (
                    <span className="text-blue-600">{slot.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                  {doc ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {doc.isVerified ? (
                        <>
                          <CheckCircle2 size={13} className="text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} className="text-amber-500" />
                          <span className="text-xs text-amber-600 font-medium">Pending verification</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Not uploaded yet</p>
                  )}
                </div>
                {isUploading ? (
                  <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRefs.current[slot.type]?.click()}
                    disabled={doc?.isVerified}
                    className="text-xs font-semibold text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1"
                  >
                    {doc ? <><RefreshCcw size={12} /> Replace</> : slot.capture === 'user' ? 'Open Camera' : 'Upload'}
                  </button>
                )}
              </div>
            );
          })}

          <p className="text-xs text-gray-400 text-center pt-2">
            Verified documents can't be changed. Contact support if a verified document needs correction.
          </p>
        </div>
      )}
    </AppLayout>
  );
}

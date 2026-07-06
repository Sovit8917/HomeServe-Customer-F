'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Camera, CheckCircle2, Loader2, CreditCard, UploadCloud } from 'lucide-react';
import { workersService } from '@/services/workers.service';
import { uploadService } from '@/services/upload.service';
import toast from 'react-hot-toast';

interface DocSlot {
  key: string;
  type: string; // sent to backend as document type
  label: string;
  hint: string;
  icon: React.ReactNode;
  accept: string;
  capture?: 'user' | 'environment';
  required: boolean;
}

const SLOTS: DocSlot[] = [
  {
    key: 'selfie',
    type: 'SELFIE_PHOTO',
    label: 'Live Selfie',
    hint: 'Take a clear photo of your face using your camera',
    icon: <Camera size={18} />,
    accept: 'image/*',
    capture: 'user',
    required: true,
  },
  {
    key: 'aadhar',
    type: 'AADHAR_CARD',
    label: 'Aadhar Card',
    hint: 'Front side, all details clearly visible',
    icon: <CreditCard size={18} />,
    accept: 'image/*,application/pdf',
    required: true,
  },
  {
    key: 'pan',
    type: 'PAN_CARD',
    label: 'PAN Card',
    hint: 'Used for payouts & tax purposes',
    icon: <FileText size={18} />,
    accept: 'image/*,application/pdf',
    required: true,
  },
];

type SlotState = {
  file?: File;
  preview?: string;
  uploading?: boolean;
  done?: boolean;
};

export default function DocumentsUploadPage() {
  const router = useRouter();
  const [state, setState] = useState<Record<string, SlotState>>({});
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFile = (slot: DocSlot, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setState((s) => ({ ...s, [slot.key]: { file, preview, done: false } }));
  };

  const allReady = SLOTS.every((s) => !s.required || state[s.key]?.file);
  const anyUploading = Object.values(state).some((s) => s.uploading);

  const handleSubmit = async () => {
    if (!allReady) {
      toast.error('Please add all required documents');
      return;
    }
    setSubmitting(true);
    try {
      for (const slot of SLOTS) {
        const entry = state[slot.key];
        if (!entry?.file || entry.done) continue;
        setState((s) => ({ ...s, [slot.key]: { ...s[slot.key], uploading: true } }));
        const url = await uploadService.uploadFile(entry.file, 'worker-documents');
        await workersService.uploadDocument(slot.type, url);
        setState((s) => ({ ...s, [slot.key]: { ...s[slot.key], uploading: false, done: true } }));
      }
      toast.success('Documents submitted for review!');
      router.replace('/auth/pending-review');
    } catch {
      toast.error('Failed to upload one or more documents. Please try again.');
    } finally {
      setSubmitting(false);
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
              <UploadCloud size={22} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Verify your identity</h1>
              <p className="text-sm text-gray-500">Step 3 of 3 — Upload documents for approval</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
            <div className="bg-blue-600 h-1.5 rounded-full w-full" />
          </div>

          <div className="space-y-3">
            {SLOTS.map((slot) => {
              const entry = state[slot.key];
              return (
                <div key={slot.key} className="border border-gray-200 rounded-xl p-4">
                  <input
                    ref={(el) => { inputRefs.current[slot.key] = el; }}
                    type="file"
                    accept={slot.accept}
                    capture={slot.capture as any}
                    className="hidden"
                    onChange={(e) => handleFile(slot, e.target.files?.[0] || null)}
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${entry?.preview ? '' : 'bg-blue-50 text-blue-600'}`}>
                      {entry?.preview ? (
                        <img src={entry.preview} alt={slot.label} className="w-11 h-11 object-cover rounded-xl" />
                      ) : slot.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {slot.label} {slot.required && <span className="text-red-500">*</span>}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {entry?.file ? entry.file.name : slot.hint}
                      </p>
                    </div>
                    {entry?.uploading ? (
                      <Loader2 size={18} className="text-blue-500 animate-spin flex-shrink-0" />
                    ) : entry?.done ? (
                      <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => inputRefs.current[slot.key]?.click()}
                        className="text-xs font-semibold text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 flex-shrink-0"
                      >
                        {slot.capture === 'user' ? 'Open Camera' : entry?.file ? 'Change' : 'Upload'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allReady || submitting || anyUploading}
            className="btn-primary w-full mt-6"
          >
            {submitting ? 'Uploading…' : 'Submit for Review →'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Our team typically reviews applications within 24–48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

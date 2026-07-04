'use client';
import { useEffect, useState } from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { workersService } from '@/services/workers.service';
import toast from 'react-hot-toast';

interface BankDetailForm {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string;
}

const EMPTY_FORM: BankDetailForm = {
  accountName: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  upiId: '',
};

export default function BankDetailsPage() {
  const [form, setForm] = useState<BankDetailForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    workersService.getProfile()
      .then((r) => {
        const bd = r.data.data?.bankDetail;
        if (bd) {
          setForm({
            accountName: bd.accountName || '',
            accountNumber: bd.accountNumber || '',
            ifscCode: bd.ifscCode || '',
            bankName: bd.bankName || '',
            upiId: bd.upiId || '',
          });
          setHasExisting(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (field: keyof BankDetailForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.accountName.trim() || !form.accountNumber.trim() || !form.ifscCode.trim() || !form.bankName.trim()) {
      toast.error('Please fill in account name, number, IFSC and bank name');
      return;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifscCode.trim())) {
      toast.error('Enter a valid 11-character IFSC code');
      return;
    }
    setSaving(true);
    try {
      await workersService.updateBankDetails({
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),
        bankName: form.bankName.trim(),
        upiId: form.upiId.trim() || undefined,
      });
      toast.success('Bank details saved! You can now withdraw earnings.');
      setHasExisting(true);
    } catch {
      toast.error('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AppLayout><LoadingSpinner className="h-64" /></AppLayout>;

  return (
    <AppLayout>
      <PageHeader title="Bank Details" subtitle="Required to withdraw your earnings" showBack />

      <div className="max-w-xl">
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Landmark size={17} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">
              {hasExisting ? 'Your bank details are on file. Update them below if anything changed.' : 'Add your bank details once so withdrawals can be processed.'}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Account Holder Name</label>
              <input
                type="text"
                value={form.accountName}
                onChange={(e) => update('accountName', e.target.value)}
                placeholder="As per bank records"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(e) => update('accountNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 123456789012"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">IFSC Code</label>
              <input
                type="text"
                value={form.ifscCode}
                onChange={(e) => update('ifscCode', e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                className="input-field uppercase"
              />
            </div>
            <div>
              <label className="label">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => update('bankName', e.target.value)}
                placeholder="e.g. State Bank of India"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">UPI ID (optional)</label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => update('upiId', e.target.value)}
                placeholder="e.g. name@upi"
                className="input-field"
              />
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-2">
              {saving ? 'Saving…' : <><ShieldCheck size={16} /> Save Bank Details</>}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

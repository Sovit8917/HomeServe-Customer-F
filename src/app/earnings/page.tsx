'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight, Download } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { walletService } from '@/services/wallet.service';
import { Transaction } from '@/types';
import { formatCurrency, formatDateTime, cn } from '@/utils';
import toast from 'react-hot-toast';

const PERIODS = ['today', 'week', 'month'] as const;

export default function EarningsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [balance, setBalance] = useState(0);
  const [earnings, setEarnings] = useState<{ netEarnings: number; totalJobs: number } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const refreshWallet = () => {
    walletService.getWallet().then((r) => setBalance(r.data.data?.balance || 0)).catch(() => {});
    walletService.getTransactions().then((r) => setTransactions(r.data.data?.data || [])).catch(() => {});
  };

  useEffect(() => {
    refreshWallet();
    setLoading(false);
  }, []);

  useEffect(() => {
    walletService.getEarnings(period).then((r) => setEarnings(r.data.data)).catch(() => {});
  }, [period]);

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt < 100) { toast.error('Minimum withdrawal is ₹100'); return; }
    if (amt > balance) { toast.error('Insufficient balance'); return; }
    setWithdrawing(true);
    try {
      await walletService.withdraw(amt);
      setWithdrawAmount('');
      toast.success(`₹${amt} withdrawal requested!`);
    } catch (err: any) {
      // Surface the real reason (insufficient balance, no bank details on
      // file, etc.) instead of a generic message that hides what to fix.
      toast.error(err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
      // Always resync from the server rather than trusting an optimistic
      // local decrement — avoids the UI drifting out of sync with the
      // actual balance if a previous action changed it server-side.
      refreshWallet();
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Earnings" subtitle="Track your income and withdraw funds" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Wallet balance card */}
        <div className="lg:col-span-1">
          <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-200 text-sm font-medium">Wallet Balance</p>
              <Wallet size={20} className="text-blue-300" />
            </div>
            <p className="text-3xl font-bold mb-5">{formatCurrency(balance)}</p>

            <div className="space-y-3">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white placeholder-blue-200 text-sm focus:outline-none focus:bg-white/30 transition-colors"
              />
              <button
                onClick={handleWithdraw}
                disabled={withdrawing || !withdrawAmount}
                className="w-full flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold rounded-xl py-2.5 text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {withdrawing ? 'Processing…' : <><Download size={16} /> Withdraw Funds</>}
              </button>
              <Link href="/profile/bank-details" className="block text-center text-xs text-blue-200 hover:text-white underline underline-offset-2 transition-colors">
                Manage bank details
              </Link>
            </div>
          </div>
        </div>

        {/* Earnings summary */}
        <div className="lg:col-span-2">
          {/* Period tabs */}
          <div className="flex gap-2 mb-4">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium capitalize transition-all',
                  period === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300',
                )}
              >
                {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={TrendingUp} label={`${period === 'today' ? "Today's" : period === 'week' ? "Week's" : "Month's"} Earnings`} value={formatCurrency(earnings?.netEarnings ?? 0)} trend="+12%" trendUp iconColor="text-green-600" iconBg="bg-green-50" />
            <StatCard icon={ArrowDownLeft} label="Jobs Completed" value={String(earnings?.totalJobs ?? 0)} iconColor="text-blue-600" iconBg="bg-blue-50" />
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card">
        <h2 className="section-title mb-5">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No transactions yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 py-3.5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', t.type === 'CREDIT' ? 'bg-green-50' : 'bg-red-50')}>
                  {t.type === 'CREDIT'
                    ? <ArrowDownLeft size={18} className="text-green-600" />
                    : <ArrowUpRight size={18} className="text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(t.createdAt)}</p>
                </div>
                <span className={cn('font-bold text-sm shrink-0', t.type === 'CREDIT' ? 'text-green-600' : 'text-red-500')}>
                  {t.type === 'CREDIT' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

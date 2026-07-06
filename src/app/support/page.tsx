'use client';
import { useEffect, useState } from 'react';
import { HelpCircle, MessageSquare, Phone, ChevronRight, Send, Ticket as TicketIcon } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import { supportService } from '@/services/support.service';
import { SupportTicket, TicketStatus } from '@/types';
import { formatDateTime, cn } from '@/utils';
import toast from 'react-hot-toast';

const FAQ = [
  { q: 'How do I accept a new job request?',   a: 'Go to Jobs → New tab. Tap the job card to view details, then click "Accept Job" to confirm it.' },
  { q: 'When do I get paid?',                  a: 'Earnings are credited to your wallet after a job is marked complete. You can withdraw anytime (min ₹100).' },
  { q: 'How do I update my availability?',     a: 'Go to Schedule from the menu to set your working hours and mark holidays.' },
  { q: 'What if a customer cancels?',          a: 'If the customer cancels after you accepted, a cancellation fee may be charged to them which is shared with you.' },
  { q: 'How is my rating calculated?',         a: 'Your rating is the average of all customer reviews after completed jobs. Aim for 5★ on every job!' },
];

const TICKET_STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
};

const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const loadTickets = () => {
    supportService.getTickets()
      .then((r) => setTickets(r.data.data?.tickets || []))
      .catch(() => {})
      .finally(() => setTicketsLoading(false));
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openTicket = async (t: SupportTicket) => {
    setSelected(t);
    setDetailLoading(true);
    try {
      const res = await supportService.getTicket(t.id);
      setSelected(res.data?.data);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const res = await supportService.reply(selected.id, replyText.trim());
      const newMsg = res.data?.data;
      setSelected((s) => (s ? { ...s, messages: [...(s.messages || []), newMsg] } : s));
      setReplyText('');
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await supportService.createTicket(form);
      toast.success('Support ticket created! We\'ll respond within 24 hours.');
      setForm({ subject: '', description: '' });
      loadTickets(); // reflect the new ticket + its status immediately
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Help & Support" subtitle="We're here to help you succeed" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Quick contact */}
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:1800-000-0000" className="card flex flex-col items-center gap-2 py-5 hover:shadow-md transition-all text-center">
              <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                <Phone size={20} className="text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Call Support</p>
              <p className="text-xs text-gray-400">1800-000-0000</p>
            </a>
            <div className="card flex flex-col items-center gap-2 py-5 text-center">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Live Chat</p>
              <p className="text-xs text-gray-400">Mon–Sat, 9am–6pm</p>
            </div>
          </div>

          {/* Raise ticket */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Raise a Ticket</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Payment not received"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your issue in detail…"
                  rows={4}
                  className="input-field resize-none"
                />
              </div>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting…' : <><Send size={16} /> Submit Ticket</>}
              </button>
            </div>
          </div>

          {/* My Tickets */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">My Tickets</h2>
            {ticketsLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <TicketIcon size={22} className="text-gray-300" />
                <p className="text-sm text-gray-400">No tickets raised yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openTicket(t)}
                    className="w-full text-left border border-gray-100 rounded-xl px-4 py-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800">{t.subject}</p>
                      <span className={cn('badge text-xs px-2.5 py-1 shrink-0', TICKET_STATUS_STYLE[t.status])}>
                        {TICKET_STATUS_LABEL[t.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(t.createdAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — FAQ */}
        <div className="card h-fit">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {FAQ.map((f, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-start justify-between w-full text-left px-4 py-3.5 gap-2 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800">{f.q}</span>
                  <ChevronRight size={16} className={`shrink-0 text-gray-400 transition-transform mt-0.5 ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 pt-3">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={() => { setSelected(null); setReplyText(''); }}>
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{selected.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('badge text-xs px-2.5 py-1', TICKET_STATUS_STYLE[selected.status])}>
                    {TICKET_STATUS_LABEL[selected.status]}
                  </span>
                  <span className="text-xs text-gray-400">{formatDateTime(selected.createdAt)}</span>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setReplyText(''); }} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">×</button>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-700">{selected.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {detailLoading ? (
                <p className="text-sm text-gray-400 text-center py-6">Loading conversation…</p>
              ) : selected.messages?.length ? (
                selected.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderType === 'WORKER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                      m.senderType === 'WORKER' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                    )}>
                      <p>{m.message}</p>
                      <p className={cn('text-xs mt-1', m.senderType === 'WORKER' ? 'text-blue-200' : 'text-gray-400')}>
                        {new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No replies yet — support will respond soon.</p>
              )}
            </div>

            {selected.status !== 'CLOSED' && (
              <div className="flex items-end gap-2 px-5 py-3 border-t border-gray-100">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply…"
                  rows={1}
                  className="input-field resize-none flex-1"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="btn-primary !w-auto !px-4 shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

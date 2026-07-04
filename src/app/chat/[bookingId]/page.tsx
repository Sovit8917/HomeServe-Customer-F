'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types';
import { formatDateTime, cn } from '@/utils';
import toast from 'react-hot-toast';

export default function ChatDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatService.getMessages(bookingId);
      setMessages(res.data.data || []);
    } catch {}
  }, [bookingId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');
    try {
      await chatService.sendMessage(bookingId, text);
      await fetchMessages();
    } catch {
      toast.error('Failed to send message');
      setInput(text); // give it back so the user doesn't lose what they typed
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/jobs" className="p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Customer Chat</p>
          <p className="text-xs text-gray-400">Booking #{bookingId.slice(0, 8)}…</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[75%] px-4 py-2.5 rounded-2xl text-sm', isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-900 shadow-sm rounded-bl-sm border border-gray-100')}>
                <p>{msg.message}</p>
                <p className={cn('text-[10px] mt-1', isMe ? 'text-blue-200 text-right' : 'text-gray-400')}>
                  {formatDateTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
          className="input-field flex-1"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

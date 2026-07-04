'use client';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { notificationsService } from '@/services/notifications.service';
import { Notification } from '@/types';
import { formatDateTime, cn } from '@/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationsService
      .getAll()
      .then((r) => setNotifications(r.data.data?.notifications || []))
      .catch(() => {});
  }, []);

  const markRead = async (id: string) => {
    await notificationsService.markRead(id).catch(() => {});
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <AppLayout>
      <PageHeader title="Notifications" />
      {notifications.length === 0 ? (
        <div className="card mt-4">
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up! New alerts will appear here." />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn('card flex gap-4 cursor-pointer hover:shadow-md transition-all', !n.isRead && 'border-l-4 border-blue-500')}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', n.isRead ? 'bg-gray-100' : 'bg-blue-100')}>
                <Bell size={18} className={n.isRead ? 'text-gray-400' : 'text-blue-600'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

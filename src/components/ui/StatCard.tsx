import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({ icon: Icon, label, value, trend, trendUp, iconColor = 'text-blue-600', iconBg = 'bg-blue-50' }: Props) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

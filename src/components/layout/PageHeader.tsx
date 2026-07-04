'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, showBack = false, action }: Props) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

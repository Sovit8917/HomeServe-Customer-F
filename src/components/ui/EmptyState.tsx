import { LucideIcon } from 'lucide-react';
interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} strokeWidth={1.5} className="text-blue-400" />
        </div>
      )}
      <p className="text-base font-semibold text-gray-700 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-5 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

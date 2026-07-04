'use client';
import { cn } from '@/utils';

interface Props {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function ToggleSwitch({ checked, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0',
        checked ? 'bg-blue-600' : 'bg-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

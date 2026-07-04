'use client';
import { useRef, KeyboardEvent, ClipboardEvent } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (val: string) => void;
}

export default function OtpInput({ length = 6, value, onChange }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(''));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(paste);
    refs.current[Math.min(paste.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                     bg-gray-50 transition-all"
        />
      ))}
    </div>
  );
}

import { Star } from 'lucide-react';
import { cn } from '@/utils';

export default function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300')}
        />
      ))}
    </div>
  );
}

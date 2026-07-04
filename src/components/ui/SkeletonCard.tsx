export default function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white rounded-2xl p-5 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

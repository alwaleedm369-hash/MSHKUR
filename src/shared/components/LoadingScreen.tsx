import { Sparkles } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center animate-pulse-soft">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 opacity-30 blur-xl animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-heading-md font-semibold text-surface-900 dark:text-white">مشكور</p>
          <p className="text-body-md text-surface-500 dark:text-surface-400 mt-1">جاري التحميل...</p>
        </div>
        <div className="h-2 w-48 bg-surface-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const PageLoading = ({ message = 'جاري التحميل...' }: { message?: string }) => {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center animate-spin">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <p className="text-body-md text-surface-500">{message}</p>
      </div>
    </div>
  );
};

export const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[4/3] skeleton-card" />
    <div className="p-4 space-y-3">
      <div className="skeleton-title" />
      <div className="skeleton-text w-3/4" />
      <div className="flex gap-2">
        <div className="skeleton h-8 w-20 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="skeleton-avatar h-12 w-12 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-text w-1/3" />
          <div className="skeleton-text w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 6, cols = 3 }: { count?: number; cols?: number }) => (
  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
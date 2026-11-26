import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, Check, MoreHorizontal, Compare, Eye, Download, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '@utils/cn';
import { ImageFile, ProcessingJob } from '../types';

interface ImageGridProps {
  images: ImageFile[];
  selectedIds: string[];
  viewMode: 'grid' | 'list';
  onSelect: (id: string, multi?: boolean) => void;
  onCompare: (id: string) => void;
  onRemove: (ids: string[]) => void;
  processingJobs: ProcessingJob[];
}

export const ImageGrid = ({
  images,
  selectedIds,
  viewMode,
  onSelect,
  onCompare,
  onRemove,
  processingJobs,
}: ImageGridProps) => {
  const getImageStatus = (imageId: string) => {
    const job = processingJobs.find(j => j.imageIds.includes(imageId) && j.status === 'processing');
    return job;
  };

  const getLatestProcessed = (image: ImageFile) => {
    const nonOriginal = image.processedBlobs.filter(p => !p.isOriginal);
    return nonOriginal.length > 0 ? nonOriginal[nonOriginal.length - 1] : null;
  };

  if (viewMode === 'grid') {
    return (
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
        role="list"
        aria-label="صور السيارات"
      >
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.article
              key={image.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="relative group"
            >
              <ImageGridItem
                image={image}
                index={index}
                isSelected={selectedIds.includes(image.id)}
                onSelect={onSelect}
                onCompare={onCompare}
                onRemove={onRemove}
                job={getImageStatus(image.id)}
                latestProcessed={getLatestProcessed(image)}
              />
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-2" role="list" aria-label="صور السيارات">
      <AnimatePresence>
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="relative group"
          >
            <ImageListItem
              image={image}
              index={index}
              isSelected={selectedIds.includes(image.id)}
              onSelect={onSelect}
              onCompare={onCompare}
              onRemove={onRemove}
              job={getImageStatus(image.id)}
              latestProcessed={getLatestProcessed(image)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ImageGridItem = ({
  image,
  index,
  isSelected,
  onSelect,
  onCompare,
  onRemove,
  job,
  latestProcessed,
}: {
  image: ImageFile;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onCompare: (id: string) => void;
  onRemove: (ids: string[]) => void;
  job: ProcessingJob | undefined;
  latestProcessed: any;
}) => {
  const isProcessing = !!job;

  return (
    <div
      className={cn(
        'card overflow-hidden relative',
        isSelected && 'ring-2 ring-brand-500 ring-offset-2'
      )}
      onClick={() => onSelect(image.id, true)}
      role="listitem"
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={e => { e.stopPropagation(); onSelect(image.id, true); }}
          className={cn(
            'h-6 w-6 rounded-lg flex items-center justify-center transition-all',
            isSelected
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white/80 dark:bg-surface-900/80 text-surface-600 border border-surface-300 backdrop-blur'
          )}
          aria-label={isSelected ? 'إلغاء التحديد' : 'تحديد'}
          aria-pressed={isSelected}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
        </button>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-body-sm">جاري المعالجة... {Math.round(job.progress)}%</p>
          </div>
        </div>
      )}

      {/* Image Preview */}
      <div className="aspect-[4/3] relative overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img
          src={latestProcessed?.preview || image.preview}
          alt={`${image.name} - ${latestProcessed ? 'معالجة' : 'أصلية'}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {latestProcessed && (
            <span className="badge badge-success text-body-xs">
              <Check className="h-3 w-3" />
              معالجة
            </span>
          )}
          {image.processedBlobs.length > 1 && (
            <span className="badge badge-primary text-body-xs">
              {image.processedBlobs.length - 1} عمليات
            </span>
          )}
        </div>

        {/* Quick Actions on Hover */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <button
            onClick={e => { e.stopPropagation(); onCompare(image.id); }}
            className="btn-icon p-2 bg-white/90 dark:bg-surface-900/90 backdrop-blur"
            aria-label="مقارنة قبل/بعد"
          >
            <Compare className="h-4 w-4" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onRemove([image.id]); }}
            className="btn-icon p-2 bg-white/90 dark:bg-surface-900/90 backdrop-blur text-error-DEFAULT"
            aria-label="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-medium text-surface-900 dark:text-white truncate">
              {image.name}
            </p>
            <p className="text-body-xs text-surface-500">
              {formatFileSize(image.size)} • {image.width || '?'}×{image.height || '?'}
            </p>
          </div>
        </div>

        {/* Processing History */}
        {image.processedBlobs.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {image.processedBlobs.map((blob, i) => (
              <span
                key={blob.id}
                className={cn(
                  'badge px-2 py-1 whitespace-nowrap flex-shrink-0',
                  blob.isOriginal ? 'badge-neutral' : 'badge-primary'
                )}
              >
                {i === 0 ? 'أصل' : blob.toolName}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ImageListItem = ({
  image,
  index,
  isSelected,
  onSelect,
  onCompare,
  onRemove,
  job,
  latestProcessed,
}: {
  image: ImageFile;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onCompare: (id: string) => void;
  onRemove: (ids: string[]) => void;
  job: ProcessingJob | undefined;
  latestProcessed: any;
}) => {
  const isProcessing = !!job;

  return (
    <div
      className={cn(
        'card flex items-center gap-4 p-3',
        isSelected && 'ring-2 ring-brand-500 ring-offset-2'
      )}
      onClick={() => onSelect(image.id, true)}
      role="listitem"
    >
      {/* Selection */}
      <button
        onClick={e => { e.stopPropagation(); onSelect(image.id, true); }}
        className={cn(
          'h-6 w-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
          isSelected
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white/80 dark:bg-surface-900/80 text-surface-600 border border-surface-300 backdrop-blur'
        )}
        aria-label={isSelected ? 'إلغاء التحديد' : 'تحديد'}
        aria-pressed={isSelected}
      >
        {isSelected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
      </button>

      {/* Thumbnail */}
      <div className="relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img
          src={latestProcessed?.preview || image.preview}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
        {latestProcessed && (
          <span className="absolute bottom-1 right-1 badge badge-success text-body-xs">
            <Check className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-body-sm font-medium text-surface-900 dark:text-white truncate">
          {image.name}
        </p>
        <p className="text-body-xs text-surface-500">
          {formatFileSize(image.size)} • {image.width || '?'}×{image.height || '?'}
        </p>
        {latestProcessed && (
          <span className="badge badge-primary text-body-xs">
            {latestProcessed.toolName}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onCompare(image.id); }}
          className="btn-icon p-2"
          aria-label="مقارنة قبل/بعد"
        >
          <Compare className="h-4 w-4" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onRemove([image.id]); }}
          className="btn-icon p-2 text-error-DEFAULT"
          aria-label="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          className="btn-icon p-2"
          aria-label="المزيد"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
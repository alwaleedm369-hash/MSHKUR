import { CompareViewer } from './CompareViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, Check, MoreHorizontal, Compare, Eye, Download, RotateCcw, Loader2, AlertCircle, Share2, Copy, ZoomIn, ZoomOut, RotateCcw as RotateCcwIcon, Crop, Scissors, Sparkles, Wand2, Sun, Moon, Droplet, Contrast, Layers, Maximize, Minimize } from 'lucide-react';
import { cn } from '@utils/cn';
import { ImageFile, ProcessingJob } from '../types';

interface MobileImageGridProps {
  images: ImageFile[];
  selectedIds: string[];
  viewMode: 'grid' | 'list' | 'compare';
  onSelect: (id: string, multi?: boolean) => void;
  onCompare: (id: string) => void;
  onRemove: (ids: string[]) => void;
  onShare: (id: string) => void;
  onEdit: (id: string) => void;
  processingJobs: ProcessingJob[];
  onViewModeChange: (mode: 'grid' | 'list' | 'compare') => void;
}

export const MobileImageGrid = ({
  images,
  selectedIds,
  viewMode,
  onSelect,
  onCompare,
  onRemove,
  onShare,
  onEdit,
  processingJobs,
  onViewModeChange,
}: MobileImageGridProps) => {
  const getImageStatus = (imageId: string) => {
    return processingJobs.find(j => j.imageIds.includes(imageId) && j.status === 'processing');
  };

  const getLatestProcessed = (image: ImageFile) => {
    const nonOriginal = image.processedBlobs.filter(p => !p.isOriginal);
    return nonOriginal.length > 0 ? nonOriginal[nonOriginal.length - 1] : null;
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-4 pb-24">
      {/* View Mode Selector */}
      <div className="sticky top-16 z-30 mx-4 mb-4 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md rounded-xl border border-surface-200 dark:border-surface-800 p-2 shadow-lg">
        <div className="flex items-center gap-1" role="group" aria-label="View mode">
          {[
            { mode: 'grid' as const, icon: Grid, label: 'Grid' },
            { mode: 'list' as const, icon: List, label: 'List' },
            { mode: 'compare' as const, icon: Compare, label: 'Compare' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-body-xs font-medium transition-all',
                viewMode === mode
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-white'
              )}
              aria-label={label}
              aria-pressed={viewMode === mode}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <AnimatePresence mode="pop">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-3 px-4"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
            role="list"
            aria-label="Vehicle images"
          >
            {images.map((image, index) => (
              <MobileImageCard
                key={image.id}
                image={image}
                index={index}
                isSelected={selectedIds.includes(image.id)}
                onSelect={onSelect}
                onCompare={onCompare}
                onRemove={onRemove}
                onShare={onShare}
                onEdit={onEdit}
                job={getImageStatus(image.id)}
                latestProcessed={getLatestProcessed(image)}
              />
            ))}
          </motion.div>
        ) : viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2 px-4"
            role="list"
            aria-label="Vehicle images"
          >
            {images.map((image, index) => (
              <MobileImageListItem
                key={image.id}
                image={image}
                index={index}
                isSelected={selectedIds.includes(image.id)}
                onSelect={onSelect}
                onCompare={onCompare}
                onRemove={onRemove}
                onShare={onShare}
                onEdit={onEdit}
                job={getImageStatus(image.id)}
                latestProcessed={getLatestProcessed(image)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="compare"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            {selectedIds.length === 1 && images.find(img => img.id === selectedIds[0]) && (
              <CompareViewer
                image={images.find(img => img.id === selectedIds[0])!}
                showOriginal={true}
                onClose={() => onViewModeChange('grid')}
                onToggleOriginal={() => {}}
              />
            )}
            {selectedIds.length !== 1 && (
              <div className="text-center py-12 text-surface-500">
                <Compare className="h-12 w-12 mx-auto text-surface-300 mb-4" />
                <p className="text-body-md">Select one image to compare</p>
                <p className="text-body-sm mt-1">Tap an image to select it</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-4 z-40 flex flex-col md:flex-row md:items-center md:justify-end gap-3 pointer-events-none"
        >
          <motion.button
            onClick={() => onShare(selectedIds[0])}
            disabled={selectedIds.length !== 1}
            className={cn(
              'btn btn-primary flex-1 md:flex-none gap-2 pointer-events-auto',
              selectedIds.length !== 1 && 'opacity-50'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
          <motion.button
            onClick={() => onEdit(selectedIds[0])}
            disabled={selectedIds.length !== 1}
            className={cn(
              'btn btn-secondary flex-1 md:flex-none gap-2 pointer-events-auto',
              selectedIds.length !== 1 && 'opacity-50'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Process</span>
          </motion.button>
          <motion.button
            onClick={() => onRemove(selectedIds)}
            className="btn btn-danger flex-1 md:flex-none gap-2 pointer-events-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedIds.length > 1 ? `Delete ${selectedIds.length}` : 'Delete'}</span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

const MobileImageCard = ({
  image,
  index,
  isSelected,
  onSelect,
  onCompare,
  onRemove,
  onShare,
  onEdit,
  job,
  latestProcessed,
}: {
  image: ImageFile;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onCompare: (id: string) => void;
  onRemove: (ids: string[]) => void;
  onShare: (id: string) => void;
  onEdit: (id: string) => void;
  job: ProcessingJob | undefined;
  latestProcessed: any;
}) => {
  const isProcessing = !!job;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'card relative overflow-hidden',
        isSelected && 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-surface-900'
      )}
      onClick={() => onSelect(image.id, true)}
      role="listitem"
    >
      {/* Selection Checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={e => { e.stopPropagation(); onSelect(image.id, true); }}
          className={cn(
            'h-7 w-7 rounded-lg flex items-center justify-center transition-all backdrop-blur',
            isSelected
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white/90 dark:bg-surface-900/90 text-surface-600 border border-surface-300'
          )}
          aria-label={isSelected ? 'Deselect' : 'Select'}
          aria-pressed={isSelected}
        >
          {isSelected ? <Check className="h-4 w-4" /> : <span className="h-4 w-4" />}
        </button>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-body-sm">Processing... {Math.round(job?.progress || 0)}%</p>
          </div>
        </div>
      )}

      {/* Image Preview */}
      <div className="aspect-[4/3] relative overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img
          src={latestProcessed?.preview || image.preview}
          alt={`${image.name} - ${latestProcessed ? 'Processed' : 'Original'}`}
          className="w-full h-full object-cover transition-transform duration-300 active:scale-105"
          loading="lazy"
        />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {latestProcessed && (
            <span className="badge badge-success text-body-xs">
              <Check className="h-3 w-3" />
              Processed
            </span>
          )}
          {image.processedBlobs.length > 1 && (
            <span className="badge badge-primary text-body-xs">
              {image.processedBlobs.length - 1} ops
            </span>
          )}
        </div>

        {/* Quick Actions on Tap/Hover */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 active:opacity-100 transition-opacity translate-y-2 active:translate-y-0">
          <button
            onClick={e => { e.stopPropagation(); onCompare(image.id); }}
            className="btn btn-primary flex-1 gap-1.5 py-2"
            aria-label="Compare before/after"
          >
            <Compare className="h-4 w-4" />
            <span className="hidden sm:inline">Compare</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onShare(image.id); }}
            className="btn btn-secondary flex-1 gap-1.5 py-2"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onRemove([image.id]); }}
            className="btn btn-danger flex-1 gap-1.5 py-2"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
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
              {image.width || '?'}×{image.height || '?'} • {image.processedBlobs.length - 1} ops
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
                  'badge px-2 py-1 whitespace-nowrap flex-shrink-0 text-body-xs',
                  blob.isOriginal ? 'badge-neutral' : 'badge-primary'
                )}
              >
                {i === 0 ? 'Original' : blob.toolName}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={e => { e.stopPropagation(); onCompare(image.id); }}
            className="btn btn-secondary flex-1 gap-1.5"
            aria-label="Compare"
          >
            <Compare className="h-4 w-4" />
            <span>Compare</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onShare(image.id); }}
            className="btn btn-secondary flex-1 gap-1.5"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(image.id); }}
            className="btn btn-secondary flex-1 gap-1.5"
            aria-label="Edit"
          >
            <Wand2 className="h-4 w-4" />
            <span>Process</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onRemove([image.id]); }}
            className="btn btn-danger flex-1 gap-1.5"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
};

const MobileImageListItem = ({
  image,
  index,
  isSelected,
  onSelect,
  onCompare,
  onRemove,
  onShare,
  onEdit,
  job,
  latestProcessed,
}: {
  image: ImageFile;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, multi?: boolean) => void;
  onCompare: (id: string) => void;
  onRemove: (ids: string[]) => void;
  onShare: (id: string) => void;
  onEdit: (id: string) => void;
  job: ProcessingJob | undefined;
  latestProcessed: any;
}) => {
  const isProcessing = !!job;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'card flex items-center gap-3 p-3',
        isSelected && 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-surface-900'
      )}
      onClick={() => onSelect(image.id, true)}
      role="listitem"
    >
      {/* Selection */}
      <button
        onClick={e => { e.stopPropagation(); onSelect(image.id, true); }}
        className={cn(
          'h-7 w-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
          isSelected
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white/80 dark:bg-surface-900/80 text-surface-600 border border-surface-300 backdrop-blur'
        )}
        aria-label={isSelected ? 'Deselect' : 'Select'}
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
          {image.width || '?'}×{image.height || '?'} • {image.processedBlobs.length - 1} ops
        </p>
        {latestProcessed && (
          <span className="badge badge-primary text-body-xs">
            {latestProcessed.toolName}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={e => { e.stopPropagation(); onCompare(image.id); }}
          className="btn-icon p-2"
          aria-label="Compare"
        >
          <Compare className="h-4 w-4" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onShare(image.id); }}
          className="btn-icon p-2"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onEdit(image.id); }}
          className="btn-icon p-2"
          aria-label="Process"
        >
          <Wand2 className="h-4 w-4" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onRemove([image.id]); }}
          className="btn-icon p-2 text-error-DEFAULT"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const MobileCompareCard = ({
  image,
  job,
  latestProcessed,
  onClose,
}: {
  image: ImageFile;
  job: ProcessingJob | undefined;
  latestProcessed: any;
  onClose: () => void;
}) => {
  const [mode, setMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const originalPreview = image.originalPreview;
  const processedPreview = latestProcessed?.preview || image.preview;

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      updateSliderPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  useEffect(() => {
    if (isDragging.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging.current]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Compare before/after"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white"
            aria-label="Close comparison"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-heading-md font-semibold text-white truncate">{image.name}</h2>
            <p className="text-body-sm text-white/60">Before / After Comparison</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1" role="group" aria-label="Comparison mode">
            <button
              onClick={() => setMode('side-by-side')}
              className={cn(
                'btn-icon p-2 rounded-md transition-colors',
                mode === 'side-by-side' ? 'bg-white text-white' : 'text-white/60 hover:text-white'
              )}
              aria-label="Side by side"
              aria-pressed={mode === 'side-by-side'}
            >
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <div className="w-4 h-4 bg-green-500 rounded" />
              </div>
            </button>
            <button
              onClick={() => setMode('slider')}
              className={cn(
                'btn-icon p-2 rounded-md transition-colors',
                mode === 'slider' ? 'bg-white text-white' : 'text-white/60 hover:text-white'
              )}
              aria-label="Slider"
              aria-pressed={mode === 'slider'}
            >
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 bg-blue-500 rounded" />
                <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-green-500 rounded-r" />
              </div>
            </button>
          </div>

          <button
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white"
            aria-label="Download"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Comparison View */}
      <div className="flex-1 overflow-hidden relative" ref={containerRef}>
        {mode === 'side-by-side' ? (
          <div className="h-full flex">
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-surface-900">
              <img
                src={originalPreview}
                alt="Original image"
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span className="badge bg-surface-900/80 text-white backdrop-blur">Original</span>
              </div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-surface-900">
              <img
                src={processedPreview}
                alt="Processed image"
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span className="badge bg-brand-600 text-white">{latestProcessed?.toolName || 'Processed'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full w-full relative">
            <div className="absolute inset-0 flex items-center justify-center bg-surface-900">
              <img
                src={originalPreview}
                alt="Original image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center bg-surface-900 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={processedPreview}
                alt="Processed image"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div
              className="absolute top-0 bottom-0 w-1 bg-white/50 pointer-events-none"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-surface-900">
                <div className="h-6 w-6 border-l-2 border-r-2 border-surface-900" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4">
              <span className="badge bg-surface-900/80 text-white backdrop-blur">Original</span>
            </div>
            <div className="absolute bottom-4 right-4">
              <span className="badge bg-brand-600 text-white">Processed</span>
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-body-sm font-mono">
              {Math.round(sliderPosition)}%
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4 text-white/70 text-body-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-surface-400" />
            Original
          </span>
          {latestProcessed && (
            <span className="flex items-center gap-1.">
              <span className="w-3 h-3 rounded-full bg-brand-500" />
              {latestProcessed.toolName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-ghost btn-sm gap-1.5 text-white/70 hover:text-white">
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button className="btn btn-primary btn-sm gap-1.5">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Grid, List, Compare, Share2, Wand2, Download, Compare as CompareIcon, Check, Trash2, Loader2, Copy, ZoomIn, ZoomOut, RotateCcw, Crop, Scissors, Sparkles, Sun, Moon, Droplet, Contrast, Layers, Maximize, Minimize, MoreHorizontal, AlertCircle, Settings, Image as ImageIcon, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Minus, Search, Filter, Clock, Calendar, Heart, Star, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
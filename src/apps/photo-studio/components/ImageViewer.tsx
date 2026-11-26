import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X, Maximize, Minimize, RotateCw, RotateCcw, ZoomIn, ZoomOut,
  Download, Share2, Eye, EyeOff, Check, Trash2, MoreHorizontal,
  ArrowLeft, ArrowRight, Copy, Settings, Zap
} from 'lucide-react';
import { cn } from '@utils/cn';
import { ImageFile } from '../types';

interface ImageViewerProps {
  image: ImageFile | null;
  images: ImageFile[];
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete: (id: string) => void;
  onCompare: (id: string) => void;
  onExport: (image: ImageFile) => void;
}

export const ImageViewer = ({
  image,
  images,
  onClose,
  onNext,
  onPrev,
  onDelete,
  onCompare,
  onExport,
}: ImageViewerProps) => {
  if (!image) return null;

  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [currentBlobIndex, setCurrentBlobIndex] = useState(image.processedBlobs.length - 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const currentBlob = image.processedBlobs[currentBlobIndex];
  const isOriginal = currentBlob.isOriginal;
  const canGoNext = images.indexOf(image) < images.length - 1;
  const canGoPrev = images.indexOf(image) > 0;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom(prev => {
        const newZoom = Math.max(0.1, Math.min(5, prev - e.deltaY * 0.001));
        return newZoom;
      });
    } else {
      setPosition(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      e.preventDefault();
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => setZoom(prev => Math.min(5, prev * 1.2)), []);
  const zoomOut = useCallback(() => setZoom(prev => Math.max(0.1, prev / 1.2)), []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
        onNext();
        break;
      case 'ArrowLeft':
        onPrev();
        break;
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      case '0':
        resetView();
        break;
      case ' ':
        e.preventDefault();
        setShowOriginal(prev => !prev);
        break;
    }
  }, [onClose, onNext, onPrev, zoomIn, zoomOut, resetView]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    resetView();
    setCurrentBlobIndex(image.processedBlobs.length - 1);
    setShowOriginal(false);
  }, [image, resetView]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`معاينة: ${image.name}`}
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white"
            aria-label="إغلاق المعاينة"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-heading-md font-semibold text-white truncate">{image.name}</h2>
            <div className="flex items-center justify-center gap-3 mt-1 text-body-xs text-white/60">
              <span>{image.width || '?'} × {image.height || '?'}</span>
              <span>•</span>
              <span>{zoom * 100}%</span>
              <span>•</span>
              <span>{currentBlob.isOriginal ? 'الأصل' : currentBlob.toolName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Version Selector */}
          <div className="relative">
            <button
              className="btn btn-ghost btn-sm gap-2 bg-white/10 text-white hover:bg-white/20"
              aria-label="اختيار النسخة"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentBlob.isOriginal ? 'الأصل' : currentBlob.toolName}
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className={cn(
              'btn-icon p-2 bg-white/10 hover:bg-white/20 text-white transition-colors',
              showOriginal && 'bg-brand-500/20'
            )}
            aria-label={showOriginal ? 'إخفاء الأصل' : 'إظهار الأصل'}
            aria-pressed={showOriginal}
          >
            {showOriginal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>

          <button
            onClick={() => onExport(image)}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white"
            aria-label="تنزيل"
          >
            <Download className="h-5 w-5" />
          </button>

          <button
            onClick={() => onDelete(image.id)}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-error-DEFAULT hover:text-error-light"
            aria-label="حذف"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Original Layer */}
        <AnimatePresence mode="wait">
          {showOriginal && (
            <motion.img
              key="original"
              src={image.originalPreview}
              alt={`${image.name} - الأصل`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 max-w-full max-h-full object-contain"
              style={{
                opacity: 0.5,
                pointerEvents: 'none',
                filter: 'grayscale(20%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Current Version */}
        <motion.img
          key={currentBlob.id}
          ref={imgRef}
          src={currentBlob.preview}
          alt={`${image.name} - ${currentBlob.isOriginal ? 'الأصل' : currentBlob.toolName}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-full max-h-full object-contain touch-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.1s ease-out',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        />

        {/* Zoom Indicator */}
        {zoom !== 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 badge bg-black/80 text-white backdrop-blur"
          >
            {Math.round(zoom * 100)}%
          </motion.div>
        )}

        {/* Navigation Arrows */}
        {canGoPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 btn-icon p-3 bg-white/10 hover:bg-white/20 text-white rounded-full shadow-lg"
            aria-label="السابق"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        )}

        {canGoNext && (
          <button
            onClick={onNext}
            className="absolute right-4 btn-icon p-3 bg-white/10 hover:bg-white/20 text-white rounded-full shadow-lg"
            aria-label="التالي"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-white/10 flex items-center justify-between gap-4">
        {/* Version History */}
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max">
            {image.processedBlobs.map((blob, index) => (
              <button
                key={blob.id}
                onClick={() => {
                  setCurrentBlobIndex(index);
                  setShowOriginal(false);
                }}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[80px]',
                  currentBlobIndex === index
                    ? 'bg-brand-500/20 border border-brand-500/30'
                    : 'bg-white/5 hover:bg-white/10'
                )}
                aria-label={blob.isOriginal ? 'الأصل' : blob.toolName}
                aria-current={currentBlobIndex === index ? 'true' : 'false'}
              >
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden',
                  currentBlobIndex === index ? 'bg-brand-500' : 'bg-white/10'
                )}>
                  {blob.isOriginal ? (
                    <Check className={cn('h-5 w-5', currentBlobIndex === index ? 'text-white' : 'text-brand-600')} />
                  ) : (
                    <Zap className={cn('h-5 w-5', currentBlobIndex === index ? 'text-white' : 'text-brand-600')} />
                  )}
                </div>
                <span className={cn(
                  'text-body-xs font-medium truncate w-full text-center',
                  currentBlobIndex === index ? 'text-brand-400' : 'text-white/70'
                )}>
                  {blob.isOriginal ? 'الأصل' : blob.toolName}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={zoom <= 0.1}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
            aria-label="تصغير"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-white/70 text-body-sm font-mono w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoom >= 5}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
            aria-label="تكبير"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={resetView}
            className="btn-icon p-2 bg-white/10 hover:bg-white/20 text-white ml-2"
            aria-label="إعادة تعيين العرض"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

import { AnimatePresence } from 'framer-motion';
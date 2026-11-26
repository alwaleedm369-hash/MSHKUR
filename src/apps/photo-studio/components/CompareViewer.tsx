import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X, ZoomIn, ZoomOut, RotateCcw, Download, Columns, SplitSquareHorizontal,
  Eye, EyeOff, Info, GitBranch
} from 'lucide-react';
import { cn, formatFileSize } from '@utils/cn';
import { ImageFile, ProcessedBlob } from '../types';

interface CompareViewerProps {
  image: ImageFile;
  showOriginal: boolean;
  onClose: () => void;
  onToggleOriginal: () => void;
  onDownloadVersion?: (version: ProcessedBlob) => void;
}

export const CompareViewer = ({
  image,
  showOriginal,
  onClose,
  onToggleOriginal,
  onDownloadVersion,
}: CompareViewerProps) => {
  const derivatives = image.processedBlobs.filter(p => !p.isOriginal);
  const originalBlobItem = image.processedBlobs.find(p => p.isOriginal) || image.processedBlobs[0];

  const [selectedDerivativeId, setSelectedDerivativeId] = useState<string>(
    derivatives[derivatives.length - 1]?.id || ''
  );
  const [mode, setMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [showMetadata, setShowMetadata] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const latest = derivatives[derivatives.length - 1];
    if (latest && !derivatives.some(d => d.id === selectedDerivativeId)) {
      setSelectedDerivativeId(latest.id);
    }
  }, [derivatives, selectedDerivativeId]);

  const activeDerivative =
    derivatives.find(d => d.id === selectedDerivativeId) ||
    derivatives[derivatives.length - 1];

  const originalPreview = image.originalPreview;
  const processedPreview = activeDerivative?.preview || image.preview;

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'slider') return;
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || mode !== 'slider') return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore if not captured
      }
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetView = () => {
    setZoom(1);
    setSliderPosition(50);
  };

  const handleDirectDownload = () => {
    const target = activeDerivative || originalBlobItem;
    if (!target) return;
    if (onDownloadVersion) {
      onDownloadVersion(target);
      return;
    }
    const url = URL.createObjectURL(target.blob);
    const a = document.createElement('a');
    const baseName = image.name.replace(/\.[^/.]+$/, '');
    a.href = url;
    a.download = target.isOriginal
      ? `${baseName}-original.png`
      : `${baseName}-${target.toolId}-v${target.version || 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-50 bg-surface-950/95 flex flex-col text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Before and after comparison"
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-surface-900/90">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="btn-icon p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close comparison"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-body-md font-semibold text-white truncate">{image.name}</h2>
            <p className="text-body-xs text-white/60">
              Original vs. {activeDerivative ? `${activeDerivative.toolName} (v${activeDerivative.version || 1})` : 'Unprocessed'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Mode Switch */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1" role="group" aria-label="Compare mode">
            <button
              onClick={() => setMode('slider')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-body-xs font-medium flex items-center gap-1.5 min-h-[36px]',
                mode === 'slider' ? 'bg-brand-600 text-white' : 'text-white/70 hover:text-white'
              )}
              aria-pressed={mode === 'slider'}
            >
              <SplitSquareHorizontal className="h-4 w-4" />
              <span>Slider</span>
            </button>
            <button
              onClick={() => setMode('side-by-side')}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-body-xs font-medium flex items-center gap-1.5 min-h-[36px]',
                mode === 'side-by-side' ? 'bg-brand-600 text-white' : 'text-white/70 hover:text-white'
              )}
              aria-pressed={mode === 'side-by-side'}
            >
              <Columns className="h-4 w-4" />
              <span>Side-by-Side</span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1" role="group" aria-label="Zoom controls">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="p-1.5 rounded-md text-white/80 hover:text-white disabled:opacity-40 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-body-xs font-mono text-white/90 min-w-[48px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 rounded-md text-white/80 hover:text-white disabled:opacity-40 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 rounded-md text-white/80 hover:text-white min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Reset zoom and slider"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {mode === 'side-by-side' && (
            <button
              onClick={onToggleOriginal}
              className={cn(
                'p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center',
                showOriginal && 'bg-brand-600/40'
              )}
              aria-label={showOriginal ? 'Dim original' : 'Highlight original'}
              aria-pressed={showOriginal}
            >
              {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          <button
            onClick={() => setShowMetadata(m => !m)}
            className={cn(
              'p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center',
              showMetadata && 'bg-white/20'
            )}
            aria-label="Toggle metadata and lineage"
            aria-pressed={showMetadata}
          >
            <Info className="h-4 w-4" />
          </button>

          <button
            onClick={handleDirectDownload}
            className="btn btn-primary btn-sm gap-1.5 min-h-[44px]"
            aria-label="Download active derivative"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Main Viewport + Optional Metadata Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Comparison Canvas */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={cn(
            'flex-1 relative overflow-hidden select-none touch-none flex items-center justify-center',
            mode === 'slider' && 'cursor-ew-resize'
          )}
          style={{
            backgroundImage:
              'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            backgroundColor: '#111827',
          }}
        >
          {mode === 'slider' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Base Layer: Original */}
              <div
                className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-75"
                style={{ transform: `scale(${zoom})` }}
              >
                <img
                  src={originalPreview}
                  alt="Original vehicle"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Clipped Layer: Processed */}
              <div
                className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-75"
                style={{
                  transform: `scale(${zoom})`,
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                <img
                  src={processedPreview}
                  alt="Processed vehicle"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white text-surface-900 shadow-xl flex items-center justify-center border-2 border-brand-600 font-mono text-xs font-bold">
                  ↔
                </div>
              </div>

              {/* Corner Labels */}
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <span className="badge bg-black/75 text-white backdrop-blur px-2.5 py-1">
                  Processed ({Math.round(sliderPosition)}%)
                </span>
              </div>
              <div className="absolute bottom-4 right-4 pointer-events-none">
                <span className="badge bg-black/75 text-white backdrop-blur px-2.5 py-1">
                  Original ({Math.round(100 - sliderPosition)}%)
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/15">
              <div
                className="relative overflow-hidden flex items-center justify-center p-4"
                style={{ opacity: showOriginal ? 1 : 0.45 }}
              >
                <img
                  src={originalPreview}
                  alt="Original vehicle"
                  className="max-w-full max-h-full object-contain transition-transform duration-75"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
                <span className="absolute bottom-3 left-3 badge bg-black/75 text-white">
                  Original • {formatFileSize(image.size)}
                </span>
              </div>
              <div className="relative overflow-hidden flex items-center justify-center p-4">
                <img
                  src={processedPreview}
                  alt="Processed vehicle"
                  className="max-w-full max-h-full object-contain transition-transform duration-75"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
                <span className="absolute bottom-3 left-3 badge bg-brand-600 text-white">
                  {activeDerivative ? `${activeDerivative.toolName} v${activeDerivative.version || 1}` : 'Processed'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metadata & Version Lineage Panel */}
        {showMetadata && (
          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-surface-900 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 text-body-sm font-semibold text-white">
              <GitBranch className="h-4 w-4 text-brand-400" />
              <span>Version Lineage & Metadata</span>
            </div>

            {/* Version Selector */}
            <div className="space-y-1.5">
              <p className="text-body-xs text-white/60">Derived Versions ({derivatives.length})</p>
              {derivatives.length === 0 ? (
                <p className="text-body-xs text-white/50 bg-white/5 rounded-lg p-2.5">
                  No derived outputs yet. Run Remove Background to create a derivative linked to the preserved original.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {derivatives.map((ver, idx) => {
                    const isCurrent = activeDerivative?.id === ver.id;
                    return (
                      <button
                        key={ver.id}
                        onClick={() => setSelectedDerivativeId(ver.id)}
                        className={cn(
                          'w-full text-left p-2.5 rounded-lg border transition-colors min-h-[44px]',
                          isCurrent
                            ? 'border-brand-500 bg-brand-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        )}
                      >
                        <div className="flex items-center justify-between text-body-xs font-medium">
                          <span>v{ver.version || idx + 1} • {ver.toolName}</span>
                          <span className="font-mono text-white/60">
                            {ver.byteSize ? formatFileSize(ver.byteSize) : ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/50 mt-0.5 font-mono truncate">
                          parent: {ver.parentId || originalBlobItem?.id || 'original'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Source & Derivative Specs */}
            <div className="border-t border-white/10 pt-3 space-y-2 text-body-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Source File</span>
                <span className="text-white font-mono truncate max-w-[160px]">{image.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Source Size / MIME</span>
                <span className="text-white font-mono">{formatFileSize(image.size)} • {image.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">KeepOriginal ID</span>
                <span className="text-emerald-400 font-mono">{originalBlobItem?.id}</span>
              </div>
              {activeDerivative && (
                <>
                  <div className="flex justify-between">
                    <span className="text-white/60">Derivative ID</span>
                    <span className="text-brand-300 font-mono">{activeDerivative.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Dimensions</span>
                    <span className="text-white font-mono">
                      {activeDerivative.width || image.width || '?'}×{activeDerivative.height || image.height || '?'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Output MIME / Size</span>
                    <span className="text-white font-mono">
                      {activeDerivative.mimeType || activeDerivative.blob.type} • {formatFileSize(activeDerivative.byteSize || activeDerivative.blob.size)}
                    </span>
                  </div>
                  {activeDerivative.durationMs !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Processing Time</span>
                      <span className="text-white font-mono">{activeDerivative.durationMs} ms</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </motion.div>
  );
};

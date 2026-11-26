import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Trash2, Image as ImageIcon, Grid, List, Compare,
  Check, Settings
} from 'lucide-react';
import { cn, generateId, readFileAsDataURL } from '@utils/cn';
import { skillRuntime, RemoveBackgroundSkillInput, RemoveBackgroundSkillOutput } from '@shared/skills/runtime';
import { PhotoStudioState, ImageFile, ProcessingJob, PROCESSING_TOOLS, BACKGROUND_OPTIONS } from './types';
import { ToolPanel } from './components/ToolPanel';
import { ImageGrid } from './components/ImageGrid';
import { BatchPanel } from './components/BatchPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ExportModal } from './components/ExportModal';
import { CompareViewer } from './components/CompareViewer';
import { Toast } from '@shared/components/Toast';
import { exportProcessedImages } from './utils/exportHelper';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const PhotoStudio = () => {
  const [state, setState] = useState<PhotoStudioState>({
    images: [],
    selectedImageIds: [],
    activeToolId: 'background-removal',
    toolSettings: {},
    processingJobs: [],
    history: [],
    viewMode: 'grid',
    compareMode: 'side-by-side',
    showOriginal: false,
    zoomLevel: 1,
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = generateId('toast-');
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const defaultSettings: Record<string, Record<string, unknown>> = {};
    PROCESSING_TOOLS.forEach(tool => {
      const settings: Record<string, unknown> = {};
      tool.settingsSchema.forEach(schema => {
        settings[schema.key] = schema.defaultValue;
      });
      defaultSettings[tool.id] = settings;
    });
    setState(prev => ({ ...prev, toolSettings: defaultSettings }));
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        addToast(`File ${file.name} exceeds 50MB limit`, 'error');
        continue;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        addToast(`Unsupported file type: ${file.name}`, 'error');
        continue;
      }

      try {
        const preview = await readFileAsDataURL(file);
        const originalBlob = file.slice(0, file.size, file.type);
        const originalPreview = await readFileAsDataURL(new File([originalBlob], file.name, { type: file.type }));

        const newImage: ImageFile = {
          id: generateId('img-'),
          file,
          preview,
          originalPreview,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          processedBlobs: [{
            id: generateId('proc-'),
            version: 0,
            toolId: 'original',
            toolName: 'Original',
            blob: originalBlob,
            preview: originalPreview,
            mimeType: file.type || 'image/png',
            byteSize: originalBlob.size,
            settings: {},
            timestamp: Date.now(),
            isOriginal: true,
          }],
          originalBlob,
        };

        setState(prev => ({
          ...prev,
          images: [...prev.images, newImage],
          selectedImageIds: [...prev.selectedImageIds, newImage.id],
        }));

        addToast(`Added ${file.name} (KeepOriginal active)`, 'success');
      } catch {
        addToast(`Failed to read ${file.name}`, 'error');
      }
    }
  }, [addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const handleImageSelect = useCallback((id: string, multi = false) => {
    setState(prev => {
      if (multi) {
        const isSelected = prev.selectedImageIds.includes(id);
        return {
          ...prev,
          selectedImageIds: isSelected
            ? prev.selectedImageIds.filter(i => i !== id)
            : [...prev.selectedImageIds, id],
        };
      }
      return {
        ...prev,
        selectedImageIds: [id],
      };
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedImageIds: prev.selectedImageIds.length === prev.images.length
        ? []
        : prev.images.map(i => i.id),
    }));
  }, []);

  const handleRemoveImages = useCallback((ids: string[]) => {
    setState(prev => ({
      ...prev,
      images: prev.images.filter(img => !ids.includes(img.id)),
      selectedImageIds: prev.selectedImageIds.filter(id => !ids.includes(id)),
    }));
    addToast(`Removed ${ids.length} image(s)`, 'success');
  }, [addToast]);

  const handleClearAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      images: [],
      selectedImageIds: [],
    }));
    addToast('Cleared all images', 'success');
  }, [addToast]);

  const handleToolSelect = useCallback((toolId: string) => {
    setState(prev => ({
      ...prev,
      activeToolId: toolId === prev.activeToolId ? null : toolId,
      showBatchPanel: false,
    }));
  }, []);

  const handleToolSettingChange = useCallback((toolId: string, key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      toolSettings: {
        ...prev.toolSettings,
        [toolId]: {
          ...prev.toolSettings[toolId],
          [key]: value,
        },
      },
    }));
  }, []);

  const handleProcessImages = useCallback(async () => {
    const { activeToolId, selectedImageIds, toolSettings, images } = state;
    if (!activeToolId || selectedImageIds.length === 0) return;

    const tool = PROCESSING_TOOLS.find(t => t.id === activeToolId);
    if (!tool) return;

    const settings = toolSettings[activeToolId] || tool.defaultSettings;
    const selectedImages = images.filter(img => selectedImageIds.includes(img.id));
    const jobId = generateId('job-');

    // Only background-removal is connected to a real client-side neural segmentation model (@imgly/background-removal)
    if (activeToolId !== 'background-removal') {
      const message = `${tool.name} is not connected to a verified engine yet. Original images remain untouched.`;
      const failedJob: ProcessingJob = {
        id: jobId,
        imageIds: selectedImages.map(img => img.id),
        toolId: activeToolId,
        settings,
        status: 'failed',
        progress: 0,
        results: [],
        error: message,
        createdAt: Date.now(),
      };

      setState(prev => ({
        ...prev,
        processingJobs: [...prev.processingJobs, failedJob],
        images: prev.images.map(img =>
          selectedImageIds.includes(img.id)
            ? { ...img, status: 'error', error: message }
            : img
        ),
        history: [...prev.history, failedJob],
      }));
      addToast(message, 'error');
      return;
    }

    const activeJob: ProcessingJob = {
      id: jobId,
      imageIds: selectedImages.map(img => img.id),
      toolId: activeToolId,
      settings,
      status: 'processing',
      progress: 0,
      results: [],
      createdAt: Date.now(),
    };

    setState(prev => ({
      ...prev,
      processingJobs: [...prev.processingJobs, activeJob],
      images: prev.images.map(img =>
        selectedImageIds.includes(img.id) ? { ...img, status: 'processing', error: undefined } : img
      ),
    }));

    const completedResults = [];
    let failedCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const image = selectedImages[i];
      try {
        const { output: result, evidence } = await skillRuntime.execute<
          RemoveBackgroundSkillInput,
          RemoveBackgroundSkillOutput
        >(
          'removebackground',
          {
            image: image.originalBlob,
            model: (settings.model as 'fast' | 'high-quality' | 'car-optimized') || 'car-optimized',
            backgroundType: (settings.backgroundType as 'transparent' | 'white' | 'studio' | 'outdoor' | 'custom') || 'transparent',
            backgroundValue: (settings.backgroundValue as string) || '#ffffff',
          },
          {
            sessionId: jobId,
            appId: 'photo-studio',
            grantedPermissions: ['read:input', 'write:derived-output'],
            onProgress: (_key, current, total) => {
              if (total > 0) {
                const itemFrac = current / total;
                const overall = Math.round(((i + itemFrac) / selectedImages.length) * 100);
                setState(prev => ({
                  ...prev,
                  processingJobs: prev.processingJobs.map(j =>
                    j.id === jobId ? { ...j, progress: overall } : j
                  ),
                }));
              }
            },
          }
        );

        const originalRecord = image.processedBlobs.find(p => p.isOriginal) || image.processedBlobs[0];
        const nextVersion = image.processedBlobs.filter(p => !p.isOriginal).length + 1;
        const derivedBlob = {
          id: generateId('proc-'),
          parentId: originalRecord?.id,
          version: nextVersion,
          toolId: activeToolId,
          toolName: tool.name,
          blob: result.transparent_png,
          preview: result.previewUrl,
          width: result.width,
          height: result.height,
          mimeType: result.transparent_png.type || 'image/png',
          byteSize: result.transparent_png.size,
          durationMs: result.durationMs,
          settings: { ...settings, durationMs: result.durationMs, executionId: evidence.executionId },
          timestamp: Date.now(),
          isOriginal: false,
        };
        completedResults.push(derivedBlob);

        setState(prev => ({
          ...prev,
          images: prev.images.map(img =>
            img.id === image.id
              ? {
                  ...img,
                  width: result.width,
                  height: result.height,
                  status: 'completed',
                  processedBlobs: [...img.processedBlobs, derivedBlob],
                }
              : img
          ),
        }));
      } catch (err) {
        failedCount++;
        const errMsg = err instanceof Error ? err.message : 'Background removal failed';
        setState(prev => ({
          ...prev,
          images: prev.images.map(img =>
            img.id === image.id ? { ...img, status: 'error', error: errMsg } : img
          ),
        }));
      }
    }

    const finalStatus = failedCount === selectedImages.length ? 'failed' : 'completed';
    setState(prev => ({
      ...prev,
      processingJobs: prev.processingJobs.map(j =>
        j.id === jobId
          ? {
              ...j,
              status: finalStatus,
              progress: 100,
              results: completedResults,
              completedAt: Date.now(),
              error: failedCount > 0 ? `${failedCount} image(s) failed` : undefined,
            }
          : j
      ),
      history: [
        ...prev.history,
        {
          ...activeJob,
          status: finalStatus,
          progress: 100,
          results: completedResults,
          completedAt: Date.now(),
        },
      ],
    }));

    if (completedResults.length > 0) {
      addToast(`Background removed for ${completedResults.length} image(s)`, 'success');
    } else {
      addToast('Background removal failed. Check model assets or network access.', 'error');
    }
  }, [state, addToast]);

  const handleExport = useCallback(async (options: any) => {
    const { selectedImageIds, images } = state;
    const selectedImages = images.filter(img => selectedImageIds.includes(img.id));
    if (selectedImages.length === 0) return;

    try {
      const count = await exportProcessedImages(selectedImages, options);
      setShowExportModal(false);
      addToast(`Downloaded ${count} file(s)`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      addToast(msg, 'error');
    }
  }, [state, addToast]);

  const handleCompare = useCallback((imageId: string) => {
    setState(prev => ({
      ...prev,
      viewMode: 'compare',
      selectedImageIds: [imageId],
    }));
  }, []);

  const activeImage = state.selectedImageIds.length > 0
    ? state.images.find(img => img.id === state.selectedImageIds[0]) || null
    : null;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      {/* Compact Workspace Bar */}
      <header className="sticky top-14 z-30 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-b border-surface-200 dark:border-surface-800">
        <div className="container-mshkur">
          <div className="flex items-center justify-between gap-3 h-14">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                <ImageIcon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-body-md font-semibold text-surface-900 dark:text-white truncate">
                  Remove Background
                </h1>
                <p className="text-body-xs text-surface-500">
                  {state.images.length} images {state.selectedImageIds.length > 0 && `• ${state.selectedImageIds.length} selected`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1" role="group" aria-label="View mode">
                {[
                  { mode: 'grid' as const, icon: Grid, label: 'Grid' },
                  { mode: 'list' as const, icon: List, label: 'List' },
                  { mode: 'compare' as const, icon: Compare, label: 'Compare' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setState(prev => ({ ...prev, viewMode: mode }))}
                    className={cn(
                      'p-2 rounded-md transition-all min-h-[36px] min-w-[36px] flex items-center justify-center',
                      state.viewMode === mode
                        ? 'bg-white dark:bg-surface-700 shadow-sm text-brand-600'
                        : 'text-surface-500 hover:text-surface-700 dark:text-surface-400'
                    )}
                    aria-label={label}
                    aria-pressed={state.viewMode === mode}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowExportModal(true)}
                disabled={state.selectedImageIds.length === 0}
                className="btn btn-primary btn-sm gap-1.5 min-h-[40px]"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {state.images.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="btn btn-ghost btn-sm text-error-DEFAULT min-h-[40px]"
                  aria-label="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-icon p-2 min-h-[40px] min-w-[40px]"
                aria-label="Settings"
                aria-expanded={showSettings}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container-mshkur py-5" {...getRootProps()}>
        <input {...getInputProps()} />

        {/* Upload Zone */}
        {state.images.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'relative rounded-2xl border-2 border-dashed p-10 md:p-16 text-center transition-all cursor-pointer bg-white dark:bg-surface-900',
              isDragActive
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-surface-300 dark:border-surface-700 hover:border-brand-400'
            )}
            role="region"
            aria-label="Image upload dropzone"
          >
            <div className="mx-auto mb-5">
              <div className={cn(
                'inline-flex h-14 w-14 items-center justify-center rounded-2xl',
                isDragActive
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
              )}>
                <Upload className="h-7 w-7" />
              </div>
            </div>
            <h2 className="text-heading-md font-semibold text-surface-900 dark:text-white mb-2">
              {isDragActive ? 'Drop vehicle photos here' : 'Upload vehicle photos'}
            </h2>
            <p className="text-body-sm text-surface-500 dark:text-surface-400 mb-6 max-w-md mx-auto">
              Drag & drop or tap to select JPG, PNG, WebP, or HEIC (max 50MB).
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-body-xs text-surface-500">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                Remove Background
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                KeepOriginal Preserved
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                PNG / WebP / JPG Export
              </span>
            </div>
          </motion.div>
        )}

        {/* Workspace */}
        {state.images.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className={cn(
                    'btn btn-sm gap-2 min-h-[40px]',
                    state.selectedImageIds.length === state.images.length
                      ? 'btn-primary'
                      : 'btn-secondary'
                  )}
                >
                  <Check className="h-4 w-4" />
                  <span>{state.selectedImageIds.length === state.images.length ? 'Deselect All' : 'Select All'}</span>
                  <span className="badge badge-neutral">{state.selectedImageIds.length}/{state.images.length}</span>
                </button>

                {state.selectedImageIds.length > 0 && (
                  <>
                    <button
                      onClick={() => handleRemoveImages(state.selectedImageIds)}
                      className="btn btn-sm btn-ghost gap-1.5 text-error-DEFAULT min-h-[40px]"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => setState(prev => ({ ...prev, viewMode: 'compare' }))}
                      disabled={state.selectedImageIds.length !== 1}
                      className="btn btn-sm btn-secondary gap-1.5 min-h-[40px]"
                    >
                      <Compare className="h-4 w-4" />
                      <span>Compare</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
              <aside className="lg:sticky lg:top-32">
                <ToolPanel
                  tools={PROCESSING_TOOLS}
                  activeToolId={state.activeToolId}
                  toolSettings={state.toolSettings}
                  selectedCount={state.selectedImageIds.length}
                  onToolSelect={handleToolSelect}
                  onSettingChange={handleToolSettingChange}
                  onProcess={handleProcessImages}
                  processingJobs={state.processingJobs}
                />
              </aside>

              <div className="min-w-0">
                {state.viewMode === 'compare' && activeImage && (
                  <CompareViewer
                    image={activeImage}
                    showOriginal={state.showOriginal}
                    onClose={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                    onToggleOriginal={() => setState(prev => ({ ...prev, showOriginal: !prev.showOriginal }))}
                  />
                )}

                {state.viewMode !== 'compare' && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.viewMode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ImageGrid
                        images={state.images}
                        selectedIds={state.selectedImageIds}
                        viewMode={state.viewMode}
                        onSelect={handleImageSelect}
                        onCompare={handleCompare}
                        onRemove={handleRemoveImages}
                        processingJobs={state.processingJobs}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </>
        )}

        {showBatchPanel && state.activeToolId && (
          <BatchPanel
            tool={PROCESSING_TOOLS.find(t => t.id === state.activeToolId)!}
            images={state.images.filter(img => state.selectedImageIds.includes(img.id))}
            settings={state.toolSettings[state.activeToolId] || {}}
            onSettingChange={(key, value) => handleToolSettingChange(state.activeToolId!, key, value)}
            onProcess={handleProcessImages}
            onClose={() => setShowBatchPanel(false)}
          />
        )}

        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            backgroundOptions={BACKGROUND_OPTIONS}
          />
        )}
      </main>

      {showExportModal && (
        <ExportModal
          images={state.images.filter(img => state.selectedImageIds.includes(img.id))}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      )}

      <div className="fixed bottom-20 left-4 z-50 flex flex-col gap-2" role="region" aria-live="polite">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * MSHKUR PWA Hooks
 * React hooks for Progressive Web App features
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export interface PWAActions {
  install: () => Promise<boolean>;
  update: () => Promise<void>;
  dismissInstallPrompt: () => void;
  checkForUpdate: () => Promise<void>;
  registerSync: (tag: string) => Promise<void>;
}

export function usePWA(): [PWAState, PWAActions] {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    installPrompt: null,
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const updateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if running as PWA
  const isStandalone = useCallback(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }, []);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });

          // Listen for controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic update check
  useEffect(() => {
    const checkForUpdate = async () => {
      if (registration) {
        await registration.update();
      }
    };

    // Check every hour
    updateCheckIntervalRef.current = setInterval(checkForUpdate, 60 * 60 * 1000);
    checkForUpdate(); // Initial check

    return () => {
      if (updateCheckIntervalRef.current) {
        clearInterval(updateCheckIntervalRef.current);
      }
    };
  }, [registration]);

  // Actions
  const install = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return false;

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      deferredPromptRef.current = null;
      setState(prev => ({ ...prev, isInstallable: false, installPrompt: null }));

      return choice.outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, []);

  const update = useCallback(async (): Promise<void> => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const dismissInstallPrompt = useCallback(() => {
    deferredPromptRef.current = null;
    setState(prev => ({ ...prev, isInstallable: false, installPrompt: null }));
  }, []);

  const checkForUpdate = useCallback(async (): Promise<void> => {
    if (registration) {
      await registration.update();
    }
  }, [registration]);

  const registerSync = useCallback(async (tag: string): Promise<void> => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).sync.register(tag);
    }
  }, []);

  return [state, { install, update, dismissInstallPrompt, checkForUpdate, registerSync }];
}

// Hook for offline queue management
export interface OfflineQueueItem {
  id: string;
  type: 'image' | 'form' | 'analytics';
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  timestamp: number;
  retries: number;
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    openDB().then(db => {
      dbRef.current = db;
      loadQueue();
    });
  }, []);

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('mshkhur-offline', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('offline-queue')) {
          db.createObjectStore('offline-queue', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const loadQueue = async () => {
    if (!dbRef.current) return;
    const tx = dbRef.current.transaction('offline-queue', 'readonly');
    const store = tx.objectStore('offline-queue');
    const items = await new Promise<OfflineQueueItem[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    setQueue(items);
  };

  const addToQueue = useCallback(async (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => {
    if (!dbRef.current) return;

    const newItem: OfflineQueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    const tx = dbRef.current!.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    await new Promise<void>((resolve, reject) => {
      const req = store.add(newItem);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await loadQueue();

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const reg = await navigator.serviceWorker.ready;
      await (reg as any).sync.register(`sync-${item.type}s`);
    }
  }, []);

  const removeFromQueue = useCallback(async (id: string) => {
    if (!dbRef.current) return;

    const tx = dbRef.current.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await loadQueue();
  }, []);

  const retryItem = useCallback(async (id: string) => {
    if (!dbRef.current) return;

    const tx = dbRef.current.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    const item = await new Promise<OfflineQueueItem | undefined>((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!item) return;

    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (response.ok) {
        await removeFromQueue(id);
      } else {
        // Increment retries
        const updatedItem = { ...item, retries: item.retries + 1 };
        await new Promise<void>((resolve, reject) => {
          const req = store.put(updatedItem);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch (error) {
      const updatedItem = { ...item, retries: item.retries + 1 };
      await new Promise<void>((resolve, reject) => {
        const req = store.put(updatedItem);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    await loadQueue();
  }, [removeFromQueue]);

  const clearQueue = useCallback(async () => {
    if (!dbRef.current) return;

    const tx = dbRef.current.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    await new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    await loadQueue();
  }, []);

  return {
    queue,
    addToQueue,
    removeFromQueue,
    retryItem,
    clearQueue,
    loadQueue,
  };
}

// Hook for push notifications
export interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
}

export function usePushNotifications(vapidPublicKey: string) {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: 'PushManager' in window,
    isSubscribed: false,
    subscription: null,
    permission: 'default',
  });

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        checkSubscription(reg);
      });

      Notification.requestPermission().then(permission => {
        setState(prev => ({ ...prev, permission }));
      });
    }
  }, [vapidPublicKey]);

  const checkSubscription = async (reg: ServiceWorkerRegistration) => {
    const subscription = await reg.pushManager.getSubscription();
    setState(prev => ({
      ...prev,
      isSubscribed: !!subscription,
      subscription,
    }));
  };

  const subscribe = useCallback(async () => {
    if (!registration || state.permission !== 'granted') return false;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setState(prev => ({ ...prev, isSubscribed: true, subscription }));
      return true;
    } catch (error) {
      console.error('[Push] Subscribe failed:', error);
      return false;
    }
  }, [registration, vapidPublicKey, state.permission]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return false;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState(prev => ({ ...prev, isSubscribed: false, subscription: null }));
      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }, [registration]);

  return [state, { subscribe, unsubscribe }] as const;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Hook for cache management
export interface CacheInfo {
  name: string;
  size: number;
  entries: number;
}

export function useCacheManager() {
  const [caches, setCaches] = useState<CacheInfo[]>([]);

  const refreshCaches = useCallback(async () => {
    const cacheNames = await window.caches.keys();
    const infos = await Promise.all(cacheNames.map(async (name) => {
      const cache = await window.caches.open(name);
      const keys = await cache.keys();
      let size = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          size += blob.size;
        }
      }
      return { name, size, entries: keys.length };
    }));
    setCaches(infos);
  }, []);

  useEffect(() => {
    refreshCaches();
  }, [refreshCaches]);

  const clearCache = useCallback(async (name: string) => {
    await window.caches.delete(name);
    await refreshCaches();
  }, [refreshCaches]);

  const clearAllCaches = useCallback(async () => {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map(name => window.caches.delete(name)));
    await refreshCaches();
  }, [refreshCaches]);

  return {
    caches,
    refreshCaches,
    clearCache,
    clearAllCaches,
  };
}

import { useState } from 'react';
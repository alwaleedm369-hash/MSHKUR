/**
 * MSHKUR Service Worker
 * Progressive Web App offline support with intelligent caching strategies
 */

const CACHE_NAME = 'mshkhur-v1';
const STATIC_CACHE = 'mshkhur-static-v1';
const DYNAMIC_CACHE = 'mshkhur-dynamic-v1';
const IMAGE_CACHE = 'mshkhur-images-v1';
const API_CACHE = 'mshkhur-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  // App shell assets will be added at build time
];

const CACHE_STRATEGIES = {
  // Cache first - for static assets
  static: ['/assets/', '/icons/', '/fonts/', '.js', '.css', '.woff2', '.svg'],
  // Network first - for API calls
  api: ['/api/', '/graphql'],
  // Stale while revalidate - for images and dynamic content
  images: ['/images/', '/uploads/', 'blob:', 'data:'],
  // Network only - for real-time data
  realtime: ['/ws/', '/socket.io', '/stream'],
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('mshkhur-') &&
                     name !== STATIC_CACHE &&
                     name !== DYNAMIC_CACHE &&
                     name !== IMAGE_CACHE &&
                     name !== API_CACHE;
            })
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy
  const strategy = getCacheStrategy(request.url);

  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    case 'network-only':
    default:
      event.respondWith(networkOnly(request));
      break;
  }
});

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    throw error;
  }
}

// Network First Strategy - for API calls
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return offline response for API
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Stale While Revalidate - for images and dynamic content
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Network Only - for real-time data
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Network required' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Determine caching strategy based on URL
function getCacheStrategy(url) {
  const urlObj = new URL(url);

  // Static assets
  if (CACHE_STRATEGIES.static.some(path => url.includes(path))) {
    return 'cache-first';
  }

  // API calls
  if (CACHE_STRATEGIES.api.some(path => url.includes(path))) {
    return 'network-first';
  }

  // Images
  if (CACHE_STRATEGIES.images.some(path => url.includes(path))) {
    return 'stale-while-revalidate';
  }

  // Real-time
  if (CACHE_STRATEGIES.realtime.some(path => url.includes(path))) {
    return 'network-only';
  }

  // Default: stale while revalidate for same-origin, network-first for cross-origin
  return urlObj.origin === location.origin ? 'stale-while-revalidate' : 'network-first';
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-images') {
    event.waitUntil(syncPendingImages());
  } else if (event.tag === 'sync-forms') {
    event.waitUntil(syncPendingForms());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncPendingImages() {
  try {
    const db = await openDB();
    const tx = db.transaction('pending-images', 'readwrite');
    const store = tx.objectStore('pending-images');
    const pending = await store.getAll();

    for (const item of pending) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });
        await store.delete(item.id);
      } catch (error) {
        console.error('[SW] Failed to sync image:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync pending images failed:', error);
  }
}

async function syncPendingForms() {
  try {
    const db = await openDB();
    const tx = db.transaction('pending-forms', 'readwrite');
    const store = tx.objectStore('pending-forms');
    const pending = await store.getAll();

    for (const item of pending) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });
        await store.delete(item.id);
      } catch (error) {
        console.error('[SW] Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync pending forms failed:', error);
  }
}

async function syncAnalytics() {
  try {
    const db = await openDB();
    const tx = db.transaction('analytics-queue', 'readwrite');
    const store = tx.objectStore('analytics-queue');
    const pending = await store.getAll();

    if (pending.length > 0) {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: pending }),
      });
      await store.clear();
    }
  } catch (error) {
    console.error('[SW] Sync analytics failed:', error);
  }
}

// IndexedDB helper for background sync
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('mshkhur-offline', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('pending-images')) {
        db.createObjectStore('pending-images', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pending-forms')) {
        db.createObjectStore('pending-forms', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('analytics-queue')) {
        db.createObjectStore('analytics-queue', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cached-responses')) {
        const store = db.createObjectStore('cached-responses', { keyPath: 'url' });
        store.createIndex('timestamp', 'timestamp');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'فتح' },
      { action: 'dismiss', title: 'تجاهل' },
    ],
    dir: 'rtl',
    lang: 'ar',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'مشكور', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if app is already open
        for (const client of windowClients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(url);
      })
  );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_IMAGES':
      cacheImages(payload.urls);
      break;

    case 'CLEAR_CACHE':
      clearCache(payload.cacheName);
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;

    case 'PREFETCH_ROUTE':
      prefetchRoute(payload.route);
      break;
  }
});

async function cacheImages(urls) {
  const cache = await caches.open(IMAGE_CACHE);
  await cache.addAll(urls);
}

async function clearCache(cacheName) {
  const name = cacheName || DYNAMIC_CACHE;
  await caches.delete(name);
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

async function prefetchRoute(route) {
  try {
    await fetch(route);
  } catch (error) {
    console.warn('[SW] Prefetch failed:', error);
  }
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();
    const now = Date.now();
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const cachedTime = response.headers.get('sw-cached-time');
        if (cachedTime && now - parseInt(cachedTime) > MAX_AGE) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily
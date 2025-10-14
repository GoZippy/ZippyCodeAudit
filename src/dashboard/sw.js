/**
 * Service Worker for ZippyCodeAudit Dashboard PWA
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'zippycodesaudit-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/styles.css',
  '/utils/storage.js',
  '/utils/api.js',
  '/utils/charts.js',
  '/components/metrics-card.js',
  '/components/activity-item.js',
  '/components/task-item.js',
  '/components/report-card.js',
  '/components/project-card.js',
  '/app.js',
  '/public/manifest.json',
  '/public/favicon.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching resources');
        return cache.addAll(CACHE_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Resources cached successfully');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        // Ensure service worker takes control immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (let them fail naturally when offline)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }

            // For other requests, just fail
            throw new Error('Network request failed');
          });
      })
  );
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync operations
async function doBackgroundSync() {
  try {
    // Check for pending audit requests when back online
    const pendingAudits = await getPendingAudits();

    for (const audit of pendingAudits) {
      try {
        await performAudit(audit);
        await removePendingAudit(audit.id);
      } catch (error) {
        console.error('Background audit failed:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/public/favicon.svg',
    badge: '/public/favicon.svg',
    tag: data.tag || 'audit-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view-audit') {
    event.waitUntil(
      clients.openWindow('/?audit=' + event.notification.tag)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the dashboard
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for background sync
async function getPendingAudits() {
  // In a real implementation, this would check IndexedDB or localStorage
  // for pending audit requests
  return [];
}

async function performAudit(auditData) {
  // In a real implementation, this would send the audit request to the API
  console.log('Performing background audit:', auditData);
}

async function removePendingAudit(auditId) {
  // Remove the pending audit from storage
  console.log('Removing pending audit:', auditId);
}

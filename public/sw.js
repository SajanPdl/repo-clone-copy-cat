// Service Worker for Push Notifications
const CACHE_NAME = 'edusanskriti-notifications-v1';
const STATIC_CACHE_NAME = 'edusanskriti-static-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.ico',
        '/sounds/notification.mp3',
        '/sounds/high-notification.mp3',
        '/sounds/urgent-notification.mp3'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'default',
    requireInteraction: false,
    data: {},
    actions: []
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        data: data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    actions: notificationData.actions,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view' && event.notification.data?.action_url) {
    // Open the action URL
    event.waitUntil(
      clients.openWindow(event.notification.data.action_url)
    );
  } else if (event.notification.data?.action_url) {
    // Default action - open the notification URL
    event.waitUntil(
      clients.openWindow(event.notification.data.action_url)
    );
  } else {
    // Default action - focus on existing window or open new one
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Send analytics or tracking data
  if (event.notification.data?.id) {
    // Track notification close
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_id: event.notification.data.id,
        action: 'close',
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Error tracking notification close:', error);
    });
  }
});

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync pending notifications
      syncNotifications()
    );
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to sync notifications
async function syncNotifications() {
  try {
    // Get pending notifications from IndexedDB
    const pendingNotifications = await getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        // Send notification to server
        const response = await fetch('/api/notifications/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification)
        });
        
        if (response.ok) {
          // Remove from pending list
          await removePendingNotification(notification.id);
        }
      } catch (error) {
        console.error('Error syncing notification:', error);
      }
    }
  } catch (error) {
    console.error('Error in syncNotifications:', error);
  }
}

// IndexedDB helper functions
async function getPendingNotifications() {
  // Implementation for getting pending notifications from IndexedDB
  return [];
}

async function removePendingNotification(id) {
  // Implementation for removing pending notification from IndexedDB
}

// Cache strategy for API requests
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/notifications')) {
    // Network first strategy for notification API
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request);
        })
    );
  } else if (event.request.destination === 'image' || 
             event.request.destination === 'audio' ||
             event.request.destination === 'video') {
    // Cache first strategy for media files
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
        })
    );
  }
});

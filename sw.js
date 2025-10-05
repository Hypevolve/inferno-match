
const CACHE_NAME = 'inferno-cache-v1';

const APP_SHELL_URLS = [
    './',
    './index.html',
    './index.tsx',
    './App.tsx',
    './types.ts',
    './constants.ts',
    './vite.svg',
    './metadata.json',
    './services/geminiService.ts',
    './services/matchService.ts',
    './helpers/geolocation.ts',
    './helpers/imageProcessing.ts',
    './components/AgeGate.tsx',
    './components/ProfileCreator.tsx',
    './components/PersonaCustomizer.tsx',
    './components/SwipeScreen.tsx',
    './components/ProfileCard.tsx',
    './components/ChatScreen.tsx',
    './components/VideoCallScreen.tsx',
    './components/MatchesScreen.tsx',
    './components/UserProfileScreen.tsx',
    './components/ItsAMatchScreen.tsx',
    './components/BottomNav.tsx',
    './components/LikesYouScreen.tsx',
    './components/FilterScreen.tsx',
    './components/ProductPlanScreen.tsx',
    './components/VerificationScreen.tsx',
    './components/SafetyCenterScreen.tsx',
    './components/SpotlightScreen.tsx',
    './components/Icons.tsx',
    './components/AudioMessageBubble.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Only pre-cache the local app shell. CDN assets will be cached on fetch.
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            if (!response || response.status !== 200) {
              return response;
            }
            
            const url = new URL(event.request.url);
            // Don't cache dynamic image services
            if (url.hostname.includes('picsum.photos') || url.hostname.includes('pravatar.cc')) {
                return response;
            }

            // Cache successful responses to our cache.
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
            // Intentionally empty. Let the request fail if network fails and not in cache.
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
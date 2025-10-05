
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

const CDN_URLS = [
    'https://aistudiocdn.com/react@^19.1.1',
    'https://aistudiocdn.com/react-dom@^19.1.1/client',
    'https://aistudiocdn.com/react@^19.1.1/jsx-runtime',
    'https://aistudiocdn.com/@google/genai@^1.21.0',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
];

const ALL_URLS_TO_CACHE = [...APP_SHELL_URLS, ...CDN_URLS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ALL_URLS_TO_CACHE);
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
            if (url.hostname.includes('picsum.photos') || url.hostname.includes('pravatar.cc') || url.hostname.includes('googleapis.com')) {
                return response;
            }

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
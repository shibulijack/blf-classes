const CACHE_NAME = "blf-v2";
const STATIC_CACHE = "blf-static-v2";

const STATIC_ASSETS = [
  "/icons/logo.webp",
  "/icons/logo_white.webp",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Cache-first for static assets (logos, icons, Next.js bundles)
  if (
    STATIC_ASSETS.some((asset) => url.pathname === asset) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for page navigations
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            if (cached) return cached;
            return new Response(
              "<html><body style='font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#64748b'><div style='text-align:center'><h2>You're offline</h2><p>Connect to the internet to browse classes.</p></div></body></html>",
              { headers: { "Content-Type": "text/html" } }
            );
          });

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-first for API calls and Supabase images
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || Response.error()))
    );
    return;
  }
});

const CACHE_NAME = "blf-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            "<html><body style='font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#64748b'><div style='text-align:center'><h2>You're offline</h2><p>Connect to the internet to browse classes.</p></div></body></html>",
            { headers: { "Content-Type": "text/html" } }
          )
      )
    );
  }
});

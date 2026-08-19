const CACHE_NAME = "aot-trainer-v4";

const LOCAL_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon.png",
];

const CDN_ASSETS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(LOCAL_ASSETS);
      } catch (e) {
        // ignore individual failures so install doesn't hard-fail
      }
      await Promise.all(
        CDN_ASSETS.map(async (url) => {
          try {
            const resp = await fetch(url, { mode: "no-cors" });
            await cache.put(url, resp);
          } catch (e) {
            /* offline on first install, will retry on next successful load */
          }
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // network-first: always try to get the freshest version when online.
  // the cache is only used as an offline fallback, never as the primary source —
  // this is what prevents an installed home-screen icon from getting stuck on an old version.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

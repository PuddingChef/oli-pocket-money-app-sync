const CACHE_NAME = "olis-pocket-money-v15";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve()))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for app shell; network fallback for any other requests
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>{});
      return resp;
    }).catch(() => cached))
  );
});

// Receive notification requests from the page
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if(data.type === "notify"){
    const title = data.title || "Oli's Pocket Money";
    const body = data.body || "";
    self.registration.showNotification(title, {
      body,
      icon: "./icons/icon.svg",
      badge: "./icons/icon.svg"
    }).catch(()=>{});
  }
});









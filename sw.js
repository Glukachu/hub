/* Service Worker fuer den Productivity Hub (PWA-Installierbarkeit + Offline-Shell) */
const C = "hub-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin) return;   // Firebase/CDN normal lassen
  if (req.mode === "navigate") {                                       // App immer frisch, offline -> Cache
    e.respondWith(
      fetch(req).then(r => { caches.open(C).then(c => c.put("./index.html", r.clone())); return r; })
                .catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      caches.open(C).then(c => c.put(req, resp.clone())); return resp;
    }))
  );
});

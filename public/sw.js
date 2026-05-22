self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  // Do not intercept API calls to prevent Failed to fetch errors with CORS
  if (event.request.url.includes('transport.rest')) {
    return;
  }
  // Let the browser handle standard requests directly, bypass SW
  return;
});
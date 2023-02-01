    // //This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

    // //Install stage sets up the offline page in the cache and opens a new cache
    // self.addEventListener('install', function(event) {
    //   event.waitUntil(preLoad());
    //   console.log('[PWA Builder] Views installed');
    // });

    // var preLoad = function(){
    //   console.log('[PWA Builder] Install Event processing');
    //   return caches.open('pwabuilder-offline').then(function(cache) {
    //     console.log('[PWA Builder] Cached index and offline page during Install');
    //     return cache.addAll(['/offline.html', '/index.php']);
    //   });
    // }

    // self.addEventListener('fetch', function(event) {
    //   console.log('[PWA Builder] The service worker is serving the asset.');
    //   event.respondWith(checkResponse(event.request).catch(function() {
    //     return returnFromCache(event.request)}
    //   ));
    //   event.waitUntil(addToCache(event.request));
    // });

    // var checkResponse = function(request){
    //   return new Promise(function(fulfill, reject) {
    //     fetch(request).then(function(response){
    //       if(response.status !== 404) {
    //         fulfill(response)
    //       } else {
    //         reject()
    //       }
    //     }, reject)
    //   });
    // };

    // var addToCache = function(request){
    //   return caches.open('pwabuilder-offline').then(function (cache) {
    //     return fetch(request).then(function (response) {
    //       console.log('[PWA Builder] add page to offline'+response.url)
    //       return cache.put(request, response);
    //     });
    //   });
    // };

    // var returnFromCache = function(request){
    //   return caches.open('pwabuilder-offline').then(function (cache) {
    //     return cache.match(request).then(function (matching) {
    //      if(!matching || matching.status == 404) {
    //        return cache.match('offline.html')
    //      } else {
    //        return matching
    //      }
    //     });
    //   });
    // };

    // This is the "Offline page" service worker

    importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

    const CACHE = "pwabuilder-page";

    // TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
    const offlineFallbackPage = "offline.html";

    self.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
      }
    });

    self.addEventListener('install', async (event) => {
      event.waitUntil(
        caches.open(CACHE)
          .then((cache) => cache.add(offlineFallbackPage))
      );
    });

    if (workbox.navigationPreload.isSupported()) {
      workbox.navigationPreload.enable();
    }

    self.addEventListener('fetch', (event) => {
      if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
          try {
            const preloadResp = await event.preloadResponse;

            if (preloadResp) {
              return preloadResp;
            }

            const networkResp = await fetch(event.request);
            return networkResp;
          } catch (error) {

            const cache = await caches.open(CACHE);
            const cachedResp = await cache.match(offlineFallbackPage);
            return cachedResp;
          }
        })());
      }
    });
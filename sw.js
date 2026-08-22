const CACHE_NAME = "propsetu-customer-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })

  );

  self.skipWaiting();

});


/* ACTIVATE */
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))

        );

      })

  );

  self.clients.claim();

});


/* FETCH */
self.addEventListener("fetch", event => {

  const request = event.request;

  if(request.method !== "GET"){
    return;
  }

  event.respondWith(

    fetch(request)

      .then(response => {

        /*
          सफल network response को cache में
          update करते हैं।
        */

        if(response && response.status === 200){

          const responseClone =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                request,
                responseClone
              );

            });

        }

        return response;

      })

      .catch(() => {

        /*
          Internet न होने पर cached file
          खोलने की कोशिश।
        */

        return caches.match(request);

      })

  );

});

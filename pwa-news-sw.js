(function () {
    'use strict';

    var APP_CACHE_SHELL = 'pwa-sw-shell-v1';
    var APP_CACHE_DATA = 'pwa-sw-data-v1';

    var URL_API_DATA = 'https://newsapi.org/v2/';

    var APP_CACHE_SHELL_FILES = [
        '/',
        '/js/api.js',
        '/css/main.css',
        '/library/jquery-3.3.1.min.js',
        '/library/moment.min.js'
    ];

    self.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open(APP_CACHE_SHELL).then(function (cache) {
                console.log('Opened Cache');
                return cache.addAll(APP_CACHE_SHELL_FILES);
            })
        );

    });

    self.addEventListener('activate', function (event) {
        var cacheList = [APP_CACHE_SHELL, APP_CACHE_DATA];

        return event.waitUntil(
            self.caches.keys().then(function (cacheNames) {
                return Promise.all(cacheNames.map(function (cacheName) {
                    if (cacheList.indexOf(cacheName) === -1) {
                        self.caches.delete(cacheName);
                    }
                }));
            })
        )
    });

    self.addEventListener('fetch', function (event) {
        if (event.request.url.indexOf(URL_API_DATA) === -1) {
            event.respondWith(
                caches.match(event.request)
                    .then(function (response) {
                        if (response) {
                            return response;
                        }
                        return fetch(event.request);
                    })
            )
        } else {
            event.respondWith(
                self.fetch(event.request)
                    .then(function (response) {
                        return self.caches.open(APP_CACHE_DATA)
                            .then(function (cache) {
                                cache.put(event.request.url, response.clone());
                                return response;
                            });
                    })
                    .catch(function (error) {
                        return self.caches.match(event.request);
                    })
            )
        }
    });

})();

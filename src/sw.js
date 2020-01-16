'use strict';
importScripts('sw-toolbox.js'); 
toolbox.precache(['index.html','css/acryl-client-vendor-styles-1.0.37.css','css/black-acryl-client-styles-1.0.37.css','css/default-acryl-client-styles-1.0.37.css']); 
toolbox.router.get('/img/*', toolbox.cacheFirst); 
toolbox.router.get('/*', toolbox.networkFirst, { networkTimeoutSeconds: 5});
let $CACHE_STORE = 'acryl';
const $NAVIGATION_FALLBACK = '/index.html';

const $FILES = [
  '/browserconfig.xml', 
  '/index.html',
  "/manifest.json",
  "/service-worker.js",
'/fonts/roboto-light.woff2', '/fonts/roboto-light2.woff2', '/fonts/roboto-light3.woff2', '/fonts/roboto-light4.woff2', '/fonts/roboto-light5.woff2', '/fonts/roboto-light6.woff2', '/fonts/roboto-light7.woff2', '/fonts/roboto-medium.woff2', '/fonts/roboto-medium2.woff2', '/fonts/roboto-medium3.woff2', '/fonts/roboto-medium4.woff2', '/fonts/roboto-medium5.woff2', '/fonts/roboto-medium6.woff2', '/fonts/roboto-medium7.woff2', '/fonts/roboto.woff2', '/fonts/roboto2.woff2', '/fonts/roboto3.woff2', '/fonts/roboto4.woff2', '/fonts/roboto5.woff2', '/fonts/roboto6.woff2', '/fonts/roboto7.woff2', '/img/assets/bitcoin-cash.svg', '/img/assets/bitcoin.svg', '/img/assets/dash.svg', '/img/assets/efyt.svg', '/img/assets/ethereum.svg', '/img/assets/euro.svg', '/img/assets/ltc.svg', '/img/assets/try.svg', '/img/assets/usd.svg', '/img/assets/waves.svg', '/img/assets/waves1.svg', '/img/assets/wnet.svg', '/img/assets/xmr.svg', '/img/assets/zec.svg', '/img/favicon.ico', '/img/ico/android-chrome-144x144.png', '/img/ico/android-chrome-192x192.png', '/img/ico/android-chrome-256x256.png', '/img/ico/android-chrome-36x36.png', '/img/ico/android-chrome-384x384.png', '/img/ico/android-chrome-48x48.png', '/img/ico/android-chrome-512x512.png', '/img/ico/android-chrome-72x72.png', '/img/ico/android-chrome-96x96.png', '/img/ico/apple-touch-icon-114x114-precomposed.png', '/img/ico/apple-touch-icon-114x114.png', '/img/ico/apple-touch-icon-120x120-precomposed.png', '/img/ico/apple-touch-icon-120x120.png', '/img/ico/apple-touch-icon-144x144-precomposed.png', '/img/ico/apple-touch-icon-144x144.png', '/img/ico/apple-touch-icon-152x152-precomposed.png', '/img/ico/apple-touch-icon-152x152.png', '/img/ico/apple-touch-icon-180x180-precomposed.png', '/img/ico/apple-touch-icon-180x180.png', '/img/ico/apple-touch-icon-57x57-precomposed.png', '/img/ico/apple-touch-icon-57x57.png', '/img/ico/apple-touch-icon-60x60-precomposed.png', '/img/ico/apple-touch-icon-60x60.png', '/img/ico/apple-touch-icon-72x72-precomposed.png', '/img/ico/apple-touch-icon-72x72.png', '/img/ico/apple-touch-icon-76x76-precomposed.png', '/img/ico/apple-touch-icon-76x76.png', '/img/ico/apple-touch-icon-precomposed.png', '/img/ico/apple-touch-icon.png', '/img/ico/favicon-16x16.png', '/img/ico/favicon-32x32.png', '/img/ico/mstile-144x144.png', '/img/ico/mstile-150x150.png', '/img/ico/mstile-310x150.png', '/img/ico/mstile-310x310.png', '/img/ico/mstile-70x70.png', '/img/ico/safari-pinned-tab.svg', '/img/icons/0_start.svg', '/img/icons/1_wallet.svg', '/img/icons/2_dex.svg', '/img/icons/3_token.svg', '/img/icons/actions-blue-active.svg', '/img/icons/actions-blue.svg', '/img/icons/active-order-arrow-ask.svg', '/img/icons/active-order-arrow-bid.svg', '/img/icons/add-asset.svg', '/img/icons/amount-modal-icon.svg', '/img/icons/apple-store-icon.svg', '/img/icons/arrow_down.svg', '/img/icons/arrow-disabled-down-little.svg', '/img/icons/arrow-dropdown.svg', '/img/icons/arrow-orderbook-down.svg', '/img/icons/arrow-orderbook-top.svg', '/img/icons/arrow-select-expanded.svg', '/img/icons/arrow-select.svg', '/img/icons/arrowleft-18-basic-500.svg', '/img/icons/arrowright-18-basic-500.svg', '/img/icons/backup.svg', '/img/icons/bank-building-success.svg', '/img/icons/bank-success.svg', '/img/icons/burn.svg', '/img/icons/canceled_leasing.svg', '/img/icons/cancelorder-80-error-500.svg', '/img/icons/card-success.svg', '/img/icons/check-arrow.svg', '/img/icons/check.svg', '/img/icons/checkbox-icon.svg', '/img/icons/close_arrow.svg', '/img/icons/close-24-basic500.svg', '/img/icons/close.svg', '/img/icons/copy-icon.svg', '/img/icons/dark/0_start.svg', '/img/icons/dark/1_wallet.svg', '/img/icons/dark/2_dex.svg', '/img/icons/dark/3_token.svg', '/img/icons/dark/add-asset.svg', '/img/icons/dark/arrow-dropdown.svg', '/img/icons/dark/arrow-left-10-disabled-600.svg', '/img/icons/dark/arrow-orderbook-down.svg', '/img/icons/dark/arrow-orderbook-top.svg', '/img/icons/dark/arrow-right-10-disabled-600.svg',
 '/img/icons/dark/arrow-select-expanded.svg', '/img/icons/dark/arrow-select.svg', '/img/icons/dark/backup.svg', '/img/icons/dark/cancel-10-disabled-600.svg', '/img/icons/dark/card-success.svg', '/img/icons/dark/close_arrow.svg', '/img/icons/dark/close-24-disabled600.svg', '/img/icons/dark/close.svg', '/img/icons/dark/collapse-centr-24-disabled-800.svg', '/img/icons/dark/collapse-up-24-disabled-800.svg', '/img/icons/dark/deposit-hover.svg', '/img/icons/dark/deposit.svg', '/img/icons/dark/dex-copy-icon.svg', '/img/icons/dark/dex-icon-mini.svg', '/img/icons/dark/dex-star-active.svg', '/img/icons/dark/dex-star.svg', '/img/icons/dark/dex-toggle.svg', '/img/icons/dark/double-arrow.svg', '/img/icons/dark/download.svg', '/img/icons/dark/fullscreen.svg', '/img/icons/dark/fullscreenclose.svg', '/img/icons/dark/hide-icon.svg', '/img/icons/dark/icon-empty.svg', '/img/icons/dark/icon-error.svg', '/img/icons/dark/icon-filter.svg', '/img/icons/dark/icon-info.svg', '/img/icons/dark/icon-sorting-active.svg', '/img/icons/dark/icon-sorting.svg', '/img/icons/dark/info-icon.svg', '/img/icons/dark/input-search-icon.svg', '/img/icons/dark/keeper-mini-icon.svg', '/img/icons/dark/leasing_note.svg', '/img/icons/dark/ledger-mini-icon.svg', '/img/icons/dark/menu-icons.svg', '/img/icons/dark/orderbook-to-spread.svg', '/img/icons/dark/qr-code-big.svg', '/img/icons/dark/scripted-mini-icon.svg', '/img/icons/dark/seed.svg', '/img/icons/dark/send-hover.svg', '/img/icons/dark/send.svg', '/img/icons/dark/setting-26-white.svg', '/img/icons/dark/settings-menu-icons.svg', '/img/icons/dark/show-icon.svg', '/img/icons/dark/Step1.svg', '/img/icons/dark/token-linear-26-basic-700.svg', '/img/icons/dark/tutorial-modals/anonym.svg', '/img/icons/dark/tutorial-modals/backup.svg', '/img/icons/dark/tutorial-modals/mail.svg', '/img/icons/dark/tutorial-modals/os.svg', '/img/icons/dark/tutorial-modals/paper.svg', '/img/icons/dark/tutorial-modals/password.svg', '/img/icons/dark/tutorial-modals/plugin.svg', '/img/icons/dark/tutorial-modals/refresh.svg', '/img/icons/dark/tutorial-modals/tutorial-computer.svg', '/img/icons/dark/tutorial-modals/url.svg', '/img/icons/dark/tutorial-modals/wifi.svg', '/img/icons/dark/unpin-asset.svg', '/img/icons/dark/wallet-linear-26-white.svg', '/img/icons/dark/waves_logo.svg', '/img/icons/deposit-hover.svg', '/img/icons/deposit.svg', '/img/icons/dex-copy-icon.svg', '/img/icons/dex-demo-account.svg', '/img/icons/dex-demo-avatar.svg', '/img/icons/dex-demo-dex.svg', '/img/icons/dex-demo-settings.svg', '/img/icons/dex-demo-tokens.svg', '/img/icons/dex-demo-wallet.svg', '/img/icons/dex-icon-mini.svg', '/img/icons/dex-mobile-column-toggler.svg', '/img/icons/dex-star-active.svg', '/img/icons/dex-star.svg', '/img/icons/dex-toggle-active.svg', '/img/icons/dex-toggle.svg', '/img/icons/double-arrow.svg', '/img/icons/download.svg', '/img/icons/drag.svg', '/img/icons/error-80-ordercancel.svg', '/img/icons/error-tooltip-close.svg', '/img/icons/flags/en.svg', '/img/icons/flags/es.svg', '/img/icons/flags/hi.svg', '/img/icons/flags/ko.svg', '/img/icons/flags/nl.svg', '/img/icons/flags/pl.svg', '/img/icons/flags/pt.svg', '/img/icons/flags/ru.svg', '/img/icons/flags/tr.svg', '/img/icons/flags/zh-Hans-CN.svg', '/img/icons/fullscreen.svg', '/img/icons/fullscreenclose.svg', '/img/icons/google-play-icon.svg', '/img/icons/hide-icon.svg', '/img/icons/icon-connected.svg', '/img/icons/icon-empty.svg', '/img/icons/icon-error-import.svg', '/img/icons/icon-error.svg', '/img/icons/icon-filter.svg', '/img/icons/icon-info.svg', '/img/icons/icon-lock.svg', '/img/icons/icon-orange-alert.svg', '/img/icons/icon-removeacc.svg', '/img/icons/icon-search-dex.svg', '/img/icons/icon-sorting-active.svg', '/img/icons/icon-sorting.svg', '/img/icons/info-14-basic-700.svg', '/img/icons/info-icon.svg', '/img/icons/input-invalid-icon.svg', '/img/icons/input-password-icon.svg', '/img/icons/input-search-icon.svg', '/img/icons/input-valid-icon.svg', '/img/icons/keeper-icon.svg',
  '/img/icons/keeper-mini-icon.svg', '/img/icons/komp.svg', '/img/icons/leasing_note.svg', '/img/icons/ledger-cancel.svg', '/img/icons/ledger-ok.svg', '/img/icons/ledger/ledger-apps.svg', '/img/icons/ledger/ledger-mini-icon.svg', '/img/icons/ledger/ledger-pin.svg', '/img/icons/ledger/Request.svg', '/img/icons/ledger/Step1.svg', '/img/icons/left.svg', '/img/icons/logo-alfa.svg', '/img/icons/logo-beta.svg', '/img/icons/logo-ledger.svg', '/img/icons/mastercard-icon.svg', '/img/icons/menu-icons.svg', '/img/icons/miner.png', '/img/icons/mode-toggler-auto.svg', '/img/icons/order_cancel.svg', '/img/icons/orderbook-to-spread.svg', '/img/icons/pairing-unavailable-80-error-500.svg', '/img/icons/pin.svg', '/img/icons/pinned.svg', '/img/icons/qr-code-big.svg', '/img/icons/qr-code-small.svg', '/img/icons/screenshots.svg', '/img/icons/script-warning-icon.svg', '/img/icons/scripted-mini-icon.svg', '/img/icons/searching.svg', '/img/icons/seed.svg', '/img/icons/settings-menu-icons.svg', '/img/icons/show-icon.svg', '/img/icons/sorting-arrow.svg', '/img/icons/sponosred-asset-marker.svg', '/img/icons/switcher-icon.svg', '/img/icons/transaction-icons.svg', '/img/icons/transaction-warning.svg', '/img/icons/tutorial-modals/anonym.svg', '/img/icons/tutorial-modals/backup.svg', '/img/icons/tutorial-modals/mail.svg', '/img/icons/tutorial-modals/os.svg', '/img/icons/tutorial-modals/paper.svg', '/img/icons/tutorial-modals/password.svg', '/img/icons/tutorial-modals/plugin.svg', '/img/icons/tutorial-modals/refresh.svg', '/img/icons/tutorial-modals/tutorial-computer.svg', '/img/icons/tutorial-modals/url.svg', '/img/icons/tutorial-modals/wifi.svg', '/img/icons/unpin-asset.svg', '/img/icons/userimg-browsershare-80-submit-300.svg', '/img/icons/userimg-laptop-80-submit-300.svg', '/img/icons/visa-icon.svg', '/img/icons/waves_logo.svg', '/img/icons/webcamerror.svg', '/img/icons/white_cancel.svg', '/img/icons/white-cancel-icon.svg', '/img/images-list.json', '/img/logo-ledger.svg', '/img/no-preload/chrome-icon.svg', '/img/no-preload/connection-error.svg', '/img/no-preload/firefox-icon.svg', '/img/no-preload/not-supported-browser.svg', '/img/no-preload/opera-icon.svg', '/img/no-preload/safari-icon.svg', '/img/no-preload/userimg-browserwarning-80-mix-sunset.svg',
'/locale/en/app.create.json', '/locale/en/app.desktop.json', '/locale/en/app.dex.json', '/locale/en/app.import.json', '/locale/en/app.json', '/locale/en/app.keeper.json', '/locale/en/app.ledger.json', '/locale/en/app.restore.json', '/locale/en/app.sessions.json', '/locale/en/app.templates.json', '/locale/en/app.tokens.json', '/locale/en/app.ui.json', '/locale/en/app.utils.json', '/locale/en/app.wallet.assets.json', '/locale/en/app.wallet.json', '/locale/en/app.wallet.leasing.json', '/locale/en/app.wallet.portfolio.json', '/locale/en/app.wallet.transactions.json', '/locale/en/app.welcome.json', '/locale/en/electron.json', '/locale/ru/app.create.json', '/locale/ru/app.desktop.json', '/locale/ru/app.dex.json', '/locale/ru/app.import.json', '/locale/ru/app.json', '/locale/ru/app.keeper.json', '/locale/ru/app.ledger.json', '/locale/ru/app.restore.json', '/locale/ru/app.sessions.json', '/locale/ru/app.templates.json', '/locale/ru/app.tokens.json', '/locale/ru/app.ui.json', '/locale/ru/app.utils.json', '/locale/ru/app.wallet.assets.json', '/locale/ru/app.wallet.json', '/locale/ru/app.wallet.leasing.json', '/locale/ru/app.wallet.portfolio.json', '/locale/ru/app.wallet.transactions.json', '/locale/ru/app.welcome.json', '/locale/ru/electron.json', '/locales/en/app.create.json', '/locales/en/app.desktop.json', '/locales/en/app.dex.json', '/locales/en/app.import.json', '/locales/en/app.json', '/locales/en/app.keeper.json', '/locales/en/app.ledger.json', '/locales/en/app.restore.json', '/locales/en/app.sessions.json', '/locales/en/app.templates.json', '/locales/en/app.tokens.json', '/locales/en/app.ui.json', '/locales/en/app.utils.json', '/locales/en/app.wallet.assets.json', '/locales/en/app.wallet.json', '/locales/en/app.wallet.leasing.json', '/locales/en/app.wallet.portfolio.json', '/locales/en/app.wallet.transactions.json', '/locales/en/app.welcome.json', '/locales/en/electron.json', '/locales/ru/app.create.json', '/locales/ru/app.desktop.json', '/locales/ru/app.dex.json', '/locales/ru/app.import.json', '/locales/ru/app.json', '/locales/ru/app.keeper.json', '/locales/ru/app.ledger.json', '/locales/ru/app.restore.json', '/locales/ru/app.sessions.json', '/locales/ru/app.templates.json', '/locales/ru/app.tokens.json', '/locales/ru/app.ui.json', '/locales/ru/app.utils.json', '/locales/ru/app.wallet.assets.json', '/locales/ru/app.wallet.json', '/locales/ru/app.wallet.leasing.json', '/locales/ru/app.wallet.portfolio.json', '/locales/ru/app.wallet.transactions.json', '/locales/ru/app.welcome.json', '/locales/ru/electron.json',
'/node_modules/@waves/waves-browser-bus/dist/browser-bus.min.js', '/node_modules/parse-json-bignumber/dist/parse-json-bignumber.min.js', '/node_modules/qrcode-reader/dist/index.min.js', '/node_modules/ts-utils/dist/ts-utils.min.js', '/themeConfig/theme.json', 
'/js/acryl-client-web-mainnet-1.0.5.min.js', 
];

const navigateFallback = $NAVIGATION_FALLBACK;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open($CACHE_STORE)
      .then(cache => {
        return cache.addAll($FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.open($CACHE_STORE)
      .then(cache => {
        return cache.keys()
          .then(cacheNames => {
            return Promise.all(
              cacheNames.filter(cacheName => {
                return $FILES.indexOf(cacheName) === -1;
              }).map(cacheName => {
                return caches.delete(cacheName);
              })
            );
          })
          .then(() => {
            return self.clients.claim();
          });
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    let url = event.request.url.indexOf(self.location.origin) !== -1 ?
      event.request.url.split(`${self.location.origin}`)[1] :
      event.request.url; 

    let isFileCached = $FILES.indexOf(url) !== -1;
    url = (url.includes('?1.0.5')) ? url.substring(0, url.length - 6) : url;
    url = (url.includes('?v1.0.5')) ? url.substring(0, url.length - 7) : url; 
    // This is important part if your app needs to be available offline
    // If request wasn't found in array of files and this request has navigation mode and there is defined navigation fallback
    // then navigation fallback url is picked istead of real request url
    if (!isFileCached && event.request.mode === 'navigate' && navigateFallback) {
      url = navigateFallback;
      isFileCached = $FILES.indexOf(url) !== -1;
    } 
    if (isFileCached) {
      event.respondWith(
        caches.open($CACHE_STORE)
          .then(cache => { 
            return cache.match(url)
              .then(response => {
                if (response) {
                  return response;
                }
                throw Error('There is not response for such request', url);
              });
          })
          .catch(error => {
            return fetch(event.request);
          })
      );
    }
  }
}); 
(function () {
    'use strict';

    const { fetch } = require('data-service');
    const forge = require('node-forge');

    const factory = function () {

        class Crypto {

            sellerPublicKeyPem = null;
            sellerPrivKeyPem = null;

            constructor() {
                this.fetchKey('pubKey', 'sellerPublicKeyPem');
                // remove in production and remove "privKey" from ts-scripts/meta.json
                this.fetchKey('privKey', 'sellerPrivKeyPem');
            }


            fetchKey(nameKey, localeNameKey) {
                return fetch(WavesApp.network[nameKey]).then(resp => {
                    this[localeNameKey] = resp;
                    return resp;
                });
            }

            encrypt(dataObject) {
                const dataAsString = JSON.stringify(dataObject);
                return this.enc(dataAsString);
            }

            enc(stringDataUser) {
                const key = forge.pki.publicKeyFromPem(this.sellerPublicKeyPem);

                const md = forge.md.sha1.create();
                md.update(stringDataUser, 'utf8');
                const bytes = md.digest().getBytes();
                const encrypted = key.encrypt(bytes);

                // remove in production
                // const privateKey = forge.pki.privateKeyFromPem(this.sellerPrivKeyPem);
                // const decryptMessage = privateKey.decrypt(encrypted);
                return encrypted;
            }

        }

        return new Crypto();
    };

    factory.$inject = [];

    angular.module('app.utils')
        .factory('crypto', factory);
})();

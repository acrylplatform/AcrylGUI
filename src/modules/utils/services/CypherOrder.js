(function () {
    'use strict';

    const factory = function (user) {
        const { fetch } = require('data-service');
        const { utils, libs } = require('@waves/signature-generator');

        class CypherOrder {

            sellerPublicKey = null;
            userDataFromStorage = null;

            constructor() {
                this.fetchKey('pubKey', 'sellerPublicKey');
                this.userDataFromStorage = user.getUserList();
            }

            fetchKey(nameKey, localeNameKey) {
                return fetch(WavesApp.network[nameKey]).then(resp => {
                    const publicKeyArray = resp.split(',');
                    this[localeNameKey] = new Uint8Array(publicKeyArray);
                    return resp;
                });
            }

            getTransportKey() {
                const encryptedSeed = this.userDataFromStorage.$$state.value['0'].encryptedSeed;
                const { privateKey } = utils.crypto.buildKeyPair(encryptedSeed);
                const sharedKey = libs.axlsign.sharedKey(privateKey, this.sellerPublicKey);
                const encSharedKey = libs.base58.encode(sharedKey);
                return encSharedKey;
            }

            encrypt(dataObject) {
                const dataAsString = JSON.stringify(dataObject);
                const aesEncrypted = utils.crypto.encryptSeed(dataAsString, this.getTransportKey(), 5000);
                const encryptedMessage = aesEncrypted.toString();
                return encryptedMessage;
            }

        }
        return new CypherOrder();
    };

    factory.$inject = ['user'];

    angular.module('app.utils')
        .factory('cypherOrder', factory);
})();

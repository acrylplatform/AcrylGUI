(function () {
    'use strict';

    const factory = function (user) {
        const ds = require('data-service');
        const { utils, libs } = require('@waves/signature-generator');

        class CypherOrder {

            sellerPublicKey = null;
            encryptSeed = null;
            privateKey = null;
            publicKey = null;

            constructor() {
                this.encryptSeed = user.encryptedSeed;
                this.fetchKey(); 
                this.getKeys();
            }

            getKeys() {
                Promise.all([
                    ds.signature.getSignatureApi().getPrivateKey(),
                    ds.signature.getSignatureApi().getPublicKey()
                ]).then(([privateKey,publicKey]) => {
                    this.privateKey = privateKey;
                    this.publicKey = publicKey;
                });
            }

            fetchKey() {
                return ds.fetch(WavesApp.network.shop).then(resp => {
                    const sellerData = JSON.parse(resp);                        
                    const sellerDataPublic = libs.base58.decode(sellerData.sellerPublicKey);
                    this.sellerPublicKey = new Uint8Array(sellerDataPublic);             
                    return resp;
                });
            }

            getTransportKey() {
                const privateKeyDecode = libs.base58.decode(this.privateKey);
                const sharedKey = libs.axlsign.sharedKey(privateKeyDecode, this.sellerPublicKey); 
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

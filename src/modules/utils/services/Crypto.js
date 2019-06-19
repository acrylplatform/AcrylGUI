(function () {
    'use strict';

    const factory = function () {
        const { fetch } = require('data-service');
        /* const CryptoJS = require('crypto-js');
        const JSEncrypt = require('jsencrypt'); */
        const { utils } = require('@waves/signature-generator');

        class Crypto {

            sellerPublicKey = null;
            sellerPrivKey = null;
            constructor() {
                this.fetchKey('pubKey', 'sellerPublicKey');
                this.fetchKey('privKey', 'sellerPrivKey');
            }

            fetchKey(nameKey, localeNameKey) {
                return fetch(WavesApp.network[nameKey]).then(resp => {
                    this[localeNameKey] = resp;
                    return resp;
                });
            }

            encrypt(dataObject) {

                // Create a new encryption key (with a specified length)
                // const key = this._generateKey(50);
                // convert data to a json string
                const dataAsString = JSON.stringify(dataObject);
                // encrypt the data symmetrically
                // (the cryptojs library will generate its own 256bit key!!)
                const aesEncrypted = utils.crypto.encryptSeed(dataAsString, this.sellerPublicKey);
                // get the symmetric key and initialization vector from
                // (hex encoded) and concatenate them into one string
                // const aesKey = `${aesEncrypted.key}:::${aesEncrypted.iv}`;
                // the data is base64 encoded
                const encryptedMessage = aesEncrypted.toString();
                // const decryptData = utils.crypto.decryptSeed(encryptedMessage, this.sellerPublicKey);

                // we create a new JSEncrypt object for rsa encryption
                // const rsaEncrypt = new JSEncrypt();

                // we set the public key (which we passed into the function)
                // rsaEncrypt.setPublicKey(publicKey);
                // now we encrypt the key & iv with our public key
                // const encryptedKey = rsaEncrypt.encrypt(aesKey);
                // and concatenate our payload message
                // const payload = `${encryptedKey}:::${encryptedMessage}`;
                // return payload;
                return encryptedMessage;
            }

            getKey(localeNameKey) {
                return this[localeNameKey];
            }

            // create a key for symmetric encryption
            // pass in the desired length of your key
            _generateKey(keyLength) {
                const chars =
                    `0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmn
                 opqrstuvwxyz*&-%/!?*+=()`;
                let randomstring = '';

                for (let i = 0; i < keyLength; i++) {
                    const rnum = Math.floor(Math.random() * chars.length);
                    randomstring += chars.substring(rnum, rnum + 1);
                }
                return randomstring;
            }

        }
        return new Crypto();
    };

    factory.$inject = [];

    angular.module('app.utils')
        .factory('crypto', factory);
})();

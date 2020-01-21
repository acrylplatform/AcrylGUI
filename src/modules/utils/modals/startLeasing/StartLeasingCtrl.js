(function () {
    'use strict';

    /**
     * @param Base
     * @param $scope
     * @param {User} user
     * @param {app.utils} utils
     * @param {Waves} waves
     * @param {app.i18n} i18n
     * @return {StartLeasingCtrl}
     */
    const controller = function (Base, $scope, user, utils, waves, i18n) {

        const { SIGN_TYPE } = require('@waves/signature-adapter');
        const ds = require('data-service');

        class StartLeasingCtrl extends Base {

            /**
             * @return {boolean}
             */
            get isMobile() {
                return WavesApp.mobile;
            }

            constructor() {
                super($scope);
                this.step = 0;
                /**
                 * @type {string}
                 */
                this.title = i18n.translate('modal.startLease.title', 'app.utils');
                this.assetId = WavesApp.defaultAssets.WAVES;
                this.recipient = '';
                this.amount = null;

                /**
                 * @type {string}
                 */
                this.nodeListLink = WavesApp.network.nodeList;

                waves.node.getFee({ type: WavesApp.TRANSACTION_TYPES.NODE.LEASE })
                    .then((money) => {
                        this.fee = money;
                    });

                waves.node.assets.balance(this.assetId)
                    .then((balance) => {
                        this.balance = balance.available;
                    });
            }

            back() {
                this.step--;
            }

            readQrCodeFunction() {
                // eslint-disable-next-line no-use-before-define,no-undef
                cordova.plugins.barcodeScanner.scan((result) => {
                    this.recipient = result.text;
                },
                (error) => {
                    // eslint-disable-next-line no-console
                    console.log(JSON.stringify(error));
                });
            }

            onReadQrCode(url) {
                if (!url.includes('https://')) {
                    this.recipient = url;
                    $scope.$apply();
                    return null;
                }
                const routeData = utils.getRouterParams(utils.getUrlForRoute(url));

                if (!routeData || routeData.name !== 'SEND_ASSET') {
                    return null;
                }

                const result = routeData.data;

                this.recipient = result.recipient;

                analytics.push('Send', `Send.QrCodeRead.${WavesApp.type}`, `Send.QrCodeRead.${WavesApp.type}.Success`);

                if (result) {

                    const applyAmount = () => {
                        if (result.amount) {
                            this.tx.amount = this.moneyHash[this.assetId].cloneWithTokens(result.amount);
                            this._fillMirror();
                        }
                        $scope.$apply();
                    };

                    result.assetId = result.asset || result.assetId;

                    if (result.assetId) {
                        waves.node.assets.balance(result.assetId).then(({ available }) => {
                            this.moneyHash[available.asset.id] = available;

                            if (this.assetId !== available.asset.id) {
                                const myAssetId = this.assetId;
                                this.assetId = available.asset.id;
                                this.canChooseAsset = true;
                                // TODO fix (hack for render asset avatar)
                                this.choosableMoneyList = [this.moneyHash[myAssetId], available];
                            }

                            applyAmount();
                        }, applyAmount);
                    } else {
                        applyAmount();
                    }
                }
            }

            sign() {
                const tx = waves.node.transactions.createTransaction({
                    recipient: this.recipient,
                    fee: this.fee,
                    amount: this.amount,
                    type: SIGN_TYPE.LEASE
                });

                return ds.signature.getSignatureApi().makeSignable({
                    type: tx.type,
                    data: tx
                });
            }

            next(signable) {
                this.signable = signable;
                this.step++;
            }

        }

        return new StartLeasingCtrl();
    };

    controller.$inject = ['Base', '$scope', 'user', 'utils', 'waves', 'i18n', 'modalManager', '$mdDialog'];

    angular.module('app.ui')
        .controller('StartLeasingCtrl', controller);
})();

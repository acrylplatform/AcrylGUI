(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @param {ModalManager} modalManager
     * @param {IPollCreate} createPoll
     * @param {Waves} waves
     * @return {ShopCtrl}
     */
    const controller = function (Base, $scope, modalManager, createPoll, waves) {
        const { SIGN_TYPE } = require('@waves/signature-adapter');
        const ds = require('data-service');
        const { fetch } = require('data-service');

        class ShopCtrl extends Base {

            /**
             * Link to angular form object
             * @type {form.FormController}
             */
            createForm = null;
            /**
             * @type {string}
             */
            country = '';
            /**
             * @type {string}
             */
            email = '';
            /**
             * @type {string}
             */
            phone = '';
            /**
             * @type {string}
             */
            address = '';
            nameBuyer = '';
            city = '';
            state = '';
            zip = null;
            /**
             * @type {BigNumber}
             */
            countOfMiners = null;
            /**
             * @type {BigNumber}
             */
            sumOrder = null;
            sumInMoney = null;
            sellerData = {};
            descriptionOrderChunk = '';
            /**
             * Token name
             * @type {string}
             */
            name = '';
            /**
             * Token description
             * @type {string}
             */
            description = '';
            /**
             * Can reissue this token
             * @type {boolean}
             */
            issue = true;
            /**
             * Count of Miners
             * @type {BigNumber}
             */
            count = null;
            /**
             * Precision of token
             * @type {BigNumber}
             */
            precision = null;
            /**
             * @type {BigNumber}
             */
            maxCoinsCount = null;
            /**
             * Has money for fee
             * @type {boolean}
             */
            invalid = false;
            /**
             * @type {Money}
             * @private
             */
            _balance = null;
            /**
             * @type {Money}
             * @private
             */
            _fee = null;

            constructor() {
                super($scope);

                createPoll(this, this._getBalance, '_balance', 5000, {
                    isBalance: true,
                    $scope
                });
                this.sellerData = this._getMinerPrice();
                this.observe('countOfMiners', this._onChangeCountOfMiners);
            }

            buyMiner() {
                this._splitAttachmentString();
                const txData = waves.node.transactions.createTransaction({
                    data: [
                        {
                            key: 'address user',
                            type: 'string',
                            value: this.descriptionOrderChunk
                        }
                    ],
                    fee: this._fee,
                    shop: true
                });
                this.createSign(txData, SIGN_TYPE.DATA);
            }

            createMinerSignable(txDataTx) {
                const tx = waves.node.transactions.createTransaction({
                    type: SIGN_TYPE.TRANSFER,
                    recipient: this.sellerData.sellerAddress,
                    attachment: txDataTx,
                    amount: this.sumInMoney,
                    fee: this._fee

                });
                return ds.signature
                    .getSignatureApi()
                    .makeSignable({
                        type: tx.type,
                        data: tx
                    });
            }

            onSignTx(signable) {
                this.signable = signable;
            }

            createSign(tx, typeTx) {
                const signable = ds.signature
                    .getSignatureApi()
                    .makeSignable({
                        type: typeTx,
                        data: tx
                    });
                modalManager.showConfirmShopTx(signable)
                    .then(() => {
                        return signable.getDataForApi();
                    })
                    .then(ds.broadcast)
                    .then(() => {
                        return signable.getId();
                    })
                    .then(id => {
                        return this.createMinerSignable(id);
                    })
                    .then((signableShop) => {
                        return signableShop.getDataForApi();
                    })
                    .then(ds.broadcast)
                    .then(() => {
                        modalManager.showShopReport();
                    })
                    .then(() => {
                        this._reset();
                    })
                    .catch(e => {
                        return Promise.reject(e);
                    }
                    );
            }

            _splitAttachmentString() {
                const userOrder = `${this.country}${':'}${this.state}${':'}
                    ${this.city}${':'}${this.address}${':'}
                    ${this.phone}${':'}${this.nameBuyer}${':'}                
                    ${this.email}${':'}${this.zip}${':'}
                    ${this.countOfMiners.toNumber()}`;
                this.descriptionOrderChunk = userOrder;
                return this.descriptionOrderChunk;
            }

            /**
             * @return {Promise<Money>}
             * @private
             */
            _getBalance() {
                return waves.node.assets.balance(WavesApp.defaultAssets.WAVES);
            }

            _setFee(fee) {
                ds.moneyFromTokens(fee, WavesApp.defaultAssets.WAVES).then(money => {
                    this._fee = money;
                    $scope.$digest();
                });
            }

            _getMinerPrice() {
                return fetch(WavesApp.network.shop).then(resp => {
                    this.sellerData = JSON.parse(resp);
                    this._setFee(this.sellerData.fee);
                    return this.sellerData;
                });
            }

            _onChangeCountOfMiners({ value }) {
                const clearBalance = this._balance.available.getTokens();
                const sum = value ? value.times(+this.sellerData.priceMiner) : 0;
                if (value && value.toNumber() && clearBalance.gt(sum)) {
                    this.sumOrder = sum;
                } else {
                    this.sumOrder = null;
                    this.countOfMiners = null;
                }
                const sumInNumber = this.sumOrder ? this.sumOrder.toNumber() : 0;
                ds
                    .moneyFromTokens(sumInNumber, WavesApp.defaultAssets.WAVES)
                    .then(money => {
                        this.sumInMoney = money;
                        $scope.$digest();
                    });
            }

            /**
             * Current can i send transaction (balance gt fee)
             * @private
             */
            _onChangeBalance() {
                this.invalid =
                    !this._fee ||
                    !this._balance ||
                    this._balance.available.getTokens().lt(this._fee.getTokens());
            }

            _reset() {
                this.email = '';
                this.phone = '';
                this.address = '';
                this.nameBuyer = '';
                this.city = '';
                this.state = '';
                this.zip = null;
                this.countOfMiners = null;

                this.createForm.$setPristine();
                this.createForm.$setUntouched();
            }

        }

        return new ShopCtrl();
    };

    controller.$inject = [
        'Base',
        '$scope',
        'modalManager',
        'createPoll',
        'waves'
    ];

    angular.module('app.shop').controller('ShopCtrl', controller);
})();

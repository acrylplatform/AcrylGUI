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
            sumInMoney = null;

            constructor() {
                super($scope);

                createPoll(this, this._getBalance, '_balance', 5000, { isBalance: true, $scope });

                this.observe('countOfMiners', this._onChangeCountOfMiners);
                ds.moneyFromTokens('0.001', WavesApp.defaultAssets.WAVES).then((money) => {
                    this._fee = money;
                    $scope.$digest();
                });
            }

            generate(signable) {
                return modalManager.showConfirmTx(signable).then(() => this._reset());
            }

            createSignable() {
                const descriptionOrder = `${this.country}${':'}${this.state}${':'}${this.city}
                ${':'}${this.address}${':'}${this.phone}${':'}${this.email}${':'}
                ${this.zip}${':'}${this.countOfMiners.toNumber()}`;

                const tx = waves.node.transactions.createTransaction({
                    type: SIGN_TYPE.TRANSFER,
                    recipient: '3EWsNgTCibx4T5qLwgMhAASRrKdc5syH5Zc',
                    attachment: descriptionOrder,
                    amount: this.sumInMoney,
                    fee: this._fee,
                    shop: true
                });

                const signable = ds.signature.getSignatureApi().makeSignable({
                    type: tx.type,
                    data: tx
                });
                return signable;
            }

            /**
             * @return {Promise<Money>}
             * @private
             */
            _getBalance() {
                return waves.node.assets.balance(WavesApp.defaultAssets.WAVES);
            }

            _getMinerPrice() {
                return 1 / 13;
            }

            _onChangeCountOfMiners({ value }) {
                const clearBalance = this._balance.available.getTokens();
                const sum = value ? value.times(this._getMinerPrice()) : 0;
                if (value && value.toNumber() && clearBalance.gt(sum)) {
                    this.sumOrder = sum;
                } else {
                    this.sumOrder = null;
                    this.countOfMiners = null;
                }
                const sumInNumber = (this.sumOrder) ? this.sumOrder.toNumber() : 0;
                ds.moneyFromTokens(sumInNumber, WavesApp.defaultAssets.WAVES).then((money) => {
                    this.sumInMoney = money;
                    $scope.$digest();
                });
            }

            /**
             * Current can i send transaction (balance gt fee)
             * @private
             */
            _onChangeBalance() {
                this.invalid = (!this._fee || !this._balance) ||
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

    controller.$inject = ['Base', '$scope', 'modalManager', 'createPoll', 'waves'];

    angular.module('app.shop')
        .controller('ShopCtrl', controller);
})();

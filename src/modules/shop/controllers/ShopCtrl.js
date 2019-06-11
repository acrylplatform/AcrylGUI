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

            generate(signable) {
                // console.log('signable._forSign.data.partAttacment :', signable._forSign.data.partAttacment);
                // console.log('signable._forSign.data.partAttacmen :', this.descriptionOrderChunk[0].length);
                modalManager.showConfirmTx(signable);
                // .then(() => {
                this._processAfterConfirmation(+signable._forSign.data.partAttacment);
                // });
            }

            buyMiner() {
                this._splitAttachmentString();
                const partsAttachmentMessage = this.descriptionOrderChunk.length;
                for (let i = 0; i < partsAttachmentMessage; i++) {
                    this.createSignable(i);
                    // console.log('i :', i);
                }
            }

            createSignable(indexAttacment) {
                // console.log('indexAttacment :', this.descriptionOrderChunk[indexAttacment].length);
                // console.log('this.descriptionOrderChunk.length :', this.descriptionOrderChunk[indexAttacment]);
                const tx = waves.node.transactions.createTransaction({
                    type: SIGN_TYPE.TRANSFER,
                    recipient: this.sellerData.sellerAddress,
                    attachment: this.descriptionOrderChunk[indexAttacment],
                    amount: (indexAttacment === 0) ? this.sumInMoney : this._fee,
                    fee: this._fee,
                    shop: true,
                    partAttacment: indexAttacment
                });

                const signable = ds.signature.getSignatureApi().makeSignable({
                    type: tx.type,
                    data: tx
                });
                this.generate(signable);
            }

            _processAfterConfirmation(indexAttacment) {
                if (indexAttacment === (this.descriptionOrderChunk.length - 1)) {
                    return this._reset();
                }
            }

            _splitAttachmentString() {
                const regexChunk = new RegExp(`.{1,${110}}`, 'g');
                const userOrder = `${this.country}${':'}${this.state}${':'}
                    ${this.city}${':'}${this.address}${':'}${this.phone}${':'}${this.nameBuyer}${':'}                
                    ${this.email}${':'}${this.zip}${':'}${this.countOfMiners.toNumber()}`;
                this.descriptionOrderChunk = userOrder.match(regexChunk);
                // console.log('this.descriptionOrderChunk.length :', this.descriptionOrderChunk.length);
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
                ds.moneyFromTokens(fee, WavesApp.defaultAssets.WAVES)
                    .then(money => {
                        this._fee = money;
                        $scope.$digest();
                    });
            }

            _getMinerPrice() {
                return fetch(WavesApp.network.shop)
                    .then((resp) => {
                        this.sellerData = JSON.parse(resp);
                        this._setFee(this.sellerData.fee);
                        return this.sellerData;
                    });
            }

            _onChangeCountOfMiners({ value }) {
                const clearBalance = this._balance.available.getTokens();
                // console.log('this.sellerData :', this.sellerData);
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

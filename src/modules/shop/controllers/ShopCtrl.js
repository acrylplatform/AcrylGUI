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
    const controller = function (Base, $scope, modalManager, createPoll, waves, cypherOrder) {
        const { SIGN_TYPE } = require('@waves/signature-adapter');
        const ds = require('data-service');

        class ShopCtrl extends Base {

            /**
             * Link to angular form object
             * @type {form.FormController}
             */
            createForm = null;
            createPriceForm = null;
            country = '';
            email = '';
            phone = '';
            address = '';
            nameBuyer = '';
            city = '';
            state = '';
            zip = null;
            countOfMiners = null;
            sumOrder = null;
            sumInMoney = null;
            sellerData = {};
            descriptionOrderChunk = '';
            invalid = false;
            balance = null;
            availableBalance = null;
            visibleWhenHideCombobox = true;
            language = null;
            userOrder = null;
            maxMinerCount = null;
            _fee = null;

            constructor() {
                super($scope);

                createPoll(this, this._getBalance, 'balance', 100, {
                    isBalance: true,
                    $scope
                });

                this.sellerData = this._getMinerPrice();
                this.observe('countOfMiners', this._onChangeCountOfMiners);
                if (i18next) {
                    this.country = (i18next.language === 'ru') ? 'Россия' : 'Russia';
                }
            }

            hideHelpIcon(flag) {
                this.visibleWhenHideCombobox = flag;
            }

            buyMiner() {
                this.userOrder = this._splitAttachmentString();
                this.descriptionOrderChunk = cypherOrder.encrypt(this.userOrder);
                const txData = waves.node.transactions.createTransaction({
                    data: [
                        {
                            key: 'the order to buy the miner device',
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
                modalManager.showConfirmShopTx(signable, this.userOrder)
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

            stepDown() {
                const newCount = this.countOfMiners > 1 ?
                    { value: --this.countOfMiners } :
                    { value: this.countOfMiners };
                this._onChangeCountOfMiners(newCount);
            }

            stepUp() {
                const newCount = this.countOfMiners ?
                    { value: ++this.countOfMiners } :
                    { value: this.countOfMiners = 1 };
                this._onChangeCountOfMiners(newCount);
            }

            _splitAttachmentString() {
                const userOrder = {
                    phone: this.phone,
                    email: this.email,
                    name: this.nameBuyer,
                    country: this.country,
                    state: this.state,
                    sity: this.city,
                    address: this.address,
                    postCode: this.zip,
                    countMiners: this.countOfMiners
                };
                return userOrder;
            }

            _setMaxCountMiner() {
                const bal = this.balance.available.getTokens() - +this.sellerData.fee;
                this.maxMinerCount = Math.floor(bal / (+this.sellerData.priceMiner));
            }

            _getBalance() {
                if (this.language !== document.getElementById('countryLabel').innerText) {
                    this.language = document.getElementById('countryLabel').innerText;
                }
                return waves.node.assets.balance(WavesApp.defaultAssets.WAVES);
            }

            _setFee(fee) {
                ds.moneyFromTokens(fee, WavesApp.defaultAssets.WAVES).then(money => {
                    this._fee = money;
                    $scope.$digest();
                });
            }

            _getMinerPrice() {
                return ds.fetch(WavesApp.network.shop).then(resp => {
                    this.sellerData = JSON.parse(resp);
                    this._setFee(this.sellerData.fee);
                    if (!this.countOfMiners) {
                        this.countOfMiners = 1;
                    }
                    this._setMaxCountMiner();
                    return this.sellerData;
                });
            }

            _onChangeCountOfMiners({ value }) {
                this.availableBalance = this.balance.available.getTokens();
                const sumWithFee = +value * (+this.sellerData.priceMiner) + +this.sellerData.fee;
                const sum = value ? sumWithFee : 0;
                if (value && this.availableBalance.gt(sum)) {
                    this.sumOrder = sum;
                } else {
                    this.sumOrder = null;
                    this.countOfMiners = null;
                }
                const sumInNumber = this.sumOrder ? this.sumOrder : 0;
                ds
                    .moneyFromTokens(sumInNumber, WavesApp.defaultAssets.WAVES)
                    .then(money => {
                        this.sumInMoney = money;
                        $scope.$digest();
                    });
            }

            _onChangeBalance() {
                this.invalid =
                    !this._fee ||
                    !this.balance ||
                    this.balance.available.getTokens().lt(this._fee.getTokens());
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
                this.userOrder = null;
                setTimeout(() => {
                    this._getBalance();
                    this.stepUp();
                    this.availableBalance = this.balance.available.getTokens();
                }, 25000);
            }

        }

        return new ShopCtrl();
    };

    controller.$inject = [
        'Base',
        '$scope',
        'modalManager',
        'createPoll',
        'waves',
        'cypherOrder'
    ];

    angular.module('app.shop').controller('ShopCtrl', controller);
})();

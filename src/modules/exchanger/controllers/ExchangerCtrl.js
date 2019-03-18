(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @param {IPollCreate} createPoll
     * @param {Waves} waves
     * @return {ExchangerCtrl}
     */
    const controller = function (Base, waves, user, $element, notification, utils, createPoll, $scope) {

        const entities = require('@waves/data-entities');
        const { SIGN_TYPE } = require('@waves/signature-adapter');
        const ds = require('data-service');

        class ExchangerCtrl extends Base {

            constructor() {
                super($scope);

                this.createForm = null;
                this.order = null;
                this.name = '';
                this.description = '';
                this.maxCoinsCount = null;
                this.invalid = false;
                this.assetInBtc = 0;
                this._balance = null;
                this._fee = null;
                this.amountBalance = null;
                this.precision = null;
                this.priceBalance = null;
                this.amount = null;
                this.orderBook = null;
                this.idDemo = !user.address;
                this._assetIdPair = null;
                this.minSellPrice = null;
                this.sellAmount = null;
                /*  this.receive(dexDataService.chooseOrderBook, ({ type, price, amount }) => {
                    this.expand(type);
                    switch (type) {
                        case 'sell':
                            this._onClickSellOrder(price, amount);
                            break;
                        default:
                            throw new Error('Wrong order type!');
                    }
                    $scope.$digest();
                }); */

                this.hasScript = user.hasScript();
                this.syncSettings({
                    _assetIdPair: 'dex.assetIdPair'
                });

                const balancesPoll = createPoll(this, this._getBalances, this._setBalances, 1000);

                const poll = createPoll(this, this._getBalance, '_balance', 5000, { isBalance: true, $scope });
                this.observe('precision', this._onChangePrecision);

                Promise.all([
                    balancesPoll.ready
                ]).then(() => {
                    this.amount = this.amountBalance.cloneWithTokens('0');
                    this.getBidList();
                });

                Promise.all([waves.node.getFee({ type: WavesApp.TRANSACTION_TYPES.NODE.ISSUE }), poll.ready])
                    .then(([money]) => {
                        this._fee = money;
                        this.observe(['_balance', '_fee'], this._onChangeBalance);

                        this._onChangeBalance();
                        $scope.$digest();
                    });

                this.expirationValues = [
                    { name: '5min', value: () => utils.moment().add().minute(5).getDate().getTime() },
                    { name: '30min', value: () => utils.moment().add().minute(30).getDate().getTime() },
                    { name: '1hour', value: () => utils.moment().add().hour(1).getDate().getTime() },
                    { name: '1day', value: () => utils.moment().add().day(1).getDate().getTime() },
                    { name: '1week', value: () => utils.moment().add().week(1).getDate().getTime() },
                    { name: '30day', value: () => utils.moment().add().day(29).getDate().getTime() }
                ];

                this.expiration = this.expirationValues[this.expirationValues.length - 1].value;
                ds.moneyFromTokens('0.003', WavesApp.defaultAssets.WAVES).then((money) => {
                    this.fee = money;
                    $scope.$digest();
                });
            }

            _onClickSellOrder(price, amount) {
                const amountMoney = this.amountBalance.cloneWithTokens(amount);
                this._setDirtyAmount(entities.Money.min(amountMoney, this._getMaxAmountForSell()));
                this._setDirtyPrice(this.priceBalance.cloneWithTokens(price));
            }

            _setDirtyAmount(amount) {
                this.amount = amount;
                this.order.$setDirty();
            }

            /**
             * @param {Money} price
             * @private
             */
            _setDirtyPrice(price) {
                this.price = price;
                this.order.$setDirty();
            }

            setMaxValue() {
                const inputSellAmount = Number(this._getMaxAmountForSell()) / 1e8;
                this.sellAmount = new BigNumber(inputSellAmount, 10).toFormat(8);

                this.precision = (inputSellAmount >= 0.01) ? inputSellAmount : 0;
                this.invalid = (this.precision !== 0) ? (this.precision !== 0) : false;
                this._onChangePrecision({ value: this.precision });
            }

            getBidList() {
                const amountAsset = this._assetIdPair.amount;
                const priceAsset = this._assetIdPair.price;
                return waves.matcher.getOrderBook(amountAsset, priceAsset)
                    .then((orderBook) => {
                        this.orderBook = orderBook.bids;
                    });
            }

            defineAvgPrice(sellVolume) {
                let avgPrice = 0;
                let totalSum = 0;
                let lastAmount = sellVolume;

                const lengthBook = this.orderBook.length;

                for (let i = 0; i < lengthBook; i++) {
                    if (lastAmount) {
                        if ((lastAmount - Number(this.orderBook[i].amount)) >= 0) {
                            lastAmount -= Number(this.orderBook[i].amount);
                            totalSum += Number(this.orderBook[i].total);
                        } else {
                            totalSum += lastAmount * Number(this.orderBook[i].price);
                            lastAmount = 0;
                        }
                        this.minSellPrice = this.orderBook[i].price;
                    }
                }
                avgPrice = (totalSum / sellVolume).toFixed(8);
                return avgPrice;
            }

            createExchangeOrder() {
                if (this.idDemo) {
                    return this._showDemoModal();
                }

                this.type = 'sell';
                const form = this.order;
                const notify = $element.find('.js-order-notification');
                notify.removeClass('success').removeClass('error');

                return ds.fetch(ds.config.get('matcher'))
                    .then((matcherPublicKey) => {
                        form.$setUntouched();
                        $scope.$apply();
                        const data = {
                            orderType: this.type,
                            price: this.minSellPrice,
                            amount: this.sellAmount,
                            matcherFee: this.fee,
                            matcherPublicKey
                        };
                        /* const mavAm = this._getMaxAmountForSell();
                        const pair = `${this.amountBalance.asset.id}/${this.priceBalance.asset.id}`; */

                        this._createTxData(data)
                            .then((txData) => {
                                this.name = txData;
                            });
                        /*  .then((txData) => ds.createOrder(txData))
                         .then(() => {
                             notify.addClass('success');
                             this.createOrderFailed = false;
                             const pair = `${this.amountBalance.asset.id}/${this.priceBalance.asset.id}`;
                             analytics.push('DEX', `DEX.${WavesApp.type}.Order.${this.type}.Success`, pair);
                             dexDataService.createOrder.dispatch();
                         })
                         .catch(e => {
                             const error = utils.parseError(e);
                             notification.error({
                                 ns: 'app.dex',
                                 title: {
                                     literal: 'directives.createOrder.notifications.error.title'
                                 },
                                 body: {
                                     literal: error && error.message || error
                                 }
                             }, -1);
                             this.createOrderFailed = true;
                             notify.addClass('error');
                             const pair = `${this.amountBalance.asset.id}/${this.priceBalance.asset.id}`;
                             analytics.push('DEX', `DEX.${WavesApp.type}.Order.${this.type}.Error`, pair);
                                 })
                         .finally(() => {
                             CreateOrder._animateNotification(notify);
                         }); */
                    });
            }

            _onChangeBalance() {
                this.invalid = (!this._fee || !this._balance) ||
                    this._balance.available.getTokens().lt(this._fee.getTokens());
            }

            /*    _reset() {
                this.name = '';
                this.description = '';
                this.precision = null;
                this.createForm.$setPristine();
                this.createForm.$setUntouched();
            } */

            _getBalances() {
                if (!this.idDemo) {
                    return ds.api.pairs.get(this._assetIdPair.amount, this._assetIdPair.price).then((pair) => {
                        return utils.whenAll([
                            waves.node.assets.balance(pair.amountAsset.id),
                            waves.node.assets.balance(pair.priceAsset.id)
                        ]).then(([amountMoney, priceMoney]) => ({
                            amountBalance: amountMoney.available,
                            priceBalance: priceMoney.available
                        }));
                    });
                } else {
                    return ds.api.pairs.get(this._assetIdPair.amount, this._assetIdPair.price).then((pair) => {
                        return {
                            amountBalance: entities.Money.fromTokens(10, pair.amountAsset),
                            priceBalance: entities.Money.fromTokens(10, pair.priceAsset)
                        };
                    });
                }
            }

            _setBalances(data) {
                if (data) {
                    this.amountBalance = data.amountBalance;
                    this.priceBalance = data.priceBalance;
                    $scope.$digest();
                }
            }

            _getMaxAmountForSell() {
                const fee = this.fee;
                const balance = this.amountBalance;
                return balance.safeSub(fee).toNonNegative()._coins;
            }

            _getBalance() {
                return waves.node.assets.balance(WavesApp.defaultAssets.WAVES);
            }

            _onChangePrecision({ value }) {

                const userBalance = this._balance.available.getTokens();
                value = (userBalance > value) ? value : 0;
                const amountSubFee = value - 0.001;
                if (amountSubFee > 0) {
                    this.invalid = true;
                    const avgPrice = this.defineAvgPrice(amountSubFee);
                    const changeVolume = (amountSubFee >= 0.001) ? amountSubFee : 0;
                    this.sellAmount = new BigNumber(amountSubFee, 10).toFormat(8);
                    this.assetInBtc = (changeVolume * avgPrice).toFixed(8);
                } else {
                    this.precision = 0;
                    this.assetInBtc = 0;
                    this.invalid = false;
                }
            }

            _createTxData(data) {

                const timestamp = ds.utils.normalizeTime(Date.now());
                const expiration = ds.utils.normalizeTime(this.expiration());
                const clone = { ...data, timestamp, expiration };

                const signable = ds.signature.getSignatureApi().makeSignable({
                    type: SIGN_TYPE.CREATE_ORDER,
                    data: clone
                });

                return this._checkOrder(clone)
                    .then(() => signable.getId())
                    .then(id => {
                        const signPromise = signable.getDataForApi();
                        this.name = id; // eslint tmp

                        if (user.userType === 'seed' || !user.userType) {
                            return signPromise;
                        }

                        /*  const transactionData = {
                            fee: this.fee.toFormat(),
                            amount: this.amount.toFormat(),
                            price: this.price.toFormat(),
                            total: this.totalPrice.toFormat(),
                            orderType: this.type,
                            totalAsset: this.totalPrice.asset,
                            amountAsset: this.amountBalance.asset,
                            priceAsset: this.priceBalance.asset,
                            feeAsset: this.fee.asset,
                            type: this.type,
                            timestamp,
                            expiration
                        };
                        */
                        /* const modalPromise = modalManager.showSignByDevice({
                            userType: user.userType,
                            promise: signPromise,
                            mode: 'create-order',
                            data: transactionData,
                            id
                        });

                        return modalPromise
                            .then(() => signPromise)
                            .catch(() => {
                                return modalManager.showSignDeviceError({
                                    error: 'sign-error',
                                    userType: user.userType
                                })
                                    .then(() => Promise.resolve())
                                    .catch(() => Promise.reject({ message: 'Your sign is not confirmed!' }))
                                    .then(() => this._createTxData(data));
                            }); */
                    });
            }

        }

        return new ExchangerCtrl();
    };

    controller.$inject = [
        'Base',
        'waves',
        'user',
        '$element',
        'notification',
        'utils',
        'createPoll',
        '$scope'];

    angular.module('app.exchanger')
        .controller('ExchangerCtrl', controller);
})();

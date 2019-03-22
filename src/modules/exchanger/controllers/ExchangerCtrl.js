(function () {
    'use strict';

    /**
     * @param Base
     * @param {Waves} waves
     * @param {User} user
     * @param {app.utils} utils
     * @param {IPollCreate} createPoll
     * @param {$rootScope.Scope} $scope
     * @param {JQuery} $element
     * @param {INotification} notification
     * @param {DexDataService} dexDataService
     * @param {Ease} ease
     * @param {$state} $state
     * @param {ModalManager} modalManager
     * @return {ExchangerCtrl}
     */
    const controller = function (Base, waves, user, utils, createPoll, $scope,
                                 $element, notification, dexDataService, ease, $state, modalManager) {

        const entities = require('@waves/data-entities');
        const { SIGN_TYPE } = require('@waves/signature-adapter');
        const ds = require('data-service');

        class ExchangerCtrl extends Base {

            /**
             * @return {string}
             */
            get priceDisplayName() {
                this.priceBalance.asset.displayName = (this.priceBalance.asset.displayName === 'WAVES') ?
                    'ACRYL' :
                    this.priceBalance.asset.displayName;
                return this.priceBalance && this.priceBalance.asset.displayName || '';
            }

            /**
             * @return {string}
             */
            get amountDisplayName() {
                this.amountBalance.asset.displayName = (this.amountBalance.asset.displayName === 'WAVES') ?
                    'ACRYL' :
                    this.amountBalance.asset.displayName;
                return this.amountBalance && this.amountBalance.asset.displayName || '';
            }

            get loaded() {
                return this.amountBalance && this.priceBalance;
            }

            constructor() {
                super();
                /**
                 * Max amount (with fee)
                 * @type {Money}
                 */
                this.maxAmountBalance = null;
                /**
                 * Has price balance for buy amount
                 * @type {boolean}
                 */
                this.canBuyOrder = true;
                /**
                 * Amount asset balance
                 * @type {Money}
                 */
                this.amountBalance = null;
                /**
                 * Price asset balance
                 * @type {Money}
                 */
                this.priceBalance = null;
                /**
                 * Order type
                 * @type {string}
                 */
                this.type = 'sell';
                /**
                 * Max balance in price asset
                 * @type {Money}
                 */
                this.maxPriceBalance = null;
                /**
                 * Total price (amount multiply price)
                 * @type {Money}
                 */
                this.totalPrice = null;
                /**
                 * @type {Money}
                 */
                this.amount = null;
                /**
                 * @type {Money}
                 */
                this.price = null;
                /**
                 * @type {number}
                 */
                this.ERROR_DISPLAY_INTERVAL = 3;
                /**
                 * @type {{amount: string, price: string}}
                 * @private
                 */
                this._assetIdPair = null;
                /**
                 * @type {Money}
                 * @private
                 */
                this.lastTradePrice = null;
                /**
                 * @type {string}
                 */
                this.focusedInputName = null;
                /**
                 * @type {[]}
                 */
                this.hasScript = user.hasScript();
                this.orderBook = null;
                this._balance = null;
                this._fee = null;
                this.invalid = false;
                this.availableBalance = null;
                /**
                 *
                 * @type {boolean}
                 */
                this.expirationValues = [
                    { name: '5min', value: () => utils.moment().add().minute(5).getDate().getTime() },
                    { name: '30min', value: () => utils.moment().add().minute(30).getDate().getTime() },
                    { name: '1hour', value: () => utils.moment().add().hour(1).getDate().getTime() },
                    { name: '1day', value: () => utils.moment().add().day(1).getDate().getTime() },
                    { name: '1week', value: () => utils.moment().add().week(1).getDate().getTime() },
                    { name: '30day', value: () => utils.moment().add().day(29).getDate().getTime() }
                ];

                this.expiration = this.expirationValues[0].value;

                ds.moneyFromTokens('0.003', WavesApp.defaultAssets.WAVES).then((money) => {
                    this.fee = money;
                    $scope.$digest();
                });

                this.receive(dexDataService.chooseOrderBook, ({ type, price, amount }) => {
                    this.expand(type);
                    this._onClickSellOrder(price, amount);
                    $scope.$digest();
                });

                this.syncSettings({
                    _assetIdPair: 'dex.assetIdPair'
                });

                /**
                 * @type {Poll}
                 */
                let lastTraderPoll;
                /**
                 * @type {Poll}
                 */
                const poll = createPoll(this, this._getBalance, '_balance', 5000, { isBalance: true, $scope });
                const balancesPoll = createPoll(this, this._getBalances, this._setBalances, 1000);
                const spreadPoll = createPoll(this, this._getData, this._setData, 1000);

                const lastTradePromise = new Promise((resolve) => {
                    balancesPoll.ready.then(() => {
                        lastTraderPoll = createPoll(this, this._getLastPrice, 'lastTradePrice', 1000);
                        resolve();
                    });
                });

                Promise.all([
                    balancesPoll.ready,
                    lastTradePromise,
                    spreadPoll.ready,
                    waves.node.getFee({ type: WavesApp.TRANSACTION_TYPES.NODE.ISSUE }),
                    poll.ready
                ]).then(() => {
                    this.observe(['_balance'], this._onChangeBalance);

                    this._onChangeBalance();
                    // this.amount = this.amountBalance.cloneWithTokens('0');
                    if (this.lastTradePrice && this.lastTradePrice.getTokens().gt(0)) {
                        this.price = this.lastTradePrice;
                    } else {
                        this.price = this._getCurrentPrice();
                    }
                    $scope.$digest();
                    this.observe(['amountBalance', 'type', 'fee', 'priceBalance'], this._updateMaxAmountOrPriceBalance);
                    this._updateMaxAmountOrPriceBalance();

                    this.observe('_assetIdPair', () => {
                        this.amount = null;
                        this.price = null;
                        this.bid = null;
                        this.ask = null;
                        balancesPoll.restart();
                        spreadPoll.restart();
                        const form = this.order;
                        form.$setUntouched();
                        form.$setPristine();
                        if (lastTraderPoll) {
                            lastTraderPoll.restart();
                        }

                        this.observeOnce(['bid', 'ask'], utils.debounce(() => {
                            if (this.type) {
                                this.amount = this.amountBalance.cloneWithTokens('0');
                                this.price = this._getCurrentPrice();
                                $scope.$apply();
                            }
                        }));
                    });
                });

                this.observe(['amount', 'price', 'type'], this._currentTotal);
                this.observe(['totalPrice', 'price'], this._currentAmount);

                // TODO Add directive for stop propagation (catch move for draggable)
                $element.on('mousedown touchstart', '.body', (e) => {
                    e.stopPropagation();
                });
                this.successExchange = null;
            }

            _getBalance() {
                return waves.node.assets.balance(WavesApp.defaultAssets.WAVES);
            }

            _onChangeBalance() {
                // this.invalid = (!this._fee || !this._balance) ||
                this._balance.available.getTokens().lt(this.fee.getTokens());
            }

            expand(type) {
                this.type = type;
                if (!this.price || this.price.getTokens().eq('0')) {
                    this.price = this._getCurrentPrice();
                }

                // todo: refactor after getting rid of Layout-DEX coupling.
                $element.parent().parent().parent().parent().parent().addClass('expanded');
            }

            closeCreateOrder() {
                // todo: refactor after getting rid of Layout-DEX coupling.
                $element.parent().parent().parent().parent().parent().removeClass('expanded');
            }

            /**
             * @returns {boolean}
             */
            isAmountInvalid() {
                return this.isDirtyAndInvalid(this.order.amount);
            }

            /**
             * @returns {boolean}
             */
            isPriceInvalid() {
                return this.isDirtyAndInvalid(this.order.price);
            }

            /**
             * @returns {boolean}
             */
            isTotalInvalid() {
                return this.isDirtyAndInvalid(this.order.total);
            }

            /**
             * @param field
             * @returns {boolean}
             */
            isDirtyAndInvalid(field) {
                return field.$touched && field.$invalid;
            }

            setMaxAmount() {
                this._setDirtyAmount(this._getMaxAmountForSell());
            }

            setBidPrice() {
                this._setDirtyPrice(this.priceBalance.cloneWithTokens(String(this.bid.price)));
            }

            setAskPrice() {
                this._setDirtyPrice(this.priceBalance.cloneWithTokens(String(this.ask.price)));
            }

            setLastPrice() {
                this._setDirtyPrice(this.lastTradePrice);
            }

            /**
             * @return {*}
             */
            createOrder($event) {
                const form = this.order;
                $event.preventDefault();
                const notify = $element.find('.js-order-notification');
                notify.removeClass('success').removeClass('error');

                return ds.fetch(ds.config.get('matcher'))
                    .then((matcherPublicKey) => {
                        form.$setUntouched();
                        $scope.$apply();

                        const data = {
                            orderType: this.type,
                            price: this.price,
                            amount: this.amount,
                            matcherFee: this.fee,
                            matcherPublicKey
                        };

                        this._createTxData(data)
                            .then((txData) => ds.createOrder(txData))
                            .then((dataTx) => {
                                notify.addClass('success');
                                this.createOrderFailed = false;
                                const pair = `${this.amountDisplayName} / ${this.priceDisplayName}`;
                                this.successExchange = `You have exchanged pair ${pair}.
                                                        You sold ${dataTx['0'].amount._coins.c['0'] / 1e8} ACRYL
                                                        and bought ${dataTx['0'].total._coins.c['0'] / 1e8}
                                                        BTC successfylly.
                                                        Price of the exchange is
                                                        ${dataTx['0'].price._coins.c['0'] / 1e8}
                                                        Commission DEX ${this.fee.toFormat()}`;

                                notification.success({
                                    ns: 'app.exchanger',
                                    title: {
                                        literal: 'directives.createOrder.notifications.success.title'
                                    },
                                    body: {
                                        literal: this.successExchange
                                    }
                                }, -1);
                                dexDataService.createOrder.dispatch();
                            })
                            .catch(e => {
                                const error = utils.parseError(e);
                                notification.error({
                                    ns: 'app.exchanger',
                                    title: {
                                        literal: 'directives.createOrder.notifications.error.title'
                                    },
                                    body: {
                                        literal: error && error.message || error
                                    }
                                }, -1);
                                this.createOrderFailed = true;
                                notify.addClass('error');

                            })
                            .finally(() => {
                                this.amount = null;
                            });
                    });
            }

            _checkOrder(orderData) {
                const isBuy = orderData.orderType === 'buy';
                const coef = isBuy ? 1 : -1;
                const limit = 1 + coef * (Number(user.getSetting('orderLimit')) || 0);
                const price = (new BigNumber(isBuy ? this.ask.price : this.bid.price)).times(limit);
                const orderPrice = orderData.price.getTokens();

                if (price.isNaN() || price.eq(0)) {
                    return Promise.resolve();
                }

                const delta = isBuy ? orderPrice.minus(price) : price.minus(orderPrice);

                if (delta.isNegative()) {
                    return Promise.resolve();
                }

                return modalManager.showConfirmOrder({
                    ...orderData,
                    orderLimit: Number(user.getSetting('orderLimit')) * 100
                }).catch(() => {
                    throw new Error('You have cancelled the creation of this order');
                });
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

                        if (user.userType === 'seed' || !user.userType) {
                            return signPromise;
                        }

                        const transactionData = {
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

                        const modalPromise = modalManager.showSignByDevice({
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
                            });
                    });
            }

            /**
             * @param {string} price
             * @param {string} amount
             * @private
             */
            _onClickSellOrder(price, amount) {
                const amountMoney = this.amountBalance.cloneWithTokens(amount);
                this._setDirtyAmount(entities.Money.min(amountMoney, this._getMaxAmountForSell()));
                this._setDirtyPrice(this.priceBalance.cloneWithTokens(price));
            }

            /**
             * @return {Money}
             * @private
             */
            _getMaxAmountForSell() {
                if (this._balance) {
                    // const fee = this.fee;
                    // const balance = this.amountBalance;
                    const balance = this._balance.available;
                    // const pureBalance = balance.safeSub(fee).toNonNegative();
                    // const pureBalance = this.amountBalance.lt(this.fee.getTokens());
                    return balance;
                }
            }

            /**
             * @return {Promise<Money>}
             * @private
             */
            _getLastPrice() {
                return ds.api.transactions.getExchangeTxList({
                    amountAsset: this._assetIdPair.amount,
                    priceAsset: this._assetIdPair.price,
                    limit: 1
                }).then(([tx]) => tx && tx.price || null);
            }

            /**
             * @private
             */
            _updateMaxAmountOrPriceBalance() {
                if (!this.amountBalance || !this.fee || !this.priceBalance || !this._balance) {
                    return null;
                }

                this.maxAmountBalance = this._getMaxAmountForSell();
                this.maxPriceBalance = null;

            }

            /**
             * @return {Money}
             * @private
             */
            _getCurrentPrice() {
                if (this.priceBalance) {
                    return this.priceBalance.cloneWithTokens(String(this.bid && this.bid.price || 0));

                }
            }

            /**
             * @return {Promise<IAssetPair>}
             * @private
             */
            _getBalances() {
                return ds.api.pairs.get(this._assetIdPair.amount, this._assetIdPair.price).then((pair) => {
                    return {
                        amountBalance: entities.Money.fromTokens(10, pair.amountAsset),
                        priceBalance: entities.Money.fromTokens(10, pair.priceAsset)
                    };
                });
            }

            /**
             * @param data
             * @private
             */
            _setBalances(data) {
                // this.amountBalance = this._balance.available.getTokens();
                if (data && this._balance) {
                    this.availableBalance = this._balance.available.getTokens();
                    this.amountBalance = data.amountBalance;
                    this.priceBalance = data.priceBalance;
                    $scope.$digest();
                }
            }

            /**
             * @private
             */
            _currentTotal() {
                if (this.focusedInputName === 'total') {
                    return null;
                }

                if (!this.price || !this.amount) {
                    this.totalPrice = this.priceBalance.cloneWithTokens('0');
                } else if (this.amount._tokens.c['0'] !== 0) {
                    this.price = this._defineMinPrice(this.amount._tokens.c['0']);
                    const sellPrice = this.price.getTokens();
                    const quantity = sellPrice.times(this.amount.getTokens());
                    this.totalPrice = this.priceBalance.cloneWithTokens(
                        quantity
                    );
                } else {
                    this.totalPrice = this.priceBalance.cloneWithTokens(
                        this.price.getTokens().times(this.amount.getTokens())
                    );
                }
            }

            /**
             * @returns {null}
             * @private
             */
            _currentAmount() {
                if (this.focusedInputName !== 'total') {
                    return null;
                }

                if (!this.totalPrice || !this.price || this.price.getTokens().eq('0')) {
                    return null;
                }

                const amount = this.totalPrice.getTokens().div(this.price.getTokens());
                this._setDirtyAmount(this.amountBalance.cloneWithTokens(amount));
            }

            /**
             * @private
             */
            _getData() {
                return waves.matcher.getOrderBook(this._assetIdPair.amount, this._assetIdPair.price)
                    .then(({ bids, asks, spread }) => {
                        const [lastAsk] = asks;
                        const [firstBid] = bids;
                        this.orderBook = bids;
                        return { lastAsk, firstBid, spread };
                    });
            }

            /**
             * @param lastAsk
             * @param firstBid
             * @param spread
             * @private
             */
            _setData({ lastAsk, firstBid }) {
                this.bid = firstBid || { price: 0 };
                this.ask = lastAsk || { price: 0 };

                const sell = Number(this.bid.price);
                const buy = Number(this.ask.price);

                this.spreadPercent = buy ? (((buy - sell) * 100 / buy) || 0).toFixed(2) : '0.00';
                $scope.$digest();
            }

            /**
             * Set only non-zero amount values
             * @param {Money} amount
             * @private
             */
            _setDirtyAmount(amount) {
                this.amount = amount;
                // this.order.$setDirty();
            }

            /**
             * @param {Money} price
             * @private
             */
            _setDirtyPrice(price) {
                this.price = price;
                // this.order.$setDirty();
            }

            _defineMinPrice(sellVolume) {
                let lastAmount = sellVolume;

                const lengthBook = this.orderBook.length;

                for (let i = 0; i < lengthBook; i++) {
                    if (lastAmount > 0) {
                        if ((lastAmount - Number(this.orderBook[i].amount)) >= 0) {
                            lastAmount -= Number(this.orderBook[i].amount);
                            this.price._tokens.c['0'] = Math.round(this.orderBook[i].price * 1e14);
                            this.price._coins.c['0'] = Math.round(this.price._tokens.c['0'] / 1e8);
                        } else {
                            lastAmount = 0;
                            this.price._tokens.c['0'] = Math.round(this.orderBook[i].price * 1e14);
                            this.price._coins.c['0'] = Math.round(this.price._tokens.c['0'] / 1e8);
                        }
                    }
                }
                return this.price;
            }

        }

        return new ExchangerCtrl();
    };

    controller.$inject = [
        'Base',
        'waves',
        'user',
        'utils',
        'createPoll',
        '$scope',
        '$element',
        'notification',
        'dexDataService',
        'ease',
        '$state',
        'modalManager'
    ];

    angular.module('app.exchanger')
        .controller('ExchangerCtrl', controller);
})();

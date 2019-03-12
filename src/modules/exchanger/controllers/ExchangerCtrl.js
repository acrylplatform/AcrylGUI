(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @param {ModalManager} modalManager
     * @param {IPollCreate} createPoll
     * @param {Waves} waves
     * @return {TokensCtrl}
     */
    const controller = function (Base, waves, user, utils, createPoll, $scope,
                                 $element, dexDataService) {

        const entities = require('@waves/data-entities');
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

            /**
             * Link to angular form object
             * @type {form.FormController}
             */
            createForm = null;
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
             * Count of generated tokens
             * @type {BigNumber}
             */
            count = null;
            /**
             * Precision of token
             * @type {BigNumber}
             */

            /**
             * @type {BigNumber}
             */
            maxCoinsCount = null;
            /**
             * Has money for fee
             * @type {boolean}
             */
            invalid = false;

            assetInBtc = 0;

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
                this.precision = null;

                this.priceBalance = null;
                /**
                 * Order type
                 * @type {string}
                 */
                this.type = 'buy';
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
                this.orderBook = null;
                /**
                 * @type {Money}
                 */
                this.price = null;
                /**
                 * @type {boolean}
                 */
                this.idDemo = !user.address;
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
                ds.moneyFromTokens('0.003', WavesApp.defaultAssets.WAVES).then((money) => {
                    this.fee = money;
                    $scope.$digest();
                });
                this.receive(dexDataService.chooseOrderBook, ({ type, price, amount }) => {
                    this.expand(type);
                    switch (type) {
                        case 'buy':
                            this._onClickBuyOrder(price, amount);
                            break;
                        case 'sell':
                            this._onClickSellOrder(price, amount);
                            break;
                        default:
                            throw new Error('Wrong order type!');
                    }
                    $scope.$digest();
                });

                this.syncSettings({
                    _assetIdPair: 'dex.assetIdPair'
                });

                /**
                 * @type {Poll}
                 */
                const balancesPoll = createPoll(this, this._getBalances, this._setBalances, 1000);
                /**
                 * @type {Poll}
                 */
                const spreadPoll = createPoll(this, this._getData, this._setData, 1000);

                /* const lastTradePromise = new Promise((resolve) => {
                    balancesPoll.ready.then(() => {
                        lastTraderPoll = createPoll(this, this._getLastPrice, 'lastTradePrice', 1000);
                        resolve();
                    });
                }); */

                Promise.all([
                    balancesPoll.ready,
                    // lastTradePromise,
                    spreadPoll.ready
                ]).then(() => {
                    this.amount = this.amountBalance.cloneWithTokens('0');
                    this.getAskList();
                    if (this.lastTradePrice && this.lastTradePrice.getTokens().gt(0)) {
                        this.price = this.lastTradePrice;
                    } else {
                        this.price = this._getCurrentPrice();
                    }
                    // console.log('this.orderBook :', this.orderBook);
                });

                this.observe(['amountBalance', 'type', 'fee', 'priceBalance'], this._updateMaxAmountOrPriceBalance);

                const poll = createPoll(this, this._getBalance, '_balance', 5000, { isBalance: true, $scope });

                this.observe('precision', this._onChangePrecision);
                // this.observe('assetInBtc', this._onAssetInBtc);

                Promise.all([waves.node.getFee({ type: WavesApp.TRANSACTION_TYPES.NODE.ISSUE }), poll.ready])
                    .then(([money]) => {
                        this._fee = money;
                        this.observe(['_balance', '_fee'], this._onChangeBalance);

                        this._onChangeBalance();
                        $scope.$digest();
                    });
            }


            setMaxValue() {
                const allTokensAmount = Number(this._balance.available.getTokens().c[0]) - 0.01;
                this.precision = (allTokensAmount >= 0.01) ? allTokensAmount : 0;
                this.invalid = (this.precision !== 0) ? (this.precision !== 0) : false;
                this._onChangePrecision(this.precision);
            }

            /**
             * @return {Promise<Money>}
             * @private
             */
            _getBalance() {
                return waves.node.assets.balance(WavesApp.defaultAssets.WAVES);
            }

            /**
             * @param {BigNumber} value
             * @private
             */
            _onChangePrecision({ value }) {
                // const allTokensAmount = Number(this._balance.available.getTokens().c[0]);
                const amountSubFee = +value - 0.001;
                // console.log('amountSubFee :', amountSubFee, value);
                // if (+value >= allTokensAmount) {

                if (amountSubFee > 0) {
                    this.invalid = true;
                    const avgPrice = this.defineAvgPrice(amountSubFee);
                    const changeVolume = (amountSubFee >= 0.001) ? amountSubFee : 0;
                    this.assetInBtc = (changeVolume * avgPrice).toFixed(8);
                } else {
                    this.assetInBtc = 0;
                    this.invalid = false;
                }

                // }
            }

            getAskList() {
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
                    }
                }
                avgPrice = (totalSum / sellVolume).toFixed(8);
                return avgPrice;
            }

            createSignable() {
                // console.log('this.assetInBtc :this.precision', this.assetInBtc, this.precision);
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

                this.name = '';
                this.description = '';
                this.issue = true;
                this.count = null;
                this.precision = null;
                this.maxCoinsCount = null;

                this.createForm.$setPristine();
                this.createForm.$setUntouched();
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

            setMaxPrice() {
                this._setDirtyAmount(this._getMaxAmountForBuy());
            }

            setBidPrice() {
                this._setDirtyPrice(this.priceBalance.cloneWithTokens(String(this.bid.price)));
            }

            setAskPrice(amount) {
                const { _coins } = this.priceBalance.cloneWithTokens(String(this.ask.price));
                const lastAskPrice = (Number(_coins.c[0]) / 10e8);
                // console.log('this.precision :', this.precision, lastAskPrice, amount);
                this.assetInBtc = (+amount - 0.01) * lastAskPrice;
                // console.log('this.assetInBtc :', this.assetInBtc);
                // this._setDirtyPrice(this.priceBalance.cloneWithTokens(String(this.ask.price)));
            }

            setLastPrice() {
                this._setDirtyPrice(this.lastTradePrice);
            }

            /**
            * @param {string} price
            * @param {string} amount
            * @private
            */
            _onClickBuyOrder(price, amount) {
                const minAmount = this.amountBalance.cloneWithTokens(this.priceBalance.getTokens().div(price));
                this._setDirtyAmount(entities.Money.min(this.amountBalance.cloneWithTokens(amount), minAmount));
                this._setDirtyPrice(this.priceBalance.cloneWithTokens(price));
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
                const fee = this.fee;
                const balance = this.amountBalance;
                return balance.safeSub(fee).toNonNegative();
            }

            /**
             * @return {Money}
             * @private
             */
            _getMaxAmountForBuy() {
                if (!this.price || this.price.getTokens().eq(0)) {
                    return this.amountBalance.cloneWithTokens('0');
                }

                const fee = this.fee;

                return this.amountBalance.cloneWithTokens(
                    this.priceBalance.safeSub(fee)
                        .toNonNegative()
                        .getTokens()
                        .div(this.price.getTokens())
                        .dp(this.amountBalance.asset.precision)
                );
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
                if (!this.amountBalance || !this.fee || !this.priceBalance) {
                    return null;
                }

                if (this.type === 'sell') {
                    this.maxAmountBalance = this._getMaxAmountForSell();
                    this.maxPriceBalance = null;
                } else {
                    this.maxAmountBalance = null;
                    this.maxPriceBalance = this.priceBalance.safeSub(this.fee).toNonNegative();
                }
            }

            /**
             * @return {Money}
             * @private
             */
            _getCurrentPrice() {
                switch (this.type) {
                    case 'sell':
                        return this.priceBalance.cloneWithTokens(String(this.bid && this.bid.price || 0));
                    case 'buy':
                        return this.priceBalance.cloneWithTokens(String(this.ask && this.ask.price || 0));
                    default:
                        throw new Error('Wrong type');
                }
            }

            /**
             * @return {Promise<IAssetPair>}
             * @private
             */
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

            /**
             * @param data
             * @private
             */
            _setBalances(data) {
                if (data) {
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
                } else {
                    this.totalPrice = this.priceBalance.cloneWithTokens(
                        this.price.getTokens().times(this.amount.getTokens())
                    );
                }
                this._setIfCanBuyOrder();
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

                this._setIfCanBuyOrder();
            }

            /**
             * @private
             */
            _setIfCanBuyOrder() {
                if (this.type === 'buy' &&
                    this.totalPrice &&
                    this.priceBalance &&
                    this.totalPrice.asset.id === this.priceBalance.asset.id) {

                    this.canBuyOrder = (
                        this.totalPrice.lte(this.maxPriceBalance) && this.maxPriceBalance.getTokens().gt(0)
                    );
                } else {
                    this.canBuyOrder = true;
                }
            }

            /**
             * @private
             */
            _getData() {
                return waves.matcher.getOrderBook(this._assetIdPair.amount, this._assetIdPair.price)
                    .then(({ bids, asks, spread }) => {
                        const [lastAsk] = asks;
                        const [firstBid] = bids;

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
                this.order.$setDirty();
            }

            /**
             * @param {Money} price
             * @private
             */
            _setDirtyPrice(price) {
                this.price = price;
                this.order.$setDirty();
                // console.log('this.price : this.order.$setDirty()', this.price, this.order.$setDirty());
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
        'dexDataService'];

    angular.module('app.exchanger')
        .controller('ExchangerCtrl', controller);
})();


(function () {
    'use strict';

    const searchByNameAndId = ($scope, key, list) => {
        const query = $scope[key];
        if (!query) {
            return list;
        }

        return list.filter((item) => {
            const name = tsUtils.get({ item }, 'item.asset.name');
            const id = tsUtils.get({ item }, 'item.asset.id');
            return String(name).toLowerCase().indexOf(query.toLowerCase()) !== -1 || String(id) === query;
        });
    };

    /**
     * @param {Base} Base
     * @param {$rootScope.Scope} $scope
     * @param {Waves} waves
     * @param {app.utils} utils
     * @param {ModalManager} modalManager
     * @param {User} user
     * @param {EventManager} eventManager
     * @param {IPollCreate} createPoll
     * @param {GatewayService} gatewayService
     * @param {$state} $state
     * @param {STService} stService
     * @param {VisibleService} visibleService
     * @return {PortfolioCtrl}
     */
    const controller = function (Base, $scope, waves, utils, modalManager, user,
                                 eventManager, createPoll, gatewayService, $state, stService, visibleService) {

        class PortfolioCtrl extends Base {

            constructor() {
                super($scope);
                /**
                 * @type {string}
                 */
                this.mirrorId = user.getSetting('baseAssetId');
                /**
                 * @type {Asset}
                 */
                this.mirror = null;
                /**
                 * @type {string[]}
                 */
                this.pinned = [];
                /**
                 * @type {string}
                 */
                this.address = user.address;
                /**
                 * @type {Array<string>}
                 */
                this.spam = [];
                /**
                 * @type {PortfolioCtrl.IBalances}
                 */
                this.details = null;
                /**
                 * @type {Array<PortfolioCtrl.IPortfolioBalanceDetails>}
                 */
                this.balanceList = [];
                /**
                 * @type {string}
                 */
                this.filter = null;
                /**
                 * @type {Moment}
                 */
                this.chartStartDate = utils.moment().add().day(-7);
                /**
                 * @type {boolean}
                 */
                this.pending = true;

                waves.node.assets.getAsset(this.mirrorId)
                    .then((mirror) => {
                        this.mirror = mirror;
                        /**
                         * @type {Array<SmartTable.IHeaderInfo>}
                         */
                        this.tableHeaders = [
                            {
                                id: 'name',
                                title: { literal: 'list.name' },
                                valuePath: 'item.asset.name',
                                sort: true,
                                search: searchByNameAndId,
                                placeholder: 'portfolio.filter'
                            },
                            {
                                id: 'balance',
                                title: { literal: 'list.balance' },
                                valuePath: 'item.available',
                                sort: true
                            },
                            {
                                id: 'inOrders',
                                title: { literal: 'list.inOrders' },
                                valuePath: 'item.inOrders',
                                sort: true
                            },
                            {
                                id: 'mirror',
                                title: { literal: 'list.mirror', params: { currency: mirror.displayName } }
                            },
                            {
                                id: 'rate',
                                title: { literal: 'list.rate', params: { currency: mirror.displayName } }
                            },
                            {
                                id: 'change24',
                                title: { literal: 'list.change' }
                            },
                            {
                                id: 'controls'
                            }
                        ];

                        $scope.$digest();
                    });

                this.syncSettings({
                    pinned: 'pinnedAssetIdList',
                    spam: 'wallet.portfolio.spam',
                    filter: 'wallet.portfolio.filter'
                });

                /**
                 * @type {Poll}
                 */
                this.poll = createPoll(this, this._getPortfolio, 'details', 1000, { isBalance: true, $scope });

                this.poll.ready.then(() => {
                    this.pending = false;
                    this.observe('details', this._onChangeDetails);
                    this.observe('filter', this._onChangeDetails);

                    this._onChangeDetails();
                });

                this.receive(stService.sort, () => {
                    visibleService.updateSort();
                });
            }

            /**
             * @param {Asset} asset
             */
            showAsset(asset) {
                modalManager.showAssetInfo(asset);
            }

            /**
             * @param {Asset} asset
             */
            showSend(asset) {
                return modalManager.showSendAsset({ assetId: asset && asset.id });
            }

            /**
             * @param {Asset} asset
             */
            showReceivePopup(asset) {
                return modalManager.showReceiveModal(user, asset);
            }

            /**
             * @param {Asset} asset
             */
            showDeposit(asset) {
                return modalManager.showDepositAsset(user, asset);
            }

            /**
             * @param {Asset} asset
             */
            showSepa(asset) {
                return modalManager.showSepaAsset(user, asset);
            }

            showQR() {
                return modalManager.showAddressQrCode(user);
            }

            showBurn(assetId) {
                return modalManager.showBurnModal(assetId);
            }

            showReissue(assetId) {
                return modalManager.showReissueModal(assetId);
            }

            canShowDex(balance) {
                return balance.isPinned ||
                    balance.asset.isMyAsset ||
                    balance.asset.id === WavesApp.defaultAssets.WAVES ||
                    gatewayService.getPurchasableWithCards()[balance.asset.id] ||
                    gatewayService.getCryptocurrencies()[balance.asset.id] ||
                    gatewayService.getFiats()[balance.asset.id];
            }

            /**
             * @param {Asset} asset
             */
            openDex(asset) {
                $state.go('main.dex', this.getSrefParams(asset));
            }

            /**
             * @param {Asset} asset
             */
            getSrefParams(asset) {
                utils.openDex(asset.id);
            }

            /**
             * @param {Asset} asset
             * @param {boolean} [state]
             */
            togglePin(asset, state) {
                user.togglePinAsset(asset.id, state);
                this.poll.restart();
            }

            /**
             * @param {Asset} asset
             * @param {boolean} [state]
             */
            toggleSpam(asset, state) {
                user.toggleSpamAsset(asset.id, state);
                this.poll.restart();
            }

            isDepositSupported(asset) {
                const isWaves = asset.id === WavesApp.defaultAssets.WAVES;

                return gatewayService.hasSupportOf(asset, 'deposit') || isWaves;
            }

            isSepaSupported(asset) {
                return gatewayService.hasSupportOf(asset, 'sepa');
            }

            /**
             * @private
             */
            _onChangeDetails() {
                const details = this.details;
                let balanceList;

                switch (this.filter) {
                    case 'active':
                        balanceList = details.active.slice();
                        break;
                    case 'pinned':
                        balanceList = details.pinned.slice();
                        break;
                    case 'spam':
                        balanceList = details.spam.slice();
                        break;
                    case 'my':
                        balanceList = details.my.slice();
                        break;
                    case 'notLiquid':
                        balanceList = details.notLiquid.slice();
                        break;
                    default:
                        throw new Error('Wrong filter name!');
                }

                this.balanceList = balanceList;
            }

            /**
             * @return {Promise<Money[]>}
             * @private
             */
            _getPortfolio() {
                /**
                 * @param {IBalanceDetails} item
                 * @return {PortfolioCtrl.IPortfolioBalanceDetails}
                 */
                const remapBalances = (item) => {
                    const isPinned = this._isPinned(item.asset.id);
                    const isSpam = this._isSpam(item.asset.id);
                    const isOnScamList = WavesApp.scam[item.asset.id];

                    return Promise.resolve({
                        available: item.available,
                        asset: item.asset,
                        inOrders: item.inOrders,
                        isPinned,
                        isSpam,
                        isOnScamList,
                        minSponsoredAssetFee: item.minSponsoredAssetFee,
                        sponsorBalance: item.sponsorBalance
                    });
                };

                return Promise.all([
                    waves.node.assets.userBalances().then((list) => Promise.all(list.map(remapBalances)))
                ]).then(([activeList]) => {

                    const spam = [];
                    const my = [];
                    const active = [];

                    activeList.forEach(item => {
                        if (item.asset.sender === user.address) {
                            my.push(item);
                        }
                        if (item.isOnScamList || item.isSpam) {
                            spam.push(item);
                        } else {
                            active.push(item);
                        }
                    });

                    return { active, spam, my };
                });
            }

            /**
             * @param assetId
             * @return {boolean}
             * @private
             */
            _isPinned(assetId) {
                return this.pinned.includes(assetId);
            }

            /**
             * @param assetId
             * @return {boolean}
             * @private
             */
            _isSpam(assetId) {
                return this.spam.includes(assetId);
            }

        }

        return new PortfolioCtrl();
    };

    controller.$inject = [
        'Base',
        '$scope',
        'waves',
        'utils',
        'modalManager',
        'user',
        'eventManager',
        'createPoll',
        'gatewayService',
        '$state',
        'stService',
        'visibleService'
    ];

    angular.module('app.wallet.portfolio')
        .controller('PortfolioCtrl', controller);
})();

/**
 * @name PortfolioCtrl
 */

/**
 * @typedef {object} PortfolioCtrl#IPortfolioBalanceDetails
 * @property {boolean} isPinned
 * @property {boolean} isSpam
 * @property {boolean} isOnScamList
 * @property {Asset} asset
 * @property {Money} available
 * @property {Money} inOrders
 * @property {Money|void} minSponsoredAssetFee
 * @property {Money|void} sponsorBalance
 */

/**
 * @typedef {object} PortfolioCtrl#IBalances
 * @property {Array<PortfolioCtrl.IPortfolioBalanceDetails>} active
 * @property {Array<PortfolioCtrl.IPortfolioBalanceDetails>} pinned // TODO when available assets store
 * @property {Array<PortfolioCtrl.IPortfolioBalanceDetails>} spam
 * @property {Array<PortfolioCtrl.IPortfolioBalanceDetails>} my
 */

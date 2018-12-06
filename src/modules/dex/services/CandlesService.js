/* eslint-disable no-console */
(function () {
    'use strict';

    const POLL_DELAY = 3000;

    /**
     * @param {app.utils} utils
     * @param {TimeLine} timeLine
     * @param {SymbolInfoService} symbolInfoService
     * @return {CandlesService}
     */
    const factory = function (utils, timeLine, symbolInfoService) {

        class CandlesService {

            constructor() {
                this._lastTime = 0;
                this._subscriber = null;
            }

            onReady(callback) {
                setTimeout(() => callback({
                    supported_resolutions: WavesApp.dex.resolutions,
                    supports_time: true,
                    supports_marks: false,
                    supports_timescale_marks: false
                }), 0);
            }

            resolveSymbol(symbolName, resolve, reject) {
                if (symbolName.match(/^DEX:/)) {
                    return;
                }

                symbolInfoService.get(symbolName)
                    .then(resolve)
                    .catch(reject); // TODO
            }

            getBars(symbolInfo, resolution, from, to = (Date.now() / 1000), onHistoryCallback, onErrorCallback) {
                from = CandlesService.convertToMilliseconds(from);
                to = CandlesService.convertToMilliseconds(to);
                const handleCandles = (candles) => {
                    candles = CandlesService.filterCandlesByTime(
                        candles,
                        from,
                        to
                    );

                    if (candles.length) {
                        this._updateLastTime(candles);
                        onHistoryCallback(candles);
                    } else {
                        onHistoryCallback([], {
                            noData: true
                        });
                    }
                };

                CandlesService._getAndHandleCandles(
                    symbolInfo,
                    from,
                    to,
                    resolution,
                    handleCandles,
                    onErrorCallback
                );
            }

            subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
                this._subscriber = subscriberUID;

                const from = this._lastTime;
                const to = Date.now();

                const handleCandles = (candles) => {
                    if (this._subscriber !== subscriberUID) {
                        return;
                    }

                    this.subscribeBars(
                        symbolInfo,
                        resolution,
                        onRealtimeCallback,
                        subscriberUID,
                        onResetCacheNeededCallback
                    );

                    if (candles.length) {
                        this._updateLastTime(candles);
                        CandlesService
                            .filterCandlesByTime(candles, from, to)
                            .forEach(onRealtimeCallback);
                    }
                };

                timeLine.timeout(() => {
                    CandlesService._getAndHandleCandles(
                        symbolInfo,
                        from,
                        to,
                        resolution,
                        handleCandles
                    );
                }, POLL_DELAY);
            }

            unsubscribeBars(subscriberUID) {
                if (this._subscriber === subscriberUID) {
                    this._subscriber = null;
                }
            }

            _updateLastTime(candles) {
                const lastTime = candles[candles.length - 1].time;
                if (this._lastTime >= lastTime) {
                    return false;
                }
                this._lastTime = lastTime;
            }

            static filterCandlesByTime(candles = [], from, to) {
                return candles.filter(({ time }) => time <= to && time >= from);
            }

            static _getAndHandleCandles(symbolInfo, from, to, resolution, handleCandles, handleError = angular.noop) {
                CandlesService
                    ._getCandles(
                        symbolInfo,
                        from,
                        to,
                        resolution
                    )
                    .then(handleCandles)
                    .catch(handleError);
            }

            static _getCandles(symbolInfo, from, to, resolution) {
                const amountId = symbolInfo._wavesData.amountAsset.id;
                const priceId = symbolInfo._wavesData.priceAsset.id;
                const interval = CandlesService._normalizeInterval(resolution);

                const path = `${WavesApp.network.api}/candles/${amountId}/${priceId}`;
                return ds.fetch(`${path}?timeStart=${from}&timeEnd=${to}&interval=${interval}`)
                    .then((res) => res.candles);
            }

            static _normalizeInterval(interval) {
                const char = interval.charAt(interval.length - 1);
                return interval + (isNaN(+char) ? '' : 'm');
            }

            static convertToMilliseconds(seconds) {
                return seconds * 1000;
            }

        }

        return new CandlesService();
    };

    factory.$inject = ['utils', 'timeLine', 'symbolInfoService'];

    angular.module('app.dex').factory('candlesService', factory);
})();

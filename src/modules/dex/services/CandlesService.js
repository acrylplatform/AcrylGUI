/* eslint-disable no-console */
(function () {
    'use strict';

    // ToDo SOME interesting about candles you can find here
    const POLL_DELAY = 400;

    /**
     * @param {app.utils} utils
     * @param {TimeLine} timeLine
     * @param {SymbolInfoService} symbolInfoService
     * @param {Waves} waves
     * @return {CandlesService}
     */
    const factory = function (utils, timeLine, symbolInfoService, waves) {

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
                console.log('symbolInfo :', symbolInfo);

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
                // from = (from === 0) ? 1543656307000 : from;
                from = (from <= 1543656307000) ? 1543656307000 : from;
                const amountId = symbolInfo._wavesData.amountAsset.id;
                const priceId = symbolInfo._wavesData.priceAsset.id;
                const priceIdAcryl = priceId.includes('DxTmLjoVh5Eos7VrX8JxzAFhDXLzo8pp7ugSxbWJATfy') ?
                    priceId.replace('DxTmLjoVh5Eos7VrX8JxzAFhDXLzo8pp7ugSxbWJATfy',
                        '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS') :
                    priceId;
                let interval = '1d';
                if (resolution === 15) {
                    interval = '15m';
                } else if (resolution === 30) {
                    interval = '30m';
                } else if (resolution === 60) {
                    interval = '1h';
                } else if (resolution === 180) {
                    interval = '3h';
                }  else if (resolution === 1440) {
                    interval = '1d';
                }

                // if (resolution) { // linter write 'resolution' is defined but never used  no-unused-vars
                //     resolution = 0;
                // }

                // ToDo Edit interval here
                // const interval = CandlesService._normalizeInterval(resolution);

                const path = `${WavesApp.network.api}/${WavesApp.network.apiVersion}/candles/${amountId}/${priceIdAcryl}`;

                const reqParams = `${path}?timeStart=${from}&timeEnd=${to}&interval=${interval}&oldVersion=true`;
                return Promise.all([
                    ds.fetch(reqParams),
                    ds.api.pairs.get(amountId, priceId)
                        .then(pair => waves.matcher.getLastPrice(pair))
                ])
                    .then(([res, { price }]) => {
                        const candles = res.candles;
                        if (candles.length) {
                            candles[candles.length - 1].close = Number(price.toTokens());
                        }

                        return candles;
                    });
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

    factory.$inject = ['utils', 'timeLine', 'symbolInfoService', 'waves'];

    angular.module('app.dex').factory('candlesService', factory);
})();

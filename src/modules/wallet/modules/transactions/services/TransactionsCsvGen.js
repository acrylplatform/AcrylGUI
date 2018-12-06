(function () {
    'use strict';

    /**
     * @param {app.i18n} i18n
     * @param {app.utils} utils
     * @returns {TransactionsCsvGen}
     */
    const factory = function (i18n, utils) {

        const Papa = require('papaparse');

        const HEADERS = [
            { name: 'csv.date', id: 'timestamp' },
            { name: 'csv.id', id: 'id' },
            { name: 'csv.type', id: 'typeName' },
            { name: 'csv.transactionType', id: 'type' },
            { name: 'csv.price.ticker', id: 'priceTicker' },
            { name: 'csv.price.name', id: 'priceName' },
            { name: 'csv.price.value', id: 'priceValue' },
            { name: 'csv.price.id', id: 'priceId' },
            { name: 'csv.amount.ticker', id: 'amountTicker' },
            { name: 'csv.amount.name', id: 'amountName' },
            { name: 'csv.amount.value', id: 'amountValue' },
            { name: 'csv.amount.id', id: 'amountId' },
            { name: 'csv.fee.ticker', id: 'feeTicker' },
            { name: 'csv.fee.name', id: 'feeName' },
            { name: 'csv.fee.value', id: 'feeValue' },
            { name: 'csv.fee.id', id: 'feeId' },
            { name: 'csv.sender', id: 'sender' },
            { name: 'csv.recipient', id: 'recipient' },
            { name: 'csv.attachment', id: 'attachment' },
            { name: 'csv.height', id: 'height' },
            { name: 'csv.alias', id: 'alias' },
            { name: 'csv.description', id: 'description' },
            { name: 'csv.name', id: 'name' },
            { name: 'csv.reissuable.name', id: 'reissuable' },
            { name: 'csv.precision', id: 'precision' }
        ];

        const NS = 'app.wallet.transactions';

        class TransactionsCsvGen {

            generate(transactionList) {
                const fileName = 'transactions.csv';

                const fields = HEADERS.map((item) => i18n.translate(item.name, NS));
                /* eslint complexity: ["off"] */
                const data = transactionList.map((tx) => HEADERS.map((header) => {
                    const id = header.id;
                    const value = tx[id];

                    try {
                        switch (id) {
                            case 'timestamp':
                                return value && utils.moment(value).format('DD.MM.YYYY hh:mm:ss') || value;
                            case 'reissuable':
                                return value != null && i18n.translate(`csv.reissuable.${value}`, NS) || value;
                            case 'priceTicker':
                                return tx.price && tx.price.asset.ticker || '';
                            case 'priceName':
                                return tx.price && tx.price.asset.name || '';
                            case 'priceValue':
                                return tx.price && tx.price.toFormat() || '';
                            case 'priceId':
                                return tx.price && tx.price.asset.id || '';
                            case 'amountTicker':
                                return tx.amount && tx.amount.asset.ticker || '';
                            case 'amountName':
                                return tx.amount && tx.amount.asset.name || '';
                            case 'amountValue':
                                return tx.amount && tx.amount.toFormat() || '';
                            case 'amountId':
                                return tx.amount && tx.amount.asset.id || '';
                            case 'feeTicker':
                                return tx.fee && tx.fee.asset.ticker || '';
                            case 'feeName':
                                return tx.fee && tx.fee.asset.name || '';
                            case 'feeValue':
                                return tx.fee && tx.fee.toFormat() || '';
                            case 'feeId':
                                return tx.fee && tx.fee.asset.id || '';
                            default:
                                return value == null ? '' : String(value);
                        }
                    } catch (e) {
                        return '';
                    }
                }));

                const csv = Papa.unparse({
                    fields,
                    data
                });

                if (WavesApp.isDesktop()) {
                    transfer('download', {
                        fileContent: csv,
                        fileName: fileName
                    });
                } else {
                    TransactionsCsvGen._download(csv, fileName);
                }
            }

            /**
             * @param {string} csv
             * @param {string} name
             * @private
             */
            static _download(csv, name) {
                if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function') {
                    this._downloadInMsEdge(csv, name);
                } else {
                    const content = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
                    const link = document.createElement('a');
                    link.setAttribute('href', content);
                    link.setAttribute('download', name);
                    link.setAttribute('target', '_blank');
                    link.style.position = 'absolute';
                    link.style.opacity = '0';
                    document.body.appendChild(link);
                    link.click();
                    requestAnimationFrame(() => {
                        document.body.removeChild(link);
                    });
                }
            }

            /**
             * @param {string} csv
             * @param {string} name
             * @private
             */
            static _downloadInMsEdge(csv, name) {
                const blob = new Blob([csv], { type: 'text/csv' });
                window.navigator.msSaveOrOpenBlob(blob, name);
            }

        }

        return new TransactionsCsvGen();
    };

    factory.$inject = ['i18n', 'utils'];

    angular.module('app.wallet.transactions').factory('transactionsCsvGen', factory);
})();

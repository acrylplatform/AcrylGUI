/* eslint-disable no-console */
(function () {
    'use strict';

    /**
     * @param {typeof ConfirmTxService} ConfirmTxService
     * @param {$rootScope.Scope} $scope
     * @param {validateService} validateService
     * @param {app.utils} utils
     * @param {Waves} waves
     * @returns {ConfirmTransaction}
     */
    const controller = function (ConfirmTxService, $scope, validateService, utils, waves, $attrs) {

        const { TRANSACTION_TYPE_NUMBER, SIGN_TYPE } = require('@waves/signature-adapter');


        class ConfirmShopTransaction extends ConfirmTxService {

            locale = $attrs.ns || 'app.ui';
            step = 0;
            isSetScript = false;

            constructor() {
                super($scope);
                this.observe(['showValidationErrors', 'signable', 'userOrder'], this._showErrors);
            }

            $postLink() {
                const tx = this.signable.getTxData();
                const type = tx.type;
                this.isSetScript = type === SIGN_TYPE.SET_SCRIPT && tx.script;
                this.isTockenIssue = type === SIGN_TYPE.ISSUE;
                this.signable.hasMySignature().then(state => {
                    this.step = state ? 1 : 0;
                    $scope.$apply();
                });
            }

            onChangeSignable() {
                super.onChangeSignable();
                if (this.tx) {
                    this.permissionName = ConfirmShopTransaction._getPermissionNameByTx(this.tx);
                }
            }

            nextStep() {
                return Promise.resolve(this.confirmModal());
            }

            /**
             * @private
             */
            _showErrors() {
                if (!this.signable) {
                    return null;
                }

                let promise;

                const { type, amount, fee } = this.signable.getTxData();

                switch (true) {
                    case (type === TRANSACTION_TYPE_NUMBER.SPONSORSHIP):
                        promise = this._validateAmount(fee);
                        break;
                    case (type === TRANSACTION_TYPE_NUMBER.TRANSFER && this.showValidationErrors):
                        promise = Promise.all([
                            this._validateAmount(amount),
                            this._validateAddress()
                        ]).then(([errors1, errors2]) => [...errors1, ...errors2]);
                        break;
                    default:
                        promise = Promise.resolve([]);
                }

                return promise.then((errors) => {
                    this.errors = errors;
                    $scope.$apply();
                });
            }

            /**
             * @return {Promise<Array | never>}
             * @private
             */
            _validateAddress() {
                const { recipient } = this.signable.getTxData();
                const errors = [];
                return utils.resolve(utils.when(validateService.wavesAddress(recipient)))
                    .then(({ state }) => {
                        if (!state) {
                            errors.push({
                                literal: 'confirmTransaction.send.errors.recipient.invalid'
                            });
                        }
                        return errors;
                    });
            }

            static _getPermissionNameByTx(tx) {
                switch (tx.type) {
                    case SIGN_TYPE.ISSUE:
                        return 'CAN_ISSUE_TRANSACTION';
                    case SIGN_TYPE.TRANSFER:
                        return 'CAN_TRANSFER_TRANSACTION';
                    case SIGN_TYPE.REISSUE:
                        return 'CAN_REISSUE_TRANSACTION';
                    case SIGN_TYPE.BURN:
                        return 'CAN_BURN_TRANSACTION';
                    case 7:
                        throw new Error('Can\' confirm exchange transaction!');
                    case SIGN_TYPE.LEASE:
                        return 'CAN_LEASE_TRANSACTION';
                    case SIGN_TYPE.CANCEL_LEASING:
                        return 'CAN_CANCEL_LEASE_TRANSACTION';
                    case SIGN_TYPE.CREATE_ALIAS:
                        return 'CAN_CREATE_ALIAS_TRANSACTION';
                    case SIGN_TYPE.MASS_TRANSFER:
                        return 'CAN_MASS_TRANSFER_TRANSACTION';
                    case SIGN_TYPE.DATA:
                        return 'CAN_DATA_TRANSACTION';
                    case SIGN_TYPE.SET_SCRIPT:
                        return 'CAN_SET_SCRIPT_TRANSACTION';
                    case SIGN_TYPE.SPONSORSHIP:
                        return 'CAN_SPONSORSHIP_TRANSACTION';
                    default:
                        return '';
                }
            }

        }

        return new ConfirmShopTransaction();
    };

    controller.$inject = [
        'ConfirmTxService',
        '$scope',
        'validateService',
        'utils',
        'waves',
        '$attrs'
    ];

    angular.module('app.ui').component('wConfirmShopTransaction', {
        bindings: {
            signable: '<',
            userOrder: '<',
            onClickBack: '&',
            onTxSent: '&',
            noBackButton: '<',
            warning: '<',
            showValidationErrors: '<',
            referrer: '<'
        },
        templateUrl: 'modules/ui/directives/confirmShopTransaction/confirmShopTransaction.html',
        transclude: false,
        controller
    });
})();

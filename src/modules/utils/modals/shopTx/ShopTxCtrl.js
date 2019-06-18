(function () {
    'use strict';

    /**
     * @param Base
     * @param $scope
     * @param {$mdDialog} $mdDialog
     * @returns {ShopTxCtrl}
     */
    const controller = function (Base, $scope, $mdDialog) {

        class ShopTxCtrl extends Base {

            constructor({ signable, showValidationErrors }) {
                super($scope);
                this.signable = signable;
                this.showValidationErrors = showValidationErrors;
            }

            back() {
                $mdDialog.cancel();
            }

        }

        return new ShopTxCtrl(this.locals);
    };

    controller.$inject = ['Base', '$scope', '$mdDialog'];

    angular.module('app.utils').controller('ShopTxCtrl', controller);
})();

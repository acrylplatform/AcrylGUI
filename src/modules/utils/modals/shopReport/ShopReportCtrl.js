(function () {
    'use strict';

    /**
     * @param Base
     * @param $scope
     * @param {$mdDialog} $mdDialog
     * @returns {ShopReportCtrl}
     */
    const controller = function (Base, $scope, $mdDialog) {

        class ShopReportCtrl extends Base {

            constructor() {
                super($scope);
            }

            success() {
                $mdDialog.hide();
            }

        }

        return new ShopReportCtrl(this.locals);
    };

    controller.$inject = ['Base', '$scope', '$mdDialog'];

    angular.module('app.utils').controller('ShopReportCtrl', controller);
})();

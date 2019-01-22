(function () {
    'use strict';

    /**
     * @param Base
     * @param $scope
     * @param {$mdDialog} $mdDialog
     * @return {ConfirmOrderCtrl}
     */
    const controller = function (Base, $scope, $mdDialog) {

        class ConfirmOrderCtrl extends Base {

            constructor({ locals }) {
                super($scope);
                this.type = locals.orderType;
                this.orderLimit = locals.orderLimit;
                this.isSell = this.type === 'sell';
            }

            agree() {
                $mdDialog.hide();
            }

            close() {
                $mdDialog.cancel();
            }

        }

        return new ConfirmOrderCtrl(this);
    };

    controller.$inject = ['Base', '$scope', '$mdDialog'];

    angular.module('app.ui')
        .controller('ConfirmOrderCtrl', controller);
})();

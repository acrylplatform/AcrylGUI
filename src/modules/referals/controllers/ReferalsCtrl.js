(function () {
    'use strict';

    /**
     * @param Base
     * @param {$rootScope.Scope} $scope
     * @return {ReferalsCtrl}
     */
    const controller = function (Base, $scope, user) {

        class ReferalsCtrl extends Base {

            constructor() {
                super($scope);

                this.address = user.address;
                this.referalLink = `https://acrylminer.com/?utm_source=${this.address}
                &utm_medium=client&utm_campaign=wallet`;
            }

        }
        return new ReferalsCtrl();
    };

    controller.$inject = ['Base', '$scope', 'user'];

    angular.module('app.referals')
        .controller('ReferalsCtrl', controller);
})();

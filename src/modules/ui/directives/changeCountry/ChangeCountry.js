(function () {
    'use strict';

    /**
     * @param Base
     * @returns {ChangeCountry}
     */
    const controller = function (Base) {

        class ChangeCountry extends Base {

            constructor() {
                super();
                /**
                 * @type {function}
                 */
                this.onChange = null;
                /**
                 * @type {string[]}
                 */
                this.list = [
                    { code: 'ru', name: 'Россия' },
                    { code: 'tr', name: 'Turkey' },
                    { code: 'ch', name: 'China' },
                    { code: 'pl', name: 'Poland' }
                ];

                this.countryForDelivery = '';
                this.observe('active', this._onChangeCountry);

            }

            /**
             * @private
             */
            _onChangeCountry() {
                const active = this.active;
                this.countryForDelivery = this._getNameCountry(this.active);
                if (active) {
                    this.onChange = this.countryForDelivery;
                }
            }

            _getNameCountry(codeCountry) {
                return this.list.find(item => item.code === codeCountry).name;
            }

        }

        return new ChangeCountry();
    };

    controller.$inject = ['Base'];

    angular.module('app.ui').component('wChangeCountry', {
        bindings: {
            onChange: '='
        },
        templateUrl: 'modules/ui/directives/changeCountry/changeCountry.html',
        transclude: false,
        controller
    });
})();

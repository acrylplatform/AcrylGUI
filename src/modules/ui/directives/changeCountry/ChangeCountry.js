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
                    /*  { code: 'ru', name: 'Россия' },
                    { code: 'tr', name: 'Turkey' },
                    { code: 'ch', name: 'China' },
                    { code: 'pl', name: 'Poland' } */
                    { code: 'Australia', name: 'Австралия' },
                    { code: 'Austria', name: 'Австрия' },
                    { code: 'Azerbaijan', name: 'Азербайджан' },
                    { code: 'Albania', name: 'Албания' },
                    { code: 'Algeria', name: 'Алжир' },
                    { code: 'Angola', name: 'Ангола' },
                    { code: 'Andorra', name: 'Андорра' },
                    { code: 'Antigua-and-Barbuda', name: 'Антигуа и Барбуда' },
                    { code: 'Argentina', name: 'Аргентина' },
                    { code: 'Armenia', name: 'Армения' },
                    { code: 'Afghanistan', name: 'Афганистан' },
                    { code: 'Bahamas', name: 'Багамские Острова' },
                    { code: 'Bangladesh', name: 'Бангладеш' },
                    { code: 'Barbados', name: 'Барбадос' },
                    { code: 'Bahrain', name: 'Бахрейн' },
                    { code: 'Belarus', name: 'Белоруссия' },
                    { code: 'Belize', name: 'Белиз' },
                    { code: 'Belgium', name: 'Бельгия' },
                    { code: 'Benin', name: 'Бенин' },
                    { code: 'Bulgaria', name: 'Болгария' },
                    { code: 'Bolivia', name: 'Боливия' },
                    { code: 'Bosnia-and-Herzegovina', name: 'Босния и Герцеговина' },
                    { code: 'Botswana', name: 'Ботсвана' },
                    { code: 'Brazil', name: 'Бразилия' },
                    { code: 'Brunei', name: 'Бруней' },
                    { code: 'Burkina', name: 'Буркина' },
                    { code: 'Burundi', name: 'Бурунди' },
                    { code: 'Butane', name: 'Бутан' },
                    { code: 'Vanuatu', name: 'Вануату' },
                    { code: 'Great-Britain', name: 'Великобритания' },
                    { code: 'Hungary', name: 'Венгрия' },
                    { code: 'Venezuela', name: 'Венесуэла' },
                    { code: 'East-Timor', name: 'Восточный Тимор' },
                    { code: 'Vietnam', name: 'Вьетнам' },
                    { code: 'Gabon', name: 'Габон' },
                    { code: 'Haiti', name: 'Гаити' },
                    { code: 'Guyana', name: 'Гайана' },
                    { code: 'Gambia', name: 'Гамбия' },
                    { code: 'Ghana', name: 'Гана' },
                    { code: 'Guatemala', name: 'Гватемала' },
                    { code: 'Guinea', name: 'Гвинея' },
                    { code: 'Guinea', name: 'Гвинея' },
                    { code: 'Germany', name: 'Германия' },
                    { code: 'Honduras', name: 'Гондурас' },
                    { code: 'Grenada', name: 'Гренада' },
                    { code: 'Greece', name: 'Греция' },
                    { code: 'Georgia', name: 'Грузия' },
                    { code: 'Denmark', name: 'Дания' },
                    { code: 'Djibouti', name: 'Джибути' },
                    { code: 'Dominica', name: 'Доминика' },
                    { code: 'Dominican-Republic', name: 'Доминиканская Республика' },
                    { code: 'Egypt', name: 'Египет' },
                    { code: 'Zambia', name: 'Замбия' },
                    { code: 'Zimbabwe', name: 'Зимбабве' },
                    { code: 'Israel', name: 'Израиль' },
                    { code: 'India', name: 'Индия' },
                    { code: 'Indonesia', name: 'Индонезия' },
                    { code: 'Jordan', name: 'Иордания' },
                    { code: 'Iraq', name: 'Ирак' },
                    { code: 'Iran', name: 'Иран' },
                    { code: 'Ireland', name: 'Ирландия' },
                    { code: 'Iceland', name: 'Исландия' },
                    { code: 'Spain', name: 'Испания' },
                    { code: 'Italy', name: 'Италия' },
                    { code: 'Yemen', name: 'Йемен' },
                    { code: 'Cape', name: 'Кабо' },
                    { code: 'Kazakhstan', name: 'Казахстан' },
                    { code: 'Cambodia', name: 'Камбоджа' },
                    { code: 'Cameroon', name: 'Камерун' },
                    { code: 'Canada', name: 'Канада' },
                    { code: 'Qatar', name: 'Катар' },
                    { code: 'Kenya', name: 'Кения' },
                    { code: 'Cyprus', name: 'Кипр' },
                    { code: 'Kyrgyzstan', name: 'Киргизия' },
                    { code: 'Kiribati', name: 'Кирибати' },
                    { code: 'China', name: 'Китай' },
                    { code: 'Colombia', name: 'Колумбия' },
                    { code: 'Comoros', name: 'Коморы' },
                    { code: 'Republic-of-the-Congo', name: 'Республика Конго' },
                    { code: 'Democratic-Republic-of-the-Congo', name: 'Демократическая Республика Конго' },
                    { code: 'North-Korea', name: 'КНДР' },
                    { code: 'The-Republic-of-Korea', name: 'Республика Корея' },
                    { code: 'Costa-Rica', name: 'Коста-Рика' },
                    { code: 'Côte-d"Ivoire', name: 'Кот-д’Ивуар' },
                    { code: 'Cuba', name: 'Куба' },
                    { code: 'Kuwait', name: 'Кувейт' },
                    { code: 'Laos', name: 'Лаос' },
                    { code: 'Latvia', name: 'Латвия' },
                    { code: 'Lesotho', name: 'Лесото' },
                    { code: 'Liberia', name: 'Либерия' },
                    { code: 'Lebanon', name: 'Ливан' },
                    { code: 'Libya', name: 'Ливия' },
                    { code: 'Lithuania', name: 'Литва' },
                    { code: 'Liechtenstein', name: 'Лихтенштейн' },
                    { code: 'Luxembourg', name: 'Люксембург' },
                    { code: 'Mauritius', name: 'Маврикий' },
                    { code: 'Mauritania', name: 'Мавритания' },
                    { code: 'Madagascar', name: 'Мадагаскар' },
                    { code: 'Malawi', name: 'Малави' },
                    { code: 'Malaysia', name: 'Малайзия' },
                    { code: 'Mali', name: 'Мали' },
                    { code: 'Maldives', name: 'Мальдивы' },
                    { code: 'Malta', name: 'Мальта' },
                    { code: 'Morocco', name: 'Марокко' },
                    { code: 'Marshall-Islands', name: 'Маршалловы Острова' },
                    { code: 'Mexico', name: 'Мексика' },
                    { code: 'Mozambique', name: 'Мозамбик' },
                    { code: 'Moldavia', name: 'Молдавия' },
                    { code: 'Monaco', name: 'Монако' },
                    { code: 'Mongolia', name: 'Монголия' },
                    { code: 'Myanmar', name: 'Мьянма' },
                    { code: 'Namibia', name: 'Намибия' },
                    { code: 'Nauru', name: 'Науру' },
                    { code: 'Nepal', name: 'Непал' },
                    { code: 'Niger', name: 'Нигер' },
                    { code: 'Nigeria', name: 'Нигерия' },
                    { code: 'Netherlands', name: 'Нидерланды' },
                    { code: 'Nicaragua', name: 'Никарагуа' },
                    { code: 'New-Zealand', name: 'Новая Зеландия' },
                    { code: 'Norway', name: 'Норвегия' },
                    { code: 'United-Arab-Emirates', name: 'ОАЭ' },
                    { code: 'Oman', name: 'Оман' },
                    { code: 'Pakistan', name: 'Пакистан' },
                    { code: 'Palau', name: 'Палау' },
                    { code: 'Panama', name: 'Панама' },
                    { code: 'Papua-New-Guinea', name: 'Папуа-Новая Гвинея ' },
                    { code: 'Paraguay', name: 'Парагвай' },
                    { code: 'Peru', name: 'Перу' },
                    { code: 'Poland', name: 'Польша' },
                    { code: 'Portugal', name: 'Португалия' },
                    { code: 'Russia', name: 'Россия' },
                    { code: 'Rwanda', name: 'Руанда' },
                    { code: 'Romania', name: 'Румыния' },
                    { code: 'Salvador', name: 'Сальвадор' },
                    { code: 'Samoa', name: 'Самоа' },
                    { code: 'Sao-Tome-and-Principe', name: 'Сан-Томе и Принсипи' },
                    { code: 'San-Marino', name: 'Сан-Марино ' },
                    { code: 'Saudi-Arabia', name: 'Саудовская Аравия' },
                    { code: 'North-Macedonia', name: 'Северная Македония' },
                    { code: 'Seychelles', name: 'Сейшельские Острова' },
                    { code: 'Senegal', name: 'Сенегал' },
                    { code: 'Vc', name: 'Сент-Винсент и Гренадины' },
                    { code: 'Saint-Kitts-and-Nevis', name: 'Сент-Китс и Невис ' },
                    { code: 'Saint-Lucia', name: 'Сент-Люсия' },
                    { code: 'Serbia', name: 'Сербия' },
                    { code: 'Singapore', name: 'Сингапур' },
                    { code: 'Syria', name: 'Сирия' },
                    { code: 'Slovakia', name: 'Словакия' },
                    { code: 'Slovenia', name: 'Словения' },
                    { code: 'USA', name: 'США' },
                    { code: 'Solomon-islands', name: 'Соломоновы Острова' },
                    { code: 'Somalia', name: 'Сомали' },
                    { code: 'Sudan', name: 'Судан' },
                    { code: 'Surinam', name: 'Суринам' },
                    { code: 'Sierra-Leone', name: 'Сьерра-Леоне' },
                    { code: 'Tajikistan', name: 'Таджикистан' },
                    { code: 'Thailand', name: 'Таиланд' },
                    { code: 'Tanzania', name: 'Танзания' },
                    { code: 'Togo', name: 'Того' },
                    { code: 'Tonga', name: 'Тонга' },
                    { code: 'Trinidad-and-Tobago', name: 'Тринидад и Тобаго' },
                    { code: 'Tuvalu', name: 'Тувалу' },
                    { code: 'Tunisia', name: 'Тунис' },
                    { code: 'Turkmenistan', name: 'Туркмения' },
                    { code: 'Turkey', name: 'Турция' },
                    { code: 'Uganda', name: 'Уганда' },
                    { code: 'Uzbekistan', name: 'Узбекистан' },
                    { code: 'Ukraine', name: 'Украина' },
                    { code: 'Uruguay', name: 'Уругвай' },
                    { code: 'Federated-States-of-Micronesia', name: 'Федеративные Штаты Микронезии' },
                    { code: 'Fiji', name: 'Фиджи' },
                    { code: 'Philippines', name: 'Филиппины' },
                    { code: 'Finland', name: 'Финляндия' },
                    { code: 'France', name: 'Франция' },
                    { code: 'Croatia', name: 'Хорватия' },
                    { code: 'Central-African-Republic', name: 'Центральноафриканская Республика' },
                    { code: 'Chad', name: 'Чад' },
                    { code: 'Montenegro', name: 'Черногория' },
                    { code: 'Czech', name: 'Чехия' },
                    { code: 'Chile', name: 'Чили' },
                    { code: 'Switzerland', name: 'Швейцария' },
                    { code: 'Sweden', name: 'Швеция' },
                    { code: 'Sri-Lanka', name: 'Шри-Ланка ' },
                    { code: 'Ecuador', name: 'Эквадор' },
                    { code: 'Equatorial-Guinea', name: 'Экваториальная Гвинея' },
                    { code: 'Eritrea', name: 'Эритрея' },
                    { code: 'Esvatini', name: 'Эсватини' },
                    { code: 'Estonia', name: 'Эстония' },
                    { code: 'Ethiopia', name: 'Эфиопия' },
                    { code: 'South-Africa', name: 'ЮАР' },
                    { code: 'South-Sudan', name: 'Южный Судан' },
                    { code: 'Jamaica', name: 'Ямайка' },
                    { code: 'Japan', name: 'Япония' }
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

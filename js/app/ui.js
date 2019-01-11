/******************************************************************************
 * Copyright © 2016 The Waves Developers.                                     *
 *                                                                            *
 * See the LICENSE files at                                                   *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

(function() {
	'use strict';

	angular
		.module('app.ui', [])
		.constant('ui.events', {
			SPLASH_COMPLETED: 'splash-completed',
			LOGIN_SUCCESSFUL: 'login-successful',
			LEASING_CANCEL: 'leasing-cancel'
		});
})();

(function () {
	'use strict';

	angular
		.module('app.ui')
		.service('utilsService', [function () {
			this.isTestnet = function () {
				return Constants.NETWORK_NAME === 'testnet';
			};

			this.testnetSubstitutePair = function (pair) {
				var realIds = {};
				if (isMir()) {
					realIds[Currency.LBR.id] = '55WhEqBaGb6Z9DK3bHJQkk4jEDwRejc1xJttyxiykMnL';
				} else {
					realIds[Currency.BTC.id] = '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS';
					realIds[Currency.USD.id] = 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck';
					realIds[Currency.EUR.id] = 'Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU';
				}

				if (isMir()) {
					return {
						amountAsset: {id: realIds[pair.amountAsset.id] || ''},
						priceAsset: {id: realIds[pair.priceAsset.id] || realIds[Currency.LBR.id]}
					};
				} else {
					return {
						amountAsset: {id: realIds[pair.amountAsset.id] || ''},
						priceAsset: {id: realIds[pair.priceAsset.id] || realIds[Currency.BTC.id]}
					};
				}
			};
		}]);
})();

(function () {
	'use strict';

	function ApplicationContextFactory() {
		return {
		};
	}

	angular
		.module('app.ui')
		.factory('applicationContext', ApplicationContextFactory);
})();

(function () {
	'use strict';

	function CoinomatRestangularFactory(rest) {
		return rest.withConfig(function(configurer) {
			configurer.setBaseUrl(Constants.COINOMAT_ADDRESS);
		});
	}

	function DatafeedRestangularFactory(rest) {
		return rest.withConfig(function(configurer) {
			configurer.setBaseUrl(Constants.DATAFEED_ADDRESS);
		});
	}

	function MatcherRestangularFactory(rest) {
		return rest.withConfig(function(configurer) {
			configurer.setBaseUrl(Constants.MATCHER_ADDRESS);
		});
	}

	CoinomatRestangularFactory.$inject = ['Restangular'];
	DatafeedRestangularFactory.$inject = ['Restangular'];
	MatcherRestangularFactory.$inject = ['Restangular'];

	angular
		.module('app.ui')
		.factory('CoinomatRestangular', CoinomatRestangularFactory)
		.factory('DatafeedRestangular', DatafeedRestangularFactory)
		.factory('MatcherRestangular', MatcherRestangularFactory);
})();

(function () {
	'use strict';

	var SCREENS = {
		splash: 'splash-screen',
		accounts: 'accounts-screen',
		main: 'main-screen'
	};

	function HomeController($scope, $window, events, utilsService, dialogService, applicationContext, notificationService, apiService) {
		$scope.isTestnet = utilsService.isTestnet;

		var home = this;
		home.screen = SCREENS.splash;
		home.featureUnderDevelopment = featureUnderDevelopment;
		home.logout = logout;

		home.title = utilsService.isTestnet() ? 'TESTNET ' : '';
		home.version = Constants.CLIENT_VERSION;

		$scope.$on(events.SPLASH_COMPLETED, function () {
			home.screen = SCREENS.accounts;
		});

		$scope.clipboardOk = function (message) {
			message = message || 'Address copied successfully';
			notificationService.notice(message);
		};

		$scope.$on(events.LOGIN_SUCCESSFUL, function (event, account) {
			// putting the current account to the app context
			ApplicationContext.account = account;

			NProgress.start();
			apiService.assets.balance(ApplicationContext.account.address)
				.then(function (response) {
					_.forEach(response.balances, function (balanceItem) {
						ApplicationContext.cache.putAsset(balanceItem.issueTransaction);
					});
				})
				.finally(function () {
					home.screen = SCREENS.main;
					NProgress.done();
				});
		});

		function featureUnderDevelopment() {
			dialogService.open('#feat-not-active');
		}

		function logout() {
			if ($window.chrome && $window.chrome.runtime && typeof $window.chrome.runtime.reload === 'function') {
				$window.chrome.runtime.reload();
			} else {
				$window.location.reload();
			}
		}
	}

	HomeController.$inject = ['$scope', '$window', 'ui.events', 'utilsService',
		'dialogService', 'applicationContext', 'notificationService', 'apiService'];

	angular
		.module('app.ui')
		.controller('homeController', HomeController);
})();

(function () {
	'use strict';

	angular
		.module('app.ui')
		.controller('splashController', ['$scope', '$timeout', 'ui.events', function ($scope, $timeout, events) {
			NProgress.start();

			$timeout(function () {
				NProgress.done();
				$scope.$emit(events.SPLASH_COMPLETED);
			}, 1);
		}]);
})();

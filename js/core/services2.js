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
		.module('waves.core.services')
		.service('chromeStorageService', ['$q', function ($q) {
			var $key = 'WavesAccounts';
			var self = this;

			self.saveState = function (state) {
				var deferred = $q.defer();
				var json = {};
				json[$key] = state;

				chrome.storage.local.set(json, function () {
					deferred.resolve();
				});

				return deferred.promise;
			};

			self.loadState = function () {
				var deferred = $q.defer();

				self.loadSyncState().then(function (syncState) {
					if (syncState) {
						self.saveState(syncState)
							.then(function () {
								return self.clearSyncState();
							})
							.then(function () {
								deferred.resolve(syncState);
							});
					} else {
						chrome.storage.local.get($key, function (data) {
							deferred.resolve(data[$key]);
						});
					}
				});

				return deferred.promise;
			};

			self.loadSyncState = function () {
				var deferred = $q.defer();

				chrome.storage.sync.get($key, function (data) {
					deferred.resolve(data[$key]);
				});

				return deferred.promise;
			};

			self.clearSyncState = function () {
				var deferred = $q.defer();

				chrome.storage.sync.clear(function () {
					deferred.resolve();
				});

				return deferred.promise;
			};
		}]);
})();

(function() {
	'use strict';

	angular
		.module('waves.core.services')
		.service('html5StorageService', ['constants.network', '$window', '$q', function(constants, window, $q) {
			if (angular.isUndefined(constants.NETWORK_NAME))
				throw new Error('Network name hasn\'t been configured');

			if (isMir()) {
				var $key = 'Mir' + constants.NETWORK_NAME;
			} else {
				var $key = 'Waves' + constants.NETWORK_NAME;
			}

			this.saveState = function(state) {
				var serialized = angular.toJson(state);

				window.localStorage.setItem($key, serialized);

				return $q.when();
			};

			this.loadState = function() {
				var data;
				var serialized = window.localStorage.getItem($key);

				if (serialized) {
					data = angular.fromJson(serialized);
				}

				return $q.when(data);
			};

			this.clear = function() {
				window.localStorage.removeItem($key);

				return $q.when();
			};
		}]);
})();

(function() {
	'use strict';

	var STORAGE_STRUCTURE_VERSION = 1;

	angular
		.module('waves.core.services')
		.provider('storageService', [function () {
			function getStorageVersion () {
				return STORAGE_STRUCTURE_VERSION;
			}

			function isLocalStorageEnabled(window) {
				var storage, fail, uid;
				try {
					uid = String(new Date());
					(storage = window.localStorage).setItem(uid, uid);
					fail = storage.getItem(uid) != uid;
					if (!fail)
						storage.removeItem(uid);
					else
						storage = false;
				}
				catch (exception) {
				}
				return storage;
			}

			this.$get = ['$window', 'chromeStorageService', 'html5StorageService',
				function($window, chromeStorageService, html5StorageService) {
					var result = isLocalStorageEnabled($window) ? html5StorageService : chromeStorageService;
					result.getStorageVersion = getStorageVersion;

					return result;
				}];
		}]);
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('formattingService', ['$window', '$filter', function (window, $filter) {

			var LOCALE_DATE_FORMATS = {
				'ar-SA': 'dd/MM/yy',
				'bg-BG': 'dd.M.yyyy',
				'ca-ES': 'dd/MM/yyyy',
				'zh-TW': 'yyyy/M/d',
				'cs-CZ': 'd.M.yyyy',
				'da-DK': 'dd-MM-yyyy',
				'de-DE': 'dd.MM.yyyy',
				'el-GR': 'd/M/yyyy',
				'en-US': 'M/d/yyyy',
				'fi-FI': 'd.M.yyyy',
				'fr-FR': 'dd/MM/yyyy',
				'he-IL': 'dd/MM/yyyy',
				'hu-HU': 'yyyy. MM. dd.',
				'is-IS': 'd.M.yyyy',
				'it-IT': 'dd/MM/yyyy',
				'ja-JP': 'yyyy/MM/dd',
				'ko-KR': 'yyyy-MM-dd',
				'nl-NL': 'd-M-yyyy',
				'nb-NO': 'dd.MM.yyyy',
				'pl-PL': 'yyyy-MM-dd',
				'pt-BR': 'd/M/yyyy',
				'ro-RO': 'dd.MM.yyyy',
				'ru-RU': 'dd.MM.yyyy',
				'hr-HR': 'd.M.yyyy',
				'sk-SK': 'd. M. yyyy',
				'sq-AL': 'yyyy-MM-dd',
				'sv-SE': 'yyyy-MM-dd',
				'th-TH': 'd/M/yyyy',
				'tr-TR': 'dd.MM.yyyy',
				'ur-PK': 'dd/MM/yyyy',
				'id-ID': 'dd/MM/yyyy',
				'uk-UA': 'dd.MM.yyyy',
				'be-BY': 'dd.MM.yyyy',
				'sl-SI': 'd.M.yyyy',
				'et-EE': 'd.MM.yyyy',
				'lv-LV': 'yyyy.MM.dd.',
				'lt-LT': 'yyyy.MM.dd',
				'fa-IR': 'MM/dd/yyyy',
				'vi-VN': 'dd/MM/yyyy',
				'hy-AM': 'dd.MM.yyyy',
				'az-Latn-AZ': 'dd.MM.yyyy',
				'eu-ES': 'yyyy/MM/dd',
				'mk-MK': 'dd.MM.yyyy',
				'af-ZA': 'yyyy/MM/dd',
				'ka-GE': 'dd.MM.yyyy',
				'fo-FO': 'dd-MM-yyyy',
				'hi-IN': 'dd-MM-yyyy',
				'ms-MY': 'dd/MM/yyyy',
				'kk-KZ': 'dd.MM.yyyy',
				'ky-KG': 'dd.MM.yy',
				'sw-KE': 'M/d/yyyy',
				'uz-Latn-UZ': 'dd/MM yyyy',
				'tt-RU': 'dd.MM.yyyy',
				'pa-IN': 'dd-MM-yy',
				'gu-IN': 'dd-MM-yy',
				'ta-IN': 'dd-MM-yyyy',
				'te-IN': 'dd-MM-yy',
				'kn-IN': 'dd-MM-yy',
				'mr-IN': 'dd-MM-yyyy',
				'sa-IN': 'dd-MM-yyyy',
				'mn-MN': 'yy.MM.dd',
				'gl-ES': 'dd/MM/yy',
				'kok-IN': 'dd-MM-yyyy',
				'syr-SY': 'dd/MM/yyyy',
				'dv-MV': 'dd/MM/yy',
				'ar-IQ': 'dd/MM/yyyy',
				'zh-CN': 'yyyy/M/d',
				'de-CH': 'dd.MM.yyyy',
				'en-GB': 'dd/MM/yyyy',
				'es-MX': 'dd/MM/yyyy',
				'fr-BE': 'd/MM/yyyy',
				'it-CH': 'dd.MM.yyyy',
				'nl-BE': 'd/MM/yyyy',
				'nn-NO': 'dd.MM.yyyy',
				'pt-PT': 'dd-MM-yyyy',
				'sr-Latn-CS': 'd.M.yyyy',
				'sv-FI': 'd.M.yyyy',
				'az-Cyrl-AZ': 'dd.MM.yyyy',
				'ms-BN': 'dd/MM/yyyy',
				'uz-Cyrl-UZ': 'dd.MM.yyyy',
				'ar-EG': 'dd/MM/yyyy',
				'zh-HK': 'd/M/yyyy',
				'de-AT': 'dd.MM.yyyy',
				'en-AU': 'd/MM/yyyy',
				'es-ES': 'dd/MM/yyyy',
				'fr-CA': 'yyyy-MM-dd',
				'sr-Cyrl-CS': 'd.M.yyyy',
				'ar-LY': 'dd/MM/yyyy',
				'zh-SG': 'd/M/yyyy',
				'de-LU': 'dd.MM.yyyy',
				'en-CA': 'dd/MM/yyyy',
				'es-GT': 'dd/MM/yyyy',
				'fr-CH': 'dd.MM.yyyy',
				'ar-DZ': 'dd-MM-yyyy',
				'zh-MO': 'd/M/yyyy',
				'de-LI': 'dd.MM.yyyy',
				'en-NZ': 'd/MM/yyyy',
				'es-CR': 'dd/MM/yyyy',
				'fr-LU': 'dd/MM/yyyy',
				'ar-MA': 'dd-MM-yyyy',
				'en-IE': 'dd/MM/yyyy',
				'es-PA': 'MM/dd/yyyy',
				'fr-MC': 'dd/MM/yyyy',
				'ar-TN': 'dd-MM-yyyy',
				'en-ZA': 'yyyy/MM/dd',
				'es-DO': 'dd/MM/yyyy',
				'ar-OM': 'dd/MM/yyyy',
				'en-JM': 'dd/MM/yyyy',
				'es-VE': 'dd/MM/yyyy',
				'ar-YE': 'dd/MM/yyyy',
				'en-029': 'MM/dd/yyyy',
				'es-CO': 'dd/MM/yyyy',
				'ar-SY': 'dd/MM/yyyy',
				'en-BZ': 'dd/MM/yyyy',
				'es-PE': 'dd/MM/yyyy',
				'ar-JO': 'dd/MM/yyyy',
				'en-TT': 'dd/MM/yyyy',
				'es-AR': 'dd/MM/yyyy',
				'ar-LB': 'dd/MM/yyyy',
				'en-ZW': 'M/d/yyyy',
				'es-EC': 'dd/MM/yyyy',
				'ar-KW': 'dd/MM/yyyy',
				'en-PH': 'M/d/yyyy',
				'es-CL': 'dd-MM-yyyy',
				'ar-AE': 'dd/MM/yyyy',
				'es-UY': 'dd/MM/yyyy',
				'ar-BH': 'dd/MM/yyyy',
				'es-PY': 'dd/MM/yyyy',
				'ar-QA': 'dd/MM/yyyy',
				'es-BO': 'dd/MM/yyyy',
				'es-SV': 'dd/MM/yyyy',
				'es-HN': 'dd/MM/yyyy',
				'es-NI': 'dd/MM/yyyy',
				'es-PR': 'dd/MM/yyyy',
				'am-ET': 'd/M/yyyy',
				'tzm-Latn-DZ': 'dd-MM-yyyy',
				'iu-Latn-CA': 'd/MM/yyyy',
				'sma-NO': 'dd.MM.yyyy',
				'mn-Mong-CN': 'yyyy/M/d',
				'gd-GB': 'dd/MM/yyyy',
				'en-MY': 'd/M/yyyy',
				'prs-AF': 'dd/MM/yy',
				'bn-BD': 'dd-MM-yy',
				'wo-SN': 'dd/MM/yyyy',
				'rw-RW': 'M/d/yyyy',
				'qut-GT': 'dd/MM/yyyy',
				'sah-RU': 'MM.dd.yyyy',
				'gsw-FR': 'dd/MM/yyyy',
				'co-FR': 'dd/MM/yyyy',
				'oc-FR': 'dd/MM/yyyy',
				'mi-NZ': 'dd/MM/yyyy',
				'ga-IE': 'dd/MM/yyyy',
				'se-SE': 'yyyy-MM-dd',
				'br-FR': 'dd/MM/yyyy',
				'smn-FI': 'd.M.yyyy',
				'moh-CA': 'M/d/yyyy',
				'arn-CL': 'dd-MM-yyyy',
				'ii-CN': 'yyyy/M/d',
				'dsb-DE': 'd. M. yyyy',
				'ig-NG': 'd/M/yyyy',
				'kl-GL': 'dd-MM-yyyy',
				'lb-LU': 'dd/MM/yyyy',
				'ba-RU': 'dd.MM.yy',
				'nso-ZA': 'yyyy/MM/dd',
				'quz-BO': 'dd/MM/yyyy',
				'yo-NG': 'd/M/yyyy',
				'ha-Latn-NG': 'd/M/yyyy',
				'fil-PH': 'M/d/yyyy',
				'ps-AF': 'dd/MM/yy',
				'fy-NL': 'd-M-yyyy',
				'ne-NP': 'M/d/yyyy',
				'se-NO': 'dd.MM.yyyy',
				'iu-Cans-CA': 'd/M/yyyy',
				'sr-Latn-RS': 'd.M.yyyy',
				'si-LK': 'yyyy-MM-dd',
				'sr-Cyrl-RS': 'd.M.yyyy',
				'lo-LA': 'dd/MM/yyyy',
				'km-KH': 'yyyy-MM-dd',
				'cy-GB': 'dd/MM/yyyy',
				'bo-CN': 'yyyy/M/d',
				'sms-FI': 'd.M.yyyy',
				'as-IN': 'dd-MM-yyyy',
				'ml-IN': 'dd-MM-yy',
				'en-IN': 'dd-MM-yyyy',
				'or-IN': 'dd-MM-yy',
				'bn-IN': 'dd-MM-yy',
				'tk-TM': 'dd.MM.yy',
				'bs-Latn-BA': 'd.M.yyyy',
				'mt-MT': 'dd/MM/yyyy',
				'sr-Cyrl-ME': 'd.M.yyyy',
				'se-FI': 'd.M.yyyy',
				'zu-ZA': 'yyyy/MM/dd',
				'xh-ZA': 'yyyy/MM/dd',
				'tn-ZA': 'yyyy/MM/dd',
				'hsb-DE': 'd. M. yyyy',
				'bs-Cyrl-BA': 'd.M.yyyy',
				'tg-Cyrl-TJ': 'dd.MM.yy',
				'sr-Latn-BA': 'd.M.yyyy',
				'smj-NO': 'dd.MM.yyyy',
				'rm-CH': 'dd/MM/yyyy',
				'smj-SE': 'yyyy-MM-dd',
				'quz-EC': 'dd/MM/yyyy',
				'quz-PE': 'dd/MM/yyyy',
				'hr-BA': 'd.M.yyyy.',
				'sr-Latn-ME': 'd.M.yyyy',
				'sma-SE': 'yyyy-MM-dd',
				'en-SG': 'd/M/yyyy',
				'ug-CN': 'yyyy-M-d',
				'sr-Cyrl-BA': 'd.M.yyyy',
				'es-US': 'M/d/yyyy'
			};

			var LANG = window.navigator.userLanguage || window.navigator.language;
			var LOCALE_DATE_FORMAT = LOCALE_DATE_FORMATS[LANG] || 'dd/MM/yyyy';
			var settings = {
				'24_hour_format': '1'
			};

			this.formatTimestamp = function (timestamp, dateOnly, isAbsoluteTime) {
				var date;
				if (typeof timestamp == 'object') {
					date = timestamp;
				} else if (isAbsoluteTime) {
					date = new Date(timestamp);
				} else {
					date = new Date(timestamp);
				}

				var format = LOCALE_DATE_FORMAT;
				if (!dateOnly) {
					var timeFormat = 'H:mm:ss';

					if (settings['24_hour_format'] === '0')
						timeFormat = 'h:mm:ss a';

					format += ' ' + timeFormat;
				}

				return $filter('date')(date, format);
			};
		}]);
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('coinomatCurrencyMappingService', [function () {
			function unsupportedCurrency(currency) {
				throw new Error('Unsupported currency: ' + currency.displayName);
			}

			/**
			 * Currency codes for Waves Platform
			 * @param {Currency} currency
			 * @returns {string} currency code
			 */
			this.platformCurrencyCode = function (currency) {
				if (isMir()) {
					switch (currency.id) {
						case Currency.LBR.id:
							return 'LBR';
						case Currency.MIR.id:
							return 'MIR';
					}
				} else {
					switch (currency.id) {
						case Currency.BTC.id:
							return 'WBTC';
						case Currency.WAVES.id:
							return 'WAVES';
					}
				}
				unsupportedCurrency(currency);
			};

			/**
			 * Currency codes for Coinomat gateway
			 * @param {Currency} currency
			 * @returns {string} currency code
			 */
			this.gatewayCurrencyCode = function (currency) {
				if (isMir()) {
					switch (currency.id) {
						case Currency.LBR.id:
							return 'LBR';
						case Currency.MIR.id:
							return 'MIR';
					}
				} else {
					switch (currency.id) {
						case Currency.BTC.id:
							return 'BTC';
						case Currency.WAVES.id:
							return 'WAVES';
					}
				}
				unsupportedCurrency(currency);
			};
		}]);
})();

(function () {
	'use strict';

	var LANGUAGE = 'ru_RU';

	function ensureTunnelCreated(response) {
		if (!response.ok) {
			console.log(response);
			throw new Error('Failed to create tunnel: ' + response.error);
		}
	}

	function ensureTunnelObtained(response) {
		if (!response.tunnel) {
			console.log(response);
			throw new Error('Failed to get tunnel: ' + response.error);
		}
	}

	function CoinomatService(rest, mappingService) {
		var apiRoot = rest.all('api').all('v1');

		/* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
		function loadPaymentDetails(currencyCodeFrom, currencyCodeTo, recipientAddress) {
			return apiRoot.get('create_tunnel.php', {
				currency_from: currencyCodeFrom,
				currency_to: currencyCodeTo,
				wallet_to: recipientAddress
			}).then(function (response) {
				ensureTunnelCreated(response);

				return {
					id: response.tunnel_id,
					k1: response.k1,
					k2: response.k2
				};
			}).then(function (tunnel) {
				return apiRoot.get('get_tunnel.php', {
					xt_id: tunnel.id,
					k1: tunnel.k1,
					k2: tunnel.k2,
					history: 0,
					lang: LANGUAGE
				});
			}).then(function (response) {
				ensureTunnelObtained(response);

				// here only BTC wallet is returned
				// probably for other currencies more requisites are required
				return {
					address: response.tunnel.wallet_from,
					attachment: response.tunnel.attachment
				};
			});
		}
		/* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

		this.getDepositDetails = function (sourceCurrency, targetCurrency, wavesRecipientAddress) {
			var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(sourceCurrency);
			var platformCurrencyCode = mappingService.platformCurrencyCode(targetCurrency);

			return loadPaymentDetails(gatewayCurrencyCode, platformCurrencyCode, wavesRecipientAddress);
		};

		this.getWithdrawDetails = function (currency, recipientAddress) {
			var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(currency);
			var platformCurrencyCode = mappingService.platformCurrencyCode(currency);

			return loadPaymentDetails(platformCurrencyCode, gatewayCurrencyCode, recipientAddress);
		};

		this.getWithdrawRate = function (currency) {
			var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(currency);
			var platformCurrencyCode = mappingService.platformCurrencyCode(currency);

			return apiRoot.get('get_xrate.php', {
				f: platformCurrencyCode,
				t: gatewayCurrencyCode,
				lang: LANGUAGE
			});
		};
	}

	CoinomatService.$inject = ['CoinomatRestangular', 'coinomatCurrencyMappingService'];

	angular
		.module('waves.core.services')
		.service('coinomatService', CoinomatService);
})();

(function () {
	'use strict';

	function CoinomatFiatService(rest, currencyMappingService) {
		var apiRoot = rest.all('api').all('v2').all('indacoin');

		this.getLimits = function (address, fiatCurrency, cryptoCurrency) {
			return apiRoot.get('limits.php', {
				address: address,
				fiat: fiatCurrency,
				crypto: currencyMappingService.gatewayCurrencyCode(cryptoCurrency)
			});
		};

		this.getRate = function (address, fiatAmount, fiatCurrency, cryptoCurrency) {
			return apiRoot.get('rate.php', {
				address: address,
				fiat: fiatCurrency,
				amount: fiatAmount,
				crypto: currencyMappingService.gatewayCurrencyCode(cryptoCurrency)
			});
		};

		this.getMerchantUrl = function (address, fiatAmount, fiatCurrency, cryptoCurrency) {
			return apiRoot.all('buy.php').getRequestedUrl() +
				'?address=' + address +
				'&fiat=' + fiatCurrency +
				'&amount=' + fiatAmount +
				'&crypto=' + currencyMappingService.gatewayCurrencyCode(cryptoCurrency);
		};
	}

	CoinomatFiatService.$inject = ['CoinomatRestangular', 'coinomatCurrencyMappingService'];

	angular
		.module('waves.core.services')
		.service('coinomatFiatService', CoinomatFiatService);
})();

(function () {
	'use strict';

	var MINUTE = 60 * 1000,
		DEFAULT_FRAME = 30,
		DEFAULT_LIMIT = 50;

	function serializeId(id) {
		if (isMir()) {
			return id === '' ? 'MIR' : id;
		} else {
			return id === '' ? 'WAVES' : id;
		}
	}

	function DatafeedApiService(rest) {
		var self = this,
			apiRoot = rest.all('api');

		self.getSymbols = function () {
			return apiRoot.get('symbols');
		};

		self.getCandles = function (pair, from, to, frame) {
			frame = frame || DEFAULT_FRAME;
			to = to || Date.now();
			from = from || to - 50 * frame * MINUTE;

			return apiRoot
				.all('candles')
				.all(serializeId(pair.amountAsset.id))
				.all(serializeId(pair.priceAsset.id))
				.all(frame)
				.all(from)
				.get(to);
		};

		self.getLastCandles = function (pair, limit, frame) {
			frame = frame || DEFAULT_FRAME;
			limit = limit || DEFAULT_LIMIT;

			return apiRoot
				.all('candles')
				.all(serializeId(pair.amountAsset.id))
				.all(serializeId(pair.priceAsset.id))
				.all(frame)
				.get(limit);
		};

		self.getTrades = function (pair, limit) {
			limit = limit || DEFAULT_LIMIT;

			return apiRoot
				.all('trades')
				.all(serializeId(pair.amountAsset.id))
				.all(serializeId(pair.priceAsset.id))
				.get(limit);
		};

		self.getTradesByAddress = function (pair, address, limit) {
			limit = limit || DEFAULT_LIMIT;

			return apiRoot
				.all('trades')
				.all(serializeId(pair.amountAsset.id))
				.all(serializeId(pair.priceAsset.id))
				.all(address)
				.get(limit);
		};
	}

	DatafeedApiService.$inject = ['DatafeedRestangular'];

	angular
		.module('waves.core.services')
		.service('datafeedApiService', DatafeedApiService);
})();

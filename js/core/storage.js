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

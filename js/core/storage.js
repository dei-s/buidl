var Storage = (function(){
	'use strict';

	var STORAGE_STRUCTURE_VERSION = 1;

	var storage;

	if (isMir()) {
		var $key = 'MirAccounts';
	} else {
		var $key = 'WavesAccounts';
	}

	if (angular.isUndefined(Constants.NETWORK_NAME))
		throw new Error('Network name hasn\'t been configured');

	if (isMir()) {
		var $key = 'Mir' + Constants.NETWORK_NAME;
	} else {
		var $key = 'Waves' + Constants.NETWORK_NAME;
	}

	function clear() {
		return new Promise(function(resolve, reject){
			window.localStorage.removeItem($key);
			resolve(); //return $q.when();
		});
	}

	function clearSyncStateChrome() {
		return new Promise(function(resolve, reject){
			chrome.storage.sync.clear(function () {
				resolve();
			});
		});
	}

	function getStorageVersion() {
		return STORAGE_STRUCTURE_VERSION;
	}

	function isLocalStorageEnabled() {
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

	function loadState() {
		if (storage) {
			return loadStateLocal();
		} else {
			return loadStateChrome();
		}
	}

	function loadStateChrome() {
		return new Promise(function(resolve, reject){
			loadSyncStateCrome().then(function (syncState) {
				if (syncState) {
					saveState(syncState)
						.then(function () {
							return clearSyncStateChrome();
						})
						.then(function () {
							resolve(syncState);
						});
				} else {
					chrome.storage.local.get($key, function (data) {
						resolve(data[$key]);
					});
				}
			});
		});
	}

	function loadStateLocal() {
		return new Promise(function(resolve, reject){
			var data;
			var serialized = window.localStorage.getItem($key);
			if (serialized) {
				data = angular.fromJson(serialized);
			}
			resolve(data); //return $q.when(data);
		});
	}

	function loadSyncStateChrome() {
		return new Promise(function(resolve, reject){
			chrome.storage.sync.get($key, function (data) {
				resolve(data[$key]);
			});
		});
	}

	function saveState(state) {
		if (storage) {
			return saveStateLocal(state);
		} else {
			return saveStateChrome(state);
		}
	}

	function saveStateLocal(state) {
		return new Promise(function(resolve, reject){
			var serialized = angular.toJson(state);
			window.localStorage.setItem($key, serialized);
			resolve();
		});
	}

	function saveStateChrome(state) {
		return new Promise(function(resolve, reject){
			var json = {};
			json[$key] = state;
			chrome.storage.local.set(json, function () {
				resolve();
			});
		});
	}

	storage = isLocalStorageEnabled();

	return {
		clear: clear,
		getStorageVersion: getStorageVersion,
		isLocalStorageEnabled: isLocalStorageEnabled,
		loadState: loadState,
		saveState: saveState
	}
})();

(function() {
	'use strict';

	angular
		.module('waves.core.services')
		.service('chromeStorageService', ['$q', function ($q) {
			var $key = Storage.$key;
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

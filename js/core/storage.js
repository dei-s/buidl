var Storage = (function(){
	'use strict';

	var STORAGE_STRUCTURE_VERSION = 1;

	var storage;

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
			resolve();
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
			resolve(data);
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

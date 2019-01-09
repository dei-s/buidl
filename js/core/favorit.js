/**
 * use core.storage (Storage)
 * favorits - is array of favorit
 * favorit = {
 *     accountAddress: string,
 *     assetId: string,        <- assetId, transactionId
 *     displayName: string
 * }
 */
var FavoritService = (function(){
	'use strict';

	var stateCache;
	var favoritsCashe = [];

	function addFavorit(favoritInfo) {
		return getState()
			.then(function (state) {
				state.favorits.push(favoritInfo);
				return state;
			})
			.then(Storage.saveState);
	}

	function getFavorits() {
		return getState()
			.then(function (state) {
				return state.favorits;
			});
	}

	function getState() {
		if (angular.isUndefined(stateCache)) {
			return Storage.loadState().then(function (state) {
				state = state || {};
				if (!state.favorits)
					state.favorits = [];
				stateCache = state;
				return stateCache;
			});
		}
		return new Promise(function (resolve, reject) {
			return resolve(stateCache);
		});
	}

	function isFavoritByAssetIdFromCashe(assetId, accountAddr) {
		var i = find(assetId, accountAddr);
		return i >= 0 && favoritsCashe[i].accountAddress == accountAddr;
	}

	function refresh() {
		return getFavorits().then(function (favorits) {
			favoritsCashe = favorits;
		});
	}

	function removeByIndex(index) {
		return getState()
			.then(function (state) {
				if (index >= 0) state.favorits.splice(index, 1);
				return state;
			})
			.then(Storage.saveState);
	}

	function find(assetId, accountAddr) {
		for (var i = 0; i < favoritsCashe.length; i++) {
			if (favoritsCashe[i].assetId == assetId && favoritsCashe[i].accountAddress == accountAddr) return i;
		}
		return -1;
	}

	function findByAssetId(assetId) {
		for (var i = 0; i < favoritsCashe.length; i++) {
			if (favoritsCashe[i].assetId == assetId) return i;
		}
		return -1;
	}

	function removeById(assetId, accountAddr) {
		return removeByIndex(find(assetId, accountAddr));
	}

	return {
		addFavorit: addFavorit,
		getFavorits: getFavorits,
		isFavoritByAssetIdFromCashe: isFavoritByAssetIdFromCashe,
		refresh: refresh,
		removeById: removeById,
		removeByIndex: removeByIndex
	}
})();

$(function() {
	FavoritService.refresh();
});

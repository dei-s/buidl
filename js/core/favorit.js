var FavoritService = (function(){
	'use strict';

	var stateCache;
	var favoritsCashe = [];

	function addFavorit(favoritInfo) {
		favoritsCashe.push(favoritInfo);
		console.log('addFavorit()', favoritsCashe);
		/*
		return getState()
			.then(function (state) {
				state.favorits.push(favoritInfo);
				return state;
			})
			.then(Storage.saveState);
		*/
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

	function isFavoritByAssetIdFromCashe(assetId) {
		return findByAssetId(assetId) >= 0 ? 'IsFavorit' : '';
	}

	function refresh() {
		return getFavorits().then(function (favorits) {
			favoritsCashe = favorits;
		});
	}

	function removeByIndex(index) {
		return getState()
			.then(function (state) {
				console.log('removeByIndex', index);
				if (index >= 0) state.favorits.splice(index, 1);
				return state;
			})
			.then(Storage.saveState);
	}

	function findByAssetId(assetId) {
		for (var i = 0; i < favoritsCashe.length; i++) {
			if (favoritsCashe[i].assetId == assetId) return i;
		}
		return -1;
	}

	function removeById(assetId) {
		removeByIndex(findByAssetId(assetId));
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

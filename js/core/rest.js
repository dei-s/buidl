var RestApi = (function(){
	'use strict';

	async function getTransactionsByAddr(address, limit) {
		if (limit > 10000) limit = 10000;
		let response = await axios.get(Constants.NODE_ADDRESS + '/transactions/address/' + address + '/limit/' + limit);
		return response.data;
	}

	async function getAssetDistribution(assetId, height, limit=999) {
		if (limit > 999) limit = 999;
		let response = await axios.get(Constants.NODE_ADDRESS + '/assets/'+assetId+'/distribution/'+height+'/limit/'+limit);
		return response.data;
	}

	async function getHeight() {
		try {
			var resp = await getLastBlock();
			if (!resp) return -1;
			return resp.height;
		} catch(e) {
			console.error('getHeight', e);
			return -1;
		}
	}

	async function getLastBlock() {
		let response = await axios.get(Constants.NODE_ADDRESS + '/blocks/last');
		return response.data;
	}

	return {
		getTransactionsByAddr: getTransactionsByAddr,
		getAssetDistribution: getAssetDistribution,
		getHeight: getHeight,
		getLastBlock: getLastBlock
	}
})();

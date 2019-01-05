var AssetService = (function(){
	'use strict';

	function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
		return [].concat(
			SignService.getAssetTransferTxTypeBytes(),
			SignService.getPublicKeyBytes(senderPublicKey),
			SignService.getAssetIdBytes(transfer.amount.currency.id),
			SignService.getFeeAssetIdBytes(transfer.fee.currency.id),
			SignService.getTimestampBytes(transfer.time),
			SignService.getAmountBytes(transfer.amount.toCoins()),
			SignService.getFeeBytes(transfer.fee.toCoins()),
			SignService.getRecipientBytes(transfer.recipient),
			SignService.getAttachmentBytes(transfer.attachment)
		);
	}

	function buildId(transactionBytes) {
		var hash = CryptoService.blake(new Uint8Array(transactionBytes));
		return Base58.encode(hash);
	}

	function validateAssetReissue(reissue) {
		if (reissue.totalTokens.currency === Currency.BASE) {
			throw new Error('Reissuing is not allowed.');
		}

		if (angular.isUndefined(reissue.totalTokens)) {
			throw new Error('Total tokens amount hasn\'t been set');
		}

		if (angular.isUndefined(reissue.fee)) {
			throw new Error('Transaction fee hasn\'t been set');
		}

		if (reissue.fee.currency !== Currency.BASE) {
			throw new Error('Transaction fee must be nominated in '+Currency.BASE.displayName);
		}
	}

	function validateAssetTransfer(transfer) {
		if (angular.isUndefined(transfer.recipient)) {
			throw new Error('Recipient account hasn\'t been set');
		}

		if (angular.isUndefined(transfer.fee)) {
			throw new Error('Transaction fee hasn\'t been set');
		}

		if (angular.isUndefined(transfer.amount)) {
			throw new Error('Transaction amount hasn\'t been set');
		}
	}

	return {
		buildCreateAssetTransferSignatureData: buildCreateAssetTransferSignatureData,
		buildId: buildId,
		validateAssetReissue: validateAssetReissue,
		validateAssetTransfer: validateAssetTransfer
	}
})();

(function () {
	'use strict';

	function AssetService1(signService, utilityService, cryptoService) {
		function buildId(transactionBytes) {
			return AssetService.buildId(transactionBytes);
		}

		function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
			return AssetService.buildCreateAssetTransferSignatureData(transfer, senderPublicKey);
		}

		this.createAssetTransferTransaction = function (transfer, sender) {
			AssetService.validateAssetTransfer(transfer);
			ValidateService.validateSender(sender);

			transfer.time = transfer.time || utilityService.getTime();
			transfer.attachment = transfer.attachment || [];
			transfer.recipient = utilityService.resolveAddressOrAlias(transfer.recipient);

			var signatureData = buildCreateAssetTransferSignatureData(transfer, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				id: buildId(signatureData),
				recipient: transfer.recipient,
				timestamp: transfer.time,
				assetId: transfer.amount.currency.id,
				amount: transfer.amount.toCoins(),
				fee: transfer.fee.toCoins(),
				feeAssetId: transfer.fee.currency.id,
				senderPublicKey: sender.publicKey,
				signature: signature,
				attachment: cryptoService.base58.encode(transfer.attachment)
			};
		};

		function buildCreateAssetReissueSignatureData(reissue, senderPublicKey) {
			return [].concat(
				signService.getAssetReissueTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAssetIdBytes(reissue.totalTokens.currency.id, true),
				signService.getAssetQuantityBytes(reissue.totalTokens.toCoins()),
				signService.getAssetIsReissuableBytes(reissue.reissuable),
				signService.getFeeBytes(reissue.fee.toCoins()),
				signService.getTimestampBytes(reissue.time)
			);
		}

		this.createAssetReissueTransaction = function (reissue, sender) {
			AssetService.validateAssetReissue(reissue);
			ValidateService.validateSender(sender);

			reissue.reissuable = angular.isDefined(reissue.reissuable) ? reissue.reissuable : false;
			reissue.time = reissue.time || utilityService.getTime();

			var signatureData = buildCreateAssetReissueSignatureData(reissue, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				id: buildId(signatureData),
				assetId: reissue.totalTokens.currency.id,
				quantity: reissue.totalTokens.toCoins(),
				reissuable: reissue.reissuable,
				timestamp: reissue.time,
				fee: reissue.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};
	}

	AssetService1.$inject = ['signService', 'utilityService', 'cryptoService'];

	angular
		.module('waves.core.services')
		.service('assetService', AssetService1);
})();




(function () {
	'use strict';

	function AliasRequestService(signService, utilityService) {
		function buildCreateAliasSignatureData (alias, senderPublicKey) {
			return [].concat(
				signService.getCreateAliasTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAliasBytes(alias.alias),
				signService.getFeeBytes(alias.fee.toCoins()),
				signService.getTimestampBytes(alias.time)
			);
		}

		this.buildCreateAliasRequest = function (alias, sender) {
			ValidateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			alias.time = alias.time || currentTimeMillis;

			var signatureData = buildCreateAliasSignatureData(alias, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				alias: alias.alias,
				timestamp: alias.time,
				fee: alias.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};
	}

	AliasRequestService.$inject = ['signService', 'utilityService'];

	angular
		.module('waves.core.services')
		.service('aliasRequestService', AliasRequestService);
})();


(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('apiService', ['Restangular', 'cryptoService', function (rest, cryptoService) {
			var blocksApi = rest.all('blocks');

			this.blocks = {
				height: function() {
					return blocksApi.get('height');
				},
				last: function() {
					return blocksApi.get('last');
				},
				list: function (startHeight, endHeight) {
					return blocksApi.one('seq', startHeight).all(endHeight).getList();
				}
			};

			var addressApi = rest.all('addresses');
			var consensusApi = rest.all('consensus');
			this.address = {
				balance: function (address) {
					return addressApi.one('balance', address).get();
				},
				effectiveBalance: function (address) {
					return addressApi.one('effectiveBalance', address).get();
				},
				generatingBalance: function (address) {
					return consensusApi.one('generatingbalance', address).get();
				}
			};

			var transactionApi = rest.all('transactions');

			var request;
			var timer;
			this.transactions = {
				unconfirmed: function () {
					if (!request) {
						request = transactionApi.all('unconfirmed').getList();
					} else {
						if (!timer) {
							timer = setTimeout(function () {
								request = transactionApi.all('unconfirmed').getList();
								request.finally(function () {
									timer = null;
								});
							}, 10000);
						}
					}
					return request;
				},
				list: function (address, max) {
					max = max || 50;
					return transactionApi.one('address', address).one('limit', max).getList();
				},
				info: function (transactionId) {
					return transactionApi.one('info', transactionId).get();
				}
			};

			var aliasApi = rest.all('alias');
			this.alias = {
				create: function (signedCreateAliasTransaction) {
					return aliasApi.all('broadcast').all('create').post(signedCreateAliasTransaction);
				},
				getByAddress: function (address) {
					return aliasApi.all('by-address').get(address).then(function (response) {
						return response.map(function (alias) {
							return alias.slice(8);
						});
					});
				}
			};

			var assetApi = rest.all('assets');
			var assetBroadcastApi = assetApi.all('broadcast');
			this.assets = {
				balance: function (address, assetId) {
					var rest = assetApi.all('balance');
					if (assetId)
						return rest.all(address).get(assetId);
					else
						return rest.get(address);
				},
				issue: function (signedAssetIssueTransaction) {
					return assetBroadcastApi.all('issue').post(signedAssetIssueTransaction);
				},
				reissue: function (signedAssetReissueTransaction) {
					return assetBroadcastApi.all('reissue').post(signedAssetReissueTransaction);
				},
				transfer: function (signedAssetTransferTransaction) {
					return assetBroadcastApi.all('transfer').post(signedAssetTransferTransaction);
				},
				massPay: function (signedTransactions) {
					return assetBroadcastApi.all('batch-transfer').post(signedTransactions);
				},
				makeAssetNameUnique: function (signedMakeAssetNameUniqueTransaction) {
					return assetApi
						.all('broadcast')
						.all('make-asset-name-unique')
						.post(signedMakeAssetNameUniqueTransaction);
				},
				isUniqueName: function (assetName) {
					assetName = cryptoService.base58.encode(converters.stringToByteArray(assetName));
					return assetApi
						.all('asset-id-by-unique-name')
						.get(assetName)
						.then(function (response) {
							// FIXME : temporary fix for the API format
							if (typeof response !== 'object') {
								response = {assetId: response};
							}

							return response.assetId;
						});
				}
			};
		}]);
})();

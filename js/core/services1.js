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

(function () {
	'use strict';

	function AssetService(signService, validateService, utilityService, cryptoService) {
		function buildId(transactionBytes) {
			var hash = cryptoService.blake2b(new Uint8Array(transactionBytes));
			return cryptoService.base58.encode(hash);
		}

		function buildCreateAssetSignatureData (asset, tokensQuantity, senderPublicKey) {
			return [].concat(
				signService.getAssetIssueTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAssetNameBytes(asset.name),
				signService.getAssetDescriptionBytes(asset.description),
				signService.getAssetQuantityBytes(tokensQuantity),
				signService.getAssetDecimalPlacesBytes(asset.decimalPlaces),
				signService.getAssetIsReissuableBytes(asset.reissuable),
				signService.getFeeBytes(asset.fee.toCoins()),
				signService.getTimestampBytes(asset.time)
			);
		}

		this.createAssetIssueTransaction = function (asset, sender) {
			validateService.validateAssetIssue(asset);
			validateService.validateSender(sender);

			asset.time = asset.time || utilityService.getTime();
			asset.reissuable = angular.isDefined(asset.reissuable) ? asset.reissuable : false;
			asset.description = asset.description || '';

			var assetCurrency = Currency.create({
				displayName: asset.name,
				precision: asset.decimalPlaces
			});

			var tokens = new Money(asset.totalTokens, assetCurrency);
			var signatureData = buildCreateAssetSignatureData(asset, tokens.toCoins(), sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				id: buildId(signatureData),
				name: asset.name,
				description: asset.description,
				quantity: tokens.toCoins(),
				decimals: Number(asset.decimalPlaces),
				reissuable: asset.reissuable,
				timestamp: asset.time,
				fee: asset.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};

		function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
			return [].concat(
				signService.getAssetTransferTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAssetIdBytes(transfer.amount.currency.id),
				signService.getFeeAssetIdBytes(transfer.fee.currency.id),
				signService.getTimestampBytes(transfer.time),
				signService.getAmountBytes(transfer.amount.toCoins()),
				signService.getFeeBytes(transfer.fee.toCoins()),
				signService.getRecipientBytes(transfer.recipient),
				signService.getAttachmentBytes(transfer.attachment)
			);
		}

		this.createAssetTransferTransaction = function (transfer, sender) {
			validateService.validateAssetTransfer(transfer);
			validateService.validateSender(sender);

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
			validateService.validateAssetReissue(reissue);
			validateService.validateSender(sender);

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

	AssetService.$inject = ['signService', 'validateService', 'utilityService', 'cryptoService'];

	angular
		.module('waves.core.services')
		.service('assetService', AssetService);
})();

(function () {
	'use strict';

	function AliasRequestService(signService, utilityService, validateService) {
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
			validateService.validateSender(sender);

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

	AliasRequestService.$inject = ['signService', 'utilityService', 'validateService'];

	angular
		.module('waves.core.services')
		.service('aliasRequestService', AliasRequestService);
})();

(function () {
	'use strict';

	function LeasingRequestService(signService, utilityService, validateService) {
		function buildStartLeasingSignatureData (startLeasing, senderPublicKey) {
			return [].concat(
				signService.getStartLeasingTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getRecipientBytes(startLeasing.recipient),
				signService.getAmountBytes(startLeasing.amount.toCoins()),
				signService.getFeeBytes(startLeasing.fee.toCoins()),
				signService.getTimestampBytes(startLeasing.time)
			);
		}

		this.buildStartLeasingRequest = function (startLeasing, sender) {
			validateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			startLeasing.time = startLeasing.time || currentTimeMillis;
			startLeasing.recipient = utilityService.resolveAddressOrAlias(startLeasing.recipient);

			var signatureData = buildStartLeasingSignatureData(startLeasing, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				recipient: startLeasing.recipient,
				amount: startLeasing.amount.toCoins(),
				timestamp: startLeasing.time,
				fee: startLeasing.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};

		function buildCancelLeasingSignatureData (cancelLeasing, senderPublicKey) {
			return [].concat(
				signService.getCancelLeasingTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getFeeBytes(cancelLeasing.fee.toCoins()),
				signService.getTimestampBytes(cancelLeasing.time),
				signService.getTransactionIdBytes(cancelLeasing.startLeasingTransactionId)
			);
		}

		this.buildCancelLeasingRequest = function (cancelLeasing, sender) {
			validateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			cancelLeasing.time = cancelLeasing.time || currentTimeMillis;

			var signatureData = buildCancelLeasingSignatureData(cancelLeasing, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				txId: cancelLeasing.startLeasingTransactionId,
				timestamp: cancelLeasing.time,
				fee: cancelLeasing.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};
	}

	LeasingRequestService.$inject = ['signService', 'utilityService', 'validateService'];

	angular
		.module('waves.core.services')
		.service('leasingRequestService', LeasingRequestService);
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

			var leasingApi = rest.all('leasing').all('broadcast');
			this.leasing = {
				lease: function (signedStartLeasingTransaction) {
					return leasingApi.all('lease').post(signedStartLeasingTransaction);
				},
				cancel: function (signedCancelLeasingTransaction) {
					return leasingApi.all('cancel').post(signedCancelLeasingTransaction);
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

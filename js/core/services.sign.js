var SignService = (function(){
	'use strict';

	// Transaction types

	function getAssetIssueTxTypeBytes() {
		return [Constants.ASSET_ISSUE_TRANSACTION_TYPE];
	}

	function getAssetReissueTxTypeBytes() {
		return [Constants.ASSET_REISSUE_TRANSACTION_TYPE];
	}

	function getAssetTransferTxTypeBytes() {
		return [Constants.ASSET_TRANSFER_TRANSACTION_TYPE];
	}

	function getStartLeasingTxTypeBytes() {
		return [Constants.START_LEASING_TRANSACTION_TYPE];
	}

	function getCancelLeasingTxTypeBytes() {
		return [Constants.CANCEL_LEASING_TRANSACTION_TYPE];
	}

	function getCreateAliasTxTypeBytes() {
		return [Constants.CREATE_ALIAS_TRANSACTION_TYPE];
	}

	// Keys

	function getPublicKeyBytes(publicKey) {
		return Utility.base58StringToByteArray(publicKey);
	}

	function getPrivateKeyBytes(privateKey) {
		return Base58.decode(privateKey);
	}

	// Data fields

	function getNetworkBytes() {
		return [Utility.getNetworkIdByte()];
	}

	function getTransactionIdBytes(tx) {
		return Utility.base58StringToByteArray(tx);
	}

	function getRecipientBytes(recipient) {
		if (recipient.slice(0, 6) === 'alias:') {
			return [].concat(
				[Constants.ALIAS_VERSION],
				[Utility.getNetworkIdByte()],
				Utility.stringToByteArrayWithSize(recipient.slice(8)) // Remove leading 'asset:W:'
			);
		} else {
			return Utility.base58StringToByteArray(recipient);
		}
	}

	function getAssetIdBytes(assetId, mandatory) {
		if (mandatory) {
			return Utility.base58StringToByteArray(assetId);
		} else {
			return assetId ? [1].concat(Utility.base58StringToByteArray(assetId)) : [0];
		}
	}

	function getAssetNameBytes(assetName) {
		return Utility.stringToByteArrayWithSize(assetName);
	}

	function getAssetDescriptionBytes(assetDescription) {
		return Utility.stringToByteArrayWithSize(assetDescription);
	}

	function getAssetQuantityBytes(assetQuantity) {
		return Utility.longToByteArray(assetQuantity);
	}

	function getAssetDecimalPlacesBytes(assetDecimalPlaces) {
		return [assetDecimalPlaces];
	}

	function getAssetIsReissuableBytes(assetIsReissuable) {
		return Utility.booleanToBytes(assetIsReissuable);
	}

	function getAmountBytes(amount) {
		return Utility.longToByteArray(amount);
	}

	function getFeeAssetIdBytes(feeAssetId) {
		return getAssetIdBytes(feeAssetId);
	}

	function getFeeBytes(fee) {
		return Utility.longToByteArray(fee);
	}

	function getTimestampBytes(timestamp) {
		return Utility.longToByteArray(timestamp);
	}

	function getAttachmentBytes(attachment) {
		return Utility.byteArrayWithSize(attachment);
	}

	function getAliasBytes(alias) {
		return Utility.byteArrayWithSize([].concat(
			[Constants.ALIAS_VERSION],
			[Utility.getNetworkIdByte()],
			Utility.stringToByteArrayWithSize(alias)
		));
	}

	function getOrderTypeBytes(orderType) {
		return Utility.booleanToBytes(orderType);
	}

	function getOrderIdBytes(orderId) {
		return Utility.base58StringToByteArray(orderId);
	}

	// Signatures

	function buildSignature(bytes, privateKey) {
		var privateKeyBytes = getPrivateKeyBytes(privateKey);
		return CryptoService.nonDeterministicSign(privateKeyBytes, bytes);
	}

	return {
		getAssetIssueTxTypeBytes: getAssetIssueTxTypeBytes,
		getAssetReissueTxTypeBytes: getAssetReissueTxTypeBytes,
		getAssetTransferTxTypeBytes: getAssetTransferTxTypeBytes,
		getStartLeasingTxTypeBytes: getStartLeasingTxTypeBytes,
		getCancelLeasingTxTypeBytes: getCancelLeasingTxTypeBytes,
		getCreateAliasTxTypeBytes: getCreateAliasTxTypeBytes,
		getPublicKeyBytes: getPublicKeyBytes,
		getPrivateKeyBytes: getPrivateKeyBytes,
		getNetworkBytes: getNetworkBytes,
		getTransactionIdBytes: getTransactionIdBytes,
		getRecipientBytes: getRecipientBytes,
		getAssetIdBytes: getAssetIdBytes,
		getAssetNameBytes: getAssetNameBytes,
		getAssetDescriptionBytes: getAssetDescriptionBytes,
		getAssetQuantityBytes: getAssetQuantityBytes,
		getAssetDecimalPlacesBytes: getAssetDecimalPlacesBytes,
		getAssetIsReissuableBytes: getAssetIsReissuableBytes,
		getAmountBytes: getAmountBytes,
		getFeeAssetIdBytes: getFeeAssetIdBytes,
		getFeeBytes: getFeeBytes,
		getTimestampBytes: getTimestampBytes,
		getAttachmentBytes: getAttachmentBytes,
		getAliasBytes: getAliasBytes,
		getOrderTypeBytes: getOrderTypeBytes,
		getOrderIdBytes: getOrderIdBytes,
		buildSignature: buildSignature
	}
})();


(function () {
	'use strict';

	function SignService1() {
		var self = this;

		// Transaction types

		self.getAssetIssueTxTypeBytes = function () {
			return SignService.getAssetIssueTxTypeBytes();
		};

		self.getAssetReissueTxTypeBytes = function () {
			return SignService.getAssetReissueTxTypeBytes();
		};

		self.getAssetTransferTxTypeBytes = function () {
			return SignService.getAssetTransferTxTypeBytes();
		};

		self.getStartLeasingTxTypeBytes = function () {
			return SignService.getStartLeasingTxTypeBytes();
		};

		self.getCancelLeasingTxTypeBytes = function () {
			return SignService.getCancelLeasingTxTypeBytes();
		};

		self.getCreateAliasTxTypeBytes = function () {
			return SignService.getCreateAliasTxTypeBytes();
		};

		// Keys

		self.getPublicKeyBytes = function (publicKey) {
			return SignService.getPublicKeyBytes(publicKey);
		};

		self.getPrivateKeyBytes = function (privateKey) {
			return SignService.getPrivateKeyBytes(privateKey);
		};

		// Data fields

		self.getNetworkBytes = function () {
			return SignService.getNetworkBytes();
		};

		self.getTransactionIdBytes = function (tx) {
			return SignService.getTransactionIdBytes(tx);
		};

		self.getRecipientBytes = function (recipient) {
			return SignService.getRecipientBytes(recipient);
		};

		self.getAssetIdBytes = function (assetId, mandatory) {
			return SignService.getAssetIdBytes(assetId, mandatory);
		};

		self.getAssetNameBytes = function (assetName) {
			return SignService.getAssetNameBytes(assetName);
		};

		self.getAssetDescriptionBytes = function (assetDescription) {
			return SignService.getAssetDescriptionBytes(assetDescription);
		};

		self.getAssetQuantityBytes = function (assetQuantity) {
			return SignService.getAssetQuantityBytes(assetQuantity);
		};

		self.getAssetDecimalPlacesBytes = function (assetDecimalPlaces) {
			return SignService.getAssetDecimalPlacesBytes(assetDecimalPlaces);
		};

		self.getAssetIsReissuableBytes = function (assetIsReissuable) {
			return SignService.getAssetIsReissuableBytes(assetIsReissuable);
		};

		self.getAmountBytes = function (amount) {
			return SignService.getAmountBytes(amount);
		};

		self.getFeeAssetIdBytes = function (feeAssetId) {
			return SignService.getFeeAssetIdBytes(feeAssetId);
		};

		self.getFeeBytes = function (fee) {
			return SignService.getFeeBytes(fee);
		};

		self.getTimestampBytes = function (timestamp) {
			return SignService.getTimestampBytes(timestamp);
		};

		self.getAttachmentBytes = function (attachment) {
			return SignService.getAttachmentBytes(attachment);
		};

		self.getAliasBytes = function (alias) {
			return SignService.getAliasBytes(alias);
		};

		self.getOrderTypeBytes = function (orderType) {
			return SignService.getOrderTypeBytes(orderType);
		};

		self.getOrderIdBytes = function (orderId) {
			return SignService.getOrderIdBytes(orderId);
		};

		// Signatures

		self.buildSignature = function (bytes, privateKey) {
			return SignService.buildSignature(bytes, privateKey);
		};
	}

	angular
		.module('waves.core.services')
		.service('signService', SignService1);
})();

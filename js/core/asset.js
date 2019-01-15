var AssetService = (function(){
	'use strict';

	function buildCreateAssetReissueSignatureData(reissue, senderPublicKey) {
		return [].concat(
			SignService.getAssetReissueTxTypeBytes(),
			SignService.getPublicKeyBytes(senderPublicKey),
			SignService.getAssetIdBytes(reissue.totalTokens.currency.id, true),
			SignService.getAssetQuantityBytes(reissue.totalTokens.toCoins()),
			SignService.getAssetIsReissuableBytes(reissue.reissuable),
			SignService.getFeeBytes(reissue.fee.toCoins()),
			SignService.getTimestampBytes(reissue.time)
		);
	}

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

	function createAssetReissueTransaction(reissue, sender) {
		AssetService.validateAssetReissue(reissue);
		ValidateService.validateSender(sender);

		reissue.reissuable = angular.isDefined(reissue.reissuable) ? reissue.reissuable : false;
		reissue.time = reissue.time || Utility.getTime();

		var signatureData = buildCreateAssetReissueSignatureData(reissue, sender.publicKey);
		var signature = SignService.buildSignature(signatureData, sender.privateKey);

		return {
			id: buildId(signatureData),
			assetId: reissue.totalTokens.currency.id,
			quantity: reissue.totalTokens.toCoins(),
			reissuable: reissue.reissuable,
			timestamp: reissue.time,
			fee: reissue.fee.toCoins(),
			senderPublicKey: sender.publicKey,
			signature: signature
		}
	}

	function createAssetTransferTransaction(transfer, sender) {
		AssetService.validateAssetTransfer(transfer);
		ValidateService.validateSender(sender);

		transfer.time = transfer.time || Utility.getTime();
		transfer.attachment = transfer.attachment || [];
		transfer.recipient = Utility.resolveAddressOrAlias(transfer.recipient);

		var signatureData = buildCreateAssetTransferSignatureData(transfer, sender.publicKey);
		var signature = SignService.buildSignature(signatureData, sender.privateKey);

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
			attachment: Base58.encode(transfer.attachment)
		}
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
		createAssetReissueTransaction: createAssetReissueTransaction,
		createAssetTransferTransaction: createAssetTransferTransaction,
		validateAssetReissue: validateAssetReissue,
		validateAssetTransfer: validateAssetTransfer
	}
})();

(function () {
	'use strict';

	function AssetService1() {
		this.createAssetTransferTransaction = function (transfer, sender) {
			return AssetService.createAssetTransferTransaction(transfer, sender);
		};

		this.createAssetReissueTransaction = function (reissue, sender) {
			return AssetService.createAssetReissueTransaction(reissue, sender);
		};
	}

	angular
		.module('waves.core.services')
		.service('assetService', AssetService1);
})();

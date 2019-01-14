var Tokens = (function(){
	'use strict';

	var ASSET_DESCRIPTION_MAX = 1000;
	var ASSET_NAME_MIN = 4;
	if (isMir()) { ASSET_NAME_MIN = 1; }
	var ASSET_NAME_MAX = 16;
	var TOKEN_DECIMALS_MAX = 8;

	function assetCreate(sender, notificationService) {
		var baseBalance = $('#create-asset-baseBalance')[0].innerText;
		var assetName = $('#assetName')[0].value;
		var displayName = $('#assetDisplayName')[0].value;
		var totalTokens = $('#assetTotalTokens')[0].value;
		var description = $('#assetDescription')[0].value;
		var checkedDep = $('#project-asset-type-dep')[0].checked;
		var checkedPie = $('#project-asset-type-pie')[0].checked;
		if (checkedDep && checkedPie) {
			notificationService.error('Error 1001');
			return;
		}
		if (!checkedDep && !checkedPie) {
			notificationService.error('Error 1002');
			return;
		}

		var assetFee = getAssetCreateFeeByLength(assetName.length);
		if (assetFee > baseBalance) {
			notificationService.error('Not enough funds for the issue transaction fee');
			return;
		}

		var decimalPlaces = Number(8);
		var maxTokens = Math.floor(Constants.JAVA_MAX_LONG / Math.pow(10, decimalPlaces));
		if (totalTokens > maxTokens) {
			notificationService.error('Total issued tokens amount must be less than ' + maxTokens);
			return;
		}

		if (displayName.length < 1) {
			displayName = assetName;
		}

		var asset = {
			name: assetName,
			displayName: displayName,
			description: description,
			totalTokens: totalTokens,
			decimalPlaces: decimalPlaces,
			reissuable: checkedDep,
			fee: new Money(assetFee, Currency.BASE)
		};

		$('#assetConfirmName')[0].innerText = assetName;
		$('#assetConfirmTotalTokens')[0].innerText = totalTokens;
		$('#assetConfirmReissuable')[0].innerText = checkedDep ? 'RE-ISSUABLE' : 'NON RE-ISSUABLE';
		$('#assetConfirmFee')[0].innerText = asset.fee;

		return createAssetIssueTransaction(asset, sender);
	}

	function AssetTotalTokensOnKeyPress(){
		var decimalPlaces = Number(8);
		var totalTokens = Number($('#assetTotalTokens')[0].value);
		var maxTokens = Math.floor(Constants.JAVA_MAX_LONG / Math.pow(10, decimalPlaces));
		if (totalTokens > maxTokens) {
			$('#create-asset-hint3')[0].innerText = 'Total issued tokens amount must be less than ' + maxTokens;
			return;
		}
		var s = '0'.repeat(decimalPlaces);
		$('#create-asset-hint3')[0].innerText = 'MAX: '+maxTokens+'.'+s;
	}

	function buildCreateAssetSignatureData(asset, tokensQuantity, senderPublicKey) {
		return [].concat(
			SignService.getAssetIssueTxTypeBytes(),
			SignService.getPublicKeyBytes(senderPublicKey),
			SignService.getAssetNameBytes(asset.name),
			SignService.getAssetDescriptionBytes(asset.description),
			SignService.getAssetQuantityBytes(tokensQuantity),
			SignService.getAssetDecimalPlacesBytes(asset.decimalPlaces),
			SignService.getAssetIsReissuableBytes(asset.reissuable),
			SignService.getFeeBytes(asset.fee.toCoins()),
			SignService.getTimestampBytes(asset.time)
		);
	}

	function createAssetIssueTransaction(asset, sender) {
		validateAssetIssue(asset);
		validateSender(sender);

		asset.time = asset.time || Utility.getTime();
		asset.reissuable = angular.isDefined(asset.reissuable) ? asset.reissuable : false;
		asset.description = asset.description || '';

		var assetCurrency = Currency.create({
			displayName: asset.name,
			precision: asset.decimalPlaces
		});

		var tokens = new Money(asset.totalTokens, assetCurrency);
		var signatureData = buildCreateAssetSignatureData(asset, tokens.toCoins(), sender.publicKey);
		var signature = SignService.buildSignature(signatureData, sender.privateKey);

		return {
			id: AssetService.buildId(signatureData),
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
	}

	function getAssetCreateFeeByLength(len){
		if (len == 1) {
			return 1000000;
		} else if (len == 2) {
			return 100000;
		} else if (len == 3) {
			return 10000;
		} else if (len == 4) {
			return 1000;
		} else if (len == 5) {
			return 100;
		} else if (len == 6) {
			return 10;
		} else if (len == 7) {
			return 1;
		}
		return 0.1;
	}

	function refreshAssetFee() {
		var assetCreateFee = $('#assetCreateFee')[0];
		var assetFeeValue = assetCreateFee.innerText;
		var baseBalanceValue = $('#create-asset-baseBalance')[0].innerText;
		if (assetFeeValue > baseBalanceValue) {
			$('#create-asset-hint1')[0].innerText = 'Not enough funds for the issue transaction fee';
		} else {
			$('#create-asset-hint1')[0].innerText = '';
		}

		var evl = $('#assetName')[0].value.length;
		if (evl > 0) {
			if (evl < ASSET_NAME_MIN) {
				assetCreateFee.innerText = '-';
				$('#create-asset-hint2')[0].innerText = 'Asset name is too short. Please give your asset a longer name';
			} else if (evl > ASSET_NAME_MAX ) {
				assetCreateFee.innerText = '-';
				$('#create-asset-hint2')[0].innerText = 'Asset name is too short. Please give your asset a longer name';
			} else {
				$('#create-asset-hint2')[0].innerText = '';
				if (isMir()) {
					if (evl == 1) {
						assetCreateFee.innerText = '1 000 000';
					} else if (evl == 2) {
						assetCreateFee.innerText = '100 000';
					} else if (evl == 3) {
						assetCreateFee.innerText = '10 000';
					} else if (evl == 4) {
						assetCreateFee.innerText = '1000';
					} else if (evl == 5) {
						assetCreateFee.innerText = '100';
					} else if (evl == 6) {
						assetCreateFee.innerText = '10';
					} else if (evl == 7) {
						assetCreateFee.innerText = '1';
					} else if (evl > 7) {
						assetCreateFee.innerText = '0.1';
					}
				} else {
					assetCreateFee.innerText = 1;
				}
			}
		}
	}

	function validateSender(sender) {
		if (!sender) {
			throw new Error('Sender hasn\'t been set');
		}

		if (!sender.publicKey) {
			throw new Error('Sender account public key hasn\'t been set');
		}

		if (!sender.privateKey) {
			throw new Error('Sender account private key hasn\'t been set');
		}
	}

	function validateAssetIssue(issue) {
		if (angular.isUndefined(issue.name)) {
			throw new Error('Asset name hasn\'t been set');
		}

		if (angular.isUndefined(issue.totalTokens)) {
			throw new Error('Total tokens amount hasn\'t been set');
		}

		if (angular.isUndefined(issue.decimalPlaces)) {
			throw new Error('Token decimal places amount hasn\'t been set');
		}

		if (issue.fee.currency !== Currency.BASE) {
			throw new Error('Transaction fee must be nominated in '+Currency.BASE.displayName);
		}
	}

	return {
		ASSET_DESCRIPTION_MAX: ASSET_DESCRIPTION_MAX,
		ASSET_NAME_MAX: ASSET_NAME_MAX,
		ASSET_NAME_MIN: ASSET_NAME_MIN,
		TOKEN_DECIMALS_MAX: TOKEN_DECIMALS_MAX,
		assetCreate: assetCreate,
		AssetTotalTokensOnKeyPress: AssetTotalTokensOnKeyPress,
		createAssetIssueTransaction: createAssetIssueTransaction,
		refreshAssetFee: refreshAssetFee,
		validateSender: validateSender,
		validateAssetIssue: validateAssetIssue
	};
})();

(function() {
	'use strict';

	angular.module('app.tokens', ['app.shared']);
})();

(function () {
	'use strict';

	function TokenCreateController($scope, $interval, applicationContext, assetService, dialogService, apiService, notificationService, formattingService, transactionBroadcast) {
		var refreshPromise;
		var refreshDelay = 15 * 1000;
		var transaction;
		var ctrl = this;

		$scope.$on('$destroy', function () {
			if (angular.isDefined(refreshPromise)) {
				$interval.cancel(refreshPromise);
				refreshPromise = undefined;
			}
		});

		ctrl.baseBalance = new Money(0, Currency.BASE);
		ctrl.issuanceValidationOptions = {
			rules: {
				assetName: {
					required: true,
					minbytelength: Tokens.ASSET_NAME_MIN,
					maxbytelength: Tokens.ASSET_NAME_MAX
				},
				assetDescription: {
					maxbytelength: Tokens.ASSET_DESCRIPTION_MAX
				},
				assetTotalTokens: {
					required: true,
					min: 0
				},
				assetTokenDecimalPlaces: {
					required: true,
					min: 0,
					max: Tokens.TOKEN_DECIMALS_MAX
				}
			},
			messages: {
				assetName: {
					required: 'Asset name is required',
					minbytelength: 'Asset name is too short. Please give your asset a longer name',
					maxbytelength: 'Asset name is too long. Please give your asset a shorter name'
				},
				assetDescription: {
					maxbytelength: 'Maximum length of asset description exceeded. Please make a shorter description'
				},
				assetTotalTokens: {
					required: 'Total amount of issued tokens in required',
					min: 'Total issued tokens amount must be greater than or equal to zero'
				},
				assetTokenDecimalPlaces: {
					required: 'Number of token decimal places is required',
					min: 'Number of token decimal places must be greater or equal to zero',
					max: 'Number of token decimal places must be less than or equal to ' + Tokens.TOKEN_DECIMALS_MAX
				}
			}
		};
		ctrl.asset = {
		};
		ctrl.confirm = {};
		ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.issue,
			function (transaction, response) {
				resetForm();

				ApplicationContext.cache.putAsset(response);

				var displayMessage = 'Asset ' + ctrl.confirm.name + ' has been issued!<br/>' +
					'Total tokens amount: ' + ctrl.confirm.totalTokens + '<br/>' +
					'Date: ' + formattingService.formatTimestamp(transaction.timestamp);
				notificationService.notice(displayMessage);
			});
		ctrl.broadcastIssueTransaction = broadcastIssueTransaction;
		ctrl.assetIssueConfirmation = assetIssueConfirmation;
		ctrl.resetForm = resetForm;

		loadDataFromBackend();
		resetForm();

		function assetIssueConfirmation(form, event) {
			event.preventDefault();
			if (!form.validate()) return;
			var sender = {
				publicKey: ApplicationContext.account.keyPair.public,
				privateKey: ApplicationContext.account.keyPair.private
			};
			var t = Tokens.assetCreate(sender, notificationService);
			if (!t) return;
			ctrl.broadcast.setTransaction(t);
			dialogService.open('#create-asset-confirmation');
		}

		function broadcastIssueTransaction() {
			ctrl.broadcast.broadcast();
		}

		function resetForm() {
			ctrl.asset.name = '';
			ctrl.asset.description = '';
			ctrl.asset.totalTokens = '0';
			ctrl.asset.decimalPlaces = '0';
			ctrl.asset.reissuable = false;
		}

		function loadDataFromBackend() {
			refreshBalance();

			refreshPromise = $interval(function() {
				refreshBalance();
			}, refreshDelay);
		}

		function refreshBalance() {
			apiService.address.balance(ApplicationContext.account.address)
				.then(function (response) {
					ctrl.baseBalance = Money.fromCoins(response.balance, Currency.BASE);
					$('#create-asset-baseBalance')[0].innerText = ctrl.baseBalance.formatAmount(true, false);
					$('#create-asset-baseShortName')[0].innerText = Currency.BASE.shortName;
				});
		}
	}

	TokenCreateController.$inject = ['$scope', '$interval', 'applicationContext',
			'assetService', 'dialogService', 'apiService', 'notificationService',
			'formattingService', 'transactionBroadcast'];

	angular
		.module('app.tokens')
		.controller('tokenCreateController', TokenCreateController);
})();

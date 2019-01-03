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

var Tokens = (function(){
	'use strict';

	var ASSET_DESCRIPTION_MAX = 1000;
	var ASSET_NAME_MIN = 4;
	if (isMir()) { ASSET_NAME_MIN = 1; }
	var ASSET_NAME_MAX = 16;
	var TOKEN_DECIMALS_MAX = 8;
	var FIXED_ISSUE_FEE = new Money(1, Currency.BASE);

	function appTokensAssetNameOnBlur() {
		var assetCreateFee = $('#assetCreateFee')[0];
		var assetFeeValue = assetCreateFee.innerText;
		var baseBalanceValue = $('#create-asset-baseBalance')[0].innerText;
		if (assetFeeValue > baseBalanceValue) {
			$('#create-asset-hint1')[0].innerText = 'Not enough funds for the issue transaction fee';
			return;
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
					if (evl = 1) {
						assetCreateFee.innerText = '1 000 000'
					} else if (evl = 2) {
						assetCreateFee.innerText = '100 000'
					} else if (evl = 3) {
						assetCreateFee.innerText = '10 000'
					} else if (evl = 4) {
						assetCreateFee.innerText = '1000'
					} else if (evl = 5) {
						assetCreateFee.innerText = '100'
					} else if (evl = 6) {
						assetCreateFee.innerText = '10'
					} else if (evl > 6) {
						assetCreateFee.innerText = '1'
					}
				} else {
					assetCreateFee.innerText = 1;
				}
			}
		}
	}

	return {
		ASSET_DESCRIPTION_MAX: ASSET_DESCRIPTION_MAX,
		ASSET_NAME_MAX: ASSET_NAME_MAX,
		ASSET_NAME_MIN: ASSET_NAME_MIN,
		TOKEN_DECIMALS_MAX: TOKEN_DECIMALS_MAX,
		FIXED_ISSUE_FEE: FIXED_ISSUE_FEE,
		appTokensAssetNameOnBlur: appTokensAssetNameOnBlur
	};
})();

(function() {
	'use strict';

	angular.module('app.tokens', ['app.shared']);
})();

(function () {
	'use strict';

	function TokenCreateController($scope, $interval, constants, applicationContext, assetService, dialogService, apiService, notificationService, formattingService, transactionBroadcast) {
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
			/*fee: Tokens.FIXED_ISSUE_FEE*/
		};
		ctrl.confirm = {};
		ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.issue,
			function (transaction, response) {
				resetForm();

				applicationContext.cache.putAsset(response);

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

			if (!form.validate()) {
				return;
			}

			/*
			var ctrlAssetFee = $('#assetCreateFee')[0].innerText;
			var ctrlBaseBalance = ctrl.baseBalance;
			if (ctrlAssetFee > ctrl.baseBalance) {
				notificationService.error('Not enough funds for the issue transaction fee');
				return;
			}
			*/

			var decimalPlaces = Number(ctrl.asset.decimalPlaces);
			var maxTokens = Math.floor(constants.JAVA_MAX_LONG / Math.pow(10, decimalPlaces));
			if (ctrl.asset.totalTokens > maxTokens) {
				notificationService.error('Total issued tokens amount must be less than ' + maxTokens);
				return;
			}

			var asset = {
				name: ctrl.asset.name,
				description: ctrl.asset.description,
				totalTokens: ctrl.asset.totalTokens,
				decimalPlaces: Number(ctrl.asset.decimalPlaces),
				reissuable: ctrl.asset.reissuable/*,
				fee: ctrl.asset.fee*/
			};

			var sender = {
				publicKey: applicationContext.account.keyPair.public,
				privateKey: applicationContext.account.keyPair.private
			};

			ctrl.confirm.name = ctrl.asset.name;
			ctrl.confirm.totalTokens = ctrl.asset.totalTokens;
			ctrl.confirm.reissuable = ctrl.asset.reissuable ? 'RE-ISSUABLE' : 'NON RE-ISSUABLE';

			ctrl.broadcast.setTransaction(assetService.createAssetIssueTransaction(asset, sender));

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
			apiService.address.balance(applicationContext.account.address)
				.then(function (response) {
					ctrl.baseBalance = Money.fromCoins(response.balance, Currency.BASE);
					$('#create-asset-baseBalance')[0].innerText = ctrl.baseBalance.formatAmount(true, false);
					$('#create-asset-baseShortName')[0].innerText = Currency.BASE.shortName;
				});
		}
	}

	TokenCreateController.$inject = ['$scope', '$interval', 'constants.ui', 'applicationContext',
			'assetService', 'dialogService', 'apiService', 'notificationService',
			'formattingService', 'transactionBroadcast'];

	angular
		.module('app.tokens')
		.controller('tokenCreateController', TokenCreateController);
})();

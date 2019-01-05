(function() {
	'use strict';

	angular.module('app.wallet', ['app.shared'])
		.constant('wallet.events', {
			WALLET_SEND: 'wallet-send',
			WALLET_WITHDRAW: 'wallet-withdraw',
			WALLET_DEPOSIT: 'wallet-deposit',
			WALLET_CARD_DEPOSIT: 'wallet-card-deposit'
		});
})();

(function () {
	'use strict';

	function WalletBoxController() {
		var ctrl = this;

		var mapping = {};
		if (isMir()) {
			mapping[Currency.MIR.displayName] = {
				image: 'wB-bg-MIR-purple.svg',
				displayName: Currency.MIR.displayName
			};
			mapping[Currency.LBR.displayName] = {
				image: 'wB-bg-LBR.svg',
				displayName: Currency.LBR.displayName
			};
		} else {
			mapping[Currency.WAVES.displayName] = {
				image: 'wB-bg-WAV.svg',
				displayName: Currency.WAVES.displayName
			};
			mapping[Currency.BTC.displayName] = {
				image: 'wB-bg-BTC.svg',
				displayName: Currency.BTC.displayName
			};
			mapping[Currency.USD.displayName] = {
				image: 'wB-bg-USD.svg',
				displayName: Currency.USD.displayName
			};
			mapping[Currency.EUR.displayName] = {
				image: 'wB-bg-EUR.svg',
				displayName: Currency.EUR.displayName
			};
			mapping[Currency.DEIP.displayName] = {
				image: 'wB-bg-DEIP.svg',
				displayName: Currency.DEIP.displayName
			};
			mapping[Currency.LIBRE.displayName] = {
				image: 'wB-bg-LIBRE.svg',
				displayName: Currency.LIBRE.displayName
			};
			mapping[Currency.MIR.displayName] = {
				image: 'wB-bg-MIR-blue.svg',
				displayName: Currency.MIR.displayName
			};
		}

		ctrl.$onChanges = function (changesObject) {
			if (changesObject.balance) {
				var balance = changesObject.balance.currentValue;
				ctrl.integerBalance = balance.formatIntegerPart();
				ctrl.fractionBalance = balance.formatFractionPart();
			}
		};
		ctrl.$onInit = function () {
			ctrl.image = mapping[ctrl.balance.currency.displayName].image;
			ctrl.displayName = mapping[ctrl.balance.currency.displayName].displayName;
		};
	}

	WalletBoxController.$inject = [];

	angular
		.module('app.wallet')
		.component('walletBox', {
			controller: WalletBoxController,
			bindings: {
				balance: '<',
				onSend: '&',
				onWithdraw: '&',
				onDeposit: '&',
				detailsAvailable: '<?'
			},
			templateUrl: 'wallet/box.component'
		});
})();

(function () {
	'use strict';

	var TRANSACTIONS_TO_LOAD = 100;

	function WalletListController($scope, $interval, events, applicationContext, apiService, transactionLoadingService, dialogService) {
		var ctrl = this;
		var refreshPromise;
		var refreshDelay = 10 * 1000;

		function sendCommandEvent(event, currency) {
			var assetWallet = findWalletByCurrency(currency);
			var baseWallet = findWalletByCurrency(Currency.BASE);

			$scope.$broadcast(event, {
				assetBalance: assetWallet.balance,
				baseBalance: baseWallet.balance
			});
		}

		function findWalletByCurrency(currency) {
			return _.find(ctrl.wallets, function (w) {
				return w.balance.currency === currency;
			});
		}

		if (isMir()) {
			var defaultWallets = [
				{
					balance: new Money(0, Currency.MIR),
					depositWith: Currency.LBR
				},
				{
					balance: new Money(0, Currency.LBR),
					depositWith: Currency.LBR
				}
			];
		} else {
			var defaultWallets = [
				{
					balance: new Money(0, Currency.WAVES),
					depositWith: Currency.BTC
				},
				{
					balance: new Money(0, Currency.MIR),
					depositWith: Currency.BTC
				},
				{
					balance: new Money(0, Currency.BTC),
					depositWith: Currency.BTC
				}
			];
		}

		ctrl.transactions = [];
		ctrl.send = send;
		ctrl.withdraw = withdraw;
		ctrl.deposit = deposit;
		ctrl.depositFromCard = depositFromCard;

		$scope.$on('$destroy', function () {
			if (angular.isDefined(refreshPromise)) {
				$interval.cancel(refreshPromise);
				refreshPromise = undefined;
			}
		});

		function send (wallet) {
			sendCommandEvent(events.WALLET_SEND, wallet.balance.currency);
		}

		function withdraw (wallet) {
			var id = wallet.balance.currency.id,
				type;

			if (isMir()) {
				if (id === Currency.BASE.id) {
					type = 'crypto';
				} else if (id === Currency.LBR.id) {
					type = 'crypto';
				} else {
					throw new Error('Add an option here!');
				}
			} else {
				if (id === Currency.BASE.id) {
					type = 'crypto';
				} else if (id === Currency.BTC.id) {
					type = 'crypto';
				} else if (id === Currency.EUR.id || id === Currency.USD.id) {
					type = 'fiat';
				} else if (id === Currency.DEIP.id || id === Currency.LIBRE.id || id === Currency.MIR.id) {
					dialogService.open('#feat-not-active');
				} else {
					throw new Error('Add an option here!');
				}
			}

			sendCommandEvent(events.WALLET_WITHDRAW + type, wallet.balance.currency);
		}

		function deposit (wallet) {
			if (wallet.balance.currency === Currency.BASE) {
				depositFromCard(wallet.balance.currency);
			} else if (wallet.balance.currency === Currency.DEIP || wallet.balance.currency === Currency.LIBRE || wallet.balance.currency === Currency.MIR) {
				dialogService.open('#feat-not-active');
			} else {
				$scope.$broadcast(events.WALLET_DEPOSIT + wallet.balance.currency.id, {
					assetBalance: wallet.balance,
					depositWith: wallet.depositWith
				});
			}
		}

		function depositFromCard (currency) {
			dialogService.close();

			$scope.$broadcast(events.WALLET_CARD_DEPOSIT, {
				currency: currency
			});
		}

		function loadDataFromBackend() {
			refreshWallets();
			refreshTransactions();

			refreshPromise = $interval(function() {
				refreshWallets();
				refreshTransactions();
			}, refreshDelay);
		}

		function refreshWalletList() {
			ctrl.wallets = defaultWallets;
			loadDataFromBackend();
			if ($scope.isTestnet()) {
				Currency.patchCurrencyIdsForTestnet();
			}
		}

		function refreshWallets() {
			apiService.address.balance(applicationContext.account.address)
				.then(function (response) {
					var baseWallet = findWalletByCurrency(Currency.BASE);
					baseWallet.balance = Money.fromCoins(response.balance, Currency.BASE);
				});

			apiService.assets.balance(applicationContext.account.address).then(function (response) {
				_.forEach(response.balances, function (assetBalance) {
					var id = assetBalance.assetId;

					// adding asset details to cache
					applicationContext.cache.putAsset(assetBalance.issueTransaction);
					applicationContext.cache.updateAsset(id, assetBalance.balance,
						assetBalance.reissuable, assetBalance.quantity);
				});

				_.forEach(ctrl.wallets, function (wallet) {
					var asset = applicationContext.cache.assets[wallet.balance.currency.id];
					if (asset) {
						wallet.balance = asset.balance;
					}
				});
			});
		}

		function refreshTransactions() {
			var txArray;
			transactionLoadingService.loadTransactions(applicationContext.account, TRANSACTIONS_TO_LOAD)
				.then(function (transactions) {
					txArray = transactions;

					return transactionLoadingService.refreshAssetCache(applicationContext.cache, transactions);
				})
				.then(function () {
					ctrl.transactions = txArray;
				});
		}

		refreshWalletList();
	}

	WalletListController.$inject = ['$scope', '$interval', 'wallet.events', 'applicationContext', 'apiService', 'transactionLoadingService', 'dialogService'];

	angular
		.module('app.wallet')
		.controller('walletListController', WalletListController);
})();

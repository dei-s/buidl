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

// use app.ui (ApplicationContext)
(function () {
	'use strict';

	function WalletBoxController() {
		var ctrl = this;

		var mapping = {};
		if (isMir()) {
			mapping[Currency.MIR.displayName] = 'wB-bg-MIR-purple.svg';
			mapping[Currency.LBR.displayName] = 'wB-bg-LBR.svg';
		} else {
			mapping[Currency.WAVES.displayName] = 'wB-bg-WAV.svg';
			mapping[Currency.BTC.displayName] = 'wB-bg-BTC.svg';
			mapping[Currency.USD.displayName] = 'wB-bg-USD.svg';
			mapping[Currency.EUR.displayName] = 'wB-bg-EUR.svg';
			mapping[Currency.DEIP.displayName] = 'wB-bg-DEIP.svg';
			mapping[Currency.LIBRE.displayName] = 'wB-bg-LIBRE.svg';
			mapping[Currency.MIR.displayName] = 'wB-bg-MIR-blue.svg';
		}

		ctrl.$onChanges = function (changesObject) {
			if (changesObject.balance) {
				var balance = changesObject.balance.currentValue;
				ctrl.integerBalance = balance.formatIntegerPart();
				ctrl.fractionBalance = balance.formatFractionPart();
			}
		};
		ctrl.$onInit = function () {
			if (mapping[ctrl.balance.currency.displayName]) {
				ctrl.image = mapping[ctrl.balance.currency.displayName];
			} else {
				ctrl.image = 'wB-bg-TEST.svg';
			}
			ctrl.displayName = ctrl.balance.currency.displayName;
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
			if (!assetWallet) assetWallet = findFavoritByCurrency(currency);
			var baseWallet = findWalletByCurrency(Currency.BASE);
			$scope.$broadcast(event, {
				assetBalance: assetWallet.balance,
				baseBalance: baseWallet.balance
			});
		}

		function findFavoritByCurrency(currency) {
			return _.find(ctrl.favorits, function (w) {
				return w.balance.currency === currency;
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

		ctrl.deposit = deposit;
		ctrl.depositFromCard = depositFromCard;
		ctrl.messaging = messaging;
		ctrl.send = send;
		ctrl.transactions = [];
		ctrl.voting = voting;
		ctrl.withdraw = withdraw;

		$scope.$on('$destroy', function () {
			if (angular.isDefined(refreshPromise)) {
				$interval.cancel(refreshPromise);
				refreshPromise = undefined;
			}
		});

		function messaging(w){
			console.log('messaging', w);
		}

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
			ctrl.favorits = [];
			if (FavoritService) {
				var favorits = FavoritService.getFavorits();
				if (favorits) {
					favorits.then(function(favorits){
						favorits.forEach(function(f,i){
							if (f.accountAddress == ApplicationContext.account.address) {
								var asset = ApplicationContext.cache.assets[f.assetId];
								ctrl.favorits.push({
									balance: asset.balance,
									depositWith: Currency.LBR,
									displayName: f.displayName,
									fractionBalance: asset.balance.formatFractionPart(),
									image: 'TEST',
									integerBalance: asset.balance.formatIntegerPart()
								});
							}
						});
					});
				}
			}
			loadDataFromBackend();
			if ($scope.isTestnet()) {
				Currency.patchCurrencyIdsForTestnet();
			}
		}

		function refreshWallets() {
			apiService.address.balance(ApplicationContext.account.address).then(function (response) {
				var baseWallet = findWalletByCurrency(Currency.BASE);
				baseWallet.balance = Money.fromCoins(response.balance, Currency.BASE);
			});

			apiService.assets.balance(ApplicationContext.account.address).then(function (response) {
				_.forEach(response.balances, function (assetBalance) {
					var id = assetBalance.assetId;
					// adding asset details to cache
					ApplicationContext.cache.putAsset(assetBalance.issueTransaction);
					ApplicationContext.cache.updateAsset(id, assetBalance.balance,
						assetBalance.reissuable, assetBalance.quantity);
				});

				_.forEach(ctrl.wallets, function (wallet) {
					var asset = ApplicationContext.cache.assets[wallet.balance.currency.id];
					if (asset) {
						wallet.balance = asset.balance;
					}
				});

				ctrl.favorits.forEach(function(wallet){
					var asset = ApplicationContext.cache.assets[wallet.balance.currency.id];
					if (asset) {
						wallet.balance = asset.balance;
						wallet.fractionBalance = asset.balance.formatFractionPart();
						wallet.integerBalance = asset.balance.formatIntegerPart();
					}
				});
			});
		}

		function refreshTransactions() {
			var txArray;
			transactionLoadingService.loadTransactions(ApplicationContext.account, TRANSACTIONS_TO_LOAD)
				.then(function (transactions) {
					txArray = transactions;

					return transactionLoadingService.refreshAssetCache(ApplicationContext.cache, transactions);
				})
				.then(function () {
					ctrl.transactions = txArray;
				});
		}

		function voting(favorit){
			console.log('voting', favorit);
			var timer = setInterval(function(){
				$('#votingTabIcon').children().click();
				clearInterval(timer);
			}, 100);
		}

		refreshWalletList();
	}

	WalletListController.$inject = ['$scope', '$interval', 'wallet.events', 'applicationContext', 'apiService', 'transactionLoadingService', 'dialogService'];

	angular
		.module('app.wallet')
		.controller('walletListController', WalletListController);
})();

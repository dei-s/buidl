(function() {
	'use strict';

	angular.module('app.blocks', ['app.shared']);
})();

(function () {
	'use strict';

	function BlocksController($scope, $interval, apiService, applicationContext) {
		var ctrl = this;
		var refreshPromise;
		var REFRESH_DELAY = 10 * 1000;
		var BLOCKS_DEPTH = 50;

		ctrl.blocks = [];
		ctrl.candidate = {
			block: 0,
			size: 0
		};

		function refreshData() {
			var blockHeight = applicationContext.blockHeight;
			var endBlock = blockHeight;
			var startBlock = Math.max(1, endBlock - BLOCKS_DEPTH);
			apiService.transactions.unconfirmed()
				.then(function (response) {
					ctrl.candidate.block = blockHeight + 1;
					ctrl.candidate.size = response.length;
					return apiService.blocks.list(startBlock, endBlock);
				})
				.then(function (response) {
					ctrl.blocks = response;
				});
		}

		refreshData();

		refreshPromise = $interval(refreshData, REFRESH_DELAY);

		$scope.$on('$destroy', function () {
			if (angular.isDefined(refreshPromise)) {
				$interval.cancel(refreshPromise);
				refreshPromise = undefined;
			}
		});
	}

	BlocksController.$inject = ['$scope', '$interval', 'apiService', 'applicationContext'];

	angular
		.module('app.blocks')
		.controller('blocksController', BlocksController);
})();

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

var Constants = (function(){
	'use strict';
	return {
		/* network */
		ADDRESS_VERSION: 1,
		NETWORK_CODE: DEI_NETWORK_CODE,
		NETWORK_NAME: DEI_NETWORK_NAME,
		INITIAL_NONCE: 0,

		/* address */
		RAW_ADDRESS_LENGTH : 35,
		ADDRESS_PREFIX: '1W',
		MAINNET_ADDRESS_REGEXP: /^[a-zA-Z0-9]{35}$/,

		/* features */
		ALIAS_VERSION: 2,

		/* ui */
		MINIMUM_PAYMENT_AMOUNT : 1e-8,
		MINIMUM_TRANSACTION_FEE : 0.001,
		AMOUNT_DECIMAL_PLACES : 8,
		JAVA_MAX_LONG: 9223372036854775807,
		MAXIMUM_ATTACHMENT_BYTE_SIZE: 140,

		/* transactions */
		PAYMENT_TRANSACTION_TYPE : 2,
		ASSET_ISSUE_TRANSACTION_TYPE: 3,
		ASSET_TRANSFER_TRANSACTION_TYPE: 4,
		ASSET_REISSUE_TRANSACTION_TYPE: 5,
		ASSET_BURN_TRANSACTION_TYPE: 6,
		EXCHANGE_TRANSACTION_TYPE: 7,
		START_LEASING_TRANSACTION_TYPE: 8,
		CANCEL_LEASING_TRANSACTION_TYPE: 9,
		CREATE_ALIAS_TRANSACTION_TYPE: 10,
		MASS_PAYMENT_TRANSACTION_TYPE: 11
	}
})();

(function() {
	'use strict';

	angular
		.module('waves.core.constants', [])
		.constant('constants.network', {
			ADDRESS_VERSION: Constants.ADDRESS_VERSION,
			NETWORK_CODE: Constants.NETWORK_CODE,
			NETWORK_NAME: Constants.NETWORK_NAME,
			INITIAL_NONCE: Constants.INITIAL_NONCE
		});

	angular
		.module('waves.core.constants')
		.constant('constants.address', {
			RAW_ADDRESS_LENGTH: Constants.RAW_ADDRESS_LENGTH,
			ADDRESS_PREFIX: Constants.ADDRESS_PREFIX,
			MAINNET_ADDRESS_REGEXP: Constants.MAINNET_ADDRESS_REGEXP
		});

	angular
		.module('waves.core.constants')
		.constant('constants.features', {
			ALIAS_VERSION: Constants.ALIAS_VERSION
		});

	angular
		.module('waves.core.constants')
		.constant('constants.ui', {
			MINIMUM_PAYMENT_AMOUNT: Constants.MINIMUM_PAYMENT_AMOUNT,
			MINIMUM_TRANSACTION_FEE: Constants.MINIMUM_TRANSACTION_FEE,
			AMOUNT_DECIMAL_PLACES: Constants.AMOUNT_DECIMAL_PLACES,
			JAVA_MAX_LONG: Constants.JAVA_MAX_LONG,
			MAXIMUM_ATTACHMENT_BYTE_SIZE: Constants.MAXIMUM_ATTACHMENT_BYTE_SIZE
		});

	angular
		.module('waves.core.constants')
		.constant('constants.transactions', {
			PAYMENT_TRANSACTION_TYPE: Constants.PAYMENT_TRANSACTION_TYPE,
			ASSET_ISSUE_TRANSACTION_TYPE: Constants.ASSET_ISSUE_TRANSACTION_TYPE,
			ASSET_TRANSFER_TRANSACTION_TYPE: Constants.ASSET_TRANSFER_TRANSACTION_TYPE,
			ASSET_REISSUE_TRANSACTION_TYPE: Constants.ASSET_REISSUE_TRANSACTION_TYPE,
			ASSET_BURN_TRANSACTION_TYPE: Constants.ASSET_BURN_TRANSACTION_TYPE,
			EXCHANGE_TRANSACTION_TYPE: Constants.EXCHANGE_TRANSACTION_TYPE,
			START_LEASING_TRANSACTION_TYPE: Constants.START_LEASING_TRANSACTION_TYPE,
			CANCEL_LEASING_TRANSACTION_TYPE: Constants.CANCEL_LEASING_TRANSACTION_TYPE,
			CREATE_ALIAS_TRANSACTION_TYPE: Constants.CREATE_ALIAS_TRANSACTION_TYPE,
			MASS_PAYMENT_TRANSACTION_TYPE: Constants.MASS_PAYMENT_TRANSACTION_TYPE
		});
})();

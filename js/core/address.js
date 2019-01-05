var Address = (function(){
	'use strict';

	function cleanupOptionalPrefix(displayAddress) {
		if (displayAddress.length <= 30) {
			// Don't change aliases
			return displayAddress;
		}

		var address = displayAddress;
		var prefixLen = Constants.ADDRESS_PREFIX.length;

		if (address.length > Constants.RAW_ADDRESS_LENGTH || address.startsWith(Constants.ADDRESS_PREFIX)) {
			address = address.substr(prefixLen, address.length - prefixLen);
		}

		return address;
	}

	function validateAddress(address) {
		var cleanAddress = cleanupOptionalPrefix(address);
		return Constants.MAINNET_ADDRESS_REGEXP.test(cleanAddress);
	}

	return {
		cleanupOptionalPrefix: cleanupOptionalPrefix,
		validateAddress: validateAddress
	}
})();

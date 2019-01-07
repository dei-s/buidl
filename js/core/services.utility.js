var Utility = (function(){
	'use strict';

	var BASE58_REGEX = new RegExp('^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{0,}$');

	function getNetworkIdByte() {
		return Constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
	}

	// long to big-endian bytes
	function longToByteArray(value) {
		var bytes = new Array(7);
		for (var k = 7; k >= 0; k--) {
			bytes[k] = value & (255);
			value = value / 256;
		}
		return bytes;
	}

	// short to big-endian bytes
	function shortToByteArray(value) {
		return converters.int16ToBytes(value, true);
	}

	function base58StringToByteArray(base58String) {
		var decoded = Base58.decode(base58String);
		var result = [];
		for (var i = 0; i < decoded.length; ++i) {
			result.push(decoded[i] & 0xff);
		}
		return result;
	}

	function stringToByteArrayWithSize(string) {
		var bytes = converters.stringToByteArray(string);
		return byteArrayWithSize(bytes);
	}

	function byteArrayWithSize(byteArray) {
		var result = shortToByteArray(byteArray.length);
		return result.concat(byteArray);
	}

	function booleanToBytes(flag) {
		return flag ? [1] : [0];
	}

	function endsWithWhitespace(value) {
		return /\s+$/g.test(value);
	}

	function getTime() {
		return Date.now();
	}

	function isValidBase58String(input) {
		return Utility.BASE58_REGEX.test(input);
	}

	// Add a prefix in case of alias
	function resolveAddressOrAlias(string) {
		if (string.length <= 30) {
			return 'alias:' + Constants.NETWORK_CODE + ':' + string;
		} else {
			return string;
		}
	}

	return {
		BASE58_REGEX: BASE58_REGEX,
		getNetworkIdByte: getNetworkIdByte,
		longToByteArray: longToByteArray,
		shortToByteArray: shortToByteArray,
		base58StringToByteArray: base58StringToByteArray,
		stringToByteArrayWithSize: stringToByteArrayWithSize,
		byteArrayWithSize: byteArrayWithSize,
		booleanToBytes: booleanToBytes,
		endsWithWhitespace: endsWithWhitespace,
		getTime: getTime,
		isValidBase58String: isValidBase58String,
		resolveAddressOrAlias: resolveAddressOrAlias
	}
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('utilityService', [function () {
			var self = this;

			self.getNetworkIdByte = function () {
				return Utility.getNetworkIdByte();
			};

			self.longToByteArray = function (value) {
				return Utility.longToByteArray(value);
			};

			self.shortToByteArray = function (value) {
				return Utility.shortToByteArray(value);
			};

			self.base58StringToByteArray = function (base58String) {
				return Utility.base58StringToByteArray(base58String);
			};

			self.stringToByteArrayWithSize = function (string) {
				return Utility.stringToByteArrayWithSize(string);
			};

			self.byteArrayWithSize = function (byteArray) {
				return Utility.byteArrayWithSize(byteArray);
			};

			self.booleanToBytes = function (flag) {
				return Utility.booleanToBytes(flag);
			};

			self.endsWithWhitespace = function (value) {
				return Utility.endsWithWhitespace(value);
			};

			self.getTime = function() {
				return Utility.getTime();
			};

			self.isValidBase58String = function (input) {
				return Utility.isValidBase58String(input);
			};

			self.resolveAddressOrAlias = function (string) {
				return Utility.resolveAddressOrAlias(string);
			};
		}]);
})();

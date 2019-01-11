/**
 * @requires {blake2b-256.js}
 * @requires {Base58.js}
 */
var CryptoService = (function(){
	'use strict';

	// private version of getNetworkId byte in order to avoid circular dependency
	// between cryptoService and utilityService
	function getNetworkIdByte() {
		return Constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
	}

	function appendUint8Arrays(array1, array2) {
		var tmp = new Uint8Array(array1.length + array2.length);
		tmp.set(array1, 0);
		tmp.set(array2, array1.length);
		return tmp;
	}

	function appendNonce(originalSeed) {
		// change this is when nonce increment gets introduced
		var nonce = new Uint8Array(converters.int32ToBytes(Constants.INITIAL_NONCE, true));
		return appendUint8Arrays(nonce, originalSeed);
	}

	// sha256 accepts messageBytes as Uint8Array or Array
	function sha256(message) {
		var bytes;
		if (typeof(message) == 'string')
			bytes = converters.stringToByteArray(message);
		else
			bytes = message;

		var wordArray = converters.byteArrayToWordArrayEx(new Uint8Array(bytes));
		var resultWordArray = CryptoJS.SHA256(wordArray);

		return converters.wordArrayToByteArrayEx(resultWordArray);
	}

	// blake2b 256 hash function
	function blake(input) {
		return blake2b(input, null, 32);
	}

	// keccak 256 hash algorithm
	function keccak(messageBytes) {
		// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
		return keccak_256.array(messageBytes);
		// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
	}

	//this.sha256 = sha256;

	function hashChain(noncedSecretPhraseBytes) {
		return keccak(blake(new Uint8Array(noncedSecretPhraseBytes)));
	}

	function buildAccountSeedHash(seedBytes) {
		var data = appendNonce(seedBytes);
		var seedHash = hashChain(data);
		return sha256(Array.prototype.slice.call(seedHash));
	}

	function buildKeyPair(seedBytes) {
		var accountSeedHash = buildAccountSeedHash(seedBytes);
		var p = axlsign.generateKeyPair(accountSeedHash);

		return {
			public: Base58.encode(p.public),
			private: Base58.encode(p.private)
		};
	}

	function buildPublicKey(seedBytes) {
		return buildKeyPair(seedBytes).public;
	}

	function buildPrivateKey(seedBytes) {
		return buildKeyPair(seedBytes).private;
	}

	function buildRawAddress(encodedPublicKey) {
		var publicKey = Base58.decode(encodedPublicKey);
		var publicKeyHash = hashChain(publicKey);

		var prefix = new Uint8Array(2);
		prefix[0] = Constants.ADDRESS_VERSION;
		prefix[1] = getNetworkIdByte();

		var unhashedAddress = appendUint8Arrays(prefix, publicKeyHash.slice(0, 20));
		var addressHash = hashChain(unhashedAddress).slice(0, 4);

		return Base58.encode(appendUint8Arrays(unhashedAddress, addressHash));
	}

	function buildRawAddressFromSeed(secretPhrase) {
		var publicKey = getPublicKey(secretPhrase);
		return buildRawAddress(publicKey);
	}

	// Returns publicKey built from string
	function getPublicKey(secretPhrase) {
		return buildPublicKey(converters.stringToByteArray(secretPhrase));
	}

	// Returns privateKey built from string
	function getPrivateKey(secretPhrase) {
		return buildPrivateKey(converters.stringToByteArray(secretPhrase));
	}

	// Returns key pair built from string
	function getKeyPair(secretPhrase) {
		return buildKeyPair(converters.stringToByteArray(secretPhrase));
	}

	// function accepts buffer with private key and an array with dataToSign
	// returns buffer with signed data
	// 64 randoms bytes are added to the signature
	// method falls back to deterministic signatures if crypto object is not supported
	function nonDeterministicSign(privateKey, dataToSign) {
		var crypto = window.crypto || window.msCrypto;
		var random;
		if (crypto) {
			random = new Uint8Array(64);
			crypto.getRandomValues(random);
		}
		var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign), random);
		return Base58.encode(signature);
	}

	// function accepts buffer with private key and an array with dataToSign
	// returns buffer with signed data
	function deterministicSign(privateKey, dataToSign) {
		var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign));
		return Base58.encode(signature);
	}

	function verify(senderPublicKey, dataToSign, signatureBytes) {
		return axlsign.verify(senderPublicKey, dataToSign, signatureBytes);
	}

	// function returns base58 encoded shared key from base58 encoded a private
	// and b public keys
	function getSharedKey(aEncodedPrivateKey, bEncodedPublicKey) {
		var aPrivateKey = Base58.decode(aEncodedPrivateKey);
		var bPublicKey = Base58.decode(bEncodedPublicKey);
		var sharedKey = axlsign.sharedKey(aPrivateKey, bPublicKey);
		return Base58.encode(sharedKey);
	}

	function encryptWalletSeed(seed, key) {
		var aesKey = prepareKey(key);
		return CryptoJS.AES.encrypt(seed, aesKey);
	}

	function decryptWalletSeed(cipher, key, checksum) {
		var aesKey = prepareKey(key);
		var data = CryptoJS.AES.decrypt(cipher, aesKey);

		var actualChecksum = seedChecksum(converters.hexStringToByteArray(data.toString()));
		if (actualChecksum === checksum)
			return converters.hexStringToString(data.toString());
		else
			return false;
	}

	// function can be used for sharedKey preparation, as recommended in: https://github.com/wavesplatform/curve25519-js
	function prepareKey(key) {
		var rounds = 1000;
		var digest = key;
		for (var i = 0; i < rounds; i++) {
			digest = converters.byteArrayToHexString(sha256(digest));
		}
		return digest;
	}

	function seedChecksum(seed) {
		return converters.byteArrayToHexString(sha256(seed));
	}

	return {
		getNetworkIdByte: getNetworkIdByte,
		appendUint8Arrays: appendUint8Arrays,
		appendNonce: appendNonce,
		sha256: sha256,
		blake: blake,
		keccak: keccak,
		hashChain: hashChain,
		buildAccountSeedHash: buildAccountSeedHash,
		buildKeyPair: buildKeyPair,
		buildPublicKey: buildPublicKey,
		buildPrivateKey: buildPrivateKey,
		buildRawAddress: buildRawAddress,
		buildRawAddressFromSeed: buildRawAddressFromSeed,
		getPublicKey: getPublicKey,
		getPrivateKey: getPrivateKey,
		getKeyPair: getKeyPair,
		nonDeterministicSign: nonDeterministicSign,
		deterministicSign: deterministicSign,
		verify: verify,
		getSharedKey: getSharedKey,
		encryptWalletSeed: encryptWalletSeed,
		decryptWalletSeed: decryptWalletSeed,
		seedChecksum: seedChecksum,
		prepareKey: prepareKey,
		seedChecksum: seedChecksum
	}
})();

(function() {
	'use strict';

	angular
		.module('waves.core.services')
		.service('cryptoService', [function() {

			var getNetworkIdByte = function() {
				return CryptoService.getNetworkIdByte();
			};

			var appendUint8Arrays = function(array1, array2) {
				return CryptoService.appendUint8Arrays(array1, array2);
			};

			var appendNonce = function (originalSeed) {
				return CryptoService.appendNonce(originalSeed);
			};

			var sha256 = function (message) {
				return CryptoService.sha256(message);
			};

			var prepareKey = function (key) {
				return CryptoService.prepareKey(key);
			};

			this.blake2b = function (input) {
				return CryptoService.blake(input);
			};

			this.keccak = function(messageBytes) {
				return CryptoService.keccak(messageBytes);
			};

			this.sha256 = sha256;

			this.hashChain = function(noncedSecretPhraseBytes) {
				return CryptoService.hashChain(noncedSecretPhraseBytes);
			};

			this.buildAccountSeedHash = function(seedBytes) {
				return CryptoService.buildAccountSeedHash(seedBytes);
			};

			this.buildKeyPair = function(seedBytes) {
				return CryptoService.buildKeyPair(seedBytes);
			};

			this.buildPublicKey = function (seedBytes) {
				return CryptoService.buildPublicKey(seedBytes);
			};

			this.buildPrivateKey = function (seedBytes) {
				return CryptoService.buildPrivateKey(seedBytes);
			};

			this.buildRawAddress = function (encodedPublicKey) {
				return CryptoService.buildRawAddress(encodedPublicKey);
			};

			this.buildRawAddressFromSeed = function (secretPhrase) {
				return CryptoService.buildRawAddressFromSeed(secretPhrase);
			};

			this.getPublicKey = function(secretPhrase) {
				return CryptoService.getPublicKey(secretPhrase);
			};

			this.getPrivateKey = function(secretPhrase) {
				return CryptoService.getPrivateKey(secretPhrase);
			};

			this.getKeyPair = function (secretPhrase) {
				return CryptoService.getKeyPair(secretPhrase);
			};

			this.nonDeterministicSign = function(privateKey, dataToSign) {
				return CryptoService.nonDeterministicSign(privateKey, dataToSign);
			};

			this.deterministicSign = function(privateKey, dataToSign) {
				return CryptoService.deterministicSign(privateKey, dataToSign);
			};

			this.verify = function(senderPublicKey, dataToSign, signatureBytes) {
				return CryptoService.verify(senderPublicKey, dataToSign, signatureBytes);
			};

			this.getSharedKey = function (aEncodedPrivateKey, bEncodedPublicKey) {
				return CryptoService.getSharedKey(aEncodedPrivateKey, bEncodedPublicKey);
			};

			this.prepareKey = function (key) {
				return CryptoService.prepareKey(key);
			};

			this.encryptWalletSeed = function (seed, key) {
				return CryptoService.encryptWalletSeed(seed, key);
			};

			this.decryptWalletSeed = function (cipher, key, checksum) {
				return CryptoService.decryptWalletSeed(cipher, key, checksum);
			};

			this.seedChecksum = function (seed) {
				return CryptoService.seedChecksum(seed);
			};
		}]);
})();

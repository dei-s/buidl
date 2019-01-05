var ValidateService = (function(){
	'use strict';

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

	return {
		validateSender: validateSender
	}
})();

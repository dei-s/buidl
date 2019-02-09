function app_HideAllVue() {
	communityApp.hide();
	messagingApp.hide();
	votingApp.hide();
}

function app_HideAllTab() {
	app_HideAllVue();
	$('#wrapper').css("height", "auto");
	$('#wrapper').css("min-height", 0);
}

function app_ShowAngularTab() {
	app_HideAllVue();
	$('#wrapper').css("height", "100vh");
	$('#wrapper').css("min-height", 320);
}

/**
 * Setup of main AngularJS application, with Restangular being defined as a dependency.
 *
 * @see controllers
 * @see services
 */

// mock methods to implement late binding
var __mockShowError = function(message) {};
var __mockValidateAddress = function(address) {};

// use app.context (ApplicationContext)
var app = angular.module('app', [
	'restangular',
	'waves.core',

	'ngclipboard',
	'ngAnimate',
	'ngMaterial',
	'ngValidate',
	'app.blocks',
	'app.ui',
	'app.shared',
	'app.login',
	'app.navigation',
	'app.wallet',
	'app.tokens',
	'app.dex',
	'app.history',
	'app.portfolio'
]).config(AngularApplicationConfig).run(AngularApplicationRun);

function AngularApplicationConfig($provide, $compileProvider, $validatorProvider, $qProvider, $sceDelegateProvider, $mdAriaProvider) {
	'use strict';

	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|file|chrome-extension):/);
	$qProvider.errorOnUnhandledRejections(false);
	$sceDelegateProvider.resourceUrlWhitelist([
		'self',
		'https://test.coinomat.com/api/**',
		'https://coinomat.com/api/**',
		'https://marketdata.wavesplatform.com/**'
	]);

	// Globally disables all ARIA warnings.
	$mdAriaProvider.disableWarnings();

	$validatorProvider.setDefaults({
		errorClass: 'wInput-error',
		onkeyup: false,
		showErrors : function(errorMap, errorList) {
			errorList.forEach(function(error) {
				// can't use notificationService here cos services are not available in config phase
				__mockShowError(error.message);
			});

			var i, elements;
			for (i = 0, elements = this.validElements(); elements[i]; i++) {
				angular.element(elements[i]).removeClass(this.settings.errorClass);
			}

			for (i = 0, elements = this.invalidElements(); elements[i]; i++) {
				angular.element(elements[i]).addClass(this.settings.errorClass);
			}
		}
	});

	$validatorProvider.addMethod('address', function (value, element) {
		return this.optional(element) || __mockValidateAddress(value);
	}, 'Account number must be a sequence of 35 alphanumeric characters with no spaces, ' +
		'optionally starting with \'1W\'');

	$validatorProvider.addMethod('decimal', function (value, element, maxDigits) {
		maxDigits = angular.isNumber(maxDigits) ? maxDigits : Currency.BASE.precision;
		var regex = new RegExp('^(?:-?\\d+)?(?:\\.\\d{0,' + maxDigits + '})?$');
		return this.optional(element) || regex.test(value);
	}, 'Amount is expected with a dot (.) as a decimal separator with no more than {0} fraction digits');

	$validatorProvider.addMethod('password', function (value, element) {
		if (this.optional(element)) {
			return true;
		}

		var containsDigits = /[0-9]/.test(value);
		var containsUppercase = /[A-Z]/.test(value);
		var containsLowercase = /[a-z]/.test(value);

		return containsDigits && containsUppercase && containsLowercase;
	}, 'The password is too weak. A good password must contain at least one digit, ' +
		'one uppercase and one lowercase letter');

	$validatorProvider.addMethod('minbytelength', function (value, element, minLength) {
		if (this.optional(element)) {
			return true;
		}

		if (!angular.isNumber(minLength)) {
			throw new Error('minbytelength parameter must be a number. Got ' + minLength);
		}

		return converters.stringToByteArray(value).length >= minLength;
	}, 'String is too short. Please add more characters.');

	$validatorProvider.addMethod('maxbytelength', function (value, element, maxLength) {
		if (this.optional(element)) {
			return true;
		}

		if (!angular.isNumber(maxLength)) {
			throw new Error('maxbytelength parameter must be a number. Got ' + maxLength);
		}

		return converters.stringToByteArray(value).length <= maxLength;
	}, 'String is too long. Please remove some characters.');
}

AngularApplicationConfig.$inject = ['$provide', '$compileProvider', '$validatorProvider', '$qProvider', '$sceDelegateProvider', '$mdAriaProvider'];

function AngularApplicationRun(rest, notificationService) {
	'use strict';

	// restangular configuration
	rest.setDefaultHttpFields({
		timeout: 10000 // milliseconds
	});
	var url = Constants.NODE_ADDRESS;
	rest.setBaseUrl(url);

	// override mock methods cos in config phase services are not available yet
	__mockShowError = function (message) {
		notificationService.error(message);
	};
	__mockValidateAddress = function (address) {
		return Address.validateAddress(address.trim());
	};
}

AngularApplicationRun.$inject = ['Restangular', 'notificationService'];

/******************************************************************************
 * Copyright © 2016 The Waves Core Developers.                                *
 *                                                                            *
 * See the LICENSE.txt files at                                               *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

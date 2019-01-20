var Constants = (function(){
	'use strict';

	return {
		IS_MIR: true,
		VERSION: '0.1.0',
		COINOMAT_ADDRESS: 'https://coinomat.com',
		DATAFEED_ADDRESS: 'https://marketdata.wavesplatform.com',
		NODE_ADDRESS: 'https://node.mir.dei.su',
		MATCHER_ADDRESS: 'https://m.mir.dei.su',
		SUPPORT_LINK: 'dei.su',

		/* network */
		ADDRESS_VERSION: 1,
		NETWORK_CODE: 'S',
		NETWORK_NAME: 'mirnet',
		INITIAL_NONCE: 0,

		/* address */
		RAW_ADDRESS_LENGTH : 35,
		ADDRESS_PREFIX: '1S', // '1W',
		MAINNET_ADDRESS_REGEXP: /^[a-zA-Z0-9]{35}$/,

		/* features */
		ALIAS_VERSION: 2,

		/* ui */
		MINIMUM_MESSAGE_AMOUNT_COINS: 1000000, // 0.01 MIR or Asset(Token)
		MINIMUM_MESSAGE_FEE_COINS: 1000000, // 0.01 MIR
		MINIMUM_PAYMENT_AMOUNT : 1e-8,
		MINIMUM_TRANSACTION_FEE : 0.001,
		AMOUNT_DECIMAL_PLACES : 8,
		JAVA_MAX_LONG: 9223372036854775807,
		MAXIMUM_ATTACHMENT_BYTE_SIZE: 140,

		/* Economic Protocol - Economic Message Transfer Protocol
		Example:
		{v:1,mt:1,of:1,to:2}
		v - version (= 1)
		mt - message type:
			1=Offer - выставление оферты
			2=OfferAccept - принять оферту (= заключить договор)
			3=OfferReject - отклонить оферту
			4=OfferWithdraw - отозвать оферту
			5=Voting - запрос на голосование
			6=Vote - голос
		of - от кого (идентификатор)
		to - кому (идентификатор)
		tr - ID предыдущей транзакции в контексте текущего сообщения (например по какому голосованию отдаётся голос или на какую оферту производится акцепт)
		add - addition - дополнение, пояснение

		Vote example:
		v:1,mt:6,tr:2evmK6eYHC3HdFjowBnYsYaUj9ZJz1ssGryKWshToxJX,vote:yes,add:"Принять участника petrenko_ivan13 в DEI"
		{v:1,mt:6,tr:2evmK6eYHC3HdFjowBnYsYaUj9ZJz1ssGryKWshToxJX,vote:yes,add:"Принять участника petrenko_ivan13 в DEI"}
		{v:1,mt:6,tr:2evmK6eYHC3HdFjowBnYsYaUj9ZJz1ssGryKWshToxJX,vote:yes,add:"vk.com/petrenko_ivan13 3PJ7J7SRCh3yYfHBvQAPCtZSFeThUL6gNRV"}

		https://github.com/lightbend/config/blob/master/HOCON.md
		*/
		MSG_TYPE_OFFER: 1,
		MSG_TYPE_OFFER_ACCEPT: 2,
		MSG_TYPE_OFFER_REJECT: 3,
		MSG_TYPE_OFFER_WITHDRAW: 4,
		MSG_TYPE_VOTING: 5,
		MSG_TYPE_VOTE: 6,

		/* transactions */
		PAYMENT_TRANSACTION_TYPE : 2,
		ASSET_ISSUE_TRANSACTION_TYPE: 3,
		ASSET_TRANSFER_TRANSACTION_TYPE: 4,
		ASSET_REISSUE_TRANSACTION_TYPE: 5,
		ASSET_BURN_TRANSACTION_TYPE: 6,
		EXCHANGE_TRANSACTION_TYPE: 7,
		START_LEASING_TRANSACTION_TYPE: 8, // No use
		CANCEL_LEASING_TRANSACTION_TYPE: 9, // No use
		CREATE_ALIAS_TRANSACTION_TYPE: 10,
		MASS_PAYMENT_TRANSACTION_TYPE: 11
	}
})();

// TODO: Change to Constants.IS_MIR
function isMir() {
	return Constants.IS_MIR;
}

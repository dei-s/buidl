var socialApp = new Vue({
	el: '#social',
	data: {
		accounts: [],
		funds: []
	},
	created: function() {
		// Base account for input coin MIR, no token
		this.funds.push({
			addr: '3MdMhcYD3ZZqWsSq9V3S1suGQKw2RnnFUND'
		});
	},
	methods: {
		checkKeeper: function() {
			return typeof window.Mir !== 'undefined';
		},
		createNewPayment: function() {
		},
		decode: function(text) {
			let bytes = Base58.decode(text);
			let str = '';
			for (let i = 0; i < bytes.length; i++) {
				str += String.fromCharCode(bytes[i]);
			}
			return decodeURIComponent(escape(str));
		},
		findAccount: function(accountAddress) {
			for (var i = 0; i < this.accounts.length; i++) {
				if (this.accounts[i].addr == accountAddress) return i;
			}
			return -1;
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		hide: function() {
			$('#social').hide();
			this.stop();
		},
		hidePanels: function() {
			$('#social-payment-panel').hide();
		},
		hidePanelsAll: function() {
			this.hidePanels();
			if (hidePrimary) $('#social-primary-panel').hide();
		},
		refresh: function() {
			this.hidePanels();
		},
		show: function() {
			$('#social').show();
			this.updateAll();
			this.start();
		},
		showPaymentPanel: function() {
			this.hidePanelsAll();
			$('#social-payment-panel').show();
		},
		showPrimaryPanel: function() {
			this.hidePanels();
			$('#social-primary-panel').show();
		},
		start: function() {
		},
		stop: function() {
		},
		update: async function(isFullRefresh) {
		},
		updateAll: function() {
		}
	}
});

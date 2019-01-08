if (Constants.IS_MIR) {
	var MSG_BASE_ID = 'MIR';
	var MSG_AMOUNT_MIN = 100000; // 100000 = 0.001, 100000000 = 1
	var MSG_ASSET_ID = '';
	var MSG_WALLET_ADDR = '3MSpWtFmVwob2GHbMk4qb2dJXEnHykYYLBR';
} else {
	var MSG_BASE_ID = 'WAVES';
	var MSG_AMOUNT_MIN = 100000; // 0.001 МИР
	var MSG_ASSET_ID = 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ'; // МИР
	var MSG_WALLET_ADDR = '3PEPpJoJNqrU6T6AAdXB3yMzUseEaUPniCw'; // DEI
}

var communityApp = new Vue({
	el: '#community',
	data: {
		project: {
			id: '',
			name: ''
		},
		message: '',
		pinnedMessage: {},
		messages: [],
		node: Constants.NODE_ADDRESS,
		amount: '0.001',
		fee: '0.001',
		minAmount: MSG_AMOUNT_MIN,
		pinAmount: 1000000,
		last: 0,
		timer: false,
		wall: MSG_WALLET_ADDR
	},
	created: function() {
	},
	methods: {
		checkKeeper: function() {
			return typeof window.Waves !== 'undefined';
		},
		decode: function(text) {
			let bytes = Base58.decode(text);
			let str = '';
			for (let i = 0; i < bytes.length; i++) {
				str += String.fromCharCode(bytes[i]);
			}
			return decodeURIComponent(escape(str));
		},
		hide: function () {
			this.stop();
			$('#community').hide();
		},
		findByKey: function(array, id) {
			let element = array.find(element => {
				return element.key == id ? element : false;
			});
			return element;
		},
		findMax: function(arr) {
			return arr.reduce(function(prev, curr){
				return prev.amount >= curr.amount ? prev : curr;
			});
		},
		formatAmount: function(amount) {
			return (amount / 100000000).toLocaleString('ru-ru', {maximumSignificantDigits: 20}) + 'МИР';
		},
		formatSender: function(sender) {
			return '...' + sender.slice(-7);
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		getName: async function(sender) {
			try {
				let response = await axios.get(this.node + '/addresses/data/' + sender + '/waves-wall-name');
				return response.data ? response.data : '';
			} catch(err) {
				console.log(err);
				return '';
			}
		},
		loadPosts: async function(limit) {
			let response = await axios.get(this.node + '/transactions/address/' + this.wall + '/limit/' + limit);
			return response.data;
		},
		send: async function() {
			let msg = this.message;
			let params = {
				type: 4,
				data: {
					amount: {
						assetId: MSG_ASSET_ID,
						tokens: this.amount
					},
					fee: {
						assetId: MSG_BASE_ID,
						tokens: this.fee
					},
					recipient: this.wall,
					attachment: msg
				}
			}
			if (this.checkKeeper()) {
				try {
					let res = await window.Waves.signAndPublishTransaction(params);
					this.message = '';
				} catch (err) {
					alert(err.message);
				}
			} else {
				alert('Please, install Waves Keeper.\nFollow the link at the bottom of the page.');
			}
		},
		show: function() {
			$('#community').show();
			this.update();
			this.start();
		},
		start: function() {
			if (this.timer) return;
			this.timer = setInterval(this.update, 10000);
		},
		stop: function() {
			clearInterval(this.timer);
			this.timer = false;
		},
		update: async function() {
			let lastTx = await this.loadPosts(1);
			let lastTime = lastTx[0][0].timestamp;
			if (lastTime == this.last) return;
			this.last = lastTime.valueOf();
			let data = await this.loadPosts(10000);
			this.messages = [];
			await data[0].forEach(item => {
				if (item.attachment && item.amount >= this.minAmount && (Constants.IS_MIR || item.assetId == MSG_ASSET_ID)) {
					let msg = this.decode(item.attachment);
					this.messages.unshift({
						sender: item.sender,
						text: msg,
						time: item.timestamp,
						amount: item.amount,
						id: item.id
					});
					let pinned = this.messages.find(element => {
						return element.amount > this.pinAmount ? element : false;
					});
					this.pinnedMessage = pinned ? pinned : '';
				}
			});
			this.$refs.msgWrapper.scrollTop = this.$refs.msgWrapper.scrollHeight;
		}
	}
});

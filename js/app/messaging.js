/**
 * use app.ui (ApplicationContext)
 * use core.favorit (FavoritService)
 * use core.rest (RestApi)
 *
 * accounts - array of object. first accoun = base
 * account = {
 *     addr: string, <- account address
 *     cashe: {
 *        assetId: string,
 *        msgs: []
 *     }
 *     last: int     <- timestamp of last account transaction
 * }
 * projects - array of project
 * project = {
 *     creator: asset.sender,
 *     description: asset.description,
 *     displayName: f.displayName,
 *     id: f.assetId,
 *     isMyAddress: messaginApp.isMyAddress(asset.sender),
 *     name: asset.currency.displayName,
 *     reissuable: asset.reissuable ? 'Yes' : 'No',
 *     timestamp: asset.timestamp,
 *     totalTokens: asset.totalTokens.formatAmount()
 * }
 * messages - array of message
 * message = {
 *     amount: item.amount,
 *     id: item.id,
 *     recipient: item.recipient,
 *     sender: item.sender,
 *     text: msg,
 *     time: item.timestamp
 * }
 */

var messaginApp = new Vue({
	el: '#messagin',
	data: {
		accounts: [],
		assetId: false, // selected project id, if base then assetId = false
		message: {}, // selected message
		messageIndex: -1, // selected message
		messages: [],
		minAmount: 100000, // 0.001 MIR or Asset(Token)
		minFee: 1000000, // 0.01 MIR
		project: {}, // selected project
		projectIndex: -1, // selected project
		projects: [],
		updatingTimer: false
	},
	created: function() {
		// Base account for input coin MIR, no token
		this.accounts.push({
			addr: '3MR1wocLPLr8tuPaPbur27oM7NdLFUNDLms',
			last: 0
		});
	},
	methods: {
		addMessage: function(msg) {
			return this.messages.push(msg);
		},
		addProject: function(project) {
			project.isSelected = false;
			return this.projects.push(project);
		},
		decode: function(text) {
			let bytes = Base58.decode(text);
			let str = '';
			for (let i = 0; i < bytes.length; i++) {
				str += String.fromCharCode(bytes[i]);
			}
			return decodeURIComponent(escape(str));
		},
		emsgFromJson: function(text) {
			return JSON.parse(text);
		},
		emsgToJson: function(obj) {
			return JSON.stringify(obj);
		},
		findAccount: function(accountAddress) {
			this.accounts.forEach(function(a,i){
				if (a.addr == accountAddress) return i;
			});
			return -1;
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		hide: function() {
			$('#messagin').hide();
			this.stop();
		},
		hideAllPanels: function(hidePrimary) {
			$('#messagin-message-panel').hide();
			if (hidePrimary) $('#messagin-primary-panel').hide();
		},
		isMyAddress: function(addr) {
			return addr == ApplicationContext.account.address;
		},
		loadAccountMessages: async function(accountAddress){
			if (this.accounts.length <= 0) {
				console.error('accounts is empty');
				return;
			}
			if (!accountAddress) accountAddress = this.accounts[0].addr;
			var msgs = [];
			var i = this.findAccount(accountAddress);
			if (i >= 0) {
				let lastTx = await RestApi.getTransactionsByAddr(accountAddress, 1);
				let lastTime = lastTx[0][0].timestamp;
				if (lastTime == this.accounts[i].last) return;
			}
			var data = await RestApi.getTransactionsByAddr(accountAddress,1000);
			data[0].forEach(function(item){
				var ok = false;
				if (messaginApp.assetId) {
					ok = (item.assetId == messaginApp.assetId);
				} else {
					ok = !item.assetId;
				}
				if (ok && item.attachment && item.amount >= messaginApp.minAmount && item.fee >= messaginApp.minFee) {
					let msg = messaginApp.decode(item.attachment);
					var message = {
						amount: item.amount,
						id: item.id,
						recipient: item.recipient,
						sender: item.sender,
						text: msg,
						time: item.timestamp
					};
					msgs.unshift(message);
				}
			});
			if (i >= 0) this.accounts[i].last = lastTime.valueOf();
			return msgs;
		},
		loadPosts: function(address, limit) {
			return RestApi.getTransactionsByAddr(address, limit);
		},
		refresh: function() {
			this.hideAllPanels();
			//this.$refs.msgWrapper.scrollTop = this.$refs.msgWrapper.scrollHeight;
		},
		selectBaseProject: function() {
			this.projects.forEach(function(p){
				p.isSelected = false;
			});
			this.assetId = false;
			this.project = {};
			this.projectIndex = -1;
			this.updateBase().then(function(){
				messaginApp.updateSelected();
				$('#messagin-primary-panel').show();
			});
		},
		selectProjectByIndex: function(index) {
			if (index < 0) return this.selectBaseProject();
			if (this.projectIndex == index) return;
			this.projects.forEach(function(p){
				p.isSelected = false;
			});
			this.projects[index].isSelected = true;
			this.projectIndex = index;
			this.project = this.projects[index];
			this.assetId = this.project.id;
			this.messages = [];
			this.update().then(function(){
				messaginApp.updateSelected();
				$('#messagin-primary-panel').show();
			});
		},
		show: function() {
			$('#messagin').show();
			this.updateAll();
			this.start();
		},
		showMessageByIndex: function(index) {
			this.hideAllPanels(true);
			this.message = this.messages[index];
			this.messageIndex = index;
			$('#messagin-message-panel').show();
		},
		showMessagePanel: function() {
			this.hideAllPanels(true);
			$('#messagin-message-panel').show();
		},
		showMessageByIndex: function(index) {
			this.messageIndex = index;
			this.message = this.messages[index];
			this.showMessageForm();
		},
		start: function() {
			if (!this.updateTimer) {
				this.updateTimer = setInterval(this.update, 20000);
			}
		},
		stop: function() {
			clearInterval(this.updateTimer);
			this.updateTimer = false;
		},
		update: async function() {
			if (!this.project.id) return await this.updateBase();
			var height = await RestApi.getHeight();
			if (this.assetId != this.project.id) {
				this.messages = [];
				this.assetId = this.project.id;
			}
			var res = await RestApi.getAssetDistribution(this.project.id, height, 2000);
			var newAccounts = [];
			for (var a in res) {
				if (res.hasOwnProperty(a)) {
					if (messaginApp.findAccount(a) < 0) newAccounts.push(a);
				}
			}
			if (newAccounts.length < 0) return;
			newAccounts.forEach(function(accountAddress){
				console.log('Запрашиваю транзакции нового держателя', accountAddress);
				messaginApp.loadAccountMessages(accountAddress).then(function(msgs){
					console.log('Результат loadAccountMessages:', accountAddress, msgs);
					msgs.forEach(function(msg){
						messaginApp.addMessage(msg);
					});
				});
			});
			this.refresh();
		},
		updateAll: function() {
			this.projects = [];
			this.updateProjects();
			this.selectBaseProject();
		},
		updateBase: async function() {
			var height = await RestApi.getHeight();
			this.messages = [];
			accountAddress = this.accounts[0].addr;
			messaginApp.loadAccountMessages(accountAddress).then(function(msgs){
				msgs.forEach(function(msg){
					messaginApp.addMessage(msg);
				});
			});
			this.refresh();
		},
		updateProjects: async function() {
			if (!FavoritService) return;
			var favorits = FavoritService.getFavorits();
			if (!favorits) return;
			favorits.then(function(favorits){
				favorits.forEach(function(f,i){
					if (f.accountAddress == ApplicationContext.account.address) {
						var asset = ApplicationContext.cache.assets[f.assetId];
						messaginApp.addProject({
							creator: asset.sender,
							description: asset.description,
							displayName: f.displayName,
							id: f.assetId,
							isMyAddress: messaginApp.isMyAddress(asset.sender),
							name: asset.currency.displayName,
							reissuable: asset.reissuable ? 'Yes' : 'No',
							timestamp: asset.timestamp,
							totalTokens: asset.totalTokens.formatAmount()
						});
					}
				});
				if (messaginApp.projects.length <= 0) return;
				var pi = messaginApp.projectIndex;
				if (pi < 0) pi = 0;
			});
		},
		updateSelected: function() {
			messaginApp.projects.forEach(function(p,i){
				$('#messagin-project-'+i).removeClass("bg-primary");
			});
			if (this.projectIndex >= 0) {
				$('#messagin-project-'+this.projectIndex).addClass("bg-primary");
				$('#messagin-project-base').removeClass("bg-primary");
			} else {
				$('#messagin-project-base').addClass("bg-primary");
			}
		}
	}
});

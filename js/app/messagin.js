/**
 * use app.ui (ApplicationContext)
 * use core.favorit (FavoritService)
 * use core.rest (RestApi)
 *
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
		assetId: false, // selected project id
		last: 0,
		message: {}, // selected message
		messageIndex: -1, // selected message
		messages: [],
		minAmount: 100000, // 0.001 MIR
		project: {}, // selected project
		projectIndex: -1, // selected project
		projects: [],
		updatingTimer: false
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
			var msgs = [];
			/*
			let lastTx = await ReatApi.getAddressTransactions(accountAddress, 1);
			let lastTime = lastTx[0][0].timestamp;
			if (lastTime == this.last) return;
			this.last = lastTime.valueOf();
			*/

			var data = await RestApi.getAddressTransactions(accountAddress,1000);
			data[0].forEach(function(item){
				if (item.attachment && item.amount >= messaginApp.minAmount && (item.assetId == messaginApp.assetId)) {
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
			return msgs;
		},
		loadPosts: function(address, limit) {
			return RestApi.getAddressTransactions(address, limit);
		},
		refresh: function() {
			this.hideAllPanels();
			//this.$refs.msgWrapper.scrollTop = this.$refs.msgWrapper.scrollHeight;
		},
		selectProjectByIndex: function(index) {
			this.projects.forEach(function(p){
				p.isSelected = false;
			});
			this.projects[index].isSelected = true;
			this.projectIndex = index;
			this.project = this.projects[index];
			console.log('1 selectProjectByIndex', index);
			this.update().then(function(){
				console.log('2 selectProjectByIndex', index);
				messaginApp.projects.forEach(function(p,i){
					$('#messagin-project-'+i).removeClass("bg-primary");
				});
				$('#messagin-project-'+index).addClass("bg-primary");
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
			if (!this.project.id) return;
			var height = await RestApi.getHeight();
			this.messages = [];
			this.assetId = this.project.id;
			var res = await RestApi.getAssetDistribution(this.project.id, height, 2000);
			var accounts = [];
			for (var a in res) {
				if (res.hasOwnProperty(a)) {
					accounts.push(a);
				}
			}
			accounts.forEach(function(accountAddress){
				console.log('Запрашиваю транзакции держателя', accountAddress);
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
			this.updateProjects();
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
				messaginApp.selectProjectByIndex(pi);
			});
		}
	}
});

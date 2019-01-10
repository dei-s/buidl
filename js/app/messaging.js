/**
 * use app.ui (ApplicationContext)
 * use core.favorit (FavoritService)
 * use core.rest (RestApi)
 *
 * accounts - array of object. first accoun = base
 * account = {
 *     addr: string, <- account address
 *     cashe: [{
 *        assetId: string,
 *        msgs: []
 *     }],
 *     last: int     <- timestamp of last account transaction
 * }
 * projects - array of project
 * project = {
 *     creator: asset.sender,
 *     description: asset.description,
 *     displayName: f.displayName,
 *     id: f.assetId,
 *     isMyAddress: messagingApp.isMyAddress(asset.sender),
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

var messagingApp = new Vue({
	el: '#messaging',
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
		updateInterval: 30000,
		updatingTimer: false
	},
	created: function() {
		// Base account for input coin MIR, no token
		this.accounts.push({
			addr: '3MR1wocLPLr8tuPaPbur27oM7NdLFUNDLms',
			cashe: [{
				assetId: false,
				msgs: []
			}],
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
			for (var i = 0; i < this.accounts.length; i++) {
				if (this.accounts[i].addr == accountAddress) return i;
			}
			return -1;
		},
		findCashe: function(accountIndex, assetId) {
			for (var j = 0; j < this.accounts[accountIndex].cashe.length; j++) {
				if (this.accounts[accountIndex].cashe[j].assetId == assetId) return j;
			}
			return -1;
		},
		findCasheMessage: function(accountIndex, assetIndex, msgId) {
			for (var i = 0; i < this.accounts[accountIndex].cashe[assetIndex].msgs.length; i++) {
				if (this.accounts[accountIndex].cashe[assetIndex].msgs[i].id == msgId) return i;
			}
			return -1;
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		hide: function() {
			$('#messaging').hide();
			this.stop();
		},
		hideAllPanels: function(hidePrimary) {
			$('#messaging-message-panel').hide();
			if (hidePrimary) $('#messaging-primary-panel').hide();
		},
		isMyAddress: function(addr) {
			return addr == ApplicationContext.account.address;
		},
		loadAccountMessages: async function(accountAddress, isFullRefresh){
			// Если isFullRefresh - то массив newMessages заполняется не зависимо от того сохранены ли сообщения в кеше
			// Если указан базовый адрес (isBaseAddr) - то функция возвращает и пришедшие и отправленные сообщения
			// Если указан не базовый адрес - то функция возвращает только отправленные сообщения с указанного адреса
			if (this.accounts.length <= 0) {
				console.error('accounts is empty');
				return;
			}
			if (!accountAddress) accountAddress = this.accounts[0].addr;
			var isBaseAddr = (accountAddress == this.accounts[0].addr);
			var newMessages = [];
			var i = this.findAccount(accountAddress);
			if (i < 0) {
				this.accounts.push({
					addr: accountAddress,
					cashe: [{
						assetId: messagingApp.assetId,
						msgs: []
					}],
					last: 0
				});
				i = this.accounts.length-1;
			}
			let lastTx = await RestApi.getTransactionsByAddr(accountAddress, 1);
			let lastTime = lastTx[0][0].timestamp;
			if (!isFullRefresh && lastTime == this.accounts[i].last) return;
			var j = this.findCashe(i, this.assetId);
			if (j < 0) {
				j = this.accounts[i].cashe.push({
					assetId: this.assetId,
					msgs: []
				})-1;
			}
			var data = await RestApi.getTransactionsByAddr(accountAddress,1000);
			data[0].forEach(function(item){
				var ok = false;
				if (messagingApp.assetId) {
					ok = (item.assetId == messagingApp.assetId);
				} else {
					ok = !item.assetId;
				}
				if (ok && item.attachment && item.amount >= messagingApp.minAmount && item.fee >= messagingApp.minFee) {
				}
				if (ok && item.attachment && item.amount >= messagingApp.minAmount && item.fee >= messagingApp.minFee && (isBaseAddr || (item.recipient == messagingApp.accounts[0].addr && item.sender == accountAddress))) {
					if (isFullRefresh) {
						let msg = messagingApp.decode(item.attachment);
						var message = {
							amount: item.amount,
							id: item.id,
							recipient: item.recipient,
							sender: item.sender,
							text: msg,
							time: item.timestamp
						};
						newMessages.unshift(message);
						if (messagingApp.findCasheMessage(i,j,item.id) < 0) messagingApp.accounts[i].cashe[j].msgs.push(message);
					} else if (messagingApp.findCasheMessage(i,j,item.id) < 0) {
						let msg = messagingApp.decode(item.attachment);
						var message = {
							amount: item.amount,
							id: item.id,
							recipient: item.recipient,
							sender: item.sender,
							text: msg,
							time: item.timestamp
						};
						newMessages.unshift(message);
						messagingApp.accounts[i].cashe[j].msgs.push(message);
					}
				}
			});
			messagingApp.accounts[i].last = lastTime.valueOf();
			return newMessages;
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
			this.updateBase(true).then(function(){
				messagingApp.updateSelected();
				$('#messaging-primary-panel').show();
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
			this.update(true).then(function(){
				messagingApp.updateSelected();
				$('#messaging-primary-panel').show();
			});
		},
		show: function() {
			$('#messaging').show();
			this.updateAll();
			this.start();
		},
		showMessageByIndex: function(index) {
			this.hideAllPanels(true);
			this.message = this.messages[index];
			this.messageIndex = index;
			$('#messaging-message-panel').show();
		},
		showMessagePanel: function() {
			this.hideAllPanels(true);
			$('#messaging-message-panel').show();
		},
		showMessageByIndex: function(index) {
			this.messageIndex = index;
			this.message = this.messages[index];
			this.showMessageForm();
		},
		start: function() {
			if (!this.updateTimer) {
				this.updateTimer = setInterval(this.update, this.updateInterval);
			}
		},
		stop: function() {
			clearInterval(this.updateTimer);
			this.updateTimer = false;
		},
		update: async function(isFullRefresh) {
			if (!this.project.id) return await this.updateBase(isFullRefresh);
			var height = await RestApi.getHeight();
			if (this.assetId != this.project.id) {
				this.messages = [];
				this.assetId = this.project.id;
				isFullRefresh = true;
			}

			var res = await RestApi.getAssetDistribution(this.project.id, height);
			var nAccounts = [];
			for (var a in res) {
				// Транзакции baseAddr не учитываем
				if (a != this.accounts[0].addr) nAccounts.push(a);
			}
			nAccounts.forEach(function(accountAddress){
				messagingApp.loadAccountMessages(accountAddress,isFullRefresh).then(function(msgs){
					console.log('Результат loadAccountMessages', accountAddress, 'isFullRefresh', isFullRefresh, msgs);
					if (msgs) {
						msgs.forEach(function(msg){
							messagingApp.addMessage(msg);
						});
					}
				});
			});
			this.refresh();
		},
		updateAll: function() {
			this.projects = [];
			this.updateProjects();
			this.selectBaseProject();
		},
		updateBase: async function(isFullRefresh) {
			var height = await RestApi.getHeight();
			if (isFullRefresh) this.messages = [];
			accountAddress = this.accounts[0].addr;
			messagingApp.loadAccountMessages(accountAddress,isFullRefresh).then(function(msgs){
				console.log('updateBase: Результат loadAccountMessages', accountAddress, 'isFullRefresh', isFullRefresh, msgs);
				if (msgs) {
					msgs.forEach(function(msg){
						messagingApp.addMessage(msg);
					});
				}
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
						messagingApp.addProject({
							creator: asset.sender,
							description: asset.description,
							displayName: f.displayName,
							id: f.assetId,
							isMyAddress: messagingApp.isMyAddress(asset.sender),
							name: asset.currency.displayName,
							reissuable: asset.reissuable ? 'Yes' : 'No',
							timestamp: asset.timestamp,
							totalTokens: asset.totalTokens.formatAmount()
						});
					}
				});
				if (messagingApp.projects.length <= 0) return;
				var pi = messagingApp.projectIndex;
				if (pi < 0) pi = 0;
			});
		},
		updateSelected: function() {
			messagingApp.projects.forEach(function(p,i){
				$('#messaging-project-'+i).removeClass("bg-primary");
			});
			if (this.projectIndex >= 0) {
				$('#messaging-project-'+this.projectIndex).addClass("bg-primary");
				$('#messaging-project-base').removeClass("bg-primary");
			} else {
				$('#messaging-project-base').addClass("bg-primary");
			}
		}
	}
});

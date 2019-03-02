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
 *     amount: Money,
 *     fee: Money,
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
		project: {}, // selected project
		projectIndex: -1, // selected project
		projects: [],
		updateInterval: 30000,
		updateTimer: false
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
		this.message = {
			amount: new Money(0, Currency.BASE),
			fee: new Money.fromCoins(Constants.MINIMUM_MESSAGE_FEE_COINS, Currency.BASE),
			id: '',
			recipient: '',
			sender: '',
			text: '',
			time: 0
		};
	},
	methods: {
		addMessage: function(msg) {
			return this.messages.unshift(msg);
		},
		addProject: function(project) {
			project.isSelected = false;
			return this.projects.push(project);
		},
		cancelNewMessage: function() {
			this.showPrimaryPanel();
		},
		checkKeeper: function() {
			return typeof window.Mir !== 'undefined';
		},
		createNewMessage: function() {
			this.message.text = $('#messaging-message-edit-text').val();
			this.send(this.message.text, this.project.assetId, this.message.amount, this.message.fee).then(function(){
				messagingApp.showPrimaryPanel();
			});
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
		formatMsgText: function(text) {
			if (text.length < 300) return text;
			return text.slice(0,100) + '...' + text.slice(-100);
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
				if (ok && item.attachment && item.amount >= Constants.MINIMUM_MESSAGE_AMOUNT_COINS && item.fee >= Constants.MINIMUM_MESSAGE_FEE_COINS && (isBaseAddr || (item.recipient == messagingApp.accounts[0].addr && item.sender == accountAddress))) {
					let message = {
						amount: Money.fromCoins(item.amount, Currency.getByAssetId(item.assetId)),
						fee: Money.fromCoins(item.fee, Currency.BASE),
						id: item.id,
						recipient: item.recipient,
						sender: item.sender,
						text: messagingApp.decode(item.attachment),
						time: item.timestamp
					};
					let mi = messagingApp.findCasheMessage(i,j,item.id);
					if (isFullRefresh || mi < 0) newMessages.unshift(message);
					if (mi < 0) messagingApp.accounts[i].cashe[j].msgs.push(message);
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
				messagingApp.showPrimaryPanel();
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
				messagingApp.showPrimaryPanel();
			});
		},
		send: async function(msg, assetId, amount, fee) {
			if (this.checkKeeper()) {
				let params = {
					type: 4,
					data: {
						amount: {
							assetId: Currency.BASE.id, //assetId,
							tokens: amount.toTokens()
						},
						fee: {
							assetId: Currency.BASE.id,
							tokens: fee.toTokens()
						},
						recipient: this.accounts[0].addr,
						attachment: msg
					}
				}
				try {
					let res = await window.Mir.signAndPublishTransaction(params);
				} catch (err) {
					alert(err.message);
				}
			} else {
				if (msg) {
					msg = converters.stringToByteArray(msg);
				}
				let assetTransfer = {
					amount: amount,
					attachment: msg,
					fee: fee,
					recipient: Address.cleanupOptionalPrefix(this.accounts[0].addr)
				};
				let sender = {
					publicKey: ApplicationContext.account.keyPair.public,
					privateKey: ApplicationContext.account.keyPair.private
				};
				// Create a transaction and wait for confirmation
				var atd = AssetService.createAssetTransferTransaction(assetTransfer, sender);
				atd.type = 4;
				var data = await RestApi.broadcastTransaction(atd);
			}
			this.showPrimaryPanel();
		},
		show: function() {
			$('#messaging').show();
			this.updateAll();
			this.start();
		},
		showCreateNewMessage: function() {
			console.log(Constants.MINIMUM_MESSAGE_AMOUNT_COINS, Currency.getByAssetId(this.project.id));
			this.message = {
				amount: Money.fromCoins(Constants.MINIMUM_MESSAGE_AMOUNT_COINS, Currency.getByAssetId(this.project.id)),
				assetId: '',
				fee: new Money.fromCoins(Constants.MINIMUM_MESSAGE_FEE_COINS, Currency.BASE),
				id: '',
				recipient: this.accounts[0].addr,
				sender: ApplicationContext.account.address,
				text: '',
				time: '',
				title: "New message"
			}
			this.showMessagePanel();
			$('#messaging-message-edit-table').show();
			$('#messaging-message-see-table').hide();
			$('#messaging-message-buttons').show();
		},
		showMessageByIndex: function(index) {
			this.hideAllPanels(true);
			$('#messaging-message-'+this.messageIndex).removeClass('primary');
			this.message = this.messages[index];
			this.message.title = this.message.id;
			this.messageIndex = index;
			this.showMessagePanel();
			$('#messaging-message-'+index).addClass('primary');
			$('#messaging-message-edit-table').hide();
			$('#messaging-message-see-table').show();
			$('#messaging-message-buttons').hide();
		},
		showMessagePanel: function() {
			this.hideAllPanels(true);
			$('#messaging-message-panel').show();
		},
		showPrimaryPanel: function() {
			this.hideAllPanels();
			$('#messaging-primary-panel').show();
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
					if (msgs) {
						msgs.forEach(function(msg){
							messagingApp.addMessage(msg);
						});
					}
				});
			});
			if (isFullRefresh) this.refresh();
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
				if (msgs) {
					msgs.forEach(function(msg){
						messagingApp.addMessage(msg);
					});
				}
			});
			if (isFullRefresh) this.refresh();
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

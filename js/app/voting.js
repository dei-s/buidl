/**
 * use app.ui (ApplicationContext)
 * projects - array of project
 * project = {
 *     creator: asset.sender,
 *     description: asset.description,
 *     displayName: f.displayName,
 *     id: f.assetId,
 *     isMyAddress: votingApp.isMyAddress(asset.sender),
 *     name: asset.currency.displayName,
 *     reissuable: asset.reissuable ? 'Yes' : 'No',
 *     timestamp: asset.timestamp,
 *     totalTokens: asset.totalTokens.formatAmount()
 * }
 * vote = {
 *     add: Str - comment
 *     amount: Money
 *     fee: Money
 *     head: Int - head of block
 *     id: Str - transaction id
 *     recipient: Str - recepient account id
 *     sender: {
 *         id: Str - sender account id
 *         name: Str - sender account name
 *     }
 *     timestamp: Int
 *     tr: Str - voting transaction id
 *     vote: Str - 0 | 1 | no | yes
 * }
 * votings - array of voting
 * voting = {
 *     amount: item.amount,
 *     creator: item.sender,
 *     id: item.id,
 *     recipient: item.recipient,
 *     text: msg,
 *     time: item.timestamp
 * }
 */

var votingApp = new Vue({
	el: '#voting',
	data: {
		accounts: [],
		assetId: false, // selected project id, if base then assetId = false
		project: {}, // selected project
		projectIndex: -1, // selected project
		projects: [],
		updateInterval: 30000,
		updateTabIconTimer: false,
		updateTimer: false,
		vote: {}, // selected vote
		voteIndex: -1, // selected vote
		votes: [],
		voting: {}, // selected voting
		votingIndex: -1, // selected voting
		votings: []
	},
	created: function() {
		// Base account for input coin MIR, no token
		this.accounts.push({
			addr: '3MR1wocLPLr8tuPaPbur27oM7NdLFUNDLms',
			cashe: [{
				assetId: false,
				votes: [],
				votings: []
			}],
			last: 0
		});
		this.vote = {
			add: '',
			amount: new Money(0, Currency.BASE),
			fee: new Money.fromCoins(Constants.MINIMUM_MESSAGE_FEE_COINS, Currency.BASE),
			head: 0,
			id: '',
			recipient: '',
			sender: {
				id: '',
				name: ''
			},
			timestamp: 0,
			tr: '', // voting transaction id
			vote: ''
		};
		this.voting = {
			amount: new Money(0, Currency.BASE),
			createdDate: Date.parse('2019-01-07T13:51:50.417Z'),
			creator: {
				id: '',
				name: ''
			},
			expirationDate: Date.parse('2019-02-01T00:00:01'),
			fee: new Money.fromCoins(Constants.MINIMUM_MESSAGE_FEE_COINS, Currency.BASE),
			head: 0,
			id: '',
			name: 'test',
			recipient: '',
			text: '',
			time: 0
		};
	},
	methods: {
		addProject: function(project) {
			project.isSelected = false;
			return this.projects.push(project);
		},
		addVoting: function(voting) {
			//return this.votings.push(voting);
			return this.votings.unshift(voting);
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
		findCashe: function(accountIndex, assetId) {
			for (var j = 0; j < this.accounts[accountIndex].cashe.length; j++) {
				if (this.accounts[accountIndex].cashe[j].assetId == assetId) return j;
			}
			return -1;
		},
		findCasheVoting: function(accountIndex, assetIndex, votingId) {
			for (var i = 0; i < this.accounts[accountIndex].cashe[assetIndex].votings.length; i++) {
				if (this.accounts[accountIndex].cashe[assetIndex].votings[i].id == votingId) return i;
			}
			return -1;
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		hide: function() {
			$('#voting').hide();
			this.stop();
		},
		hideAllPanels: function(hidePrimary) {
			$('#voting-panel').hide();
			$('#voting-vote-panel').hide();
			if (hidePrimary) $('#voting-primary-panel').hide();
		},
		isMyAddress: function(addr) {
			return addr == ApplicationContext.account.address;
		},
		loadAccountVotings: async function(accountAddress, isFullRefresh){
			// Если isFullRefresh - то массив newVotings заполняется не зависимо от того сохранены ли сообщения в кеше
			// Если указан базовый адрес (isBaseAddr) - то функция возвращает и пришедшие и отправленные сообщения
			// Если указан не базовый адрес - то функция возвращает только отправленные сообщения с указанного адреса
			if (this.accounts.length <= 0) {
				console.error('accounts is empty');
				return;
			}
			if (!accountAddress) accountAddress = this.accounts[0].addr;
			var isBaseAddr = (accountAddress == this.accounts[0].addr);
			var newVotings = [];
			var i = this.findAccount(accountAddress);
			if (i < 0) {
				this.accounts.push({
					addr: accountAddress,
					cashe: [{
						assetId: votingApp.assetId,
						votings: []
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
					votings: []
				})-1;
			}
			var data = await RestApi.getTransactionsByAddr(accountAddress,1000);
			data[0].forEach(function(item){
				var ok = false;
				if (votingApp.assetId) {
					ok = (item.assetId == votingApp.assetId);
				} else {
					ok = !item.assetId;
				}
				if (ok && item.type == 4 && item.attachment && item.amount >= Constants.MINIMUM_MESSAGE_AMOUNT_COINS && item.fee >= Constants.MINIMUM_MESSAGE_FEE_COINS && (isBaseAddr || (item.recipient == votingApp.accounts[0].addr && item.sender == accountAddress))) {
					let voting = {
						amount: Money.fromCoins(item.amount, Currency.getByAssetId(item.assetId)),
						createdDate: item.timestamp,
						expirationDate: item.timestamp + 100000000,
						fee: Money.fromCoins(item.fee, Currency.BASE),
						height: item.height,
						id: item.id,
						recipient: item.recipient,
						creator: {
							id: item.sender,
							name: ''
						},
						text: votingApp.decode(item.attachment),
						time: item.timestamp
					};
					let vi = votingApp.findCasheVoting(i,j,item.id);
					if (isFullRefresh || vi < 0) newVotings.unshift(voting);
					if (vi < 0) votingApp.accounts[i].cashe[j].votings.push(voting);
				}
			});
			votingApp.accounts[i].last = lastTime.valueOf();
			return newVotings;
		},
		refresh: function() {
			this.hideAllPanels();
		},
		selectBaseProject: function() {
			this.projects.forEach(function(p){
				p.isSelected = false;
			});
			this.assetId = false;
			this.project = {};
			this.projectIndex = -1;
			this.updateBase(true).then(function(){
				votingApp.updateSelected();
				votingApp.showPrimaryPanel();
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
				votingApp.updateSelected();
				votingApp.showPrimaryPanel();
				/*
				votingApp.projects.forEach(function(p,i){
					$('#voting-project-'+i).removeClass("bg-primary");
				});
				$('#voting-project-'+index).addClass("bg-primary");
				$('#voting-primary-panel').show();
				*/
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
			$('#voting').show();
			this.updateAll();
			this.start();
		},
		showCreateNewVote: function() {
			this.vote = {
				amount: Money.fromCoins(Constants.MINIMUM_MESSAGE_AMOUNT_COINS, Currency.getByAssetId(this.project.id)),
				assetId: '',
				createdDate: 0,
				creator: {
					id: ApplicationContext.account.address,
					name: ''
				},
				expirationDate: Date.now() + 100000000,
				fee: new Money.fromCoins(Constants.MINIMUM_MESSAGE_FEE_COINS, Currency.BASE),
				id: '',
				name: '',
				recipient: this.accounts[0].addr,
				text: '',
				time: '',
				title: "New voting"
			}
			this.showVotingPanel();
			$('#voting-buttons').show();
			$('#voting-edit-table').show();
			$('#voting-info-table').hide();
		},
		showCreateNewVoting: function() {
			this.voting = {
				amount: Money.fromCoins(Constants.MINIMUM_MESSAGE_AMOUNT_COINS, Currency.getByAssetId(this.project.id)),
				assetId: '',
				createdDate: 0,
				creator: {
					id: ApplicationContext.account.address,
					name: ''
				},
				expirationDate: Date.now() + 1000000,
				fee: new Money.fromCoins(Constants.MINIMUM_MESSAGE_FEE_COINS, Currency.BASE),
				id: '',
				name: '',
				recipient: this.accounts[0].addr,
				text: '',
				time: '',
				title: "New voting"
			}
			this.showVotingPanel();
			$('#voting-buttons').show();
			$('#voting-edit-table').show();
			$('#voting-info-table').hide();
		},
		showPrimaryPanel: function() {
			this.hideAllPanels();
			$('#voting-primary-panel').show();
		},
		showVoteByIndex: function(index) {
			this.voteIndex = index;
			this.vote = this.votes[index];
			this.showVotePanel();
			$('#voting-vote-buttons').hide();
			$('#voting-vote-edit-table').hide();
			$('#voting-vote-info-table').show();
		},
		showVotePanel: function() {
			this.hideAllPanels(true);
			$('#voting-vote-panel').show();
		},
		showVotingByIndex: function(index) {
			if (this.votingIndex >= 0) $('#voting-tr-'+this.votingIndex).removeClass('primary');
			this.votingIndex = index;
			this.voting = this.votings[index];
			this.showVotingPanel();
			$('#voting-buttons').hide();
			$('#voting-edit-table').hide();
			$('#voting-info-table').show();
			$('#voting-tr-'+index).addClass('primary');
		},
		showVotingPanel: function() {
			this.hideAllPanels(true);
			this.voting.title = this.voting.id;
			$('#voting-panel').show();
		},
		start: function() {
			if (!this.updateTimer) {
				this.updateTimer = setInterval(this.update, this.updateInterval);
			}
			/*
			if (!this.updateTabIconTimer) {
				this.updateTabIconTimer = setInterval(this.updateTabIcon, 4000);
			}
			*/
		},
		stop: function() {
			clearInterval(this.updateTimer);
			this.updateTimer = false;
			/*
			clearInterval(this.updateTabIconTimer);
			this.updateTabIconTimer = false;
			*/
		},
		update: async function(isFullRefresh) {
			if (!this.project.id) return await this.updateBase(isFullRefresh);
			var height = await RestApi.getHeight();
			if (this.assetId != this.project.id) {
				this.votings = [];
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
				votingApp.loadAccountVotings(accountAddress,isFullRefresh).then(function(msgs){
					if (msgs) {
						msgs.forEach(function(msg){
							// TODO: Добавить проверку типа сообщения
							votingApp.addVoting(msg);
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
			if (isFullRefresh) {
				this.votes = [];
				this.votings = [];
			}
			accountAddress = this.accounts[0].addr;
			votingApp.loadAccountVotings(accountAddress,isFullRefresh).then(function(msgs){
				if (msgs) {
					msgs.forEach(function(msg){
						// TODO: Добавить проверку типа сообщения
						votingApp.addVoting(msg);
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
						votingApp.addProject({
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
				if (votingApp.projects.length <= 0) return;
			});
		},
		updateSelected: function() {
			votingApp.projects.forEach(function(p,i){
				$('#voting-project-'+i).removeClass("bg-primary");
			});
			if (this.projectIndex >= 0) {
				$('#voting-project-'+this.projectIndex).addClass("bg-primary");
				$('#voting-project-base').removeClass("bg-primary");
			} else {
				$('#voting-project-base').addClass("bg-primary");
			}
		},
		updateTabIcon: function () {
			var v = $('#votingTabIcon');
			var opacity = v.css("opacity");
			if (opacity >= 0.9) {
				v.css({"opacity":"0.5"});
			} else {
				v.css({"opacity":"1"});
			}
		}
	}
});

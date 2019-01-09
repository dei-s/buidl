var preferencesApp = (function(){
	var isDevMode = false;
	var list = [];

	function add(eid) {
		var e = $(eid);
		if (!e) return;
		list.push({
			eid: eid,
			displayModeDefault: getCssDisplay(eid)
		});
	}

	function getCssDisplay(eid) {
		var e = $(eid);
		if (!e) return;
		return e.css("display");
	}

	function toggleDevMode() {
		isDevMode = !isDevMode;
		if (isDevMode) {
			list.forEach(function(item){
				$(item.eid).show();
			});
		} else {
			list.forEach(function(item){
				$(item.eid).css("display", item.displayModeDefault);
			});
		}
	}

	add('#blocksTabIcon');
	add('#communityTabIcon');
	add('#exchangeTabIcon');
	add('#messagingTabIcon');

	return {
		toggleDevMode: toggleDevMode
	}
})();
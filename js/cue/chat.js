(function () {
	
	function start() {
		var initObj = {};
		initObj['name'] = prompt('Type Chat Name');
		initObj[netsuiteRtc_module.constants.FIELDS.OFFER] = 'offerStringHere';
		
		netsuiteRtc_module.initializeConnection(initObj);
	}
	
	function join() {
		var openCons = netsuiteRtc_module.findOpenConnections();
		var msg = 'Select the connection id : ' + openCons.reduce(function (str, con) {
			return str += con.name.value;
		}, '');
		
		var selected = prompt(msg);
		
	}
	
	
	
	
	
	
	
	var chat_module = {
		start : start
	};
	
	window.chat_module = chat_module;
	return chat_module;
	
})();
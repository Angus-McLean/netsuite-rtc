(function () {

	var activeChat;
	var activeEmployees = [];

	function start() {
		var initObj = {};
		initObj.name = prompt('Type Chat Name');
		initObj.employee = nlapiGetContext().getUser();

		activeChat = new ChatSession();
		activeChat.initHost(initObj);
	}

	function join() {
		var openCons = netsuiteRtc_module.findOpenConnections();
		var msg = 'Select the connection (Employee:ChannelName:ID) by typing the ID : \n' + openCons.reduce(function (str, con) {
			return str += con[netsuiteRtc_module.constants.FIELDS.EMPLOYEE].value + ' : ' + con[netsuiteRtc_module.constants.FIELDS.NAME].value +' : '+ con.id + '\n';
		}, '');

		var selected = prompt(msg);

		activeChat = ChatSession.prototype.joinFromId(selected);

		console.log('Waiting for host to accept your answer..');
	}

	function resyncNSChatRec() {
		activeChat.resyncSessionRecord();
	}

	function updateActiveEmployees() {
		var activeChannelsElem = document.getElementById('active-channels-list');
		var openCons = netsuiteRtc_module.findOpenConnections();
		openCons = netsuiteRtc_module.reduceToValues(openCons);
		activeChannelsElem.innerHTML = '';
		openCons.forEach(function (connectionRec) {
			render_engine.append(gitBaseURL + '/templates/activeUserItem.template.html', connectionRec, activeChannelsElem);
		});
	}

	var chat_module = {
		start : start,
		join : join,
		resyncNSChatRec : resyncNSChatRec,
		updateActiveEmployees : updateActiveEmployees
	};

	window.chat_module = chat_module;
	return chat_module;

})();

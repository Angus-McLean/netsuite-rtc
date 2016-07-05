(function () {

	var activeChat;

	function start() {
		var initObj = {};
		initObj.name = prompt('Type Chat Name');
		initiObj.employee = nlapiGetContext().getUser();

		var activeChat = new ChatSession();
		activeChat.initHost(initObj);
	}

	function join() {
		var openCons = netsuiteRtc_module.findOpenConnections();
		var msg = 'Select the connection (Employee:ChannelName:ID) by typing the ID : \n' + openCons.reduce(function (str, con) {
			return str += con[netsuiteRtc_module.FIELDS.EMPLOYEE].value + ' : ' + con.name.value +' : '+ con.id + '\n';
		}, '');

		var selected = prompt(msg);

		activeChat = ChatSession.prototype.joinFromId(selected);

		console.log('Waiting for host to accept your answer..');
	}

	function resyncNSChatRec() {
		activeChat.resyncSessionRecord();
	}



	var chat_module = {
		start : start,
		join : join,
		resyncNSChatRec : resyncNSChatRec
	};

	window.chat_module = chat_module;
	return chat_module;

})();

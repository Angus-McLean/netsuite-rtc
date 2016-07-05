(function () {

	var active = {
		chat : null,
		employees : []
	};

	function start() {
		var initObj = {};
		//initObj.name = prompt('Type Chat Name');
		initObj.employee = nlapiGetContext().getUser();

		active.chat = new ChatSession();
		active.chat.initHost(initObj);
	}

	function join(selected) {
		// var openCons = netsuiteRtc_module.findOpenConnections();
		// var msg = 'Select the connection (Employee:ChannelName:ID) by typing the ID : \n' + openCons.reduce(function (str, con) {
		// 	return str += con[netsuiteRtc_module.constants.FIELDS.EMPLOYEE].value + ' : ' + con[netsuiteRtc_module.constants.FIELDS.NAME].value +' : '+ con.id + '\n';
		// }, '');

		//var selected = prompt(msg);

		active.chat = ChatSession.prototype.joinFromId(selected);

		console.log('Waiting for host to accept your answer..');
	}

	function updateOrStart() {
		var employeeId = nlapiGetContext().getUser();
		var filtered = netsuiteRtc_module.reduceToValues(netsuiteRtc_module.findOpenConnections() || []).filter(function (elem) {
			return elem[netsuiteRtc_module.constants.FIELDS.EMPLOYEE] == employeeId;
		});
		if(filtered.length) {
			active.chat = ChatSession.prototype.updateHost(filtered[0]);
		} else {
			start(filtered[0]);
		}
	}

	function joinClick(selected) {

		join(selected);

	}

	function resyncNSChatRec() {
		active.chat.resyncSessionRecord();
	}

	function updateActiveEmployees() {

		function formatSearchResult(searchRow) {
			return {
				custrecord_rtc_host_employee : searchRow.custrecord_rtc_host_employee.text,
				id : searchRow.id,
				name : searchRow.name.value
			};
		}

		var activeChannelsElem = document.getElementById('active-channels-list');
		active.employees = netsuiteRtc_module.findOpenConnections() || [];
		active.employees = active.employees.map(formatSearchResult);
		activeChannelsElem.innerHTML = '';
		active.employees.forEach(function (connectionRec) {
			render_engine.append(gitBaseURL + '/templates/activeUserItem.template.html', connectionRec, activeChannelsElem);
		});
	}

	function sendMessage() {
		active.chat.send({
			type : 'text',
			sender : nlapiGetContext().getUser(),
			message : document.getElementById('btn-input').value
		});
		return false;
	}

	function addListenersToChat(chatSesObj) {
		chatSesObj.on('text', function (msgObj) {
			console.log(msgObj);
		})
	}

	var chat_module = {
		active : active,
		updateOrStart : updateOrStart,
		start : start,
		joinClick : joinClick,
		resyncNSChatRec : resyncNSChatRec,
		updateActiveEmployees : updateActiveEmployees
	};

	window.chat_module = chat_module;
	return chat_module;

})();

(function () {

	var chatLog = document.getElementById('message-container');

	var active = {
		chat : null,
		employees : []
	};

	function start() {
		var initObj = {};
		//initObj.name = prompt('Type Chat Name');
		initObj.employee = nlapiGetContext().getUser();

		active.chat = new ChatSession();
		addListenersToChat(active.chat);
		setTimeout(function () {
			console.info('initHost')
			active.chat.initHost(initObj);
		}, 1000);
	}

	function join(selected) {
		// var openCons = netsuiteRtc_module.findOpenConnections();
		// var msg = 'Select the connection (Employee:ChannelName:ID) by typing the ID : \n' + openCons.reduce(function (str, con) {
		// 	return str += con[netsuiteRtc_module.constants.FIELDS.EMPLOYEE].value + ' : ' + con[netsuiteRtc_module.constants.FIELDS.NAME].value +' : '+ con.id + '\n';
		// }, '');

		//var selected = prompt(msg);

		active.chat = ChatSession.prototype.joinFromId(selected);
		addListenersToChat(active.chat);

		render_engine.append(gitBaseURL + '/templates/dialog_message.template.html', {message:'Sit tight while we connect you..'}, chatLog);
	}

	function updateOrStart() {
		var employeeId = nlapiGetContext().getUser();
		var filtered = netsuiteRtc_module.reduceToValues(netsuiteRtc_module.findOpenConnections() || []).filter(function (elem) {
			return elem[netsuiteRtc_module.constants.FIELDS.EMPLOYEE] == employeeId;
		});
		if(filtered.length) {
			active.chat = ChatSession.prototype.updateHost(filtered[0]);
			addListenersToChat(active.chat);
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

	function startVideo() {
		if(!active.chat) return;

		active.chat.addVideo();
	}

	function sendMessage() {
		var msgIn = document.getElementById('btn-input');
		if(msgIn.value === '') return;
		active.chat.sendMessage(document.getElementById('btn-input').value);
		document.getElementById('btn-input').value = '';
		return false;
	}

	render_engine.append(gitBaseURL + '/templates/dialog_message.template.html', {message:'Welcome to NetSuite RTC! ☺'}, chatLog);
	document.getElementById('btn-input').onkeydown = function (e) {
		if(e.keyCode == 13){
			sendMessage();
		}
	};

	function addListenersToChat(chatSesObj) {
		chatSesObj.on('addstream', function (e) {
			console.log('Got remote stream', e.stream)
			var el = document.getElementById('remoteVideo')
			el.autoplay = true
			el.src = webkit.createObjectURL(e.stream);
		})
		chatSesObj.on('new_message_sent', function (msgObj) {
			console.log('new_message_sent',msgObj);
			render_engine.append(gitBaseURL + '/templates/message_sent.template.html', msgObj, chatLog);
		});

		chatSesObj.on('new_message_received', function (msgObj) {
			console.log('new_message_received',msgObj);
			render_engine.append(gitBaseURL + '/templates/message_receive.template.html', msgObj, chatLog);
		});

		chatSesObj.on('open', function (ev) {
			render_engine.replace(gitBaseURL + '/templates/dialog_message.template.html', {message:'---- Begining of your conversation ----'}, chatLog);
		});

		chatSesObj.on('close', function (ev) {
			render_engine.replace(gitBaseURL + '/templates/dialog_message.template.html', {message:'Welcome to NetSuite RTC! ☺'}, chatLog);
			//updateOrStart();
		});
	}

	var chat_module = {
		active : active,
		updateOrStart : updateOrStart,
		start : start,
		joinClick : joinClick,
		resyncNSChatRec : resyncNSChatRec,
		updateActiveEmployees : updateActiveEmployees,
		sendMessage : sendMessage,
		startVideo : startVideo
	};

	window.chat_module = chat_module;
	return chat_module;

})();


;(function () {

	window.onload = function () {

		// display available chats
		setTimeout(chat_module.updateActiveEmployees.bind(chat_module), 1000);
		setTimeout(chat_module.updateOrStart.bind(chat_module), 500);

		setInterval(chat_module.updateActiveEmployees.bind(chat_module), 10000);
		setInterval(function () {
			if(chat_module.active.chat.RTCSession.role === 'HOST') chat_module.active.chat.resyncSessionRecord();
		}, 5000);

	};
})();

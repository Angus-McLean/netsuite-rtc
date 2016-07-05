
;(function () {

	window.onload = function () {

		// display available chats
		setTimeout(chat_module.updateActiveEmployees.bind(chat_module), 1000);
		setTimeout(chat_module.start.bind(chat_module), 1000);
	};
})();

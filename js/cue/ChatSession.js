
;(function () {

	var nsFields = netsuiteRtc_module.constants.FIELDS;

	var ChatSessionsList = {
		listeningHost : null
	};

	function ChatSession() {

		var self = this;
		EventEmitter.call(this);

		this.sessionRecord = null;
		this.sessionRecordId = null;

		// create RTC Session
		this.RTCSession = new RTCSession();
		addRTCSessionListeners(this, this.RTCSession);

	}

	function addRTCSessionListeners(chatSesObj, rtcSes) {
		// proxy all listeners
		rtcSes.onAll(function (ev) {
			chatSesObj.emit(ev.name, ev.event);
		});

		rtcSes.on('text', chatSesObj.emit.bind(chatSesObj, 'new_message_received'));

	}
	ChatSession.prototype = Object.create(EventEmitter.prototype);
	ChatSession.prototype.updateHost = function (initParams) {
		var self = (this === ChatSession.prototype) ? new ChatSession(initParams) : this;
		self.RTCSession.role = 'HOST';

		self.RTCSession.createOffer(function (er, offer) {
			if(er) return console.error(er);
			self.sessionRecordId = initParams.id;
			netsuiteRtc_module.updateField(initParams.id, nsFields.OFFER, JSON.stringify(offer));
		});
		return self;
	};

	ChatSession.prototype.initHost = function (initParams) {
		// get offer RTCSession offer
		var self = this;
		this.RTCSession.name = initParams && initParams.name;
		this.RTCSession.role = 'HOST';

		this.RTCSession.createOffer(function (er, offer) {
			if(er) return console.error(er);

			var initObj = {};
			initObj.name = initParams.name;
			initObj[nsFields.OFFER] = JSON.stringify(offer);
			initObj[nsFields.EMPLOYEE] = initParams.employee || nlapiGetContext().getUser();
			self.sessionRecordId = netsuiteRtc_module.initializeConnection(initObj);
		});
	};

	ChatSession.prototype.resyncSessionRecord = function () {
		var self = this;
		var newRec = netsuiteRtc_module.loadChatRecordObject(this.sessionRecordId);
		if(JSON.stringify(newRec) !== JSON.stringify(this.sessionRecord)) {
			// record has changed
			// if new record has ANSWER accept the offer
			this.sessionRecord = newRec;
			if(newRec[nsFields.ANSWER]) this.acceptOffer(newRec[nsFields.ANSWER]);
		}
	};

	ChatSession.prototype.acceptOffer = function (offerStr) {
		var answerObj = JSON.parse(offerStr);
		this.RTCSession.setAnswer(answerObj);
	};

	ChatSession.prototype.joinFromId = function (chatRecordId) {
		var obj = netsuiteRtc_module.loadChatRecordObject(chatRecordId);
		return ChatSession.prototype.joinFromObject.call(this, obj);
	};

	ChatSession.prototype.joinFromRecord = function (chatRecord) {
		var obj = netsuiteRtc_module.recordToObject(chatRecord);
		return ChatSession.prototype.joinFromObject.call(this, obj);
	};

	ChatSession.prototype.joinFromObject = function (chatRecord) {
		// assume contains all necessary information (offer string, etc)
		var self = (this === ChatSession.prototype) ? new ChatSession(chatRecord) : this;

		self.sessionRecordId = chatRecord.id;
		var offerObj = JSON.parse(chatRecord[nsFields.OFFER]);
		self.RTCSession.setOffer(offerObj);
		self.RTCSession.peerConnection.onicecandidate = function (ev) {
			if (ev.candidate == null) {
				var acceptDesc = JSON.stringify(self.RTCSession.peerConnection.localDescription);
				netsuiteRtc_module.updateField(self.sessionRecordId, nsFields.ANSWER, acceptDesc);
			}
		};
		return self;
	};

	ChatSession.prototype.sendMessage = function (msgText) {
		var msgObj = {
			type : 'text',
			sender : nlapiGetContext().getUser(),
			timestampe : new Date(),
			message : msgText
		};
		this.RTCSession.dataChannel.send(JSON.stringify(msgObj));
		this.emit('new_message_sent', msgObj);
	};

	window.ChatSession = ChatSession;
	return ChatSession;

})();

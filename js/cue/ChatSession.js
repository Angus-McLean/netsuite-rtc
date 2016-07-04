
;(function () {
	
	var nsFields = netsuiteRtc_module.constants.FIELDS;
	
	var ChatSessionsList = {
		listeningHost : null
	};
	
	function ChatSession() {
		
		var self = this;
		
		this.sessionRecord = null;
		this.sessionRecordId = null;
		
		// create RTC Session
		this.RTCSession = new RTCSession();
		
	}
	
	ChatSession.prototype.initHost = function (initParams) {
		// get offer RTCSession offer
		this.RTCSession.name = initParams && initParams.name;
		this.RTCSession.role = 'HOST';
		
		this.RTCSession.createOffer(function (er, offer) {
			if(er) return console.error(er);
			
			var initObj = {};
			initObj.name = (''+Math.random()).slice(2);
			initObj[nsFields.OFFER] = JSON.stringify(offer);
			self.sessionRecordId = netsuiteRtc_module.initializeConnection(initObj);
		});
	};
	
	ChatSession.prototype.resyncSessionRecord = function () {
		var self = this;
		var newRec = netsuiteRtc_module.loadChatRecordObject(this.sessionRecordId);
		if(JSON.stringify(newRec) !== JSON.stringify(this.sessionRecord)) {
			// record has changed
			// if new record has ANSWER accept the offer
			if(newRec[nsFields.ANSWER]) this.acceptOffer(newRec[nsFields.ANSWER]);
		}
	};
	
	ChatSession.prototype.acceptOffer = function (offerStr) {
		var answerObj = JSON.parse(offerStr);
		this.RTCSession.setAnswer(answerObj);
	};
	
	ChatSession.prototype.joinFromId = function (chatRecordId) {
		var obj = netsuiteRtc_module.loadChatRecordObject(chatRecordId);
		ChatSession.prototype.joinFromObject.call(this, obj);
	};
	
	ChatSession.prototype.joinFromRecord = function (chatRecord) {
		var obj = netsuiteRtc_module.recordToObject(chatRecord);
		ChatSession.prototype.joinFromObject.call(this, obj);
	};
	
	ChatSession.prototype.joinFromObject = function (chatRecord) {
		var self = this;
		// assume contains all necessary information (offer string, etc)
		var chatSesObj = (this === ChatSession.prototype) ? new ChatSession(chatRecord) : this;
		
		this.sessionRecordId = chatRecord.id;
		var offerObj = JSON.parse(chatRecord[nsFields.OFFER]);
		chatSesObj.RTCSession.setOffer(offerObj);
		chatSesObj.RTCSession.peerConnection.onicecandidate = function (ev) {
			if (ev.candidate == null) {
				var acceptDesc = JSON.stringify(self.RTCSession.peerConnection.localDescription);
				netsuiteRtc_module.updateField(self.sessionRecordId, nsFields.ANSWER, acceptDesc);
			}
		};
	};
	
	window.ChatSession = ChatSession;
	return ChatSession;
	
})();
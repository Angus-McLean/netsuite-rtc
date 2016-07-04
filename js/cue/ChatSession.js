
;(function () {
	
	var nsFields = netsuiteRtc_module.constants.FIELDS;
	
	var ChatSessionsList = {
		listeningHost : null
	};
	
	function ChatSession() {
		
		var self = this;
		
		this.sessionRecordId = null;
		
		// create RTC Session
		this.RTCSession = new RTCSession();
		
	}
	
	ChatSession.prototype.initHost = function (initParams) {
		// get offer RTCSession offer
		this.RTCSession.name = initParams && initParams.name;
		this.RTCSession.role = 'HOST';
		
		this.RTCSession.createOffer(function (er, offer) {
			if(err) return console.error(er);
			
			var initObj = {};
			initObj.name = (''+Math.random()).slice(2);
			initObj[nsFields.OFFER] = JSON.stringify(offer);
			self.sessionRecordId = netsuiteRtc_module.initializeConnection(initObj);
		});
	};
	
	ChatSession.prototype.joinFromId = function (chatRecordId) {
		var obj = netsuiteRtc_module.loadChatRecordObject(chatRecordId);
		ChatSession.prototype.call(this, obj);
	};
	
	ChatSession.prototype.joinFromSearchResult = function (chatRecord) {
		// assume contains all necessary information (offer string, etc)
		var offerObj = {};
		
	};
	
	ChatSession.prototype.joinFromRecord = function (chatRecord) {
		
	};
	
	ChatSession.prototype.joinFromObject = function (chatRecord) {
		var self = this;
		// assume contains all necessary information (offer string, etc)
		var chatSesObj = (this === ChatSession.prototype) ? new ChatSession(chatRecord) : this;
		
		this.sessionRecordId = chatRecord.id;
		chatSesObj.setOffer(chatRecord[nsFields.OFFER]);
		chatSesObj.RTCSession.peerConnection.onicecandidate = function (ev) {
			if (e.candidate == null) {
				var acceptDesc = self.RTCSession.peerConnection.localDescription;
				netsuiteRtc_module.updateField(self.sessionRecordId, nsFields.ANSWER, acceptDesc);
			}
		};
	};
	
	window.ChatSession = ChatSession;
	return ChatSession;
	
})();
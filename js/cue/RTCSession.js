
(function () {
	
	var rtcSessions = {};
	
	var cfg = {'iceServers': [{'url': 'stun:23.21.150.121'}]},
		con = {'optional': [{'DtlsSrtpKeyAgreement': true}]};
	
	var pc1 = new RTCPeerConnection(cfg, con);
	
	var sdpConstraints = {
		optional: [],
		mandatory: {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
		}
	};
	
	function RTCSession(initParams) {
		var self = this;
		
		// Instance metadata
		this.name = initParams && initParams.name;
		this.role = initParams && initParams.role;
		
		// Connection Information
		this.localOffer = null;
		this.localAnswer = null;
		this.remoteOffer = null;
		this.remoteAnswer = null;
		
		this.peerConnection = new RTCPeerConnection(cfg, con);
		this.dataChannel = null;
		
		setUpConnection(this);
	}
	
	RTCSession.prototype.createOffer = function (cb) {
		this.dataChannel = setupHostDataChannel(this);
		setupHostConnection(this, cb);
	};
	
	RTCSession.prototype.setOffer = function (offer) {
		var self = this;
		
		setupClientDataChannel(self);
		
		var offerDesc = new RTCSessionDescription(offer);
		this.peerConnection.setRemoteDescription(offerDesc);
		this.remoteOffer = offerDesc;
		this.peerConnection.createAnswer(
			function (answerDesc) {
				self.localAnswer = answerDesc;
				
				self.peerConnection.setLocalDescription(answerDesc);
			},
			function () { console.warn("Couldn't create offer");},
			sdpConstraints
		);
	};
	
	RTCSession.prototype.setAnswer = function (answer) {
		var answerDesc = new RTCSessionDescription(answer);
		this.peerConnection.setRemoteDescription(answerDesc);
		this.remoteAnswer = answerDesc;
	};
	
	function setupClientDataChannel(rtcSessObj) {
		rtcSessObj.peerConnection.ondatachannel = function (e) {
			//var fileReceiver2 = new FileReceiver();
			var fileReceiver2;
			var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
			console.log('Received datachannel ', arguments);
			dc2 = datachannel;
			dc2.onopen = function (e) {
				console.log('data channel connect');
			};
			dc2.onmessage = function (e) {
				console.log('Got message ', e.data);
				if (e.data.size) {
					fileReceiver2.receive(e.data, {});
				} else {
					var data = JSON.parse(e.data);
					if (data.type === 'file') {
						fileReceiver2.receive(e.data, {});
					} else {
						writeToChatLog(data.message, 'text-info');
					}
				}
			};
			rtcSessObj.dataChannel = dc2;
		};
	}
	
	function setupHostDataChannel(rtcSessObj) {
		try {
			//var fileReceiver1 = new FileReceiver();
			var fileReceiver1;
			dc1 = rtcSessObj.peerConnection.createDataChannel('test', {reliable: true});
			dc1.onopen = function (e) {
				console.log('data channel connect');
			};
			dc1.onclose = function () {
				console.log("datachannel close");
			};
			dc1.onmessage = function (e) {
				console.log('Got message (peerConnection)', e.data);
				if (e.data.size) {
					fileReceiver1.receive(e.data, {});
				} else {
					if (e.data.charCodeAt(0) == 2) {
						// The first message we get from Firefox (but not Chrome)
						// is literal ASCII 2 and I don't understand why -- if we
						// leave it in, JSON.parse() will barf.
						return;
					}
					console.log(e);
					var data = JSON.parse(e.data);
					if (data.type === 'file') {
						fileReceiver1.receive(e.data, {});
					} else {
						writeToChatLog(data.message, 'text-info');
					}
				}
			};
			return dc1;
		} catch (e) {
			console.warn('No data channel (pc1)', e);
		}
	}
	
	function setUpConnection(rtcSessObj) {
		
		function onsignalingstatechange (state) {
			console.log('signaling state change:', state);
		}
		
		function oniceconnectionstatechange (state) {
			console.log('ice connection state change:', state);
		}
		
		function onicegatheringstatechange (state) {
			console.log('ice gathering state change:', state);
		}
		
		rtcSessObj.peerConnection.onsignalingstatechange = onsignalingstatechange;
		rtcSessObj.peerConnection.oniceconnectionstatechange = oniceconnectionstatechange;
		rtcSessObj.peerConnection.onicegatheringstatechange = onicegatheringstatechange;
		
		rtcSessObj.peerConnection.onicecandidate = function (e) {
			//console.log('ICE candidate '+this.name, e);
			if (e.candidate == null) {
				console.info(JSON.stringify(rtcSessObj.peerConnection.localDescription).replace(/\\/g,'\\\\'));
			}
		};
	}

	function setupHostConnection(rtcSessObj, cb) {
		rtcSessObj.peerConnection.createOffer(
			function (desc) {
				rtcSessObj.peerConnection.setLocalDescription(desc, function () {}, function () {});
				rtcSessObj.offer = desc;
				console.info(JSON.stringify(desc).replace(/\\/g,'\\\\'));
				if(cb) cb(null, desc);
			},
			function (e) {
				console.warn("Couldn't create offer");
				if(cb) cb(e, null);
			},
			sdpConstraints
		);
	}
	
	window.RTCSession = RTCSession;
	return RTCSession;
})()
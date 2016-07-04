/* See also:
http://www.html5rocks.com/en/tutorials/webrtc/basics/
https://code.google.com/p/webrtc-samples/source/browse/trunk/apprtc/index.html

https://webrtc-demos.appspot.com/html/pc1.html
*/
/*
Steps : 
	createLocalOffer is called
	copy the localDescription object
	paste and parse it into client then call setOffer(offerObject)
	copy paste the answer into setAnswer(answerObject)
	use activedc.send(JSON.stringify({msgObj})) to send message back and forth
	
*/

var cfg = {'iceServers': [{'url': 'stun:23.21.150.121'}]},
	con = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

/* THIS IS ALICE, THE CALLER/SENDER */

var pc1 = new RTCPeerConnection(cfg, con),
	dc1 = null, tn1 = null;

// Since the same JS file contains code for both sides of the connection,
// activedc tracks which of the two possible datachannel variables we're using.
var activedc;

var pc1icedone = false;

var sdpConstraints = {
	optional: [],
	mandatory: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true
	}
};


createLocalOffer();

//@entry pc2 : write offer JSON string of offer object here
function setOffer(offer){
	var offerDesc = new RTCSessionDescription(offer);
	//console.log('Received remote offer', offerDesc)
	//writeToChatLog('Received remote offer', 'text-success')
	handleOfferFromPC1(offerDesc);
}


function setAnswer(answer){
	var answerDesc = new RTCSessionDescription(answer);
	handleAnswerFromPC2(answerDesc);
}

function sendMessage (msg) {
	var channel = new RTCMultiSession();
	writeToChatLog(msg, 'text-success');
	channel.send({message: msg});
	
	return false;
}

function setupDC1 () {
	try {
		//var fileReceiver1 = new FileReceiver();
		var fileReceiver1;
		dc1 = pc1.createDataChannel('test', {reliable: true});
		activedc = dc1;
		dc1.onopen = function (e) {
			console.log('data channel connect');
		};
		dc1.onclose = function () {
			console.log("datachannel close");
		};
		dc1.onmessage = function (e) {
			console.log('Got message (pc1)', e.data);
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
	} catch (e) {
		console.warn('No data channel (pc1)', e);
	}
}

function createLocalOffer () {
	setupDC1();
	pc1.createOffer(
		function (desc) {
			pc1.setLocalDescription(desc, function () {}, function () {});
			//console.log('created local offer', desc);
			console.info(JSON.stringify(desc).replace(/\\/g,'\\\\'));
		},
		function () {
			console.warn("Couldn't create offer");
		},
		sdpConstraints
	);
}

//@entry : recieved localDescription
pc1.onicecandidate = function (e) {
	//console.log('ICE candidate (pc1)', e);
	if (e.candidate == null) {
		console.log('pc1.localDescription', pc1.localDescription);
	}
};

function handleOnconnection () {
	console.log('Datachannel connected');
	writeToChatLog('Datachannel connected', 'text-success');
}

pc1.onconnection = handleOnconnection;

function onsignalingstatechange (state) {
	console.log('signaling state change:', state);
}

function oniceconnectionstatechange (state) {
	console.log('ice connection state change:', state);
}

function onicegatheringstatechange (state) {
	console.log('ice gathering state change:', state);
}

pc1.onsignalingstatechange = onsignalingstatechange;
pc1.oniceconnectionstatechange = oniceconnectionstatechange;
pc1.onicegatheringstatechange = onicegatheringstatechange;

function handleAnswerFromPC2 (answerDesc) {
	console.log('Received remote answer: ', answerDesc);
	writeToChatLog('Received remote answer', 'text-success');
	pc1.setRemoteDescription(answerDesc);
}

function handleCandidateFromPC2 (iceCandidate) {
	pc1.addIceCandidate(iceCandidate);
}

/* THIS IS BOB, THE ANSWERER/RECEIVER */

var pc2 = new RTCPeerConnection(cfg, con),
	dc2 = null;

var pc2icedone = false;

pc2.ondatachannel = function (e) {
	//var fileReceiver2 = new FileReceiver();
	var fileReceiver2;
	var datachannel = e.channel || e; // Chrome sends event, FF sends raw channel
	console.log('Received datachannel (pc2)', arguments);
	dc2 = datachannel;
	activedc = dc2;
	dc2.onopen = function (e) {
		console.log('data channel connect');
	};
	dc2.onmessage = function (e) {
		console.log('Got message (pc2)', e.data);
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
};

function handleOfferFromPC1 (offerDesc) {
	pc2.setRemoteDescription(offerDesc);
	pc2.createAnswer(
		function (answerDesc) {
			writeToChatLog('Created local answer', 'text-success');
			//console.log('Created local answer: ', answerDesc);
			//console.info(JSON.stringify(answerDesc).replace(/\\/g,'\\\\'));
			pc2.setLocalDescription(answerDesc);
		},
		function () { console.warn("Couldn't create offer");},
		sdpConstraints
	);
}

pc2.onicecandidate = function (e) {
	//console.log('ICE candidate (pc2)', e);
	if (e.candidate == null) {
		console.info(JSON.stringify(pc2.localDescription).replace(/\\/g,'\\\\'));
	}
};

pc2.onsignalingstatechange = onsignalingstatechange;
pc2.oniceconnectionstatechange = oniceconnectionstatechange;
pc2.onicegatheringstatechange = onicegatheringstatechange;

function handleCandidateFromPC1 (iceCandidate) {
	pc2.addIceCandidate(iceCandidate);
}

pc2.onconnection = handleOnconnection;

function writeToChatLog (message, message_type) {
	console.log(message_type, message);
}

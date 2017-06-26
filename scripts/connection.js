let isChannelReady = false;
let isInitiator = false;
let isStarted = false;
let localStream;
let pc;
let remoteStream;
let turnReady;

// TODO: move whole Connection to Service.js?

const log = (...args) => {
	console.log('Connection: ' + args)
}

const pcConfig = {
	'iceServers': [{
		'url': 'stun:stun.l.google.com:19302'
	}]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
	offerToReceiveAudio: true,
	offerToReceiveVideo: true
};

/////////////////////////////////////////////

// if (room !== '') {
// 	socket.emit('create or join', room);
// 	log('Attempted to create or  join room', room);
// }

// socket.on('created', function(room) {
// 	log('Created room ' + room);
// 	isInitiator = true;
// });

// socket.on('full', function(room) {
// 	log('Room ' + room + ' is full');
// });

// socket.on('join', function (room){
// 	log('Another peer made a request to join room ' + room);
// 	log('This peer is the initiator of room ' + room + '!');
// 	isChannelReady = true;
// });

// socket.on('joined', function(room) {
// 	log('joined: ' + room);
// 	isChannelReady = true;
// });

// socket.on('log', function(array) {
// 	log.apply(console, array);
// });

////////////////////////////////////////////////

class Connection {

	constructor() {
	}

	setupUser(name) {
		this.userName = name
	}

	// This client receives a message
	startListening() {
		if (this.userKey) {
			throw new Error('no userKey')
		}
		const messagesRef = db.ref('users/' + this.userKey + '/messages')

		messagesRef.on('value', snapshot => {
			const message = snapshot.val()
			log('Client received message:', message)

			if (message === 'got user media') {
				this.maybeStart()
			} else if (message.type === 'offer') {
				if (!isInitiator && !isStarted) {
					this.maybeStart()
				}
				pc.setRemoteDescription(new RTCSessionDescription(message))
				doAnswer()
			} else if (message.type === 'answer' && isStarted) {
				pc.setRemoteDescription(new RTCSessionDescription(message))
			} else if (message.type === 'candidate' && isStarted) {
				var candidate = new RTCIceCandidate({
					sdpMLineIndex: message.label,
					candidate: message.candidate
				})
				pc.addIceCandidate(candidate)
			} else if (message === 'bye' && isStarted) {
				this.handleRemoteHangup()
			}
		})

		const hostRef = db.ref('users/' + this.userKey + '/host')
		hostRef.on('value', snapshot => {
			log('looks like youre the host now.')
			isInitiator = snapshot.val()
		})
	}


}

function sendMessage(message) {
	log('Client sending message: ', message);
	socket.emit('message', message);
}



////////////////////////////////////////////////////

function uselessStuff(){

	var localVideo = document.querySelector('#localVideo');
	var remoteVideo = document.querySelector('#remoteVideo');

	navigator.mediaDevices.getUserMedia({
		audio: false,
		video: true
	})
		.then(gotStream)
		.catch(function (e) {
			alert('getUserMedia() error: ' + e.name);
		});

	function gotStream(stream) {
		log('Adding local stream.');
		localVideo.src = window.URL.createObjectURL(stream);
		localStream = stream;
		sendMessage('got user media');
		if (isInitiator) {
			maybeStart();
		}
	}

	var constraints = {
		video: true
	};

	log('Getting user media with constraints', constraints);
}

if (location.hostname !== 'localhost') {
	requestTurn(
		'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
	);
}

function maybeStart() {
	log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
	if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
		log('>>>>>> creating peer connection');
		createPeerConnection();
		pc.addStream(localStream);
		isStarted = true;
		log('isInitiator', isInitiator);
		if (isInitiator) {
			doCall();
		}
	}
}

window.onbeforeunload = function () {
	sendMessage('bye');
};

/////////////////////////////////////////////////////////

function createPeerConnection() {
	try {
		pc = new RTCPeerConnection(null);
		pc.onicecandidate = handleIceCandidate;
		pc.onaddstream = handleRemoteStreamAdded;
		pc.onremovestream = handleRemoteStreamRemoved;
		log('Created RTCPeerConnnection');
	} catch (e) {
		log('Failed to create PeerConnection, exception: ' + e.message);
		alert('Cannot create RTCPeerConnection object.');
		return;
	}
}

function handleIceCandidate(event) {
	log('icecandidate event: ', event);
	if (event.candidate) {
		sendMessage({
			type: 'candidate',
			label: event.candidate.sdpMLineIndex,
			id: event.candidate.sdpMid,
			candidate: event.candidate.candidate
		});
	} else {
		log('End of candidates.');
	}
}

function handleRemoteStreamAdded(event) {
	log('Remote stream added.');
	remoteVideo.src = window.URL.createObjectURL(event.stream);
	remoteStream = event.stream;
}

function handleCreateOfferError(event) {
	log('createOffer() error: ', event);
}

function doCall() {
	log('Sending offer to peer');
	pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}

function doAnswer() {
	log('Sending answer to peer.');
	pc.createAnswer().then(
		setLocalAndSendMessage,
		onCreateSessionDescriptionError
	);
}

function setLocalAndSendMessage(sessionDescription) {
	// Set Opus as the preferred codec in SDP if Opus is present.
	//  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
	pc.setLocalDescription(sessionDescription);
	log('setLocalAndSendMessage sending message', sessionDescription);
	sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error) {
	trace('Failed to create session description: ' + error.toString());
}

function requestTurn(turnURL) {
	var turnExists = false;
	for (var i in pcConfig.iceServers) {
		if (pcConfig.iceServers[i].url.substr(0, 5) === 'turn:') {
			turnExists = true;
			turnReady = true;
			break;
		}
	}
	if (!turnExists) {
		log('Getting TURN server from ', turnURL);
		// No TURN server. Get one from computeengineondemand.appspot.com:
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var turnServer = JSON.parse(xhr.responseText);
				log('Got TURN server: ', turnServer);
				pcConfig.iceServers.push({
					'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
					'credential': turnServer.password
				});
				turnReady = true;
			}
		};
		xhr.open('GET', turnURL, true);
		xhr.send();
	}
}

function handleRemoteStreamAdded(event) {
	log('Remote stream added.');
	remoteVideo.src = window.URL.createObjectURL(event.stream);
	remoteStream = event.stream;
}

function handleRemoteStreamRemoved(event) {
	log('Remote stream removed. Event: ', event);
}

function hangup() {
	log('Hanging up.');
	stop();
	sendMessage('bye');
}

function handleRemoteHangup() {
	log('Session terminated.');
	stop();
	isInitiator = false;
}

function stop() {
	isStarted = false;
	// isAudioMuted = false;
	// isVideoMuted = false;
	pc.close();
	pc = null;
}

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
	var sdpLines = sdp.split('\r\n');
	var mLineIndex;
	// Search for m line.
	for (var i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('m=audio') !== -1) {
			mLineIndex = i;
			break;
		}
	}
	if (mLineIndex === null) {
		return sdp;
	}

	// If Opus is available, set it as the default in m line.
	for (i = 0; i < sdpLines.length; i++) {
		if (sdpLines[i].search('opus/48000') !== -1) {
			var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
			if (opusPayload) {
				sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex],
					opusPayload);
			}
			break;
		}
	}

	// Remove CN in m line and sdp.
	sdpLines = removeCN(sdpLines, mLineIndex);

	sdp = sdpLines.join('\r\n');
	return sdp;
}

function extractSdp(sdpLine, pattern) {
	var result = sdpLine.match(pattern);
	return result && result.length === 2 ? result[1] : null;
}

// Set the selected codec to the first in m line.
function setDefaultCodec(mLine, payload) {
	var elements = mLine.split(' ');
	var newLine = [];
	var index = 0;
	for (var i = 0; i < elements.length; i++) {
		if (index === 3) { // Format of media starts from the fourth.
			newLine[index++] = payload; // Put target payload to the first.
		}
		if (elements[i] !== payload) {
			newLine[index++] = elements[i];
		}
	}
	return newLine.join(' ');
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
	var mLineElements = sdpLines[mLineIndex].split(' ');
	// Scan from end for the convenience of removing an item.
	for (var i = sdpLines.length - 1; i >= 0; i--) {
		var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
		if (payload) {
			var cnPos = mLineElements.indexOf(payload);
			if (cnPos !== -1) {
				// Remove CN payload from m line.
				mLineElements.splice(cnPos, 1);
			}
			// Remove CN line in sdp
			sdpLines.splice(i, 1);
		}
	}

	sdpLines[mLineIndex] = mLineElements.join(' ');
	return sdpLines;
}


export default Connection

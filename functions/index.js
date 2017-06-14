const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!")
})

// exports.create = functions. ', function(room) {
// 	log('Received request to create or join room ' + room);

// 	var numClients = Object.keys(io.sockets.sockets).length;
// 	log('Room ' + room + ' now has ' + numClients + ' client(s)');

// 	if (numClients === 1) {
// 		socket.join(room);
// 		log('Client ID ' + socket.id + ' created room ' + room);
// 		socket.emit('created', room, socket.id);

// 	} else if (numClients === 2) {
// 		log('Client ID ' + socket.id + ' joined room ' + room);
// 		io.sockets.in(room).emit('join', room);
// 		socket.join(room);
// 		socket.emit('joined', room, socket.id);
// 		io.sockets.in(room).emit('ready');
// 	} else { // max two clients
// 		socket.emit('full', room);
// 	}
// });

exports.getIpAddr = functions.https.onRequest((req, res) => {
	res.status(200).send(req.ips[0])
})


exports.setHostOnFirstUser = functions.database.ref('/users/{id}')
.onWrite(event => {
	const user = event.data.val()
	const userKey = event.data.key
	const roomId = user.room

	// Get room info, and see if it has host already
	admin.database.ref('/rooms/'+roomId+'/host').once('value').then(snapshot => {
		const val = snapshot.val()
		// No host yet, hurray!
		if (!!val) {
			admin.database.ref('/rooms/'+roomId+'/host').set({
				userId: userKey,
				userName: user.name
			})
		}
	})

})

exports.setHostWhenHostLeaves = functions.database.ref('/users/{id}')
.onWrite(event => {
	// See if the user is leaving
	if( !(event.data.previous.exists() && !event.data.exists()) ){
		return
	}

	// See if he's a host
	const hostOf = event.data.previous.child('hostOf').val()

	if(!hostOf){
		return
	}

	// Get any first user in the room
	const hostCandidate = admin.database.ref('/users')
		.orderByChild('room')
		.equalTo(hostOf)
		.limitToFirst(1)

	if(!hostCandidate){
		console.log('no more users. Clearing host of the room')
		admin.database.ref('/rooms/'+hostOf+'/host').remove()
	} else {
		hostCandidate.child('hostOf').set(hostOf)
	}
})


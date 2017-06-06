const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

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

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!")
})

exports.getIpAddr = functions.https.onRequest((req, res) => {
	res.status(200).send(req.ips[0])
})

exports.setHostOnFirstUser = functions.database.ref('/users/{id}')
.onWrite(event => {
	if (!event.data.exists()) return
	const userKey = event.data.key
	const userName = event.data.val().name
	const room = event.data.val().room
	
	_setHostOnFirstUser(room, userKey, userName)
})

function _setHostOnFirstUser(room, userKey, userName) {
	// See if the room already has host.
	return admin.database.ref('/rooms/' + room + '/host').then(snapshot => {
		console.log(`I'm in _setHostOnFirstUser ref`)
		if (!snapshot.exists()) {
			console.log(`room "${room}" has no host`)
			// Update the room with new host
			setRoomHost(room, userKey, userName)
			console.log(`I'm after setRoomHost`)
			// Update itself with isHost
			admin.database.ref('/users/' + userKey).update({
				isHost: true,
			}, () => {
				console.log(`User ${userName} upadted, is now a host`)
			})
		}
	})
}

function setRoomHost(roomId, userKey, userName){
	console.log(`I'm in setRoomHost (${roomId}, ${userKey}, ${userName})`)
	return admin.database.ref('/rooms/'+roomId).child('host').set({
		userId: userKey,
		userName: userName
	})
}

exports.setHostWhenHostLeaves = functions.database.ref('/users/{id}')
.onWrite(event => {
	// See if the user is leaving
	if( !(event.data.previous.exists() && !event.data.exists()) ){
		return
	}
	// See if he's a host
	const isHost = event.data.previous.child('isHost').val()

	if(!isHost){
		return
	}
	// Of which room he was a host
	const room = event.data.previous.child('room').val()

	// Get any first user in the room
	queryHostCandidate(hostOf).then(snap => {
		if (snap.exists()) {
			snap.child('hostOf').set(hostOf)
			return setRoomHost(hostOf, snap.key, snap.val().name)
		}else{
			console.log('no more users. Clearing host of the room')
			return functions.database.ref('/rooms/'+hostOf+'/host').remove()
		}
	})
})

function queryHostCandidate(hostOf){
	return functions.database.ref('/users')
		.orderByChild('room')
		.equalTo(room)
		.limitToFirst(1)
		.once('value')
		.then(snap => {
			if (snap.exists()) {
				snap.child('isHost').set(true)
			}else{
				console.log('no more users. Clearing host of the room')
				admin.database.ref('/rooms/'+room+'/host').remove()
			}
		})
}

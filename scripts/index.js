import React from 'react'
import ReactDOM from 'react-dom'

import * as firebase from 'firebase'
import Main from './main'


// Initialize Firebase
const config = {
	apiKey: "AIzaSyDtmShgqEaE6u2aQyqyYGOX-mbS5ScaucU",
	authDomain: "webrtcsignaler.firebaseapp.com",
	databaseURL: "https://webrtcsignaler.firebaseio.com",
	projectId: "webrtcsignaler",
	storageBucket: "webrtcsignaler.appspot.com",
	messagingSenderId: "964935208268"
}

const state = {
	userName: undefined,
	userKey: undefined,

	connectedUsers: []
}

const log = console.log.bind(console)

document.addEventListener('DOMContentLoaded', function() {

	firebase.initializeApp(config)

	ReactDOM.render(<Main/>, document.getElementById('main'))
	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
	// // The Firebase SDK is initialized and available here!
	//
	// firebase.auth().onAuthStateChanged(user => { });
	// firebase.database().ref('/path/to/ref').on('value', snapshot => { });
	// firebase.messaging().requestPermission().then(() => { });
	// firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
	//
	// // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
	
	var users = firebase.database().ref('users')

	users.on('value', snapshot => {
		snapshot.forEach(el => {
			state.connectedUsers.push({
				key: el.key,
				name: el.val().name
			})
		})
		Main.events.emit('updateUsers', state.connectedUsers)
	})


	Main.events.on('connect', e => addUser(e))

})

function setupUser(name){
	state.userName = name
}

function addUser(userName) {
	state.userName = userName

	// Get a key for a  user.
	state.userKey = firebase.database().ref().child('users').push().key;

	// Write the new post's data simultaneously in the posts list and the user's post list.
	const updates = {};
	updates['/users/' + state.userKey] = {
		name: state.userName,
	};

	return firebase.database().ref().update(updates);
}

function removeUser() {
	var updates = {};
	updates['/users/' + state.userKey] = null;
	firebase.database().ref().update(updates);
}



window.addEventListener('beforeunload', (e) => {
	removeUser()
})


import React from 'react'
import ReactDOM from 'react-dom'

import * as firebase from 'firebase'
import Main from './main'
import Connection from './connection'


// Initialize Firebase
const config = {
	apiKey: "AIzaSyDtmShgqEaE6u2aQyqyYGOX-mbS5ScaucU",
	authDomain: "webrtcsignaler.firebaseapp.com",
	databaseURL: "https://webrtcsignaler.firebaseio.com",
	projectId: "webrtcsignaler",
	storageBucket: "webrtcsignaler.appspot.com",
	messagingSenderId: "964935208268"
}

let connection

const state = {
	userName: undefined,
	userKey: undefined,
}

const log = console.log.bind(console)

document.addEventListener('DOMContentLoaded', function() {

	firebase.initializeApp(config)

	connection = new Connection()

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

	initUsersDB()

	Main.events.on('connect', data => connection.joinRoom({
		room: 'room1',
		userName: data
	}))

	Main.events.on('start', e => {})

})

function initUsersDB(){
	var usersRef = firebase.database().ref('users')

	usersRef.on('value', snapshot => {
		if(!snapshot.val()) return
		const arr = []
		snapshot.forEach(el => {
			// Ignore users of other rooms
			if(el.val().room !== connection.room) return
			arr.push({
				key: el.key,
				name: el.val().name,
				isHost: el.val().hostOf === connection.room
			})
		})
		Main.events.emit('updateUsers', ({
			users: arr,
			command: 'UPDATE'
		}))
	})
	usersRef.on('child_removed', oldSnapshot => {
		Main.events.emit('updateUsers', {
			users: [oldSnapshot],
			command: 'REMOVE'
		})
	})
}

window.addEventListener('beforeunload', (e) => {
	connection.removeUser()
})

import '../assets/icon/meeple-128.png'
import '../assets/icon/meeple-144.png'
import '../assets/icon/meeple-152.png'
import '../assets/icon/meeple-192.png'
import '../assets/icon/meeple-256.png'

import '../manifest.json'

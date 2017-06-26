import * as firebase from 'firebase'
import Main from './main'
import Emitter from 'eventemitter3'
import Connection from './connection'

// init connection class
let connection

// Init emitter
export const events = new Emitter()

// Initialize Firebase
const config = {
	apiKey: "AIzaSyDtmShgqEaE6u2aQyqyYGOX-mbS5ScaucU",
	authDomain: "webrtcsignaler.firebaseapp.com",
	databaseURL: "https://webrtcsignaler.firebaseio.com",
	projectId: "webrtcsignaler",
	storageBucket: "webrtcsignaler.appspot.com",
	messagingSenderId: "964935208268"
}
firebase.initializeApp(config)
// firebase.database.enableLogging(function(message) {
// 	console.log("[FIREBASE]", message);
// })

const db = firebase.database()
const users = db.ref('users')

const log = (args) => console.log.apply(console, ['[Service] > ', ...args])
const info = (args) => console.info.apply(console, ['[Service] > ', ...args])
const warn = (args) => console.warn.apply(console, ['[Service] > ', ...args])
const error = (args) => console.error.apply(console, ['[Service] > ', ...args])

export const init = () => {
	 connection = new Connection()
	// Emit users of the same room
	users.on('value', snapshot => {
		if(!snapshot.val()) return
		
		events.emit('users', snapshot)
	})

	users.on('child_added', (snapshot, prevChildKey) => {
		events.emit('user.added', snapshot, prevChildKey)
	})

	users.on('child_removed', snapshot => {
		events.emit('user.removed', snapshot)
	})
	
	users.on('child_changed', (snapshot, prevChildKey) => {
		events.emit('user.changed', snapshot, prevChildKey)
	})

	users.on('child_moved', (snapshot, prevChildKey) => {
		events.emit('user.moved', snapshot, prevChildKey)
	})
}

export function getUsers(){
	return users.once('value')
}

/**
 * Me wants to join a room
 * 
 * @export
 * @param {any} { userName, room } 
 */
export function joinRoom({ userName, room }) {
	room = !!room ? room : 'room1'
	log('joining room ' + room)
	
	// Get a new key for this user.
	const userKey = db.ref().child('users').push().key
	
	const updates = {};
	updates['/users/' + userKey] = {
		name: userName,
		room: room,
		isHost: false,
		messages: [],
	};

	return db.ref().update(updates).then(snapshot => {
		events.emit('connected', {
			userKey: snapshot.key,
			userName: snapshot.val().name,
			room: snapshot.val().room,
			isHost: snapshot.val().isHost,
		})
	}).catch(reason => {
		error('I failed to join the room for some reason', reason)
	})
}

export function createRoom(roomName) {
	// TODO: the user who creates this room should become a host
	log('creating room ' + roomName)
	const updates = {}
	updates['/rooms/' + roomName] = {
		name: roomName,
		host: '',
	}

	return db.ref().update(updates)
}

export const disconnect = userKey => {
	var updates = {}
	updates['/users/' + userKey] = null
	return db.ref().update(updates)
}

export function listenForMessages(userId) {
	db.ref(`users/${userId}/messages`).on('child_added', snapshot => {
		events.emit(`messages.${userId}`, snapshot)
	})
}

// Below functions that will parse snapshots

/**
 * Give me only users in the given room
 * 
 * @param {string} roomName 
 * @param {DataSnapshot} snapshot 
 * @returns {DataSnapshot-like} filtered with only users of this room
 */
export function usersInRoom(roomName, snapshot){
	const arr = []
	snapshot.forEach(el => {
		if(el.val().room !== roomName) return
		arr.push( Object.assign(
			{key: el.key}, typeof el.val() === 'object' ? el.val() : {value: el.val()} )
		)
	})
	return arr
}

import * as firebase from 'firebase'
import Main from './main'
import Emitter from 'eventemitter3'

// Init emitter
const events = new Emitter()

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

const db = firebase.database()
const users = db.ref('users')

const log = (args) => console.log.apply(console, ['[Service] > ', ...args])
const info = (args) => console.info.apply(console, ['[Service] > ', ...args])
const warn = (args) => console.warn.apply(console, ['[Service] > ', ...args])
const error = (args) => console.error.apply(console, ['[Service] > ', ...args])

export const on = events.on.bind(events)
export const once = events.once.bind(events)

export const init = () => {
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
 * New uesr wants to join a room
 * 
 * @export
 * @param {any} { userName, room } 
 */
export function joinRoom({ userName, room }) {
	room = !!room ? room : 'room1'
	log('joining room '+room)

	return db.ref('rooms/'+room).once('value').then(snapshot => {

		// Get a new key for this user.
		const userKey = db.ref().child('users').push().key

		// Get room info
		let hostOf = null

		if(!snapshot.val().host){
			// This room doesn't have a host yet, now you're it!
			db.ref('/rooms/'+room+'/host').set({ userKey, userName })

			hostOf = room
			log(`You're now the host of ${room}`)
		}

		const updates = {};
		updates['/users/' + userKey] = {
			name: userName,
			room: room,
			hostOf: hostOf,
			messages: [],
		};

		db.ref().update(updates).then(() => {
			events.emit('connected', {room, userKey, userName})
		}).catch(reason => {
			error('I failed to join the room for some reason', reason)
		})
	})
}

export const disconnect = userKey => {
	var updates = {}
	updates['/users/' + userKey] = null
	db.ref().update(updates)
}

// Below functions that will parse snapshots

/**
 * Give me only users in the given room
 * 
 * @param {string} roomName 
 * @param {DataSnapshot} snapshot 
 * @returns {array} filtered with only users of this room
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

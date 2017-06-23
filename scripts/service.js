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
firebase.initializeApp(config)

const db = firebase.database()

export const init = () => {
}

export function initUsersDB() {
	
	const usersRef = db.ref('users')

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

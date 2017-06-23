import React from 'react'
import ReactDOM from 'react-dom'

import Service from './service'
import Main from './main'

import Connection from './connection'
let connection

const state = {
	userName: undefined,
	userKey: undefined,
}

const log = console.log.bind(console)


document.addEventListener('DOMContentLoaded', function() {

	ReactDOM.render(<Main/>, document.getElementById('main'))
	Service.init()

	connection = new Connection()

	Main.events.on('connect', data => connection.joinRoom({
		room: 'room1',
		userName: data
	}))

	Main.events.on('start', e => {})

})

window.addEventListener('beforeunload', (e) => {
	connection.removeUser()
})

import '../assets/icon/meeple-128.png'
import '../assets/icon/meeple-144.png'
import '../assets/icon/meeple-152.png'
import '../assets/icon/meeple-192.png'
import '../assets/icon/meeple-256.png'

import '../manifest.json'

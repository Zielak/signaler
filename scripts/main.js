import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import { Set as ImmutableSet, Map as ImmutableMap } from 'immutable'
import * as firebase from 'firebase'

import * as Service from './service'

import { Card, List, Toolbar, Drawer, TextField, Select, ListItem } from './components'

class Main extends PureComponent {

	constructor(props, context) {
		super(props, context)

		this.state = {
			room: undefined,
			userKey: undefined,
			userName: undefined,
			userConnected: false,
			connectedUsers: new ImmutableMap(),
			toolbar: {
				fixed: true,
				waterfall: true,
			},
		}

		this.handleUnload = function(){
			Service.disconnect(this.state.userKey)
		}.bind(this)

		Service.on('connected', ({room, userKey, userName}) => {
			this.state.room = room
			this.state.userName = userName
			this.state.userKey = userKey
			this.state.userConnected = true

			Service.getUsers().then(snapshot => {
				Service.usersInRoom(room, snapshot).forEach(user => {
					this.setState(prev => ({
						connectedUsers: prev.connectedUsers.set(user.key, {
							name: user.name,
							room: user.room,
							isHost: user.isHost
						})
					}))
				})
			})

			Service.on('user.added', (snapshot, prevChildKey) => {
				// TODO: use prevChildKey
				this.setState(prev => ({
					connectedUsers: prev.connectedUsers.set(snapshot.key, {
						name: snapshot.val().name,
						isHost: snapshot.val().isHost
					})
				}))
			})

			Service.on('user.removed', (snapshot) => {
				this.setState(prev => ({
					connectedUsers: prev.connectedUsers.delete(snapshot.key)
				}))
			})

			Service.on('user.changed', (snapshot, prevChildKey) => {
				// TODO: use prevChildKey
				this.setState(prev => ({
					connectedUsers: prev.connectedUsers.set(snapshot.key, {
						name: snapshot.val().name,
						isHost: snapshot.val().isHost
					})
				}))
			})
		})

	}

	handleConnectClick(e) {
		const input = this.refs.userNameInput
		if (input.value.length > 0) {
			Service.joinRoom({
				userName: input.value,
				room: 'room1'
			})
		} else {
			input.focus()
		}
	}

	handleStartClick(e) {
		events.emit('start')
	}

	handleUserNameChange(e) {

	}

	componentWillMount() {

	}

	render() {
		const { toolbar } = this.state;

		var users = []
		this.state.connectedUsers.forEach((v, k) => users.push(
			<ListItem key={k}
				detailIcon={v.isHost ? 'star rate' : ''}
			>{v.name}</ListItem>
		))

		const listOfUsers = this.state.userConnected ?
			<Card title={`Welcome, ${this.state.userName}`}>
				<h2>Connected users</h2>
				<ul className="mdc-list" ref="connectedUsers">
					{users}
				</ul>
				<button className="mdc-button mdc-button--raised mdc-button--accent"
					ref={button => this.startButton_ = button}
					onClick={e => this.handleStartClick(e)}
				>Start</button>
			</Card>
			: ''

		return (
			<main ref='main' className={toolbar.fixed ? 'mdc-toolbar-fixed-adjust' : ''}>
				<Toolbar
					fixed={toolbar.fixed}
					fixedAdjustRef='main'
					waterfall={toolbar.waterfall}
					/*events={events}*/
				/>
				<Drawer
					/*events={events}*/
				>
					Something here
				</Drawer>

				<Card
					title="Login / signup"
					ref="loginForm"
					visible={!this.state.userConnected}
				>
					<TextField
						ref="userNameInput"
						onChange={e => this.handleUserNameChange(e)}
						label="Name"
						helperText="Whats your name?"
					>
					</TextField>
					<Select>
						<ListItem id="first">First</ListItem>
						<ListItem id="second">Second</ListItem>
						<ListItem id="third">Third</ListItem>
					</Select>
					<section className="mdc-card__actions">
						<button className="mdc-button mdc-button--raised mdc-button--accent"
							ref="connectButton"
							onClick={e => this.handleConnectClick(e)}
						>Connect</button>
					</section>
				</Card>

				{listOfUsers}

			</main>
		)
	}

	componentWillMount() {
		window.addEventListener('beforeunload', this.handleUnload)
	}

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.handleUnload)
	}

}

export default Main

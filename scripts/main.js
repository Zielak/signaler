import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'
import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'
import EE from 'eventemitter3'
import * as firebase from 'firebase'

import {Card, List, Toolbar, Drawer, TextField, Select, ListItem} from './components'

const events = new EE()

class Main extends PureComponent {

	constructor(props, context){
		super(props, context)

		this.state = {
			userName: undefined,
			userConnected: false,
			connectedUsers: new ImmutableMap(),
			toolbar: {
				fixed: true,
				waterfall: true,
			},
		}

		events.on('updateUsers', ({command, users}) => {
			if(command === 'UPDATE'){
				users.forEach( el => {
					this.setState(prev => ({
						connectedUsers: prev.connectedUsers.set(el.key, el.name)
					}))
				})
			} else if (command === 'REMOVE') {
				users.forEach( el => {
					this.setState(prev => ({
						connectedUsers: prev.connectedUsers.remove(el.key)
					}))
				})
			}
		})
	}

	handleConnectClick(e){
		const input = this.refs.userNameInput
		if(input.value.length > 1){
			this.state.userConnected = true

			this.setState(prev => ({
				userName: input.value
			}))

			events.emit('connect', input.value)
		} else {
			input.focus()
		}
	}

	handleUserNameChange(e){
		
	}

	componentWillMount(){
	}

	render(){
		const { toolbar } = this.state;
		
		var users = []
		this.state.connectedUsers.forEach((v, k) => users.push(<ListItem key={k}>{v}</ListItem>))
		
		return (
			<main ref='main' className={toolbar.fixed ? 'mdc-toolbar-fixed-adjust' : ''}>
				<Toolbar
					fixed={toolbar.fixed}
					fixedAdjustRef='main'
					waterfall={toolbar.waterfall}
					events={events}
				/>
				<Drawer
					events={events}
				/>

				<Card
					ref="loginForm"
					visible={!this.state.userConnected}
					title={`Welcome, ${this.state.userName}`}
				>
					<TextField
						ref="userNameInput"
						onChange={e=>this.handleUserNameChange(e)}
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
							onClick={e=>this.handleConnectClick(e)}
						>Connect</button>
					</section>
				</Card>

				<Card
					title="Connected people"
				>
					<ul ref="connectedUsers">
						{users}
					</ul>
				</Card>

			</main>
		)
	}

}

Main.events = events

export default Main

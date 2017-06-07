import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'
import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'
import EE from 'eventemitter3'
import * as firebase from 'firebase'

class Main extends PureComponent {

	constructor(props, context){
		super(props, context)

		this.state = {
			userName: undefined,
			connectedUsers: new ImmutableMap(),
		}

		Main.events.on('updateUsers', ({command, users}) => {
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
			enterForm.style.display = 'none'

			this.setState(prev => ({
				userName: input.value
			}))

			Main.events.emit('connect', input.value)
		} else {
			input.focus()
		}
	}

	handleUserNameChange(e){
		
	}

	componentWillMount(){
	}

	render(){
		var users = []
		this.state.connectedUsers.forEach((v, k) => users.push(<li key={k}>{v}</li>))
		
		return (
			<main>
				<h2>Welcome, {this.state.userName}</h2>
				<h1>Connected people:</h1>
				<ul ref="connectedUsers">
					{users}
				</ul>
				<div id="enterForm">
					<p>
						Name:
						<input type="text"
							ref="userNameInput"
							onChange={e=>this.handleUserNameChange(e)}
						></input>
					</p>
					<a
						href="#"
						ref="connectButton"
						onClick={e=>this.handleConnectClick(e)}
						>
						Connect
					</a>
				</div>
			</main>
		)
	}

}

Main.events = new EE()

export default Main

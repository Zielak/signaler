import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

class List extends PureComponent{

	constructor(props, context){
		super(props, context)
	}

	render(){
		return (
			<nav className="mdc-list">
				<a href="#" className="mdc-list-item">
					<i className="mdc-list-item__start-detail material-icons" aria-hidden="true">network_wifi</i>
					Wi-Fi
				</a>
				<a href="#" className="mdc-list-item">
					<i className="mdc-list-item__start-detail material-icons" aria-hidden="true">bluetooth</i>
					Bluetooth
				</a>
				<a href="#" className="mdc-list-item">
					<i className="mdc-list-item__start-detail material-icons" aria-hidden="true">data_usage</i>
					Data Usage
				</a>
			</nav>
		)
	}

}

export default List

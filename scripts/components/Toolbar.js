import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import {getCorrectEventName} from '@material/animation/dist/mdc.animation'
import {MDCToolbar, MDCToolbarFoundation} from '@material/toolbar/dist/mdc.toolbar'
import '@material/toolbar/dist/mdc.toolbar.min.css'

import * as Service from '../service'

class Toolbar extends PureComponent {

	constructor(props, context){

		super(props, context)

		this.state = {
			fixed: props.fixed,
			fixedAdjustRef: props.fixedAdjustRef,
			waterfall: props.waterfall,
			style: new ImmutableMap(),
			classes: new ImmutableSet(),
			rippleCss: new ImmutableMap(),
		}

		if(this.state.fixed)
			this.state.classes = this.state.classes.add('mdc-toolbar--fixed')

		if(this.state.waterfall)
			this.state.classes = this.state.classes.add('mdc-toolbar--waterfall')

		this.foundation = new MDCToolbarFoundation({
			hasClass: className => this.state.classes.has(className),
			addClass: className => this.setState(prev => ({
				classes: prev.classes.add(className)
			})),
			removeClass: className => this.setState(prev => ({
				classes: prev.classes.remove(className)
			})),

			registerScrollHandler: handler => 
				window.addEventListener(getCorrectEventName(window, 'scroll'), handler),
			deregisterScrollHandler: handler => 
				window.removeEventListener(getCorrectEventName(window, 'scroll'), handler),
			registerResizeHandler: handler => 
				window.addEventListener(getCorrectEventName(window, 'resize'), handler),
			deregisterResizeHandler: handler => 
				window.removeEventListener(getCorrectEventName(window, 'resize'), handler),
			
			getViewportWidth: () => window.innerWidth,
			getViewportScrollY: () => window.scrollY,
			getOffsetHeight: () => {
				if(this.refs.root){
					return this.refs.root.clientHeight
				}
			},
			getFlexibleRowElementOffsetHeight: () =>
				this.refs.root.querySelector('.mdc-toolbar__row').clientHeight,
			notifyChange: (evtData) => this.handleChange(evtData),
			// Sets mdc-toolbar style property to provided value.
			setStyle: (property, value) => {
				if(this.refs.root){
					this.refs.root.style.setProperty(property, value)
				}
			},
			setStyleForTitleElement: (property, value) => {
				if(this.refs.title){
					this.refs.title.style.setProperty(property, value)
				}
			},
			setStyleForFlexibleRowElement: (property, value) => {
				if(this.refs.flexibleRow){
					this.refs.flexibleRow.style.setProperty(property, value)
				}
			},
			setStyleForFixedAdjustElement: (property, value) => {
				if(this.state.fixedAdjustRef){
					document.querySelector(this.state.fixedAdjustRef)
						.style.setProperty(property, value)
				}
			},
		})

	}

	handleChange(data){
		// console.log(data)
	}

	render(){
		return (
			<header
				ref="root"
				className={`mdc-toolbar ${this.state.classes.toJS().join(' ')}`}
				style={this.state.style}
			>
				{/*<div className="mdc-toolbar__row mdc-toolbar--flexible-default-behavior">
					<section className="mdc-toolbar__section">
						<h1>Lets see this in action</h1>
					</section>
				</div>*/}
				<div className="mdc-toolbar__row">
					<section className="mdc-toolbar__section mdc-toolbar__section--align-start">
						<a
							className="material-icons"
							onClick={event=>{
								event.preventDefault()
								Service.events.emit('menu.clicked')
							}}
						>
							<span className="material-icons">menu</span>
						</a>
						<span ref="title" className="mdc-toolbar__title">Title</span>
					</section>
					<section className="mdc-toolbar__section mdc-toolbar__section--align-end">
						🎲
					</section>
				</div>
			</header>
		);
	}



	// Within the two component lifecycle methods below, 
	// we invoke the foundation's lifecycle hooks
	// so that proper work can be performed.
	componentDidMount() {
		this.foundation.init();
		// this.state.waterfall && foundation.addClass('mdc-toolbar--waterfall')
	}
	componentWillUnmount() {
		this.foundation.destroy();
	}

	// Here we synchronize the internal state of the UI component
	// based on what the user has specified.
	componentWillReceiveProps(props) {
		if (props.fixed !== this.props.fixed) {
			this.setState({fixed: props.fixed});
		}
		if (props.waterfall !== this.props.waterfall) {
			this.setState({waterfall: props.waterfall});
		}
	}

}

Toolbar.propTypes = {
	fixed: PropTypes.bool,
	waterfall: PropTypes.bool,
}

Toolbar.defaultProps = {
	fixed: false,
	waterfall: false,
}

export default Toolbar

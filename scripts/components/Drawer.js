import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import EventEmitter from 'eventemitter3'
import { Set as ImmutableSet, Map as ImmutableMap } from 'immutable'
import * as Service from '../service'

import { MDCTemporaryDrawer, MDCTemporaryDrawerFoundation, util } from '@material/drawer'

import '@material/drawer/dist/mdc.drawer.min.css'

class Drawer extends PureComponent {

	constructor(props, context){
		super(props, context)

		this.state = {
			style: new ImmutableMap(),
			classes: new ImmutableSet(),
		}

		const {FOCUSABLE_ELEMENTS, OPACITY_VAR_NAME, OPEN_EVENT, CLOSE_EVENT} = MDCTemporaryDrawerFoundation.strings;

		this.foundation = new MDCTemporaryDrawerFoundation({
			hasClass: className => this.refs.root.classList.contains(className),
			addClass: className => this.setState(prev => ({
				classes: prev.classes.add(className)
			})),
			removeClass: className => this.setState(prev => ({
				classes: prev.classes.remove(className)
			})),
			hasNecessaryDom: () => !!this.refs.drawer,

			registerInteractionHandler: (eventName, handler) => 
				this.refs.root.addEventListener(eventName, handler),
			deregisterInteractionHandler: (eventName, handler) => 
				this.refs.root.removeEventListener(eventName, handler),

			registerDrawerInteractionHandler: (eventName, handler) => 
				this.refs.drawer.addEventListener(eventName, handler),
			deregisterDrawerInteractionHandler: (eventName, handler) => 
				this.refs.drawer.removeEventListener(eventName, handler),

			registerTransitionEndHandler: handler =>
				this.refs.drawer.addEventListener('transitionend', handler),
			deregisterTransitionEndHandler: handler =>
				this.refs.drawer.removeEventListener('transitionend', handler),

			registerDocumentKeydownHandler: handler => 
				document.addEventListener('keydown', handler),
			deregisterDocumentKeydownHandler: handler => 
				document.removeEventListener('keydown', handler),
			
			getDrawerWidth: () => this.refs.drawer.offsetWidth,
			setTranslateX: (value) => this.refs.drawer.style.setProperty(
				util.getTransformPropertyName(), value === null ? null : `translateX(${value}px)`
			),
			updateCssVariable: (value) => {
				if (util.supportsCssCustomProperties()) {
					this.refs.root.style.setProperty(OPACITY_VAR_NAME, value);
				}
			},
			getFocusableElements: () => this.refs.drawer.querySelectorAll(FOCUSABLE_ELEMENTS),

			saveElementTabState: el => util.saveElementTabState(el),
			restoreElementTabState: el => util.restoreElementTabState(el),
			notifyOpen: () => this.notifyOpen(OPEN_EVENT),
			notifyClose: () => this.notifyClose(CLOSE_EVENT),
			isRtl: () => getComputedStyle(this.refs.root).getPropertyValue('direction') === 'rtl',
			isDrawer: (el) => el === this.refs.drawer,
		})

		this.handleOpenDrawer = function(){
			this.open = !this.open
		}.bind(this)

	}

	registerEventListeners(){
		Service.on('menu.clicked', this.handleOpenDrawer)
	}

	unregisterEventListeners(){
		Service.on('menu.clicked', this.handleOpenDrawer)
	}

	get open() {
		return this.foundation.isOpen();
	}

	set open(value) {
		if (value) {
			this.foundation.open();
		} else {
			this.foundation.close();
		}
	}

	notifyOpen(){

	}

	notifyClose(){

	}

	render(){
		return(
			<aside
				ref="root"
				className={`mdc-temporary-drawer ${this.state.classes.toJS().join(' ')}`}
				open={this.props.open}
			>
				<nav ref="drawer" className="mdc-temporary-drawer__drawer mdc-typography">
					{/*<header className="mdc-temporary-drawer__header">
						<div className="mdc-temporary-drawer__header-content">
							<span className="mdc-typography--display3">
								Siema!
							</span>
						</div>
					</header>*/}
					{/*<div className="mdc-temporary-drawer__toolbar-spacer"></div>*/}
					<div className="mdc-temporary-drawer__content">
						<nav id="" className="mdc-list">
							<a className="mdc-list-item mdc-temporary-drawer--selected" href="#">
								<i className="material-icons mdc-list-item__start-detail" aria-hidden="true">inbox</i>Inbox
							</a>
							<a className="mdc-list-item" href="#">
								<i className="material-icons mdc-list-item__start-detail" aria-hidden="true">star</i>Star
							</a>
						</nav>
					</div>
				</nav>
			</aside>
		)
	}

	componentDidMount() {
		this.foundation.init();
		this.registerEventListeners();
	}
	componentWillUnmount() {
		this.foundation.destroy();
		this.unregisterEventListeners()
	}

	// Here we synchronize the internal state of the UI component
	// based on what the user has specified.
	// componentWillReceiveProps(props) {
	// 	if (props.open !== this.props.open) {
	// 		this.setState({open: props.open});
	// 		this.open = props.open
	// 	}
	// }

}

Drawer.propTypes = {
	open: PropTypes.bool,
	events: PropTypes.instanceOf(EventEmitter)
}

Drawer.defaultProps = {
	open: false,
}

export default Drawer

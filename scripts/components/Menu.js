import React, {PureComponent, Children} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import { MDCSimpleMenu, MDCSimpleMenuFoundation } from '@material/menu'
import { getTransformPropertyName } from '@material/menu/util'

const {CANCEL_EVENT, SELECTED_EVENT} = MDCSimpleMenuFoundation.strings

class Menu extends PureComponent {

	constructor(props, context) {

		super(props, context)

		this.state = {
			style: new ImmutableMap(),
			children: props.children,
			previousFocus: undefined
		}

		this.foundation = new MDCSimpleMenuFoundation({
			addClass: (className) => this.refs.root.classList.add(className),
			removeClass: (className) => this.refs.root.classList.remove(className),
			hasClass: (className) => this.refs.root.classList.contains(className),

			hasNecessaryDom: () => Boolean(this.refs.list),
			getInnerDimensions: () => ({
				width: this.refs.list.offsetWidth,
				height: this.refs.list.offsetHeight
			}),

			hasAnchor: () => this.refs.root.parentElement && this.refs.root.parentElement.classList.contains('mdc-menu-anchor'),
			getAnchorDimensions: () => this.refs.root.parentElement.getBoundingClientRect(),

			getWindowDimensions: () => ({
				width: window.innerWidth,
				height: window.innerHeight
			}),

			setScale: (x, y) => {
				this.setState(prev => ({
					style: prev.style.set(getTransformPropertyName(window), `scale(${x}, ${y})`)
				}))
			},
			setInnerScale: (x, y) => {
				this.refs.list.style[getTransformPropertyName(window)] = `scale(${x}, ${y})`;
			},
			getNumberOfItems: () => Children.count(this.state.children),
			
			registerInteractionHandler: (type, handler) => {
				this.refs.root.addEventListener(type, handler)
			},
			deregisterInteractionHandler: (type, handler) => {
				this.refs.root.removeEventListener(type, handler)
			},

			registerDocumentClickHandler: (handler) => {
				document.addEventListener('click', handler)
			},
			deregisterDocumentClickHandler: (handler) => {
				document.removeEventListener('click', handler)
			},
			
			getYParamsForItemAtIndex: (index) => {
				const {offsetTop: top, offsetHeight: height} = this.state.children[index];
				return {top, height};
			},
			setTransitionDelayForItemAtIndex: (index, value) => {
				this.state.children = Children.map(this.state.children, (child, idx) => 
					idx === index ? React.cloneElement(child, {
						transitionDelay: value
					}) : child
				)
			},
			getIndexForEventTarget: (target) => {
				return Children.toArray(this.state.children).findIndex(child => {
					return target.id === child.props.id || target.innerText === child.props.children
				})
			},
			
			notifySelected: (evtData) => this.dispatch(SELECTED_EVENT, {
				index: evtData.index,
				item: this.state.children[evtData.index],
			}),
			notifyCancel: () => this.dispatch(CANCEL_EVENT),

			saveFocus: () => {
				this.state.previousFocus = document.activeElement
			},
			restoreFocus: () => {
				if (this.state.previousFocus) {
					this.state.previousFocus.focus()
				}
			},
			isFocused: () => document.activeElement === this.refs.root,
			focus: () => {
				this.refs.root.focus()
			},

			getFocusedItemIndex: () => {
				return Children.toArray(this.state.children).filter((child, index) => {
					return child.props.focused
				})
			},
			focusItemAtIndex: (index) => {
				this.state.children = Children.map(this.state.children, (child, idx) => 
					idx === index ? React.cloneElement(child, {
						focused: true
					}) : child
				)
			},

			isRtl: () => getComputedStyle(this.refs.root).getPropertyValue('direction') === 'rtl',
			setTransformOrigin: (origin) => {
				this.refs.root.style[`${getTransformPropertyName(window)}-origin`] = origin;
			},
			setPosition: (position) => {
				this.refs.root.style.left = 'left' in position ? position.left : null;
				this.refs.root.style.right = 'right' in position ? position.right : null;
				this.refs.root.style.top = 'top' in position ? position.top : null;
				this.refs.root.style.bottom = 'bottom' in position ? position.bottom : null;
			},
			getAccurateTime: () => window.performance.now(),
		})

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

	show({focusIndex = null} = {}) {
		this.foundation.open({focusIndex: focusIndex});
	}

	hide() {
		this.foundation.close();
	}

	listen(type, handler) {
		this.refs.root.addEventListener(type, handler)
	}
	unlisten(type, handler) {
		this.refs.root.removeEventListener(type, handler)
	}
	dispatch(type, data) {
		this.refs.root.dispatchEvent(new CustomEvent(type, {
			detail: data
		}))
	}

	setAttribute(attr, value) {
		this.refs.root.setAttribute(attr, value)
	}
	removeAttribute(attr) {
		this.refs.root.removeAttribute(attr)
	}

	setStyle(name, value) {
		this.setState(prev => ({
			style: prev.style.set(name, value)
		}))
	}
	removeStyle(name) {
		this.setState(prev => ({
			style: prev.style.remove(name)
		}))
	}

	componentDidMount() {
		this.foundation.init()
	}
	componentWillUnmount() {
		this.foundation.destroy()
	}

	render() {
		return (
			<div ref="root" className="mdc-simple-menu" style={this.state.style}>
				<ul ref="list" className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden="true">
					{this.state.children}
				</ul>
			</div>
		)
	}
}

export default Menu

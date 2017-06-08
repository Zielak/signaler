import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import { MDCSimpleMenu, MDCSimpleMenuFoundation } from '@material/menu'
import { getTransformPropertyName } from '@material/menu/util'


class Menu extends PureComponent {

	constructor(props, context) {

		super(props, context)

		this.state = {
			style: new ImmutableMap(),
		}

		this.foundation = new MDCSimpleMenuFoundation({
			addClass: (className) => this.refs.root.classList.add(className),
			removeClass: (className) => this.refs.root.classList.remove(className),
			hasClass: (className) => this.refs.root.classList.contains(className),
			hasNecessaryDom: () => Boolean(this.refs.list),
			getInnerDimensions: () => {
				const {itemsContainer_: itemsContainer} = this;
				return {width: itemsContainer.offsetWidth, height: itemsContainer.offsetHeight};
			},
			hasAnchor: () => this.refs.root.parentElement && this.refs.root.parentElement.classList.contains('mdc-menu-anchor'),
			getAnchorDimensions: () => this.refs.root.parentElement.getBoundingClientRect(),
			getWindowDimensions: () => {
				return {width: window.innerWidth, height: window.innerHeight};
			},
			setScale: (x, y) => {
				this.setState(prev => ({
					style: prev.style.add(getTransformPropertyName(window), `scale(${x}, ${y})`)
				}))
			},
			setInnerScale: (x, y) => {
				this.refs.list.style[getTransformPropertyName(window)] = `scale(${x}, ${y})`;
			},
			getNumberOfItems: () => this.props.children.length,
			registerInteractionHandler: (type, handler) => this.refs.root.addEventListener(type, handler),
			deregisterInteractionHandler: (type, handler) => this.refs.root.removeEventListener(type, handler),
			registerDocumentClickHandler: (handler) => document.addEventListener('click', handler),
			deregisterDocumentClickHandler: (handler) => document.removeEventListener('click', handler),
			getYParamsForItemAtIndex: (index) => {
				const {offsetTop: top, offsetHeight: height} = this.props.children[index];
				return {top, height};
			},
			setTransitionDelayForItemAtIndex: (index, value) =>
				this.props.children[index].style.setProperty('transition-delay', value),
			getIndexForEventTarget: (target) => this.props.children.indexOf(target),
			notifySelected: (evtData) => this.emit(MDCSimpleMenuFoundation.strings.SELECTED_EVENT, {
				index: evtData.index,
				item: this.props.children[evtData.index],
			}),
			notifyCancel: () => this.emit(MDCSimpleMenuFoundation.strings.CANCEL_EVENT),
			saveFocus: () => {
				this.previousFocus_ = document.activeElement;
			},
			restoreFocus: () => {
				if (this.previousFocus_) {
					this.previousFocus_.focus();
				}
			},
			isFocused: () => document.activeElement === this.refs.root,
			focus: () => this.refs.root.focus(),
			getFocusedItemIndex: () => this.props.children.indexOf(document.activeElement),
			focusItemAtIndex: (index) => this.props.children[index].focus(),
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

	listen(type, handler) {
		this.refs.root.addEventListener(type, handler)
	}
	unlisten(type, handler) {
		this.refs.root.removeEventListener(type, handler)
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

	

	render() {
		return (
			<div ref="root" className="mdc-simple-menu" tabIndex="-1" style={this.state.style}>
				<ul ref="list" className="mdc-simple-menu__items mdc-list" role="menu" aria-hidden="true">
					{this.props.children}
				</ul>
			</div>
		)
	}
}

export default Menu

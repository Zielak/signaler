import React, {PureComponent, Children} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import Menu from './Menu'

import {MDCSelect, MDCSelectFoundation} from '@material/select'

const {CHANGE_EVENT} = MDCSelectFoundation.strings

class Select extends PureComponent {

	constructor(props, context){

		super(props, context)

		this.state = {
			style: new ImmutableMap(),
			classes: new ImmutableSet(),
			children: props.children,
			selectedText: '',
		}

		if(props.multiline){
			this.state.classes = this.state.classes.add('mdc-textfield--multiline')
		}
		if(props.fullWidth){
			this.state.classes = this.state.classes.add('mdc-textfield--fullWidth')
		}
		if(props.persistentHelperText){
			this.state.helperTextClasses = this.state.helperTextClasses.add('mdc-textfield-helptext--persistent')
		}

		this.foundation = new MDCSelectFoundation({
			addClass: className => this.setState(prev => ({
				classes: prev.classes.add(className)
			})),
			removeClass: className => this.setState(prev => ({
				classes: prev.classes.remove(className)
			})),

			setAttr: (attr, value) => this.refs.root.setAttribute(attr, value),
			rmAttr: (attr, value) => this.refs.root.removeAttribute(attr, value),

			computeBoundingRect: () => this.refs.root.getBoundingClientRect(),
			registerInteractionHandler: (type, handler) => {
				this.refs.root.addEventListener(type, handler)
			},
			deregisterInteractionHandler: (type, handler) => {
				this.refs.root.removeEventListener(type, handler)
			},

			focus: () => this.refs.root.focus(),
			makeTabbable: () => {
				this.refs.root.tabIndex = 0
			},
			makeUntabbable: () => {
				this.refs.root.tabIndex = -1
			},

			getComputedStyleValue: (prop) => window.getComputedStyle(this.refs.root).getPropertyValue(prop),
			setStyle: (propertyName, value) => this.setState(prev => ({
				style: prev.style.set(propertyName, value)
			})),
			create2dRenderingContext: () => document.createElement('canvas').getContext('2d'),

			setMenuElStyle: (propertyName, value) => this.refs.menu.setStyle(propertyName, value),
			setMenuElAttr: (attr, value) => this.refs.menu.setAttribute(attr, value),
			rmMenuElAttr: (attr) => this.refs.menu.removeAttribute(attr),
			getMenuElOffsetHeight: () => this.refs.menu.offsetHeight,

			openMenu: (focusIndex) => {
				this.refs.menu.show({focusIndex})
			},
			isMenuOpen: () => this.refs.menu.open,

			setSelectedTextContent: (selectedTextContent) => {
				this.state.selectedText = selectedTextContent
			},

			getNumberOfOptions: () => Children.count(this.state.children),
			getTextForOptionAtIndex: (index) => this.state.children[index].props.children,
			getValueForOptionAtIndex: (index) => this.state.children[index].props.id || this.state.children[index].props.children,

			setAttrForOptionAtIndex: (index, attr, value) => {
				this.state.children = Children.map(this.state.children, (child, idx) => {
					let obj = {}
					obj[attr] = value
					return idx === index ? React.cloneElement(child, obj) : child
				})
			},
			rmAttrForOptionAtIndex: (index, attr) => {
				this.state.children = Children.map(this.state.children, (child, idx) => {
					let obj = {}
					obj[attr] = null
					return idx === index ? React.cloneElement(child, obj) : child
				})
			},
			getOffsetTopForOptionAtIndex: (index) => this.state.children[index].offsetTop,

			registerMenuInteractionHandler: (type, handler) => this.refs.menu.listen(type, handler),
			deregisterMenuInteractionHandler: (type, handler) => this.refs.menu.unlisten(type, handler),
			notifyChange: () => this.dispatch(CHANGE_EVENT, this),

			getWindowInnerHeight: () => window.innerHeight,
		})
		
	}

	get value(){
		return this.refs.input.value
	}
	
	dispatch(type, data) {
		this.refs.root.dispatchEvent(new CustomEvent(type, {
			detail: {
				data
			}
		}))
	}
	
	componentDidMount() {
		this.foundation.init()
	}
	componentWillUnmount() {
		this.foundation.destroy()
	}
	componentDidUpdate(){
		this.foundation.resize()
	}
	componentWillReceiveProps(props) {
		this.setState({
			classes: this.state.classes[props.multiline ? 'add' : 'remove']('mdc-textfield--multiline')
		});
		this.setState({
			classes: this.state.classes[props.fullWidth ? 'add' : 'remove']('mdc-textfield--fullwidth')
		});

		this.setState({
			helperTextClasses: this.state.helperTextClasses[props.persistentHelperText ? 'add' : 'remove']('mdc-textfield-helptext--persistent')
		});
		
	}

	
	render(){

		return(
			<div ref="root" role="listbox" tabIndex="-1"
				className={`mdc-select ${this.state.classes.toJS().join(' ')}`}
				style={this.state.style}
			>
				<span className="mdc-select__selected-text">
					{this.state.selectedText}
				</span>
				<Menu ref="menu">
					{this.state.children}
				</Menu>
			</div>
		)
	}

}

Select.propTypes = {
	label: PropTypes.string.isRequired,
	type: PropTypes.string,
	disabled: PropTypes.bool,
	multiline: PropTypes.bool,
	fullWidth: PropTypes.bool,
	dense: PropTypes.bool,
	required: PropTypes.bool,
	helperText: PropTypes.string,
	persistentHelperText: PropTypes.bool,
	helperAsValidation: PropTypes.bool,
}

Select.defaultProps = {
	label: '',
	type: 'text',
	disabled: false,
	multiline: false,
	fullWidth: false,
	dense: false,
	required: false,
	helperText: '',
	persistentHelperText: false,
	helperAsValidation: false,
}

export default Select

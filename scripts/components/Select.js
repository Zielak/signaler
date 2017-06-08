import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import Menu from './Menu'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import {MDCSelect, MDCSelectFoundation} from '@material/select'

class Select extends PureComponent {

	constructor(props, context){

		super(props, context)

		this.state = {
			style: new ImmutableMap(),
			classes: new ImmutableSet(),
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
			registerInteractionHandler: (type, handler) => this.refs.root.addEventListener(type, handler),
			deregisterInteractionHandler: (type, handler) => this.refs.root.removeEventListener(type, handler),
			focus: () => this.refs.root.focus(),
			makeTabbable: () => {
				this.refs.root.tabIndex = 0;
			},
			makeUntabbable: () => {
				this.refs.root.tabIndex = -1;
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
			openMenu: (focusIndex) => this.refs.menu.show({focusIndex}),
			isMenuOpen: () => this.refs.menu.open,
			setSelectedTextContent: (selectedTextContent) => {
				this.selectedText_.textContent = selectedTextContent;
			},
			getNumberOfOptions: () => this.props.children.length,
			getTextForOptionAtIndex: (index) => this.props.children[index].props.children,
			getValueForOptionAtIndex: (index) => this.props.children[index].props.id || this.props.children[index].props.children,
			setAttrForOptionAtIndex: (index, attr, value) => this.props.children[index].props[attr] = value,
			rmAttrForOptionAtIndex: (index, attr) => delete this.props.children[index].props[attr],
			getOffsetTopForOptionAtIndex: (index) => this.props.children[index].offsetTop,
			registerMenuInteractionHandler: (type, handler) => this.refs.menu.listen(type, handler),
			deregisterMenuInteractionHandler: (type, handler) => this.refs.menu.unlisten(type, handler),
			notifyChange: () => this.emit(MDCSelectFoundation.strings.CHANGE_EVENT, this),
			getWindowInnerHeight: () => window.innerHeight,
		})
		
	}

	get value(){
		return this.refs.input.value
	}

	render(){

		return(
			<div ref="root" role="listbox" tabIndex="-1"
				className={`mdc-select ${this.state.classes.toJS().join(' ')}`}
				style={this.state.style}
			>
				<span className="mdc-select__selected-text">
					{this.props.selectedText}
				</span>
				<Menu ref="menu">
					{this.props.children}
				</Menu>
			</div>
		)
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

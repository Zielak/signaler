import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import {MDCTextfield, MDCTextfieldFoundation} from '@material/textfield'

class TextField extends PureComponent {

	constructor(props, context){

		super(props, context)

		this.state = {
			style: new ImmutableMap(),
			classes: new ImmutableSet(),
			labelClasses: new ImmutableSet(),
			helperTextClasses: new ImmutableSet(),
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

		this.foundation = new MDCTextfieldFoundation({
			addClass: className => this.setState(prev => ({
				classes: prev.classes.add(className)
			})),
			removeClass: className => this.setState(prev => ({
				classes: prev.classes.remove(className)
			})),

			addClassToLabel: className => this.setState(prev => ({
				labelClasses: prev.labelClasses.add(className)
			})),
			removeClassFromLabel: className => this.setState(prev => ({
				labelClasses: prev.labelClasses.remove(className)
			})),

			addClassToHelptext: className => this.setState(prev => ({
				helperTextClasses: prev.helperTextClasses.add(className)
			})),
			removeClassFromHelptext: className => this.setState(prev => ({
				helperTextClasses: prev.helperTextClasses.remove(className)
			})),

			helptextHasClass: className => this.state.helperTextClasses.has(className),

			registerInputFocusHandler: handler =>
				this.refs.input.addEventListener('focus', handler),
			deregisterInputFocusHandler: handler =>
				this.refs.input.removeEventListener('focus', handler),
			
			registerInputBlurHandler: handler =>
				this.refs.input.addEventListener('blur', handler),
			deregisterInputBlurHandler: handler =>
				this.refs.input.removeEventListener('blur', handler),
			
			registerInputInputHandler: handler =>
				this.refs.input.addEventListener('input', handler),
			deregisterInputInputHandler: handler =>
				this.refs.input.removeEventListener('input', handler),
			
			registerInputKeydownHandler: handler =>
				this.refs.input.addEventListener('keydown', handler),
			deregisterInputKeydownHandler: handler =>
				this.refs.input.removeEventListener('keydown', handler),

			setHelptextAttr: (name, value) => {
				if (this.refs.helptext) {
					this.refs.helptext.setAttribute(name, value)
				}
			},
			removeHelptextAttr: name => {
				if (this.refs.helptext) {
					this.refs.helptext.removeAttribute(name)
				}
			},

			getNativeInput: () => this.refs.input,
		})
		
	}

	get value(){
		return this.refs.input.value
	}

	render(){
		return(
			<div>
				<div ref="root"
					className={`mdc-textfield ${this.state.classes.toJS().join(' ')}`}
					style={this.state.style}
				>
					<input type={this.props.type}
						ref="input"
						id="my-textfield"
						className="mdc-textfield__input"
						aria-label={this.props.placeholder}
						disabled={this.props.disabled}
						required={this.props.required}
					>
					</input>
					<label
						className={`mdc-textfield__label ${this.state.labelClasses.toJS().join(' ')}`}
						htmlFor="my-textfield"
					>
						{this.props.label}
					</label>
				</div>
				
				{this.props.helperText && (
					<p
						ref="helptext"
						className={`mdc-textfield-helptext ${this.state.helperTextClasses.toJS().join(' ')}`}
						aria-hidden="true"
					>
						{this.props.helperText}
					</p>
				)}
			</div>
		)
	}
	
	componentDidMount() {
		this.foundation.init()
	}
	componentWillUnmount() {
		this.foundation.destroy()
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

TextField.propTypes = {
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

TextField.defaultProps = {
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

export default TextField

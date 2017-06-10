import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

class ListItem extends React.Component {

	constructor(props, context){
		super(props, context)
	}

	componentDidMount() {
		this.props.focused && this.refs.root.focus()
	}

	componentDidUpdate() {
		this.props.focused && this.refs.root.focus()
	}
	
	render(){
		return(
			<li ref="root"
				className="mdc-list-item"
				role="option"
				aria-disabled="true"
				aria-selected={this.props['aria-selected']}
				tabIndex="0"
				style={{transitionDelay: this.props.transitionDelay}}
				id={this.props.id}
			>
				{this.props.children}
				{/*{this.props.focused && (<i>F</i>)}*/}
			</li>
		)
	}

}

ListItem.propTypes = {
	transitionDelay: PropTypes.string,
	focused: PropTypes.bool,
	id: PropTypes.string,
	'aria-selected': PropTypes.string
}

ListItem.defaultProps = {
	transitionDelay: '',
	focused: false,
	id: '',
	'aria-selected': ''
}

export default ListItem

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

		const detailIcon = this.props.detailIcon ?
			<i
				className="mdc-list-item__start-detail material-icons"
				aria-hidden="true"
			>{this.props.detailIcon}</i>
		: ''

		const endDetail = !!this.props.endDetail.icon ?
			<a href="#" className="mdc-list-item__end-detail material-icons"
				aria-label={this.props.endDetail.title} title={this.props.endDetail.title}
				onClick={e=>this.props.endDetail.handleClick(e)}>
				{this.props.endDetail.icon}
			</a>
		: ''


		let textElement = <span className="mdc-list-item__text">
				{this.props.children}
				{endDetail}
				{(!!this.props.secondaryText && <span className="mdc-list-item__text__secondary">
					{this.props.secondaryText}
				</span>)}
			</span>

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
				{detailIcon}
				{textElement}
			</li>
		)
	}

}

ListItem.propTypes = {
	id: PropTypes.string,
	dense: PropTypes.bool,
	detailIcon: PropTypes.string,
	endDetail: PropTypes.object,
	secondaryText: PropTypes.string,
	focused: PropTypes.bool,
	transitionDelay: PropTypes.string,
	'aria-selected': PropTypes.string
}

ListItem.defaultProps = {
	id: '',
	dense: false,
	detailIcon: '',
	endDetail: {},
	secondaryText: '',
	focused: false,
	transitionDelay: '',
	'aria-selected': ''
}

export default ListItem

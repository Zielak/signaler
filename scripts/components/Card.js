import React, {PureComponent} from 'react'
import ReactDOM from 'react-dom'

import {Set as ImmutableSet, Map as ImmutableMap} from 'immutable'

import '@material/card/dist/mdc.card.min.css'

class Card extends PureComponent{

	constructor(props, context){
		super(props, context)
	}

	render() {
		let titleElement, subtitleElement

		if (this.props.title) {
			titleElement  = <h1 className="mdc-card__title mdc-card__title--large">{this.props.title}</h1>
		}
		if (this.props.subtitle) {
			subtitleElement = <h2 className="mdc-card__subtitle">{this.props.subtitle}</h2>
		}

		return (
			<div className="mdc-card" style={{ display: this.props.visible === false ? 'none' : '' }}>
				<section className="mdc-card__primary">
					{titleElement}
					{subtitleElement}
				</section>
				<section className="mdc-card__supporting-text">
					{this.props.children}
				</section>
			</div>
		)
	}

}

export default Card

/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component, createRef } from '@wordpress/element';
import { BaseControl, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */

import Lookup from '../lookup';

const placeholderText = __( 'Add a marker...', 'jetpack' );

export class LocationSearch extends Component {
	constructor() {
		super( ...arguments );

		this.textRef = createRef();
		this.testRef = createRef();
		this.state = {
			isEmpty: true,
		};
		this.autocompleter = {
			name: 'placeSearch',
			options: this.search,
			isDebounced: true,
			getOptionLabel: option => <span>{ option.place_name }</span>,
			getOptionKeywords: option => [ option.place_name ],
			getOptionCompletion: this.getOptionCompletion,
		};
	}
	getOptionCompletion = option => {
		const { value } = option;
		const point = {
			place_title: value.text,
			title: value.text,
			caption: value.place_name,
			id: value.id,
			coordinates: {
				longitude: value.geometry.coordinates[ 0 ],
				latitude: value.geometry.coordinates[ 1 ],
			},
		};
		this.props.onAddPoint( point );
		return value.text;
	};

	search = value => {
		const { api_key, onError } = this.props;
		const url =
			'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
			encodeURI( value ) +
			'.json?access_token=' +
			api_key;
		return new Promise( function( resolve, reject ) {
			const xhr = new XMLHttpRequest();
			xhr.open( 'GET', url );
			xhr.onload = function() {
				if ( xhr.status === 200 ) {
					const res = JSON.parse( xhr.responseText );
					resolve( res.features );
				} else {
					const res = JSON.parse( xhr.responseText );
					onError( res.statusText, res.responseJSON.message );
					reject( new Error( 'Mapbox Places Error' ) );
				}
			};
			xhr.send();
		} );
	};
	onReset = () => {
		this.textRef.current.value = null;
	};
	render() {
		const { label } = this.props;
		return (
			<BaseControl label={ label } className="components-location-search">
				<Lookup completer={ this.autocompleter } onReset={ this.onReset }>
					{ ( { isExpanded, listBoxId, activeId, onChange, onKeyDown } ) => (
						<TextControl
							placeholder={ placeholderText }
							ref={ this.textRef }
							onChange={ onChange }
							aria-expanded={ isExpanded }
							aria-owns={ listBoxId }
							aria-activedescendant={ activeId }
							onKeyDown={ onKeyDown }
						/>
					) }
				</Lookup>
				<div ref={ this.testRef } />
			</BaseControl>
		);
	}
}

LocationSearch.defaultProps = {
	onError: () => {},
};

export default LocationSearch;

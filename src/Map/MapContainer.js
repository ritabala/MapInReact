import React ,{Component} from 'react';
import {withScriptjs,withGoogleMap, GoogleMap, InfoWindow,Marker} from 'google-maps-react';
import Geocode from 'react-geocode';
import Autocomplete from 'react-google-autocomplete';

Geocode.setApiKey('AIzaSyBai4ODQg2quhv6vTXKo8my');
Geocode.enableDebug();

class MapContainer extends Component {
    constructor(props){
        super(props);
        this.state={
            address :'',
            city:'',
            state:'',
            area:'',
            mapLocation:{
                lat:this.props.center.lat,
                lng:this.props.center.lng
            },
            markerLocation:{
                lat:this.props.center.lat,
                lng:this.props.center.lng
            },
            showingInfoWindow:false
        }
    }

//Component should only update ( meaning re-render ), when the user selects the address, or drags the pin

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.state.markerLocation.lat !== this.props.center.lat ||
            this.state.address !== nextState.address ||
            this.state.city !== nextState.city ||
            this.state.area !== nextState.area ||
            this.state.state !== nextState.state
        ) {
            return true
        } else if (this.props.center.lat === nextProps.center.lat) {
            return false
        }
    }


	componentDidMount() {
        this.addressFromGeocode(this.state.mapLocation.lat , this.state.mapLocation.lng );
    };
    
    /**
	 * Get the current address from the default map position and set those values in the state
	 */
    addressFromGeocode =(newLat,newLng)=>{
        Geocode.fromLatLng( newLat , newLng ).then(
			response => {
				const address = response.results[0].formatted_address,
					addressArray =  response.results[0].address_components,
					city = this.getCity( addressArray ),
					area = this.getArea( addressArray ),
					state = this.getState( addressArray );

				console.log( 'city', city, area, state );

				this.setState( {
					address: ( address ) ? address : '',
					area: ( area ) ? area : '',
					city: ( city ) ? city : '',
					state: ( state ) ? state : '',
				} )
			},
			error => {
				console.error( error );
			}
		);
    }

    getState = ( addressArray ) => {
		let state = '';
		for( let i = 0; i < addressArray.length; i++ ) {
			for( let i = 0; i < addressArray.length; i++ ) {
				if ( addressArray[ i ].types[0] && 'administrative_area_level_1' === addressArray[ i ].types[0] ) {
					state = addressArray[ i ].long_name;
					return state;
				}
			}
		}
    };
    
    getCity = ( addressArray ) => {
		let city = '';
		for( let i = 0; i < addressArray.length; i++ ) {
			if ( addressArray[ i ].types[0] && 'administrative_area_level_2' === addressArray[ i ].types[0] ) {
				city = addressArray[ i ].long_name;
				return city;
			}
		}
    };

    getArea = ( addressArray ) => {
		let area = '';
		for( let i = 0; i < addressArray.length; i++ ) {
			if ( addressArray[ i ].types[0]  ) {
				for ( let j = 0; j < addressArray[ i ].types.length; j++ ) {
					if ( 'sublocality_level_1' === addressArray[ i ].types[j] || 'locality' === addressArray[ i ].types[j] ) {
						area = addressArray[ i ].long_name;
						return area;
					}
				}
			}
		}
	};
    
    onChange = ( event ) => {
		this.setState({ [event.target.name]: event.target.value });
    };
    
    onMarkerDragEnd =(event)=>{
        console.log(event);
        let newLat = event.latLng.lat(),
			newLng = event.latLng.lng();
        this.addressFromGeocode(newLat,newLng);

    }

    onMarkerClick=(event)=>{
        this.setState({
            showingInfoWindow:true
        })
    }

    onInfoWindowClose =(event)=>{
        this.setState({
            showingInfoWindow:false
        })
    }

    onPlaceSelected=(place)=>{
        console.log( 'plc', place ); // contains all the required lat & lng , so no need to use geocode
		const address = place.formatted_address,
			addressArray =  place.address_components,
			city = this.getCity( addressArray ),
			area = this.getArea( addressArray ),
			state = this.getState( addressArray ),
			latValue = place.geometry.location.lat(),
            lngValue = place.geometry.location.lng();
            
		// Set these values in the state.
		this.setState({
			address: ( address ) ? address : '',
			area: ( area ) ? area : '',
			city: ( city ) ? city : '',
			state: ( state ) ? state : '',
			markerLocation: {
				lat: latValue,
				lng: lngValue
			},
			mapLocation: {
				lat: latValue,
				lng: lngValue
			},
		})
    }

    render() {
        const myComponent = withScriptjs(withGoogleMap(props => 
        // const myComponent = (props=>
                <GoogleMap google={this.props.google}
                    defaultzoom={this.props.zoom}
                    defaultcenter={{
                        lat: this.state.mapLocation.lat,
                        lng: this.state.mapLocation.lng
                    }}
                >
                {/* InfoWindow on top of marker */}
						<InfoWindow
                            visible={this.state.showingInfoWindow}
							onClose={this.onInfoWindowClose}
							position={{ lat: ( this.state.markerLocation.lat + 0.0018 ), lng: this.state.markerLocation.lng }}
						>
							<div>
								<span style={{ padding: 0, margin: 0 }}>{ this.state.address }</span>
							</div>
						</InfoWindow>
                {/* Marker */}
						<Marker google={this.props.google}
						        name={'Dolores park'}
						        draggable={true}
                                onDragEnd={ this.onMarkerDragEnd }
                                onClick={this.onMarkerClick}
						        position={{ lat: this.state.markerLocation.lat, lng: this.state.markerLocation.lng }}
						/>
						<Marker />
                {/* For Auto complete Search Box */}
                        <Autocomplete
                            style={{
                                width: '100%',
                                height: '40px',
                                paddingLeft: '16px',
                                marginTop: '2px',
                                marginBottom: '100px'
                            }}
                            onPlaceSelected={this.onPlaceSelected}
                            types={['(regions)']}
                        />
                </GoogleMap>
            )
        )

        // console.log(myComponent)
        let mapForm;
        if (this.props.center.lat !== undefined) {
            mapForm = (
                <div>
                    <div className="form-group">
                        <label htmlFor="">City</label>
                        <input type="text" name="city" className="form-control" onChange={this.onChange} readOnly="readOnly" value={this.state.city} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Area</label>
                        <input type="text" name="area" className="form-control" onChange={this.onChange} readOnly="readOnly" value={this.state.area} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="">State</label>
                        <input type="text" name="state" className="form-control" onChange={this.onChange} readOnly="readOnly" value={this.state.state} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="">Address</label>
                        <input type="text" name="address" className="form-control" onChange={this.onChange} readOnly="readOnly" value={this.state.address} />
                    </div>
                    <myComponent googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBai4ODQg2quhv6vTXKo8my&libraries=places"
                        loadingElement={<div style={{ height: `100%` }} />}
                        containerElement={<div style={{ height: `400px` }}/>}
                        mapElement= {<div style={{ height: `100%` }} />}
                    />
                </div>
            )
        }
        else{
            mapForm=<div style={{height :this.props.height}} ></div>
        }
        return(mapForm);
    }}
export default MapContainer;
import React, { Component } from 'react';

import MapContainer from './MapContainer';

class Home extends Component {
  render() {
    return (
    <div style={{ margin: '100px' }}>
        <MapContainer 
          google={this.props.google}
          zoom={14}
          height='300px'
          center={{lat : 27.1750,
                   lng: 78.0422}}/>
      </div>
    );
  }
}

export default Home;

import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';

// Import the custom marker icon image
import pinIcon from '../../assets/location-pin.png';

// Create a custom icon instance
const customIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [32, 32], // Adjust the size of the icon
  iconAnchor: [16, 32], // Adjust the position of the icon's anchor point
});

const MapComponent = ({ center }) => {
  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: '200px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="Map data © <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
      />
      <Marker position={center} icon={customIcon} />
    </MapContainer>
  );
};

export default MapComponent;

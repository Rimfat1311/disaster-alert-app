"use client";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useState } from 'react';

// Add type definition for the map instance
type MapInstance = google.maps.Map;

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers: {
    position: google.maps.LatLngLiteral;
    type: string;
    id: number;
  }[];
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

export default function MapComponent({ center, zoom, markers }: MapProps) {
  const [map, setMap] = useState<MapInstance | null>(null);

  // Add explicit type to the parameter
  const onLoad = (mapInstance: MapInstance) => {
    setMap(mapInstance);
  };

  const onUnmount = () => {
    setMap(null);
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
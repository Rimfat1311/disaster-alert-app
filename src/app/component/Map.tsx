"use client";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { memo, useState, useEffect } from 'react';

// Define types for better type safety
type LatLng = {
  lat: number;
  lng: number;
};

type DisasterType = 'fire' | 'tornado' | 'flood' | string;

type MarkerData = {
  position: LatLng;
  type: DisasterType;
  id: number;
  severity?: number; // 1-5 scale
};

interface MapProps {
  center: LatLng;
  zoom: number;
  markers: MarkerData[];
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const DISASTER_ICONS: Record<string, string> = {
  fire: '🔥',
  tornado: '🌪️',
  flood: '🌊',
  default: '⚠️'
};

const DISASTER_COLORS: Record<string, string> = {
  fire: '#FF5722',
  tornado: '#9C27B0',
  flood: '#2196F3',
  default: '#FFC107'
};

function MapComponent({ center, zoom, markers }: MapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setLoadError('Google Maps API key is missing');
    }
  }, [apiKey]);

  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-red-100 text-red-700 p-4">
        Error: {loadError}
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-yellow-100 text-yellow-700 p-4">
        Warning: Google Maps API key not configured
      </div>
    );
  }

  const getScaledSize = (severity: number = 3) => {
    // Scale marker size based on severity (1-5)
    const baseSize = 32;
    const scaleFactor = 0.2 * severity;
    return new google.maps.Size(baseSize * scaleFactor, baseSize * scaleFactor);
  };

  const getCustomIcon = (type: DisasterType, severity: number = 3) => {
    const color = DISASTER_COLORS[type] || DISASTER_COLORS.default;
    const size = getScaledSize(severity);
    
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#FFF',
      strokeWeight: 2,
      scale: 10 * (0.2 * severity),
    };
  };

  return (
    <div className="relative h-full w-full">
      <LoadScript
        googleMapsApiKey={apiKey}
        loadingElement={<div className="h-full w-full bg-gray-200 animate-pulse" />}
        onLoad={() => setIsLoaded(true)}
        onError={() => setLoadError('Failed to load Google Maps')}
      >
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              minZoom: 4,
              maxZoom: 18,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                label={{
                  text: DISASTER_ICONS[marker.type] || DISASTER_ICONS.default,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: '#FFF'
                }}
                icon={getCustomIcon(marker.type, marker.severity)}
                onClick={() => {
                  // You can add click handler here
                  console.log('Marker clicked:', marker);
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="h-full w-full bg-gray-200 animate-pulse flex items-center justify-center">
            <p>Loading map...</p>
          </div>
        )}
      </LoadScript>
    </div>
  );
}

export default memo(MapComponent);
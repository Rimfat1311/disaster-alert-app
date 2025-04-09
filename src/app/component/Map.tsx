"use client";
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { memo, useState, useEffect, useCallback } from 'react';

type LatLng = { lat: number; lng: number };
type DisasterType = 'fire' | 'tornado' | 'flood' | 'user' | 'safe';

type MarkerData = { 
  position: LatLng; 
  type: DisasterType; 
  id: number; 
  severity?: string;
};

interface MapProps {
  center: LatLng;
  zoom: number;
  markers: MarkerData[];
  userLocation: LatLng | null;
  safeDestination: LatLng | null;
  showSafeRoute?: boolean;
}

const containerStyle = { width: '100%', height: '100%' };

const DISASTER_ICONS: Record<string, string> = {
  fire: '🔥', 
  tornado: '🌪️', 
  flood: '🌊', 
  user: '📍', 
  safe: '🟢',
  default: '⚠️'
};

const DISASTER_COLORS: Record<string, string> = {
  fire: '#FF5722', 
  tornado: '#9C27B0', 
  flood: '#2196F3', 
  user: '#4285F4',
  safe: '#0F9D58',
  default: '#FFC107'
};

function MapComponent({ 
  center, 
  zoom, 
  markers, 
  userLocation, 
  safeDestination,
  showSafeRoute = false 
}: MapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const calculateRoute = useCallback(() => {
    if (!mapLoaded || !userLocation || !safeDestination || !window.google.maps) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    // Add waypoints or avoid areas if disaster data is available
    const waypoints = markers
      .filter(marker => marker.type !== 'user' && marker.type !== 'safe')
      .map(marker => ({
        location: marker.position,
        stopover: false // Avoid stopping at disaster points
      }));

    directionsService.route(
      {
        origin: userLocation,
        destination: safeDestination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        waypoints: waypoints.length > 0 ? waypoints : undefined,
        optimizeWaypoints: true, // Optimize route if waypoints are used
        avoidHighways: false, // Optional: adjust based on disaster type
        avoidTolls: false,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
          setDirections(null); // Clear directions on failure
        }
      }
    );
  }, [userLocation, safeDestination, mapLoaded, markers]);

  useEffect(() => {
    if (showSafeRoute && userLocation && safeDestination) {
      calculateRoute();
    } else {
      setDirections(null); // Clear route when not showing
    }
  }, [showSafeRoute, userLocation, safeDestination, calculateRoute]);

  const getCustomIcon = (type: DisasterType) => {
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: DISASTER_COLORS[type] || DISASTER_COLORS.default,
      fillOpacity: 0.8,
      strokeColor: '#FFF',
      strokeWeight: 2,
      scale: type === 'user' ? 8 : type === 'safe' ? 6 : 10,
    };
  };

  return (
    <div className="relative h-full w-full">
      <LoadScript 
        googleMapsApiKey={apiKey}
        libraries={['places']}
        onLoad={() => setMapLoaded(true)}
        onError={(e) => console.error('LoadScript error:', e)}
      >
        {mapLoaded ? (
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
              styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
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
                icon={getCustomIcon(marker.type)}
              />
            ))}
            
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: { 
                    strokeColor: '#0F9D58', 
                    strokeWeight: 5,
                    strokeOpacity: 0.7,
                    zIndex: 1
                  },
                  suppressMarkers: true
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <p>Loading Google Maps...</p>
          </div>
        )}
      </LoadScript>
    </div>
  );
}

export default memo(MapComponent);
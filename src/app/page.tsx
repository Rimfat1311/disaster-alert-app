// "use client";
// import { useState, useEffect } from 'react';
// import { FaFire, FaAmbulance, FaBell, FaLocationArrow, FaRoute } from 'react-icons/fa';
// import dynamic from 'next/dynamic';
// import { parseStringPromise } from 'xml2js';
// import AlertCard from './component/AlertCard';

// type DisasterType = 'fire' | 'tornado' | 'flood';
// type Alert = {
//   id: number;
//   type: DisasterType;
//   location: string;
//   distance: string;
//   coords: { lat: number; lng: number };
//   severity?: 'low' | 'medium' | 'high';
// };

// const MapComponent = dynamic(() => import('./component/Map'), {
//   ssr: false,
//   loading: () => (
//     <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-lg relative overflow-hidden mb-20 flex items-center justify-center">
//       <div className="animate-pulse flex flex-col items-center">
//         <div className="h-8 w-8 bg-gray-400 rounded-full mb-2"></div>
//         <p className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">Loading Map...</p>
//       </div>
//     </div>
//   ),
// });

// export default function Home() {
//   const [alerts, setAlerts] = useState<Alert[]>([
//     { id: 1, type: 'fire', location: 'San Francisco, CA', distance: 'Calculating...', coords: { lat: 37.7749, lng: -122.4194 }, severity: 'high' },
//     { id: 2, type: 'tornado', location: 'Oklahoma City, OK', distance: 'Calculating...', coords: { lat: 35.4676, lng: -97.5164 }, severity: 'medium' },
//   ]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
//   const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
//   const [locationLoading, setLocationLoading] = useState(true);
//   const [showSafeRoute, setShowSafeRoute] = useState(false);
//   const [distanceInfo, setDistanceInfo] = useState({ toDisaster: '', toSafeRoute: '' });
//   const [notificationsEnabled, setNotificationsEnabled] = useState(false);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   const safeRouteLocation = { lat: 34.0522, lng: -118.2437 };
//   const NOTIFICATION_DISTANCE_THRESHOLD = 500; // km

//   const fetchGdacsAlerts = async () => {
//     try {
//       const res = await fetch('/api/gdacs');
//       if (!res.ok) throw new Error('Failed to fetch GDACS data');
//       const result = await res.json();
//       const parsed = await parseStringPromise(result.data);
//       const items = parsed.rss.channel[0].item || [];
//       const newAlerts = items.map((item: any, index: number) => {
//         const title = item.title[0].toLowerCase();
//         const lat = parseFloat(item['geo:lat']?.[0] || 0);
//         const lng = parseFloat(item['geo:long']?.[0] || 0);
//         return {
//           id: alerts.length + index + 1,
//           type: (title.includes('fire') ? 'fire' : title.includes('flood') ? 'flood' : 'tornado') as DisasterType,
//           location: item.title[0].split(' - ')[1] || item.title[0],
//           distance: 'Calculating...',
//           coords: { lat: isNaN(lat) ? 0 : lat, lng: isNaN(lng) ? 0 : lng },
//           severity: item.description?.[0]?.includes('High') ? 'high' : 'medium',
//         };
//       }).filter((alert: Alert) => alert.coords.lat !== 0 && alert.coords.lng !== 0);

//       setAlerts((prev) => {
//         const existingIds = new Set(prev.map((alert: Alert) => alert.id));
//         const addedAlerts = newAlerts.filter((alert: Alert) => !existingIds.has(alert.id));
//         if (notificationsEnabled && userLocation && 'Notification' in window && Notification.permission === 'granted') {
//           addedAlerts.forEach((alert: Alert) => {
//             const distance = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, alert.coords.lat, alert.coords.lng));
//             if (distance <= NOTIFICATION_DISTANCE_THRESHOLD) {
//               new Notification('New Disaster Alert', {
//                 body: `${alert.type.toUpperCase()} reported at ${alert.location} (${distance.toFixed(1)} km away)`,
//                 icon: '/favicon.ico',
//               });
//             }
//           });
//         }
//         return [...prev, ...addedAlerts];
//       });
//     } catch (error) {
//       console.error('Error fetching GDACS data:', error);
//       setFetchError(error instanceof Error ? error.message : 'Unknown error fetching GDACS data');
//     }
//   };

//   useEffect(() => {
//     fetchGdacsAlerts();
//   }, []);

//   useEffect(() => {
//     if (userLocation && selectedAlert) {
//       setDistanceInfo({
//         toDisaster: calculateDistance(userLocation.lat, userLocation.lng, selectedAlert.coords.lat, selectedAlert.coords.lng),
//         toSafeRoute: calculateDistance(userLocation.lat, userLocation.lng, safeRouteLocation.lat, safeRouteLocation.lng),
//       });
//     }
//     if (userLocation) {
//       updateAlertDistances(userLocation);
//     }
//   }, [userLocation, selectedAlert]);

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
//           setUserLocation(coords);
//           setLocationLoading(false);
//         },
//         () => {
//           setUserLocation({ lat: 39.8283, lng: -98.5795 });
//           setLocationLoading(false);
//         }
//       );
//     } else {
//       setLocationLoading(false);
//     }
//   }, []);

//   const updateAlertDistances = (coords: { lat: number; lng: number }) => {
//     setAlerts((prevAlerts) =>
//       prevAlerts.map((alert) => ({
//         ...alert,
//         distance: calculateDistance(coords.lat, coords.lng, alert.coords.lat, alert.coords.lng),
//       }))
//     );
//   };

//   const fetchFakeAlerts = () => {
//     setIsLoading(true);
//     setTimeout(() => {
//       const newAlert: Alert = {
//         id: alerts.length + 1,
//         type: 'flood',
//         location: 'New Orleans, LA',
//         distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, 29.9511, -90.0715) : 'Location unknown',
//         coords: { lat: 29.9511, lng: -90.0715 },
//         severity: 'low',
//       };
//       setAlerts((prev) => {
//         if (notificationsEnabled && userLocation && 'Notification' in window && Notification.permission === 'granted') {
//           const distance = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, newAlert.coords.lat, newAlert.coords.lng));
//           if (distance <= NOTIFICATION_DISTANCE_THRESHOLD) {
//             new Notification('New Disaster Alert', {
//               body: `${newAlert.type.toUpperCase()} reported at ${newAlert.location} (${distance.toFixed(1)} km away)`,
//               icon: '/favicon.ico',
//             });
//           }
//         }
//         return [...prev, newAlert];
//       });
//       setIsLoading(false);
//     }, 1500);
//   };

//   const handleShowRoute = (alert: Alert) => {
//     setSelectedAlert(alert);
//     setShowSafeRoute(false);
//   };

//   const toggleSafeRoute = () => {
//     if (!userLocation) {
//       alert('User location not available. Please enable location services.');
//       return;
//     }
//     setShowSafeRoute((prev) => !prev);
//   };

//   const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c;
//     return distance > 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} meters`;
//   };

//   const toggleNotifications = async () => {
//     if (!('Notification' in window)) {
//       alert('This browser does not support notifications.');
//       return;
//     }

//     if (notificationsEnabled) {
//       setNotificationsEnabled(false);
//     } else if (Notification.permission === 'granted') {
//       setNotificationsEnabled(true);
//     } else {
//       const permission = await Notification.requestPermission();
//       if (permission === 'granted') {
//         setNotificationsEnabled(true);
//         new Notification('DisasterAlert', {
//           body: 'Notifications enabled! You’ll be alerted to nearby disasters.',
//           icon: '/favicon.ico',
//         });
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-5 dark:bg-gray-800 dark:text-white">
//       <header className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">DisasterAlert</h1>
//         <div className="flex gap-3">
//           <button onClick={() => document.documentElement.classList.toggle('dark')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">🌓</button>
//           <button
//             onClick={toggleNotifications}
//             className={`p-2 rounded-full ${notificationsEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
//             title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
//           >
//             <FaBell size={20} />
//           </button>
//         </div>
//       </header>

//       <div className="flex gap-3 mb-5">
//         <button onClick={fetchFakeAlerts} className="bg-blue-500 text-white py-2 px-4 rounded-lg" disabled={isLoading}>
//           {isLoading ? 'Loading...' : 'Refresh Alerts'}
//         </button>
//         {locationLoading ? (
//           <button className="bg-gray-300 text-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
//             <span className="animate-spin">⌛</span> Locating...
//           </button>
//         ) : (
//           <button className="bg-green-500 text-white py-2 px-4 rounded-lg flex items-center gap-2">
//             <FaLocationArrow /> {userLocation ? 'Location Found' : 'Location Unknown'}
//           </button>
//         )}
//       </div>

//       {fetchError && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5" role="alert">
//           <strong>Error:</strong> {fetchError}
//         </div>
//       )}

//       {selectedAlert && (
//         <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md mb-5">
//           <h3 className="font-bold text-lg mb-2">Distance Information</h3>
//           <p><span className="font-semibold">To {selectedAlert.type} at {selectedAlert.location}:</span> {distanceInfo.toDisaster || 'Calculating...'}</p>
//           {showSafeRoute && (
//             <p><span className="font-semibold">To safe location:</span> {distanceInfo.toSafeRoute || 'Calculating...'}</p>
//           )}
//           <button
//             onClick={toggleSafeRoute}
//             className={`py-2 px-4 rounded-lg mt-2 flex items-center gap-2 ${showSafeRoute ? 'bg-gray-500 text-white' : 'bg-green-600 text-white'}`}
//           >
//             <FaRoute /> {showSafeRoute ? 'Hide Safe Route' : 'Show Safe Route'}
//           </button>
//         </div>
//       )}

//       <div className="space-y-4 mb-10">
//         <h2 className="text-xl font-semibold flex items-center gap-2">
//           <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span> LIVE ALERTS ({alerts.length})
//         </h2>
//         {alerts.map((alert: Alert) => (
//           <AlertCard key={alert.id} alert={{ ...alert, onShowRoute: () => handleShowRoute(alert) }} />
//         ))}
//       </div>

//       <div className="h-96 rounded-lg overflow-hidden mb-20">
//         <MapComponent
//           center={selectedAlert?.coords || userLocation || { lat: 39.8283, lng: -98.5795 }}
//           zoom={selectedAlert ? 12 : userLocation ? 10 : 4}
//           markers={[
//             ...(userLocation ? [{ position: userLocation, type: 'user' as const, id: 0 }] : []),
//             ...alerts.map((alert) => ({ position: alert.coords, type: alert.type, id: alert.id, severity: alert.severity })),
//             ...(showSafeRoute ? [{ position: safeRouteLocation, type: 'safe' as const, id: 999 }] : []),
//           ]}
//           userLocation={userLocation}
//           safeDestination={showSafeRoute ? safeRouteLocation : null}
//           showSafeRoute={showSafeRoute}
//         />
//       </div>

//       <div className="fixed bottom-5 left-5 right-5 flex justify-center mb-4 gap-4">
//         <button className="bg-red-600 text-white p-4 rounded-full shadow-lg"><FaAmbulance size={24} /></button>
//         <a href="tel:911" className="bg-black text-white p-4 rounded-full shadow-lg flex-1 text-center font-bold">CALL 911</a>
//       </div>
//     </div>
//   );
// }




"use client";
import { useState, useEffect } from 'react';
import { FaFire, FaAmbulance, FaBell, FaLocationArrow, FaRoute } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { parseStringPromise } from 'xml2js';
import AlertCard from './component/AlertCard';

type DisasterType = 'fire' | 'tornado' | 'flood';
type Alert = {
  id: number;
  type: DisasterType;
  location: string;
  distance: string;
  coords: { lat: number; lng: number };
  severity?: 'low' | 'medium' | 'high';
};

const MapComponent = dynamic(() => import('./component/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 dark:bg-gray-600 rounded-lg relative overflow-hidden mb-20 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-8 bg-gray-400 rounded-full mb-2"></div>
        <p className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">Loading Map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'fire', location: 'San Francisco, CA', distance: 'Calculating...', coords: { lat: 37.7749, lng: -122.4194 }, severity: 'high' },
    { id: 2, type: 'tornado', location: 'Oklahoma City, OK', distance: 'Calculating...', coords: { lat: 35.4676, lng: -97.5164 }, severity: 'medium' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showSafeRoute, setShowSafeRoute] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({ toDisaster: '', toSafeRoute: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const safeRouteLocation = { lat: 34.0522, lng: -118.2437 };
  const NOTIFICATION_DISTANCE_THRESHOLD = 500; // km

  const fetchGdacsAlerts = async () => {
    try {
      const res = await fetch('/api/gdacs');
      if (!res.ok) throw new Error(`Failed to fetch GDACS data: ${res.status} ${res.statusText}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      const parsed = await parseStringPromise(result.data);
      const items = parsed.rss.channel[0].item || [];
      const newAlerts = items.map((item: any, index: number) => {
        const title = item.title[0].toLowerCase();
        const lat = parseFloat(item['geo:lat']?.[0] || 0);
        const lng = parseFloat(item['geo:long']?.[0] || 0);
        return {
          id: alerts.length + index + 1,
          type: (title.includes('fire') ? 'fire' : title.includes('flood') ? 'flood' : 'tornado') as DisasterType,
          location: item.title[0].split(' - ')[1] || item.title[0],
          distance: 'Calculating...',
          coords: { lat: isNaN(lat) ? 0 : lat, lng: isNaN(lng) ? 0 : lng },
          severity: item.description?.[0]?.includes('High') ? 'high' : 'medium',
        };
      }).filter((alert: Alert) => alert.coords.lat !== 0 && alert.coords.lng !== 0);

      setAlerts((prev) => {
        const existingIds = new Set(prev.map((alert: Alert) => alert.id));
        const addedAlerts = newAlerts.filter((alert: Alert) => !existingIds.has(alert.id));
        if (notificationsEnabled && userLocation && 'Notification' in window && Notification.permission === 'granted') {
          addedAlerts.forEach((alert: Alert) => {
            const distance = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, alert.coords.lat, alert.coords.lng));
            if (distance <= NOTIFICATION_DISTANCE_THRESHOLD) {
              new Notification('New Disaster Alert', {
                body: `${alert.type.toUpperCase()} reported at ${alert.location} (${distance.toFixed(1)} km away)`,
                icon: '/favicon.ico',
              });
            }
          });
        }
        return [...prev, ...addedAlerts];
      });
    } catch (error) {
      console.error('Error fetching GDACS data:', error);
      setFetchError(error instanceof Error ? error.message : 'Unknown error fetching GDACS data');
    }
  };

  useEffect(() => {
    fetchGdacsAlerts();
  }, []);

  useEffect(() => {
    if (userLocation && selectedAlert) {
      setDistanceInfo({
        toDisaster: calculateDistance(userLocation.lat, userLocation.lng, selectedAlert.coords.lat, selectedAlert.coords.lng),
        toSafeRoute: calculateDistance(userLocation.lat, userLocation.lng, safeRouteLocation.lat, safeRouteLocation.lng),
      });
    }
    if (userLocation) {
      updateAlertDistances(userLocation);
    }
  }, [userLocation, selectedAlert]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          setLocationLoading(false);
        },
        () => {
          setUserLocation({ lat: 39.8283, lng: -98.5795 });
          setLocationLoading(false);
        }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  const updateAlertDistances = (coords: { lat: number; lng: number }) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => ({
        ...alert,
        distance: calculateDistance(coords.lat, coords.lng, alert.coords.lat, alert.coords.lng),
      }))
    );
  };

  const fetchFakeAlerts = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newAlert: Alert = {
        id: alerts.length + 1,
        type: 'flood',
        location: 'New Orleans, LA',
        distance: userLocation ? calculateDistance(userLocation.lat, userLocation.lng, 29.9511, -90.0715) : 'Location unknown',
        coords: { lat: 29.9511, lng: -90.0715 },
        severity: 'low',
      };
      setAlerts((prev) => {
        if (notificationsEnabled && userLocation && 'Notification' in window && Notification.permission === 'granted') {
          const distance = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, newAlert.coords.lat, newAlert.coords.lng));
          if (distance <= NOTIFICATION_DISTANCE_THRESHOLD) {
            new Notification('New Disaster Alert', {
              body: `${newAlert.type.toUpperCase()} reported at ${newAlert.location} (${distance.toFixed(1)} km away)`,
              icon: '/favicon.ico',
            });
          }
        }
        return [...prev, newAlert];
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleShowRoute = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowSafeRoute(false);
  };

  const toggleSafeRoute = () => {
    if (!userLocation) {
      alert('User location not available. Please enable location services.');
      return;
    }
    setShowSafeRoute((prev) => !prev);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance > 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} meters`;
  };

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('DisasterAlert', {
          body: 'Notifications enabled! You’ll be alerted to nearby disasters.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 dark:bg-gray-800 dark:text-white">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">DisasterAlert</h1>
        <div className="flex gap-3">
          <button onClick={() => document.documentElement.classList.toggle('dark')} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">🌓</button>
          <button
            onClick={toggleNotifications}
            className={`p-2 rounded-full ${notificationsEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
          >
            <FaBell size={20} />
          </button>
        </div>
      </header>

      <div className="flex gap-3 mb-5">
        <button onClick={fetchFakeAlerts} className="bg-blue-500 text-white py-2 px-4 rounded-lg" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh Alerts'}
        </button>
        {locationLoading ? (
          <button className="bg-gray-300 text-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
            <span className="animate-spin">⌛</span> Locating...
          </button>
        ) : (
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg flex items-center gap-2">
            <FaLocationArrow /> {userLocation ? 'Location Found' : 'Location Unknown'}
          </button>
        )}
      </div>

      {fetchError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5" role="alert">
          <strong>Error:</strong> {fetchError}
        </div>
      )}

      {selectedAlert && (
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md mb-5">
          <h3 className="font-bold text-lg mb-2">Distance Information</h3>
          <p><span className="font-semibold">To {selectedAlert.type} at {selectedAlert.location}:</span> {distanceInfo.toDisaster || 'Calculating...'}</p>
          {showSafeRoute && (
            <p><span className="font-semibold">To safe location:</span> {distanceInfo.toSafeRoute || 'Calculating...'}</p>
          )}
          <button
            onClick={toggleSafeRoute}
            className={`py-2 px-4 rounded-lg mt-2 flex items-center gap-2 ${showSafeRoute ? 'bg-gray-500 text-white' : 'bg-green-600 text-white'}`}
          >
            <FaRoute /> {showSafeRoute ? 'Hide Safe Route' : 'Show Safe Route'}
          </button>
        </div>
      )}

      <div className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span> LIVE ALERTS ({alerts.length})
        </h2>
        {alerts.map((alert: Alert) => (
          <AlertCard key={alert.id} alert={{ ...alert, onShowRoute: () => handleShowRoute(alert) }} />
        ))}
      </div>

      <div className="h-96 rounded-lg overflow-hidden mb-20">
        <MapComponent
          center={selectedAlert?.coords || userLocation || { lat: 39.8283, lng: -98.5795 }}
          zoom={selectedAlert ? 12 : userLocation ? 10 : 4}
          markers={[
            ...(userLocation ? [{ position: userLocation, type: 'user' as const, id: 0 }] : []),
            ...alerts.map((alert) => ({ position: alert.coords, type: alert.type, id: alert.id, severity: alert.severity })),
            ...(showSafeRoute ? [{ position: safeRouteLocation, type: 'safe' as const, id: 999 }] : []),
          ]}
          userLocation={userLocation}
          safeDestination={showSafeRoute ? safeRouteLocation : null}
          showSafeRoute={showSafeRoute}
        />
      </div>

      <div className="fixed bottom-5 left-5 right-5 flex justify-center mb-4 gap-4">
        <button className="bg-red-600 text-white p-4 rounded-full shadow-lg"><FaAmbulance size={24} /></button>
        <a href="tel:911" className="bg-black text-white p-4 rounded-full shadow-lg flex-1 text-center font-bold">CALL 911</a>
      </div>
    </div>
  );
}
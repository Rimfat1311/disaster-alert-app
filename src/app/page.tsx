"use client";
import { useState } from 'react';
import { FaFire, FaAmbulance, FaBell, FaWind } from 'react-icons/fa';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AlertCard from './component/AlertCard';
import NotificationButton from './component/NotificationButton';
// Type definitions
type Alert = {
  id: number;
  type: 'fire' | 'tornado' | 'flood';
  location: string;
  distance: string;
  coords: { lat: number; lng: number };
};

// Dynamically import MapComponent
const MapComponent = dynamic(
  () => import('./component/Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded-lg relative overflow-hidden mb-20">
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5">
          {[...Array(25)].map((_, i) => (
            <div key={i} className="border border-gray-300 dark:border-gray-500 animate-pulse" />
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">Loading Map...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: 1, type: 'fire', location: 'San Francisco, CA', distance: '12 miles away', coords: { lat: 37.7749, lng: -122.4194 } },
    { id: 2, type: 'tornado', location: 'Oklahoma City, OK', distance: '45 miles away', coords: { lat: 35.4676, lng: -97.5164 } },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchFakeAlerts = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAlerts([
        ...alerts,
        { 
          id: 3, 
          type: 'flood', 
          location: 'New Orleans, LA', 
          distance: '82 miles away',
          coords: { lat: 29.9511, lng: -90.0715 }
        }
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleShowRoute = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5 dark:bg-gray-800 dark:text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">DisasterAlert</h1>
        <div className="flex gap-3">
          <NotificationButton />
          <button 
            onClick={() => document.documentElement.classList.toggle('dark')}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            🌓
          </button>
          <button className="bg-red-500 text-white p-2 rounded-full">
            <FaBell size={20} />
          </button>
        </div>
      </header>

      <button 
        onClick={fetchFakeAlerts} 
        className="bg-blue-500 text-white py-2 px-4 rounded-lg mb-5"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Refresh Alerts'}
      </button>

      {/* Live Alerts */}
      <div className="space-y-4 mb-10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
          LIVE ALERTS
        </h2>
{/*         
        {alerts.map((alert) => (
          <motion.div 
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md"
          >
            <div className="flex items-center gap-3">
              {alert.type === 'fire' ? (
                <FaFire className="text-orange-500" size={24} />
              ) : (
                <FaWind className="text-blue-500" size={24} />
              )}
              <div>
                <h3 className="font-bold dark:text-white">{alert.location}</h3>
                <p className="text-gray-600 dark:text-gray-300">{alert.distance}</p>
              </div>
            </div>
            <button 
              onClick={() => handleShowRoute(alert)}
              className="mt-3 w-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 py-2 rounded-lg font-medium"
            >
              Show Safe Route
            </button>
          </motion.div>
        ))} */}



{alerts.map((alert) => (
    <AlertCard key={alert.id} alert={{ ...alert, onShowRoute: handleShowRoute }} />
  ))} 


      </div>

      {/* Interactive Map */}
      <div className="h-96 rounded-lg overflow-hidden mb-20">
        <MapComponent 
          center={selectedAlert?.coords || { lat: 39.8283, lng: -98.5795 }}
          zoom={selectedAlert ? 10 : 4}
          markers={alerts.map(alert => ({
            position: alert.coords,
            type: alert.type,
            id: alert.id
          }))}
        />
      </div>

      {/* Emergency Actions */}
      <div className="fixed bottom-5 left-5 right-5 flex justify-center gap-4">
        <button className="bg-red-600 text-white p-4 rounded-full shadow-lg">
          <FaAmbulance size={24} />
        </button>
        <a 
          href="tel:911" 
          className="bg-black text-white p-4 rounded-full shadow-lg flex-1 text-center font-bold"
        >
          CALL 911
        </a>
      </div>
    </div>
  );
}
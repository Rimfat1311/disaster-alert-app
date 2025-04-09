"use client";

type DisasterType = 'fire' | 'tornado' | 'flood';

export type Alert = {
  id: number;
  type: DisasterType;
  location: string;
  distance: string;
  coords: { lat: number; lng: number };
  severity?: string;
  onShowRoute?: (alert: Alert) => void;
};

export default function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div 
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => alert.onShowRoute?.(alert)}
    >
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${
          alert.type === 'fire' ? 'text-red-500' :
          alert.type === 'tornado' ? 'text-purple-500' :
          'text-blue-500'
        }`}>
          {alert.type === 'fire' ? '🔥' :
           alert.type === 'tornado' ? '🌪️' : '🌊'}
        </div>
        <div>
          <h3 className="font-bold">{alert.location}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">{alert.distance}</p>
        </div>
      </div>
    </div>
  );
}
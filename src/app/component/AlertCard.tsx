"use client";
import { FaFire, FaWind } from "react-icons/fa";
import { motion } from "framer-motion";

// Alert Type Definition
type Alert = {
  id: number;
  type: "fire" | "tornado" | "flood";
  location: string;
  distance: string;
  coords: { lat: number; lng: number };
  onShowRoute: (alert: Alert) => void;
};

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  return (
    <motion.div
      key={alert.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center gap-3">
        {alert.type === "fire" ? (
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
        onClick={() => alert.onShowRoute(alert)}
        className="mt-3 w-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 py-2 rounded-lg font-medium"
      >
        Show Safe Route
      </button>
    </motion.div>
  );
};

export default AlertCard;

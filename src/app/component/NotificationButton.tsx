import { useState, useEffect } from "react";

export default function NotificationButton() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);





useEffect(() => {
    const fetchAlerts = async () => {
      try {
        console.log("Fetching alerts...");
  
        const response = await fetch("https://api.allorigins.win/raw?url=https://www.gdacs.org/xml/rss.xml");
        const textData = await response.text();
  
        console.log("Raw XML Response:", textData); // Log the raw response
  
        // Convert XML to JSON
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
  
        console.log("Total items found:", items.length); // Check the count of alerts
  
        const newAlerts = [];
        for (let i = 0; i < Math.min(items.length, 5); i++) {
          const title = items[i].getElementsByTagName("title")[0].textContent || "";
          console.log("Extracted alert:", title); // Log extracted alert title
          newAlerts.push(`🚨 ${title}`);
        }
  
        setNotifications(newAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };
  
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
  
    return () => clearInterval(interval);
  }, []);
  




  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="bg-red-500 text-white p-2 rounded-full relative"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg">
          <ul className="p-2">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <li key={index} className="text-sm p-2 border-b dark:border-gray-600">
                  {notif}
                </li>
              ))
            ) : (
              <li className="text-sm p-2">No new alerts</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
// <li className="text-sm p-2">No new alerts</li>
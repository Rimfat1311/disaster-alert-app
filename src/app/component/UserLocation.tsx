"use client";

import { useEffect, useState } from "react";
import { getUserLocation } from "@/app/utils/getUserLocation";

const UserLocation = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        getUserLocation((userCoords) => {
            setLocation(userCoords); // Store location in state
            console.log(`User Location: Lat ${userCoords.latitude}, Lng ${userCoords.longitude}`);
        });
    }, []);

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md text-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Your Location:</h2>
            {location ? (
                <p className="text-gray-600 dark:text-gray-300">
                    📍 Latitude: {location.latitude}, Longitude: {location.longitude}
                </p>
            ) : (
                <p className="text-gray-500">Fetching location...</p>
            )}
        </div>
    );
};

export default UserLocation;

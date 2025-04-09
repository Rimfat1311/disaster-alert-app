export function getUserLocation(callback: (location: { latitude: number; longitude: number }) => void) {
    if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                callback(userCoords);
            },
            (error) => console.error("Error getting location:", error)
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

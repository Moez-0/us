/**
 * Real GPS Location & Distance Calculation Utility for Moez & Eliza
 */

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  country?: string;
  timestamp: string;
}

/**
 * Calculates distance between two latitude/longitude points in kilometers and miles using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { km: number; miles: number } {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);
  const miles = Math.round(km * 0.621371);
  return { km, miles };
}

/**
 * Reverse geocodes coordinates to a human-readable city & country
 * Uses free, keyless reverse geocoding with graceful fallback
 */
export async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Nearby';
      const country = data.countryName || data.countryCode || '';
      return { city, country };
    }
  } catch (err) {
    console.warn('BigDataCloud geocode failed, attempting OpenStreetMap:', err);
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        'Location';
      const country = data.address?.country || '';
      return { city, country };
    }
  } catch (err) {
    console.warn('Nominatim geocode failed:', err);
  }

  return {
    city: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    country: '',
  };
}

/**
 * Gets the current real GPS position from the browser/device
 */
export async function getRealGPSPosition(): Promise<GPSLocation> {
  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const { city, country } = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            city,
            country,
            timestamp: new Date().toISOString(),
          });
        } catch {
          resolve({
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            timestamp: new Date().toISOString(),
          });
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  });
}

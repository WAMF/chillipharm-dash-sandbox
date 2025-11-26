const API_BASE_URL = import.meta.env.PROD
  ? 'https://europe-west2-chillipharm-dashboard.cloudfunctions.net'
  : 'http://127.0.0.1:5002/chillipharm-dashboard/europe-west2';

const coordinatesCache: Record<string, { lat: number; lng: number }> = {};

export async function fetchCountryCoordinates(countryName: string): Promise<{ lat: number; lng: number } | null> {
  if (coordinatesCache[countryName]) {
    return coordinatesCache[countryName];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/geocodeCountry?country=${encodeURIComponent(countryName)}`);

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.success && result.data) {
      const coords = { lat: result.data.lat, lng: result.data.lng };
      coordinatesCache[countryName] = coords;
      return coords;
    }
  } catch (error) {
    console.warn(`Failed to geocode country: ${countryName}`, error);
  }

  return null;
}

export async function resolveAllCoordinates(
  countries: string[]
): Promise<Map<string, { lat: number; lng: number }>> {
  const results = new Map<string, { lat: number; lng: number }>();

  const fetchPromises = countries.map(async (country) => {
    const coords = await fetchCountryCoordinates(country);
    if (coords) {
      results.set(country, coords);
    }
  });

  await Promise.all(fetchPromises);

  return results;
}

export function getCountryCoordinates(countryName: string): { lat: number; lng: number } | null {
  return coordinatesCache[countryName] || null;
}

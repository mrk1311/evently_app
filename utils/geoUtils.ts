// Parse database string to coordinates
export function parseCoordinates(geometry: string): [number, number] {
    // Handle both POINT(lng lat) and SRID=4326;POINT(lng lat) formats
    const match = geometry.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (!match) throw new Error('Invalid geometry format');
    return [parseFloat(match[1]), parseFloat(match[2])];
  }
  
  // Convert coordinates to PostGIS string
  export function formatToPostGisPoint(lng: number, lat: number): string {
    return `SRID=4326;POINT(${lng} ${lat})`;
  }
  
  // Optional: Add reverse geocoding function
  export async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || "";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "";
    }
  }
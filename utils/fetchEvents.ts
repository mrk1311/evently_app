// utils/events.ts
import { EventFeatureCollection, EventFeature } from '@/components/ClusteredMap';
// import { supabase } from './migrate.mjs/index.js';
import { supabase } from './supabase'
import { Point } from 'react-native-maps';


// utils/fetchEvents.ts
// utils/fetchEvents.ts
export async function fetchEvents(): Promise<EventFeatureCollection> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,  
      type,
      description,
      event_time,  
      coordinates,
      photo_url, 
      event_url, 
      location
    `);

  if (error) throw error;

  return {
    type: 'FeatureCollection',
    features: data.map(event => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: parseCoordinates(event.coordinates)
      },
      properties: {
        id: event.id,
        name: event.title,          // map title to name
        type: event.type,
        description: event.description,
        date: event.event_time,     // map event_time to date
        link: event.event_url,
        photo: event.photo_url,
        location: event.location
      }
    })) as EventFeature[]
  };
}

// Helper to convert PostGIS geometry to coordinates
function parseCoordinates(geometry: string): [number, number] {
  const match = geometry.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) throw new Error('Invalid geometry format');
  return [parseFloat(match[1]), parseFloat(match[2])];
}
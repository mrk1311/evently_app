// utils/events.ts
import { EventFeatureCollection, EventFeature } from '@/components/ClusteredMap';
import { supabase } from './supabase';

interface EventRow {
  id: string;
  title: string;
  type: string;
  description: string;
  event_time: string;
  coordinates: string; // WKT string
  photo_url: string;
  event_url: string;
  location: string;
}

export async function fetchEvents(): Promise<EventFeatureCollection> {
  // Query the VIEW instead of the original table
  const { data, error } = await supabase
    .from('events_with_wkt') // Use the new view
    .select('*');

  if (error) throw error;

  // Type assertion (safe because the view matches EventRow)
  const events = data as EventRow[];

  return {
    type: 'FeatureCollection',
    features: events.map(event => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: parseCoordinates(event.coordinates)
      },
      properties: {
        id: event.id,
        name: event.title,
        type: event.type,
        description: event.description,
        date: event.event_time,
        link: event.event_url,
        photo: event.photo_url,
        location: event.location
      }
    })) as EventFeature[]
  };
}

// Helper function remains unchanged
function parseCoordinates(geometry: string): [number, number] {
  const match = geometry.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) throw new Error('Invalid geometry format');
  return [parseFloat(match[1]), parseFloat(match[2])];
}
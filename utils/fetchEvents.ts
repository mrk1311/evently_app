// utils/events.ts
import { EventFeatureCollection } from '@/components/ClusteredMap';
// import { supabase } from './migrate.mjs/index.js';
import { supabase } from './supabase'
import { Point } from 'react-native-maps';

type SupabaseEvent = {
  id: number;
  title: string;
  description: string;
  event_time: string;
  location: string;
  geometry: string; // GeoJSON string representation
  photo_url: string;
  event_url: string;
  type: string;
};

export const fetchEvents = async (): Promise<EventFeatureCollection> => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      description,
      event_time,
      location,
      coordinates,
      photo_url,
      event_url,
      type,
      ST_AsGeoJSON(coordinates) as geometry
    `);

  if (error) throw error;

  return {
    type: 'FeatureCollection',
    features: data.map((event: SupabaseEvent) => ({
      type: 'Feature',
      geometry: JSON.parse(event.geometry) as Point,
      properties: {
        id: event.id,
        name: event.title,
        type: event.type,
        description: event.description,
        date: new Date(event.event_time).toISOString(),
        link: event.event_url,
        photo: event.photo_url
      }
    }))
  };
};
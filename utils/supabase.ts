import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttvleputeqzzvmhuabss.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dmxlcHV0ZXF6enZtaHVhYnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTc2MzksImV4cCI6MjA1Nzk5MzYzOX0.X1URzGtqNQK6I3ootltikKRVdljcftUDTwtEsAjqVR8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// utils/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

// Get these from your Supabase project settings
const SUPABASE_URL = "https://ttvleputeqzzvmhuabss.supabase.co";
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dmxlcHV0ZXF6enZtaHVhYnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTc2MzksImV4cCI6MjA1Nzk5MzYzOX0.X1URzGtqNQK6I3ootltikKRVdljcftUDTwtEsAjqVR8";

// Create and export the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Export TypeScript types
export type { Session } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

// Get these from your Supabase project settings
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

// Create and export the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true, // Keep the session alive
        autoRefreshToken: true, // Automatically refresh the token
    },
})

// Export TypeScript types
export type { Session } from '@supabase/supabase-js'
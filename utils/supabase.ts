import { AppState, Platform } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

// Get these from your Supabase project settings
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

// Create and export the client
// export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
//     auth: {
//         persistSession: true, // Keep the session alive
//         autoRefreshToken: true, // Automatically refresh the token
//     },
// });

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
    },
});

if (Platform.OS !== "web") {
    AppState.addEventListener("change", (state) => {
        if (state === "active") {
            supabase.auth.startAutoRefresh();
        } else {
            supabase.auth.stopAutoRefresh();
        }
    });
}

// Export TypeScript types
export type { Session } from "@supabase/supabase-js";

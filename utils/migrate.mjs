import { createClient } from "@supabase/supabase-js";
import markers from "../assets/markers.json" assert { type: "json" };

const supabaseUrl = "https://ttvleputeqzzvmhuabss.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dmxlcHV0ZXF6enZtaHVhYnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTc2MzksImV4cCI6MjA1Nzk5MzYzOX0.X1URzGtqNQK6I3ootltikKRVdljcftUDTwtEsAjqVR8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateEvents() {
    // First add location names to properties
    const featuresWithLocation = markers.features.map((feature) => ({
        ...feature,
        properties: {
            ...feature.properties,
            location: feature.properties.name.split(" ").slice(0, -1).join(" "),
        },
    }));

    const { data, error } = await supabase.rpc("import_events", {
        data: {
            type: "FeatureCollection",
            features: featuresWithLocation,
        },
    });

    if (error) {
        console.error("Migration failed:", error);
    } else {
        console.log("Successfully migrated", markers.features.length, "events");
    }
}

migrateEvents();

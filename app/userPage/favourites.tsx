import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useUser } from "@/hooks/useUser";
import { EventFeature, EventProperties } from "@/components/ClusteredMap";

// Define proper type for the Supabase response
type FavoriteEvent = {
    events: {
        id: string;
        name: string;
        type: string;
        description: string;
        link: string;
        photo: string;
        date: string;
        geometry: any;
    };
};

export default function Favourites() {
    const router = useRouter();
    const { user } = useUser();
    const [favorites, setFavorites] = useState<EventFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFavourites = async (userId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("user_favourites")
                .select<FavoriteEvent>(
                    `
                    events:event_id (
                        id,
                        name,
                        type,
                        description,
                        link,
                        photo,
                        date,
                        geometry
                    )
                `
                )
                .eq("user_id", userId);

            if (error) throw error;

            const formattedData = data.map(
                (item): EventFeature => ({
                    type: "Feature",
                    geometry: item.events.geometry,
                    properties: {
                        id: item.events.id,
                        name: item.events.name,
                        type: item.events.type,
                        description: item.events.description,
                        link: item.events.link,
                        photo: item.events.photo,
                        date: item.events.date,
                        // Add proper location data instead of "dupa"
                        location: "Proper location data",
                    },
                })
            );

            setFavorites(formattedData);
            setError("");
        } catch (err) {
            console.error("Error fetching favorites:", err);
            setError("Failed to load favorites");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchFavourites(user.id);
        }
    }, [user?.id]);

    // Rest of the component remains the same...
}

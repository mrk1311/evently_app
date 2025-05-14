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
import { EventFeature } from "@/components/ClusteredMap";

// Define proper response type for the joined data
type FavoriteResponse = {
    event_id: {
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
                .select(
                    `
              event_id (
                id,
                title,
                type,
                description,
                event_url,
                photo_url,
                event_time,
                location
              )
            `
                )
                .eq("user_id", userId);

            if (error) throw error;

            // Properly type the response and map to EventFeature
            const formattedData = (data as unknown as FavoriteResponse[]).map(
                (item): EventFeature => ({
                    type: "Feature",
                    geometry: item.event_id.geometry,
                    properties: {
                        id: item.event_id.id,
                        name: item.event_id.name,
                        type: item.event_id.type,
                        description: item.event_id.description,
                        link: item.event_id.link,
                        photo: item.event_id.photo,
                        date: item.event_id.date,
                        location: "Actual location from your data",
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

    const renderItem = ({ item }: { item: EventFeature }) => (
        <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.properties.name}</Text>
            <Text>{item.properties.description}</Text>
            <Text>{new Date(item.properties.date).toLocaleDateString()}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => router.back()}
            >
                <MaterialIcons name="chevron-left" size={24} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.properties.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
    },
    loader: {
        marginTop: 20,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
    },
    listContent: {
        padding: 16,
    },
    eventCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
});

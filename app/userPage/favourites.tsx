import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useUser } from "@/hooks/useUser";
import { EventFeature } from "@/components/ClusteredMap";
import { AntDesign } from "@expo/vector-icons";
import getMarkerColor from "@/functions/getMarkerColor";

// Define proper response type for the joined data
type FavoriteResponse = {
    event_id: {
        id: string;
        title: string;
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
                        name: item.event_id.title,
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

    const renderEventCard = useCallback(
        ({ item }: { item: EventFeature }) => (
            <TouchableOpacity
                style={styles.cardContainer}
                // onPress={() => {
                //     props.openEventDetailsBottomSheet(item);
                //     props.setCenter(
                //         coordinatesToRegion(item.geometry.coordinates)
                //     );
                //     props.snapToIndex(0);
                // }}
            >
                {/* Event Image */}
                {item.properties.photo && (
                    <Image
                        source={{ uri: item.properties.photo }}
                        style={styles.cardImagePlaceholder}
                        resizeMode="cover"
                    />
                )}

                {/* Event Type Indicator */}
                <View
                    style={[
                        styles.typeIndicator,
                        {
                            backgroundColor: getMarkerColor(
                                item.properties.type
                            ),
                        },
                    ]}
                />
                {/* Main Content */}
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                            {item.properties.name}
                        </Text>
                        <TouchableOpacity
                            onPress={() =>
                                // TODO
                                console.log(
                                    "adding " +
                                        item.properties.name +
                                        " to local storage"
                                )
                            }
                        >
                            <AntDesign name="hearto" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.metaContainer}>
                        <Text style={styles.cardSubtitle}>
                            {item.properties.type.toUpperCase()}
                        </Text>
                        <Text style={styles.cardDate}>
                            {new Date(
                                item.properties.date
                            ).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text
                        style={styles.cardDescription}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.properties.description}
                    </Text>
                </View>
            </TouchableOpacity>
        ),
        []
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
                    renderItem={renderEventCard}
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
    // cardContainer: {
    //     backgroundColor: "#fff",
    //     borderRadius: 8,
    //     padding: 16,
    //     marginBottom: 12,
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    //     elevation: 2,
    // },
    eventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 8,
        marginRight: 8,
        backgroundColor: "#eeeeee",
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardContent: {
        flex: 1,
        zIndex: 5000,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333333",
    },
    metaContainer: {
        flexDirection: "row",
        marginTop: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#666666",
    },
    cardDate: {
        fontSize: 12,
        color: "#999999",
        marginLeft: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: "#666666",
        marginTop: 8,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 16,
    },
    typeIndicator: {
        width: 6,
        marginRight: 12,
    },
});

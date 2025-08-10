// ClusterEventsBottomSheet.tsx
import React, { forwardRef, useCallback, useEffect, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
} from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { EventFeature } from "./ClusteredMap";
import getMarkerColor from "@/functions/getMarkerColor";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/utils/supabase";
import { AntDesign } from "@expo/vector-icons";

type ClusterEventsBottomSheetProps = {
    events: EventFeature[];
    onEventPress: (event: EventFeature) => void;
};

const ClusterEventsBottomSheet = forwardRef<
    BottomSheet,
    ClusterEventsBottomSheetProps
>(({ events, onEventPress }, ref) => {
    const snapPoints = useMemo(() => ["30%", "70%"], []);
    const { favorites, addFavorite, removeFavorite, refreshFavorites } =
        useFavorites();

    useEffect(() => {
        refreshFavorites();
    }, []);

    const handleAddFavoriteToServer = useCallback(
        async (eventId: string) => {
            console.log("adding to server");
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    Alert.alert(
                        "Login Required",
                        "Please log in to save favorites"
                    );
                    return;
                }

                const { error } = await supabase
                    .from("user_favourites")
                    .upsert({
                        user_id: user.id,
                        event_id: eventId,
                    });

                if (error) {
                    // Rollback on error
                    console.log("error adding to favorites");
                    // setFavorites((prev) => {
                    //     const updated = new Set(prev);
                    //     updated.delete(eventId);
                    //     return updated;
                    // });
                    throw error;
                }

                // Optional: Update UI state here if needed
            } catch (error) {
                console.error("Error saving favorite:", error);
                Alert.alert("Error", "Failed to save favorite");
            }
        },
        [favorites]
    );

    const handleAddToFavorites = useCallback(
        (eventId: string) => {
            // Optimistic UI update
            console.log("adding to local");
            addFavorite(eventId);

            handleAddFavoriteToServer(eventId);
        },
        [favorites]
    );

    const handleRemoveFavoriteFromServer = useCallback(
        async (eventId: string) => {
            console.log("removing from server");
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    Alert.alert(
                        "Login Required",
                        "Please log in to manage favorites"
                    );
                    return;
                }

                const { error } = await supabase
                    .from("user_favourites")
                    .delete()
                    .match({
                        user_id: user.id,
                        event_id: eventId,
                    });

                if (error) throw error;

                // Alert.alert("Removed", "Event removed from favorites");
            } catch (error) {
                console.error("Error removing favorite:", error);
                Alert.alert("Error", "Failed to remove favorite");
            }
        },
        []
    );

    const handleRemoveFromFavorites = useCallback((eventId: string) => {
        // Update local state
        console.log("removing from local");
        removeFavorite(eventId);

        handleRemoveFavoriteFromServer(eventId);
    }, []);
    // const renderItem = ({ item }: { item: EventFeature }) => (
    //     <TouchableOpacity
    //         style={styles.eventItem}
    //         onPress={() => onEventPress(item)}
    //     >
    //         <Text style={styles.eventName}>{item.properties.name}</Text>
    //         <Text style={styles.eventType}>
    //             {item.properties.type} •{" "}
    //             {new Date(item.properties.date).toLocaleDateString()}
    //         </Text>
    //         <Text style={styles.eventLocation}>{item.properties.location}</Text>
    //     </TouchableOpacity>
    // );

    const renderItem = useCallback(
        ({ item }: { item: EventFeature }) => (
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => {
                    onEventPress(item);
                    // props.setCenter(
                    //     coordinatesToRegion(item.geometry.coordinates)
                    // );
                    // props.snapToIndex(0);
                }}
            >
                {/* Event Image */}
                {/* {item.properties.photo && ( */}
                <Image
                    source={{ uri: item.properties.photo }}
                    style={styles.cardImagePlaceholder}
                    resizeMode="cover"
                />
                {/* )} */}

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
                            onPress={
                                favorites.has(item.properties.id)
                                    ? () =>
                                          handleRemoveFromFavorites(
                                              item.properties.id
                                          )
                                    : () =>
                                          handleAddToFavorites(
                                              item.properties.id
                                          )
                            }
                        >
                            <AntDesign
                                name={
                                    favorites.has(item.properties.id)
                                        ? "heart"
                                        : "hearto"
                                }
                                size={24}
                                color={
                                    favorites.has(item.properties.id)
                                        ? "#d35050"
                                        : "#fff"
                                }
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.metaContainer}>
                        <Text style={styles.cardSubtitle}>
                            {item.properties.type.toUpperCase()}
                        </Text>
                        <Text style={styles.cardDate}>
                            {new Date(item.properties.date).toLocaleDateString(
                                "en-GB"
                            )}
                        </Text>
                    </View>
                    {/* location */}
                    <Text style={styles.cardDescription}>
                        {item.properties.location}
                    </Text>
                </View>
            </TouchableOpacity>
        ),
        [favorites, handleAddToFavorites, handleRemoveFromFavorites]
    );

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.5}
                />
            )}
            backgroundStyle={{ backgroundColor: "#282828" }}
            handleIndicatorStyle={{ backgroundColor: "#fff" }}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Wydarzenia w tym miejscu</Text>
                    <Text style={styles.subtitle}>
                        {events[0]?.properties.location}
                    </Text>
                </View>

                <BottomSheetFlatList
                    data={events}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.properties.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            Nie znaleziono wydarzeń
                        </Text>
                    }
                />
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 16,
        backgroundColor: "#282828",
    },
    header: {
        // marginBottom: 16,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    subtitle: {
        fontSize: 16,
        color: "#fff",
    },
    listContent: {
        paddingBottom: 20,
    },
    eventItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
    },
    eventName: {
        fontSize: 16,
        fontWeight: "600",
    },
    eventType: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    eventLocation: {
        fontSize: 14,
        color: "#333",
        marginTop: 4,
    },
    emptyText: {
        textAlign: "center",
        padding: 20,
        color: "#666",
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
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
        color: "#fff",
    },
    metaContainer: {
        flexDirection: "row",
        marginTop: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#fff",
    },
    cardDate: {
        fontSize: 12,
        color: "#fff",
        marginLeft: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: "#fff",
        marginTop: 8,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 16,
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 8,
        marginRight: 8,
        backgroundColor: "#eeeeee",
    },
    typeIndicator: {
        width: 6,
        marginRight: 12,
    },
});

export default ClusterEventsBottomSheet;

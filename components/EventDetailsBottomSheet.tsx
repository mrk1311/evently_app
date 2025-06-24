import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
    forwardRef,
    memo,
} from "react";
import {
    View,
    Text,
    Image,
    Button,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { EventFeature } from "./ClusteredMap";
import getMarkerColor from "../functions/getMarkerColor";
import { AntDesign } from "@expo/vector-icons";
import { useFavorites } from "@/contexts/FavoritesContext";
import { supabase } from "@/utils/supabase";
import { Link } from "expo-router";

interface BottomSheetProps {
    event: EventFeature;
    handleCancelDetails: () => void;
}

type Ref = BottomSheet;

const EventDetailsBottomSheet = forwardRef<Ref, BottomSheetProps>(
    (props, ref) => {
        // hooks
        const [typeColor, setTypeColor] = useState<string | null>(null);
        const { favorites, addFavorite, removeFavorite, refreshFavorites } =
            useFavorites();

        useEffect(() => {
            if (props.event?.properties.type === undefined) {
            } else {
                setTypeColor(getMarkerColor(props.event.properties.type));
            }
        }, [props.event]);

        // variables
        const snapPoints = useMemo(() => ["30%", "85%"], []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    {...props}
                />
            ),
            []
        );

        // TODO: move these functions to FavoritesContext

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

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
                backdropComponent={renderBackdrop}
                // enableContentPanningGesture={true}
                enablePanDownToClose={true}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        {/* <Button
                            title="map"
                            onPress={props.handleCancelDetails}
                        /> */}
                        <Text style={styles.headerText}>
                            {props.event?.properties.name}
                        </Text>

                        <TouchableOpacity
                            onPress={
                                favorites.has(props.event.properties.id)
                                    ? () =>
                                          handleRemoveFromFavorites(
                                              props.event.properties.id
                                          )
                                    : () =>
                                          handleAddToFavorites(
                                              props.event.properties.id
                                          )
                            }
                        >
                            <AntDesign
                                name={
                                    favorites.has(props.event.properties.id)
                                        ? "heart"
                                        : "hearto"
                                }
                                size={24}
                                color={
                                    favorites.has(props.event.properties.id)
                                        ? "red"
                                        : "black"
                                }
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Event Type Indicator */}
                    <View
                        style={[
                            styles.typeIndicator,
                            {
                                backgroundColor:
                                    typeColor === null ? "black" : typeColor,
                            },
                        ]}
                    />
                    <View style={styles.horizontalContainer}>
                        {/* Event Image */}
                        {/* {props.event?.properties.photo && ( */}
                        <Image
                            source={{ uri: props.event?.properties.photo }}
                            style={styles.cardImagePlaceholder}
                            resizeMode="cover"
                        />
                        {/* )} */}
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>Event Type</Text>
                            <Text style={styles.infoText}>
                                {props.event?.properties.type.toUpperCase()}
                            </Text>
                            <Text style={styles.infoTitle}>Tickets</Text>
                            <Link
                                href={props.event?.properties.link || "#"}
                                style={styles.link}
                            >
                                {props.event?.properties.link
                                    ? props.event?.properties.link.toString()
                                    : "No link available"}
                            </Link>
                            <Text style={styles.infoTitle}>Location</Text>
                            <Text style={styles.infoText}>
                                {props.event?.properties.location}
                            </Text>
                            <Text style={styles.infoTitle}>Time</Text>
                            <Text style={styles.infoText}>
                                {new Date(
                                    props.event.properties.date
                                ).toLocaleDateString("en-GB")}
                            </Text>
                            <Text style={styles.infoText}>
                                {new Date(
                                    props.event.properties.date
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                })}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.headerText}>Description</Text>
                    <Text style={styles.description}>
                        {props.event?.properties.description}
                    </Text>
                </View>
            </BottomSheet>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    headerText: {
        fontSize: 20,
        margin: 8,
        fontWeight: "bold",
        textAlign: "left",
    },
    link: {
        color: "#2563eb",
        fontSize: 16,
        marginBottom: 8,
        textDecorationLine: "underline",
        textAlign: "center",
        fontWeight: "bold",
    },
    type: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 16,
    },
    infoText: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 8,
        fontWeight: "bold",
        color: "#333333",
        width: "100%",
    },
    infoTitle: {
        fontSize: 12,
        color: "#999999",
        marginLeft: 8,
        marginBottom: 4,
        fontWeight: "bold",
    },
    description: {
        fontSize: 16,
        margin: 8,
    },
    typeIndicator: {
        height: 6,
    },
    cardImage: {
        borderRadius: 8,
    },
    cardImagePlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 8,
        backgroundColor: "#eeeeee",
    },
    horizontalContainer: {
        flexDirection: "row",
        marginTop: 16,
        marginBottom: 8,
    },
    infoContainer: {
        alignContent: "center",
        justifyContent: "center",
        flex: 1,
        padding: 10,
    },
});

export default memo(EventDetailsBottomSheet);

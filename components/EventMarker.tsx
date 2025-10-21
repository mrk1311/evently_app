import React, { FunctionComponent, memo, useCallback } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { Marker as MapsMarker } from "react-native-maps";
import type { supercluster } from "react-native-clusterer";
import { AntDesign, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useFavorites } from "@/contexts/FavoritesContext";
import getMarkerStyle from "@/functions/getMarkerStyle";

type IFeature = supercluster.PointOrClusterFeature<any, any>;

interface Props {
    item: IFeature;
    onPress: (item: IFeature) => void;
}

// const getMarkerColor = (type: string) => {
//     const colors: { [key: string]: string } = {
//         music: "#FF4081",
//         sport: "#7C4DFF",
//         conference: "#00BCD4",
//         art: "#FF9800",
//         theatre: "#4CAF50",
//         festival: "#9C27B0",
//     };
//     return colors[type] || "#2196F3";
// };

type iconName =
    | "music-note"
    | "sports-basketball"
    | "school"
    | "palette"
    | "theater-comedy"
    | "festival"
    | "question-mark";

// const getMarkerIcon = (type: string): iconName => {
//     const icons: { [key: string]: iconName } = {
//         music: "music-note",
//         sport: "sports-basketball",
//         conference: "school",
//         art: "palette",
//         theatre: "theater-comedy",
//         festival: "festival",
//     };
//     return icons[type] || "question-mark";
// };

const EventMarker: FunctionComponent<Props> = memo(
    ({ item, onPress }) => {
        const { favorites } = useFavorites(); // Access favorites context
        const isFavorite = favorites.has(item.properties.id); // Check if event is favorited

        const { color, icon } = getMarkerStyle(item.properties.type);

        // Check if this cluster contains any favorite events
        const hasFavoritesInCluster = item.properties?.hasFavorites || false;

        const MarkerIcon = useCallback(({ type }: { type: string }) => {
            const { color, icon } = getMarkerStyle(type);
            return (
                <FontAwesome5 name={icon as iconName} size={20} color="#fff" />
            );
        }, []);

        return (
            <MapsMarker
                key={item.properties?.cluster_id || item.properties?.id}
                coordinate={{
                    latitude: item.geometry.coordinates[1],
                    longitude: item.geometry.coordinates[0],
                }}
                tracksViewChanges={false}
                onPress={() => onPress(item)}
            >
                {item.properties?.cluster ? (
                    // Render Cluster
                    <TouchableOpacity style={styles.clusterMarker}>
                        <Text style={styles.clusterMarkerText}>
                            {item.properties.point_count}
                        </Text>
                        {/* Add favorite badge if cluster has favorites */}
                        {hasFavoritesInCluster && (
                            <>
                                <View style={styles.favoriteBadge}>
                                    <AntDesign
                                        name="heart"
                                        size={18}
                                        color="#d35050"
                                    />
                                </View>
                                <View style={styles.favoriteBadge}>
                                    <AntDesign
                                        name="hearto"
                                        size={18}
                                        color="black"
                                    />
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    // Else, create a custom marker for the event
                    // Add favorite indicator if event is favorited
                    <>
                        <TouchableOpacity style={styles.markerContainer}>
                            <View style={styles.markerTitlePopup}>
                                <Text style={styles.markerTitle}>
                                    {item.properties.name}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.eventMarker,
                                    {
                                        backgroundColor: color,
                                    },
                                ]}
                            >
                                <MarkerIcon type={item.properties.type} />
                                {/* Heart indicator for favorites */}
                                {isFavorite && (
                                    <>
                                        <View style={styles.favoriteBadge}>
                                            <AntDesign
                                                name="heart"
                                                size={18}
                                                color="#d35050"
                                            />
                                        </View>
                                        <View style={styles.favoriteBadge}>
                                            <AntDesign
                                                name="hearto"
                                                size={18}
                                                color="black"
                                            />
                                        </View>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </>
                )}
            </MapsMarker>
        );
    },

    (prevProps, nextProps) =>
        prevProps.item.properties?.cluster_id ===
            nextProps.item.properties?.cluster_id &&
        prevProps.item.properties?.id === nextProps.item.properties?.id &&
        prevProps.item.properties?.point_count ===
            nextProps.item.properties?.point_count &&
        prevProps.item.properties?.onItemPress ===
            nextProps.item.properties?.onItemPress &&
        prevProps.item.properties?.getExpansionRegion ===
            nextProps.item.properties?.getExpansionRegion
);

const styles = StyleSheet.create({
    calloutContainer: {
        width: 200,
        height: 200,
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: 10,
    },
    clusterMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#8eb3ed",
        justifyContent: "center",
        alignItems: "center",
    },
    eventMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2196F3",
        justifyContent: "center",
        alignItems: "center",
        position: "relative", // Added for positioning the badge
    },
    clusterMarkerText: {
        color: "#fff",
        fontSize: 16,
    },
    markerTitlePopup: {
        width: 100,
        padding: 2,
        borderRadius: 5,
        backgroundColor: "#282828",
    },
    markerTitle: {
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontSize: 12,
        textAlign: "center",
    },
    markerContainer: {
        display: "flex",
        gap: 3,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    // Add favorite badge style
    favoriteBadge: {
        position: "absolute",
        top: -4,
        right: -12,
        // backgroundColor: "#FF4081",
        borderRadius: 8,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        // borderWidth: 1,
        // borderColor: "#fff",
    },
});

export default EventMarker;

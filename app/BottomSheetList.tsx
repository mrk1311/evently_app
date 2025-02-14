import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
    BottomSheetFlatList,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import ClusteredMap from "./map";
import eventData from "../assets/markers.json";
import type { EventFeatureCollection, EventFeature } from "./map";

// Reuse your existing marker color function
const getMarkerColor = (type: string) => {
    const colors: { [key: string]: string } = {
        music: "#FF4081",
        sport: "#7C4DFF",
        conference: "#00BCD4",
        art: "#FF9800",
        theatre: "#4CAF50",
        festival: "#9C27B0",
    };
    return colors[type] || "#2196F3";
};

// Helper function to get location name (you might want to implement proper geocoding)
const getLocationFromCoordinates = (coords: number[]) => {
    // This is a simplified example - consider using a geocoding service
    return `Lat: ${coords[1].toFixed(3)}, Lng: ${coords[0].toFixed(3)}`;
};

const BottomSheetList = () => {
    // hooks
    const sheetRef = useRef<BottomSheet>(null);

    // variables
    const snapPoints = useMemo(() => ["15%", "30%", "85%"], []);

    // render
    const renderItem = useCallback(
        ({ item }: { item: string }) => (
            <TouchableOpacity onPress={() => console.log(item)}>
                <View style={styles.itemContainer}>
                    <Text>{item}</Text>
                </View>
            </TouchableOpacity>
        ),
        []
    );

    return (
        <GestureHandlerRootView style={styles.container}>
            <ClusteredMap data={eventData as EventFeatureCollection} />
            <BottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
                enableDynamicSizing={false}
            >
                <BottomSheetFlatList
                    data={eventData.features.map(
                        (feature) => feature.properties.name
                    )}
                    keyExtractor={(i) => i}
                    renderItem={renderItem}
                    contentContainerStyle={styles.contentContainer}
                />
            </BottomSheet>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        backgroundColor: "white",
    },
    itemContainer: {
        padding: 6,
        margin: 6,
        backgroundColor: "#eee",
    },
    typeIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333333",
    },
    eventSubtitle: {
        fontSize: 14,
        color: "#666666",
        marginTop: 4,
    },
    eventLocation: {
        fontSize: 12,
        color: "#999999",
        marginTop: 4,
    },
    header: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        color: "#333333",
    },
});

export default BottomSheetList;

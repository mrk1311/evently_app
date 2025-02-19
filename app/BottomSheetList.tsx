import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";

interface BottomSheetProps {
    events: EventFeatureCollection;
    onListItemClick: (region: Region) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (isOpen: boolean) => void;
}

const coordinatesToRegion = (coordinates: number[]) => ({
    latitude: coordinates[1],
    longitude: coordinates[0],
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
});

const BottomSheetList: React.FC<BottomSheetProps> = ({
    events,
    onListItemClick,
    isSearchOpen,
    setIsSearchOpen,
}) => {
    // hooks
    const sheetRef = useRef<BottomSheet>(null);

    // variables
    const snapPoints = useMemo(() => ["15%", "30%", "85%"], []);

    useEffect(() => {
        if (isSearchOpen) {
            sheetRef.current?.snapToIndex(2);
            console.log("Opening bottom sheet");
        }
    }, [isSearchOpen]);

    const renderEventCard = ({ item }: { item: EventFeature }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => {
                onListItemClick(coordinatesToRegion(item.geometry.coordinates));
                sheetRef.current?.snapToIndex(0);
            }}
        >
            {/* Event Type Indicator */}
            <View
                style={[
                    styles.typeIndicator,
                    // { backgroundColor: getMarkerColor(item.properties.type) },
                ]}
            />

            {/* Main Content */}
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.properties.name}</Text>
                <View style={styles.metaContainer}>
                    <Text style={styles.cardSubtitle}>
                        {item.properties.type.toUpperCase()}
                    </Text>
                    <Text style={styles.cardDate}>
                        {new Date(item.properties.date).toLocaleDateString()}
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

            {/* Event Image */}
            {item.properties.photo && (
                <Image
                    source={{ uri: item.properties.photo }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
            )}
        </TouchableOpacity>
    );

    return (
        <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
        >
            <Text style={styles.header}>Events: {events.features.length}</Text>
            <BottomSheetFlatList
                data={events.features as EventFeature[]}
                keyExtractor={(item) => item.properties.id.toString()}
                renderItem={renderEventCard}
                contentContainerStyle={styles.contentContainer}
            />
        </BottomSheet>
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
    eventDate: {
        fontSize: 12,
        color: "#999999",
        marginTop: 4,
    },
    header: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        color: "#333333",
        textAlign: "center",
        padding: 8,
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
    },
    cardContent: {
        flex: 1,
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
});

export default BottomSheetList;

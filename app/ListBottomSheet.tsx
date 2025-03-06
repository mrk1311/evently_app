import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    forwardRef,
} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";

interface BottomSheetProps {
    events: EventFeatureCollection;
    setCenter: (region: Region) => void;
    snapToIndex: (index: number) => void;
}

const coordinatesToRegion = (coordinates: number[]) => ({
    latitude: coordinates[1],
    longitude: coordinates[0],
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
});

type Ref = BottomSheet;

const ListBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // variables
    const snapPoints = useMemo(() => ["15%", "85%"], []);

    const renderEventCard = ({ item }: { item: EventFeature }) => (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => {
                props.setCenter(coordinatesToRegion(item.geometry.coordinates));
                props.snapToIndex(0);
            }}
        >
            {/* Event Type Indicator NOT WORKING*/}
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
            ref={ref}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            style={styles.container}
        >
            <View style={styles.horizontalContainer}>
                <Text style={styles.header}>
                    Events: {props.events.features.length}
                </Text>

                {/* {
                    <TouchableOpacity
                        onPress={() => {
                            props.snapToIndex(0);
                        }}
                    >
                        <Ionicons name="chevron-down" size={24} color="black" />
                    </TouchableOpacity>
                } */}
            </View>
            <BottomSheetFlatList
                data={props.events.features as EventFeature[]}
                keyExtractor={(item) => item.properties.id.toString()}
                renderItem={renderEventCard}
                contentContainerStyle={styles.contentContainer}
            />
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 8,
    },
    horizontalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingLeft: 38,
        paddingRight: 38,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
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
        // width: "30%",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        marginTop: 8,
        color: "#333333",
        textAlign: "left",
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

export default ListBottomSheet;

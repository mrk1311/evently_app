// components/ClusterEventsBottomSheet.tsx
import React, { forwardRef, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { EventFeature } from "./ClusteredMap";
import { MaterialIcons } from "@expo/vector-icons";

type ClusterEventsBottomSheetProps = {
    events: EventFeature[];
    onEventPress: (event: EventFeature) => void;
};

const ClusterEventsBottomSheet = forwardRef<
    BottomSheet,
    ClusterEventsBottomSheetProps
>(({ events, onEventPress }, ref) => {
    const snapPoints = useMemo(() => ["30%", "70%"], []);

    const renderItem = ({ item }: { item: EventFeature }) => (
        <TouchableOpacity
            style={styles.eventItem}
            onPress={() => onEventPress(item)}
        >
            <Text style={styles.eventName}>{item.properties.name}</Text>
            <Text style={styles.eventType}>
                {item.properties.type} •{" "}
                {new Date(item.properties.date).toLocaleDateString()}
            </Text>
            <Text style={styles.eventLocation}>{item.properties.location}</Text>
        </TouchableOpacity>
    );

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Events at this location</Text>
                    <Text style={styles.subtitle}>
                        {events.length} event{events.length > 1 ? "s" : ""}
                    </Text>
                </View>

                <FlatList
                    data={events}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.properties.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    listContent: {
        paddingBottom: 20,
    },
    eventItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
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
});

export default ClusterEventsBottomSheet;

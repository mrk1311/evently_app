import React, { FunctionComponent, memo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Marker as MapsMarker, Callout } from "react-native-maps";

import type { supercluster } from "react-native-clusterer";

type IFeature = supercluster.PointOrClusterFeature<any, any>;

interface Props {
    item: IFeature;
    onPress: (item: IFeature) => void;
}

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

export const EventMarker: FunctionComponent<Props> = memo(
    ({ item, onPress }) => {
        return (
            <MapsMarker
                key={
                    item.properties?.cluster_id ??
                    `point-${item.properties?.id}`
                }
                coordinate={{
                    latitude: item.geometry.coordinates[1],
                    longitude: item.geometry.coordinates[0],
                }}
                tracksViewChanges={false}
                onPress={() => onPress(item)}
                useLegacyPinView={true}
            >
                {item.properties?.cluster ? (
                    // Render Cluster
                    <View style={styles.clusterMarker}>
                        <Text style={styles.clusterMarkerText}>
                            {item.properties.point_count}
                        </Text>
                    </View>
                ) : (
                    // Else, create a custom marker for the event
                    // a marker and add a callout to it
                    <>
                        <View
                            style={[
                                styles.eventMarker,
                                {
                                    backgroundColor: getMarkerColor(
                                        item.properties.type
                                    ),
                                },
                            ]}
                        >
                            <Text style={styles.clusterMarkerText}>
                                {item.properties.type.charAt(0).toUpperCase()}
                            </Text>
                        </View>

                        <Callout tooltip>
                            <View style={styles.calloutContainer}>
                                <Text>{item.properties.title}</Text>
                                <Text>{item.properties.description}</Text>
                            </View>
                        </Callout>
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
    },
    clusterMarkerText: {
        color: "#fff",
        fontSize: 16,
    },
});

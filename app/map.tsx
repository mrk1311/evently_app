import React, { useState } from "react";
import MapView from "react-native-maps";
import { StyleSheet, View, Dimensions } from "react-native";
import { Clusterer, isPointCluster } from "react-native-clusterer";
import type { Region } from "react-native-maps";
import type { Feature, Point, FeatureCollection } from "geojson";
import { EventMarker } from "./EventMarker";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

type EventProperties = {
    id: number;
    name: string;
    type: string;
    description: string;
    date: string;
    link: string;
    photo: string;
};

type EventFeature = Feature<Point> & {
    properties: EventProperties;
};

type EventFeatureCollection = FeatureCollection & {
    features: EventFeature[];
};

type MapProps = {
    data: EventFeatureCollection;
};

const { width, height } = Dimensions.get("window");
const MAP_DIMENSIONS = { width, height };

const ClusteredMap: React.FC<MapProps> = ({ data }) => {
    const [region, setRegion] = useState<Region>({
        // Center on Europe
        latitude: 51.1657,
        longitude: 10.4515,
        latitudeDelta: 30,
        longitudeDelta: 30,
    });

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

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
            >
                <Clusterer
                    data={data.features}
                    region={region}
                    mapDimensions={MAP_DIMENSIONS}
                    renderItem={(item) => {
                        return (
                            <EventMarker
                                key={
                                    isPointCluster(item)
                                        ? `cluster-${item.properties.cluster_id}`
                                        : `point-${item.properties.id}`
                                }
                                item={item}
                                onPress={(item) => {
                                    // zoom to the cluster
                                    if (isPointCluster(item)) {
                                        const expansionRegion =
                                            item.properties.getExpansionRegion();
                                        setRegion(expansionRegion);
                                    } else {
                                        // handle point press
                                        console.log("Point pressed", item);
                                    }
                                }}
                            />
                        );
                    }}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    marker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    markerText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    cluster: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2196F3",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    clusterText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
});

export default ClusteredMap;
export type { EventFeatureCollection };

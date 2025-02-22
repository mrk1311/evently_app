import React, { useState, useEffect } from "react";
import MapView from "react-native-maps";
import { StyleSheet, View, Dimensions } from "react-native";
import { Clusterer, isPointCluster } from "react-native-clusterer";
import type { Region } from "react-native-maps";
import type { Feature, Point, FeatureCollection } from "geojson";
import { EventMarker } from "./EventMarker";
import type { supercluster } from "react-native-clusterer";

type IFeature = supercluster.PointOrClusterFeature<any, any>;

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
    center: Region;
};

const { width, height } = Dimensions.get("window");
const MAP_DIMENSIONS = { width, height };

const ClusteredMap: React.FC<MapProps> = ({ data, center }) => {
    const mapRef = React.useRef<MapView>(null);

    const [region, setRegion] = useState<Region>(center);

    const handleRegionChange = (newRegion: Region) => {
        console.log(newRegion);
        setRegion(newRegion);
    };

    const _handlePointPress = (point: IFeature) => {
        if (isPointCluster(point)) {
            const toRegion = point.properties.getExpansionRegion();
            mapRef.current?.animateToRegion(toRegion, 500);
        } else {
            console.log("Point pressed", point);
        }
    };

    useEffect(() => {
        mapRef.current?.animateToRegion(center, 500);
    }, [center]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                onRegionChangeComplete={handleRegionChange}
                showsCompass={false}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsTraffic={false}
                showsBuildings={true}
                rotateEnabled={false}
                pitchEnabled={false}
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
                                onPress={_handlePointPress}
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
export type { EventFeature, EventFeatureCollection };

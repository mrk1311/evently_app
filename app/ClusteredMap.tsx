import React, { useState, useEffect, useCallback } from "react";
import MapView from "react-native-maps";
import { StyleSheet, View, Dimensions, Keyboard } from "react-native";
import { Clusterer, isPointCluster } from "react-native-clusterer";
import type { Region } from "react-native-maps";
import type { Feature, Point, FeatureCollection } from "geojson";
import EventMarker from "./EventMarker";
import type { supercluster } from "react-native-clusterer";

import * as Location from "expo-location";
import debounce from "lodash/debounce";
import { set, throttle } from "lodash";

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
    location: Location.LocationObject | null;
    openEventDetailsBottomSheet: (event: EventFeature) => void;
    onRegionChangeComplete: (region: Region) => void;
};

const { width, height } = Dimensions.get("window");
const MAP_DIMENSIONS = { width, height };

const ClusteredMap: React.FC<MapProps> = ({
    data,
    center,
    openEventDetailsBottomSheet,
    onRegionChangeComplete,
}) => {
    const mapRef = React.useRef<MapView>(null);

    const [region, setRegion] = useState<Region>(center);

    const onRegionChange = useCallback(
        debounce(
            (region: Region) => {
                console.log("debounced region change", region);
                onRegionChangeComplete(region);
            },
            1000,
            { trailing: true, leading: false }
        ),
        []
    );

    useEffect(() => {
        onRegionChange(region);
    }, [region]);

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    const _handlePointPress = (point: IFeature) => {
        if (isPointCluster(point)) {
            const toRegion = point.properties.getExpansionRegion();
            mapRef.current?.animateToRegion(toRegion, 500);
        } else {
            console.log("Point pressed", point);
            openEventDetailsBottomSheet(point);
        }
    };

    useEffect(() => {
        mapRef.current?.animateToRegion(center, 500);
        console.log("Center changed", center);
    }, [center]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                // onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChange}
                showsCompass={false}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsTraffic={false}
                showsBuildings={true}
                rotateEnabled={false}
                pitchEnabled={false}
                onPanDrag={() => Keyboard.dismiss()}
            >
                <Clusterer
                    data={data.features}
                    region={region}
                    mapDimensions={MAP_DIMENSIONS}
                    options={{
                        radius: 30,
                    }}
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

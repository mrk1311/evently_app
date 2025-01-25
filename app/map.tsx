import React, { useState, useRef, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Clusterer, isPointCluster } from "react-native-clusterer";
import MapView, { Region } from "react-native-maps";
import { Point } from "./Point";

import type { supercluster } from "react-native-clusterer";

type IFeature = supercluster.PointOrClusterFeature<any, any>;

const { width, height } = Dimensions.get("window");
const MAP_DIMENSIONS = { width, height };

const initialRegion = {
    latitude: 40.77,
    longitude: -73.97,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

// TODO animations

const MapComponent = () => {
    const [markers, setMarkers] = useState<any[]>([]);
    const [region, setRegion] = useState<Region>(initialRegion);
    const mapRef = useRef<MapView>(null);

    const _handlePointPress = (point: IFeature) => {
        if (isPointCluster(point)) {
            const toRegion = point.properties.getExpansionRegion();
            mapRef.current?.animateToRegion(toRegion, 500);
        }
    };

    useEffect(() => {
        console.log("region changed", region);
    }, [region]);

    useEffect(() => {
        console.log("Fetching GeoJSON data...");
        // Load the GeoJSON data with markers
        const fetchGeoJson = async () => {
            const geoJson = require("../assets/markers.json");
            setMarkers(geoJson.features);
        };

        fetchGeoJson();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                initialRegion={initialRegion}
                onRegionChangeComplete={setRegion}
                style={MAP_DIMENSIONS}
            >
                <Clusterer
                    data={markers}
                    region={region}
                    options={{ radius: 18 }}
                    mapDimensions={MAP_DIMENSIONS}
                    renderItem={(item) => {
                        console.log;
                        return (
                            <Point
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
    },
});

export default MapComponent;

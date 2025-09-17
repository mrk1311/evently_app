import React, { useState, useEffect, useCallback } from "react";
import MapView from "react-native-maps";
import { StyleSheet, View, Dimensions, Keyboard } from "react-native";
import { supercluster, isPointCluster } from "react-native-clusterer";
import type { Region } from "react-native-maps";
import type { Feature, Point, FeatureCollection, Geometry } from "geojson";
import EventMarker from "../components/EventMarker";
import * as Location from "expo-location";
import debounce from "lodash/debounce";
import { Href } from "expo-router";
import Supercluster from "react-native-clusterer";
import { useFavorites } from "@/contexts/FavoritesContext";

type IFeature = supercluster.PointOrClusterFeature<any, any>;

type EventProperties = {
    id: string;
    name: string;
    type: string;
    description: string;
    date: string;
    link: Href;
    photo: string;
    location: string;
    distance?: number;
};

type EventFeature = Feature<Point, EventProperties>;
type EventFeatureCollection = GeoJSON.FeatureCollection<Point, EventProperties>;
type MapProps = {
    data: EventFeatureCollection;
    center: Region;
    location: Location.LocationObject | null;
    openEventDetailsBottomSheet: (event: EventFeature) => void;
    onRegionChangeComplete: (region: Region) => void;
    setCenterOnUser: (boolean: boolean) => void;
    openClusterEventsBottomSheet: (events: EventFeature[]) => void; // Add this prop
    setEventsInRegion: (events: EventFeature[]) => void;
};

const { width, height } = Dimensions.get("window");
const MAP_DIMENSIONS = { width, height };

const ClusteredMap: React.FC<MapProps> = ({
    data,
    center,
    openEventDetailsBottomSheet,
    onRegionChangeComplete,
    setCenterOnUser,
    openClusterEventsBottomSheet,
    setEventsInRegion,
}) => {
    const mapRef = React.useRef<MapView>(null);
    const superclusterRef = React.useRef<Supercluster | null>(null);
    const [clusters, setClusters] = useState<IFeature[]>([]);
    const [region, setRegion] = useState<Region>(center);
    const { favorites } = useFavorites();

    useEffect(() => {
        if (data && data.features) {
            // Filter events in the current region
            const filteredEvents = data.features.filter((feature) => {
                const [lon, lat] = feature.geometry.coordinates;
                return (
                    lon >= region.longitude - region.longitudeDelta / 2 &&
                    lon <= region.longitude + region.longitudeDelta / 2 &&
                    lat >= region.latitude - region.latitudeDelta / 2 &&
                    lat <= region.latitude + region.latitudeDelta / 2
                );
            }) as EventFeature[];

            setEventsInRegion(filteredEvents);
        }
    }, [data, region]);

    // Initialize Supercluster
    useEffect(() => {
        if (!superclusterRef.current) {
            superclusterRef.current = new Supercluster({
                radius: 30,
                maxZoom: 20,
                minZoom: 1,
                minPoints: 2,
            });
        }

        // Load data into Supercluster
        superclusterRef.current.load(data.features);
        updateClusters();
    }, [data]);

    // Update clusters when region changes
    useEffect(() => {
        updateClusters();
    }, [region]);

    // Compute cluster properties
    const computeClusterProperties = (clusters: IFeature[]) => {
        return clusters.map((cluster) => {
            if (cluster.properties?.cluster && superclusterRef.current) {
                // Get events in this cluster
                const leaves = superclusterRef.current.getLeaves(
                    cluster.properties.cluster_id,
                    Number.POSITIVE_INFINITY,
                    0
                ) as EventFeature[];

                // Check if any event in cluster is favorited
                const hasFavorites = leaves.some((leaf) =>
                    favorites.has(leaf.properties.id)
                );

                // Add hasFavorites property to cluster
                return {
                    ...cluster,
                    properties: {
                        ...cluster.properties,
                        hasFavorites,
                    },
                };
            }
            return cluster;
        });
    };

    const updateClusters = () => {
        if (superclusterRef.current) {
            const clusters = superclusterRef.current.getClustersFromRegion(
                region,
                MAP_DIMENSIONS
            );

            // Add hasFavorites property to clusters
            const enhancedClusters = computeClusterProperties(clusters);
            setClusters(enhancedClusters);
        }
    };

    const onRegionChange = useCallback(
        debounce(
            (region: Region) => {
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
        if (point.properties?.cluster) {
            if (superclusterRef.current) {
                const clusterEvents = superclusterRef.current.getLeaves(
                    point.properties.cluster_id,
                    Number.POSITIVE_INFINITY,
                    0
                ) as EventFeature[];

                const tooClose = areMarkersTooClose(clusterEvents);

                if (tooClose) {
                    // If markers are too close, open bottom sheet with cluster events and zoom in
                    const toRegion = calculateClusterBoundingBox(clusterEvents);
                    mapRef.current?.animateToRegion(toRegion, 500);
                    openClusterEventsBottomSheet(clusterEvents);
                } else {
                    // Calculate bounding box for the cluster
                    const toRegion = calculateClusterBoundingBox(clusterEvents);
                    mapRef.current?.animateToRegion(toRegion, 500);
                }
            }
        } else {
            openEventDetailsBottomSheet(point as EventFeature);
        }
    };
    // Calculate bounding box for a cluster
    const calculateClusterBoundingBox = (events: EventFeature[]): Region => {
        if (events.length === 0) {
            return {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };
        }

        let minLat = events[0].geometry.coordinates[1];
        let maxLat = minLat;
        let minLon = events[0].geometry.coordinates[0];
        let maxLon = minLon;

        events.forEach((event) => {
            const [lon, lat] = event.geometry.coordinates;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
        });

        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        const latDelta = (maxLat - minLat) * 1.5; // Add padding
        const lonDelta = (maxLon - minLon) * 1.5; // Add padding

        return {
            latitude: centerLat,
            longitude: centerLon,
            latitudeDelta: Math.max(latDelta, 0.01), // Minimum delta
            longitudeDelta: Math.max(lonDelta, 0.01), // Minimum delta
        };
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
                userInterfaceStyle="dark"
                // onRegionChange={handleRegionChange}
                onRegionChangeComplete={handleRegionChange}
                showsCompass={false}
                showsUserLocation={true}
                showsMyLocationButton={true}
                rotateEnabled={false}
                pitchEnabled={false}
                onPanDrag={() => {
                    Keyboard.dismiss();
                    setCenterOnUser(false);
                }}
                mapPadding={{ top: 100, right: 0, bottom: 220, left: 0 }}
            >
                {/* <Clusterer
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
                /> */}
                {clusters.map((item) => (
                    <EventMarker
                        key={
                            item.properties?.cluster
                                ? `cluster-${item.properties.cluster_id}`
                                : `point-${item.properties.id}`
                        }
                        item={item}
                        onPress={_handlePointPress}
                    />
                ))}
            </MapView>
        </View>
    );
};

// const findMarkersInRegion = async (
//     region: Region,
//     data: EventFeatureCollection
// ) => {
//     const markersInRegion = data.features.filter((feature) => {
//         const [lon, lat] = feature.geometry.coordinates;
//         return (
//             lon >= region.longitude - region.longitudeDelta / 2 &&
//             lon <= region.longitude + region.longitudeDelta / 2 &&
//             lat >= region.latitude - region.latitudeDelta / 2 &&
//             lat <= region.latitude + region.latitudeDelta / 2
//         );
//     });
//     return markersInRegion;
// };

// Check if markers in a cluster are too close to decluster
const areMarkersTooClose = (
    events: EventFeature[],
    thresholdKm = 1
): boolean => {
    if (events.length <= 1) return false;

    const coordinates = events.map((event) => ({
        latitude: event.geometry.coordinates[1],
        longitude: event.geometry.coordinates[0],
    }));

    // Check distances between all points
    for (let i = 0; i < coordinates.length; i++) {
        for (let j = i + 1; j < coordinates.length; j++) {
            const distance = haversine(
                coordinates[i].latitude,
                coordinates[i].longitude,
                coordinates[j].latitude,
                coordinates[j].longitude
            );

            if (distance > thresholdKm) {
                // At least one pair is not too close
                return false;
            }
        }
    }

    // All markers are very close
    return true;
};

// Haversine distance calculation
const haversine = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
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

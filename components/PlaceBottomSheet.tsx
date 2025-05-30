import React, {
    useCallback,
    useMemo,
    useState,
    forwardRef,
    useEffect,
} from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
} from "react-native";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { Region } from "react-native-maps";
import { Feature, FeatureCollection } from "geojson";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BottomSheetProps {
    setCenter: (region: Region) => void;
    handleCancelPlace: () => void;
    handleAcceptPlace: (place: Feature) => void;
    places: FeatureCollection | null;
    setPlaces: (places: FeatureCollection | null) => void;
}

type Ref = BottomSheet;

const PlaceBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // hooks

    // variables
    const [lastSearched, setLastSearched] = useState<Feature[] | null>(null);
    const snapPoints = useMemo(() => ["85%"], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        []
    );

    // Load last searched items on component mount
    useEffect(() => {
        const loadLastSearched = async () => {
            try {
                const storedItems = await AsyncStorage.getItem("last-searched");
                if (storedItems !== null) {
                    const parsedItems: Feature[] = JSON.parse(storedItems);
                    setLastSearched(parsedItems);
                }
            } catch (error) {
                console.error("Error loading last searched items:", error);
            }
        };

        loadLastSearched();
    }, []);

    const PlaceCard = ({ place }: { place: Feature }) => (
        <TouchableOpacity
            style={[styles.cardContainer]}
            onPress={async () => {
                try {
                    // Retrieve existing items
                    const storedItems = await AsyncStorage.getItem(
                        "last-searched"
                    );
                    let items: Feature[] = storedItems
                        ? JSON.parse(storedItems)
                        : [];

                    // Check if the place already exists
                    const existingIndex = items.findIndex(
                        (p) =>
                            p.properties?.place_id ===
                            place.properties?.place_id
                    );

                    // Remove if exists to avoid duplicates
                    if (existingIndex !== -1) {
                        items.splice(existingIndex, 1);
                    }

                    // Add the new place to the beginning and limit to 10 items
                    items = [place, ...items].slice(0, 10);

                    // Save to AsyncStorage
                    await AsyncStorage.setItem(
                        "last-searched",
                        JSON.stringify(items)
                    );

                    // Update state
                    setLastSearched(items);
                } catch (error) {
                    console.error("Error updating last searched:", error);
                }

                props.handleAcceptPlace(place);
                props.setPlaces(null);
                Keyboard.dismiss();
            }}
        >
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                    {place.properties?.display_name}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            backdropComponent={renderBackdrop}
            enableContentPanningGesture={true}
            enablePanDownToClose={false}
        >
            <View style={styles.horizontalContainer}>
                <Button
                    title="Cancel"
                    // change to cancel and close
                    onPress={() => {
                        props.handleCancelPlace();
                        props.setPlaces(null);
                        Keyboard.dismiss();
                    }}
                />
                <Text style={styles.header}>Choose Place</Text>
                <Button title="Accept" />
            </View>
            <View style={styles.container}>
                {/* display last searched items when not searching*/}
                {props.places === null ? (
                    <>
                        <Text style={styles.subHeader}>Last searched:</Text>
                        {lastSearched === null ? (
                            <Text>No places found</Text>
                        ) : (
                            lastSearched.map((place) => (
                                <PlaceCard
                                    place={place}
                                    key={place.properties?.place_id}
                                />
                            ))
                        )}
                    </>
                ) : (
                    props.places?.features.map((place) => {
                        return (
                            <PlaceCard
                                place={place}
                                key={place.properties?.place_id}
                            />
                        );
                    })
                )}
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    horizontalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 8,
    },

    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
        margin: 8,
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
    subHeader: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 16,
        color: "#333333",
        textAlign: "left",
        paddingHorizontal: 16,
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

export default PlaceBottomSheet;

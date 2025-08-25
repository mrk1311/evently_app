import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    forwardRef,
    useState,
} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, {
    BottomSheetFlatList,
    BottomSheetFlatListMethods,
} from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";
import getMarkerColor from "../functions/getMarkerColor";
import ScrollToTopButton from "./ScrollToTopButton";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Alert } from "react-native";
import { supabase } from "@/utils/supabase";
import { useFavorites } from "@/contexts/FavoritesContext";
import { add } from "lodash";
import TextTicker from "react-native-text-ticker";
import EventPhotoPlaceholder from "./EventPlaceholder";

interface BottomSheetProps {
    events: EventFeatureCollection;
    setCenter: (region: Region) => void;
    snapToIndex: (index: number) => void;
    openEventDetailsBottomSheet: (event: EventFeature) => void;
    pickedSortByOption: string;
    setPickedSortByOption: (sortByOption: string) => void;
    eventsInRegion?: EventFeature[];
    pickedTypes?: string[];
    startDate?: Date;
    endDate?: Date;
}

const coordinatesToRegion = (coordinates: number[]) => ({
    latitude: coordinates[1],
    longitude: coordinates[0],
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
});

type Ref = BottomSheet;

const ListBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // variables
    const snapPoints = useMemo(() => ["30%", "85%"], []);

    const flatListRef = useRef<BottomSheetFlatListMethods>(null);
    const [buttonShown, setButtonShown] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const { favorites, addFavorite, removeFavorite, refreshFavorites } =
        useFavorites();

    const listToTop = () => {
        flatListRef.current?.scrollToIndex({ animated: true, index: 0 });
    };

    // create a new list with all events in region first, then all events in the whole collection

    const eventList = useMemo(() => {
        const eventsInRegionSet = new Set(
            props.eventsInRegion?.map((event) => event.properties.id)
        );

        const listWithoutEventsInRegion = props.events.features.filter(
            (event) => !eventsInRegionSet.has(event.properties.id)
        );

        // separator between two lists
        if (props.eventsInRegion) {
            listWithoutEventsInRegion.unshift({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0],
                },
                properties: {
                    id: "separator",
                    name: "Pozostałe najbliższe wydarzenia",
                    type: "",
                    description: "",
                    date: "",
                    link: "/#${string}",
                    photo: "",
                    location: "",
                },
            });
        }

        if (props.eventsInRegion?.length === 0) {
            listWithoutEventsInRegion.unshift({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [0, 0],
                },
                properties: {
                    id: "separator2",
                    name: "Brak wydarzeń w okolicy",
                    type: "",
                    description: "",
                    date: "",
                    link: "/#${string}",
                    photo: "",
                    location: "",
                },
            });
        }

        return [...(props.eventsInRegion || []), ...listWithoutEventsInRegion];
    }, [props.events, props.eventsInRegion]);

    useEffect(() => {
        refreshFavorites();
    }, []);

    useEffect(() => {
        if (currentIndex >= 2) {
            setButtonShown(true);
        } else {
            setButtonShown(false);
        }
    }, [currentIndex]);

    const handleAddFavoriteToServer = useCallback(
        async (eventId: string) => {
            console.log("adding to server");
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    Alert.alert(
                        "Login Required",
                        "Please log in to save favorites"
                    );
                    return;
                }

                const { error } = await supabase
                    .from("user_favourites")
                    .upsert({
                        user_id: user.id,
                        event_id: eventId,
                    });

                if (error) {
                    // Rollback on error
                    console.log("error adding to favorites");
                    // setFavorites((prev) => {
                    //     const updated = new Set(prev);
                    //     updated.delete(eventId);
                    //     return updated;
                    // });
                    throw error;
                }

                // Optional: Update UI state here if needed
            } catch (error) {
                console.error("Error saving favorite:", error);
                Alert.alert("Error", "Failed to save favorite");
            }
        },
        [favorites]
    );

    const handleAddToFavorites = useCallback(
        (eventId: string) => {
            // Optimistic UI update
            console.log("adding to local");
            addFavorite(eventId);

            handleAddFavoriteToServer(eventId);
        },
        [favorites]
    );

    const handleRemoveFavoriteFromServer = useCallback(
        async (eventId: string) => {
            console.log("removing from server");
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    Alert.alert(
                        "Login Required",
                        "Please log in to manage favorites"
                    );
                    return;
                }

                const { error } = await supabase
                    .from("user_favourites")
                    .delete()
                    .match({
                        user_id: user.id,
                        event_id: eventId,
                    });

                if (error) throw error;

                // Alert.alert("Removed", "Event removed from favorites");
            } catch (error) {
                console.error("Error removing favorite:", error);
                Alert.alert("Error", "Failed to remove favorite");
            }
        },
        []
    );

    const handleRemoveFromFavorites = useCallback((eventId: string) => {
        // Update local state
        console.log("removing from local");
        removeFavorite(eventId);

        handleRemoveFavoriteFromServer(eventId);
    }, []);

    const renderEventCard = useCallback(
        ({ item }: { item: EventFeature }) => (
            // if item is separator, return a view with text
            <View
            // style={[
            //     styles.itemContainer,
            //     item.properties.id === "separator" && {
            //         backgroundColor: "#f0f0f0",
            //         borderBottomWidth: 0,
            //     },
            // ]}
            >
                {item.properties.id === "separator" ||
                item.properties.id === "separator2" ? (
                    <View style={styles.itemContainer}>
                        <Text
                            style={{
                                fontWeight: "bold",
                                color: "#ffffff",
                            }}
                        >
                            {item.properties.name}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.cardContainer}
                        onPress={() => {
                            props.openEventDetailsBottomSheet(item);
                            props.setCenter(
                                coordinatesToRegion(item.geometry.coordinates)
                            );
                            props.snapToIndex(0);
                        }}
                    >
                        {/* Event Image */}
                        {item.properties.photo ? (
                            <Image
                                source={{ uri: item.properties.photo }}
                                style={styles.cardImagePlaceholder}
                                resizeMode="cover"
                            />
                        ) : (
                            <EventPhotoPlaceholder
                                type={item.properties.type}
                                componentWidth={80}
                                componentHeight={80}
                            />
                        )}

                        {/* Event Type Indicator */}
                        <View
                            style={[
                                styles.typeIndicator,
                                {
                                    backgroundColor: getMarkerColor(
                                        item.properties.type
                                    ),
                                },
                            ]}
                        />
                        {/* Main Content */}
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>
                                    {item.properties.name}
                                </Text>
                                <TouchableOpacity
                                    onPress={
                                        favorites.has(item.properties.id)
                                            ? () =>
                                                  handleRemoveFromFavorites(
                                                      item.properties.id
                                                  )
                                            : () =>
                                                  handleAddToFavorites(
                                                      item.properties.id
                                                  )
                                    }
                                >
                                    <AntDesign
                                        name={
                                            favorites.has(item.properties.id)
                                                ? "heart"
                                                : "hearto"
                                        }
                                        size={24}
                                        color={
                                            favorites.has(item.properties.id)
                                                ? "#d35050"
                                                : "#ffffff"
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.metaContainer}>
                                <Text style={styles.cardSubtitle}>
                                    {item.properties.type.toUpperCase()}
                                </Text>
                                <Text style={styles.cardDate}>
                                    {new Date(
                                        item.properties.date
                                    ).toLocaleDateString("en-GB")}
                                </Text>
                            </View>
                            {/* location */}
                            <Text style={styles.cardDescription}>
                                {item.properties.location}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        ),
        [favorites, handleAddToFavorites, handleRemoveFromFavorites, props]
    );

    return (
        <BottomSheet
            ref={ref}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            style={styles.container}
            backgroundStyle={{ backgroundColor: "#282828" }}
            handleIndicatorStyle={{ backgroundColor: "#ffffff" }}
        >
            {/* <View style={styles.headerContainer}> */}
            <View style={styles.horizontalContainer}>
                <Text style={styles.header}>
                    {/* Wydarzenia: {props.events.features.length} */}
                    Wydarzenia w tym obszarze
                </Text>

                {/* add information about applied filters */}
                <View style={styles.filtersContainer}>
                    <View style={styles.filter}>
                        <TextTicker
                            style={styles.subHeader}
                            duration={6000}
                            loop
                            bounce
                            repeatSpacer={50}
                            marqueeDelay={1000}
                            // shouldAnimateTreshold={50}
                        >
                            Rodzaje:{" "}
                            {props.pickedTypes && props.pickedTypes?.length > 0
                                ? props.pickedTypes.join(", ")
                                : "Wszystkie"}
                        </TextTicker>
                    </View>
                    <View style={styles.filter}>
                        <Text style={styles.subHeader}>
                            Data:{" "}
                            {props.startDate && props.endDate
                                ? `${props.startDate.toLocaleDateString(
                                      "pl-PL",
                                      {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit",
                                      }
                                  )} - ${props.endDate.toLocaleDateString(
                                      "pl-PL",
                                      {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "2-digit",
                                      }
                                  )}`
                                : "Brak dat"}
                        </Text>
                    </View>
                </View>
            </View>
            {/* </View> */}

            <BottomSheetFlatList
                ref={flatListRef}
                data={eventList}
                keyExtractor={(item) => item.properties.id.toString()}
                renderItem={renderEventCard}
                contentContainerStyle={styles.contentContainer}
                onScrollEndDrag={(event) => {
                    const totalHeight =
                        event.nativeEvent.layoutMeasurement.width;
                    const yPosition = event.nativeEvent.contentOffset.y;
                    const newIndex = Math.round(yPosition / totalHeight);
                    if (newIndex !== currentIndex) {
                        setCurrentIndex(newIndex);
                    }
                }}
            />

            <ScrollToTopButton
                active={buttonShown}
                listToTop={listToTop}
                setButtonShown={setButtonShown}
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
        flex: 1,
        minHeight: 40,
        maxHeight: 40,
        alignItems: "flex-start",
        gap: 16,
        paddingTop: 8,
        paddingLeft: 16,
        paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
        paddingBottom: 10,
        // margin: 6,
        marginBottom: 0,
    },
    filtersContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        // gap: 10,
    },
    filter: {
        flex: 1,
        height: 120,
        // padding: 8,
        // width: 130,
        // height: 40,
    },
    contentContainer: {
        backgroundColor: "#282828",
        zIndex: 5000,
    },
    itemContainer: {
        padding: 12,
        // margin: 6,
        paddingLeft: 16,
        // backgroundColor: "#eee",
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
    },
    typeIndicator: {
        width: 6,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
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
        color: "#ffffff",
        textAlign: "left",
    },
    subHeader: {
        fontSize: 12,

        // fontWeight: "700",
        // marginTop: 8,
        // height: 20,
        color: "#ffffff",
        // textAlign: "left",
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardContent: {
        flex: 1,
        zIndex: 5000,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    metaContainer: {
        flexDirection: "row",
        marginTop: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#ffffff",
    },
    cardDate: {
        fontSize: 12,
        color: "#ffffff",
        marginLeft: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: "#ffffff",
        marginTop: 8,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 16,
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 8,
        marginRight: 8,
        backgroundColor: "#eeeeee",
    },
});

export default ListBottomSheet;

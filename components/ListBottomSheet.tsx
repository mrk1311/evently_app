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
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from "react-native-popup-menu";
import AntDesign from "@expo/vector-icons/AntDesign";

interface BottomSheetProps {
    events: EventFeatureCollection;
    setCenter: (region: Region) => void;
    snapToIndex: (index: number) => void;
    openEventDetailsBottomSheet: (event: EventFeature) => void;
    pickedSortByOption: string;
    setPickedSortByOption: (sortByOption: string) => void;
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

    const flatListRef = useRef<BottomSheetFlatListMethods>(null);
    const [buttonShown, setButtonShown] = useState(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const listToTop = () => {
        flatListRef.current?.scrollToIndex({ animated: true, index: 0 });
    };

    useEffect(() => {
        if (currentIndex >= 2) {
            setButtonShown(true);
        } else {
            setButtonShown(false);
        }
    }, [currentIndex]);

    const renderEventCard = useCallback(
        ({ item }: { item: EventFeature }) => (
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
                {item.properties.photo && (
                    <Image
                        source={{ uri: item.properties.photo }}
                        style={styles.cardImagePlaceholder}
                        resizeMode="cover"
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
                            onPress={() =>
                                // TODO
                                console.log(
                                    "adding" +
                                        item.properties.name +
                                        "to local storage"
                                )
                            }
                        >
                            <AntDesign name="hearto" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.metaContainer}>
                        <Text style={styles.cardSubtitle}>
                            {item.properties.type.toUpperCase()}
                        </Text>
                        <Text style={styles.cardDate}>
                            {new Date(
                                item.properties.date
                            ).toLocaleDateString()}
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
            </TouchableOpacity>
        ),
        []
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

                <Menu>
                    <MenuTrigger
                        text={"Sort by: " + props.pickedSortByOption}
                        customStyles={triggerStyles}
                    />
                    <MenuOptions customStyles={optionsStyles}>
                        <MenuOption
                            onSelect={() =>
                                props.setPickedSortByOption("Map Center")
                            }
                            text="Map Center"
                        />
                        <MenuOption
                            onSelect={() =>
                                props.setPickedSortByOption("User Location")
                            }
                            text="User Location"
                        />
                        <MenuOption
                            onSelect={() =>
                                props.setPickedSortByOption("Date of Event")
                            }
                            text="Date of Event"
                        />
                    </MenuOptions>
                </Menu>
            </View>
            <BottomSheetFlatList
                ref={flatListRef}
                data={props.events.features as EventFeature[]}
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

const triggerStyles = {
    triggerText: {
        color: "#333",
        padding: 8,
        borderRadius: 15,
        width: 145,
    },
    triggerOuterWrapper: {
        backgroundColor: "#e0e0e0",
        flex: 1,
        borderRadius: 15,
    },
    triggerWrapper: {
        borderRadius: 15,
    },
    triggerTouchable: {
        textAlign: "center",
        underlayColor: "#8eb3ed",
        borderRadius: 15,
        activeOpacity: 70,
        style: {
            flex: 1,
        },
    },
};

const optionsStyles = {
    optionsContainer: {
        backgroundColor: "transparent",
        marginTop: 30,
        marginLeft: 70,
    },
    optionsWrapper: {
        backgroundColor: "#e0e0e0",
        borderRadius: 15,
        width: 120,
    },
    optionWrapper: {
        margin: 5,
    },
    optionTouchable: {
        underlayColor: "#8eb3ed",
        activeOpacity: 70,
    },
    optionText: {
        color: "#333",
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 8,
    },
    horizontalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "70%",
        paddingLeft: 38,
        paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
        paddingBottom: 10,
        margin: 5,
        height: 41,
        overflow: "visible",
    },
    contentContainer: {
        backgroundColor: "white",
        zIndex: 5000,
    },
    itemContainer: {
        padding: 6,
        margin: 6,
        backgroundColor: "#eee",
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
        color: "#333333",
        textAlign: "left",
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
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

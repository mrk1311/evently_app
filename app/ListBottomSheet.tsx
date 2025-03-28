import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    forwardRef,
    memo,
    useState,
} from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ViewProps,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";
import getMarkerColor from "./functions/getMarkerColor";
// import DropDownPicker from "react-native-dropdown-picker";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from "react-native-popup-menu";

interface BottomSheetProps {
    events: EventFeatureCollection;
    setCenter: (region: Region) => void;
    snapToIndex: (index: number) => void;
    openEventDetailsBottomSheet: (event: EventFeature) => void;
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

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const sortByOptions: { label: string; value: string }[] = [
        { label: "Map Center", value: "mapCenter" },
        { label: "User Location", value: "userLocation" },
        { label: "Date", value: "date" },
    ];

    // const SortButton = (
    //     <TouchableOpacity
    //         style={styles.sortButton}
    //         onPress={() => {
    //             console.log("Sort button pressed");
    //         }}
    //     >
    //         <Text>Sorted By: {sortedBy}</Text>
    //     </TouchableOpacity>
    // );

    const MyDropdownInputContainer = ({
        open,
        children,
    }: ViewProps & { open?: boolean }) => (
        <View style={{ ...(open && { zIndex: 1 }) }}>{children}</View>
    );

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
                    <Text style={styles.cardTitle}>{item.properties.name}</Text>
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
                        text={"Sort by: " + sortByOptions[1].label}
                        customStyles={triggerStyles}
                    />
                    <MenuOptions customStyles={optionsStyles}>
                        <MenuOption
                            onSelect={() => alert("Sort by map center")}
                            text="Sort by map center"
                        />
                        <MenuOption
                            onSelect={() => alert("Sort by user location")}
                            text="Sort by user location"
                        />
                        <MenuOption
                            onSelect={() => alert("Sort by Date")}
                            text="Sort by Date"
                        />
                    </MenuOptions>
                </Menu>
            </View>
            <BottomSheetFlatList
                data={props.events.features as EventFeature[]}
                keyExtractor={(item) => item.properties.id.toString()}
                renderItem={renderEventCard}
                contentContainerStyle={styles.contentContainer}
            />
        </BottomSheet>
    );
});

const triggerStyles = {
    triggerText: {
        color: "#333",
        // textAlign: "center",
        padding: 8,
        borderRadius: 15,
    },
    triggerOuterWrapper: {
        backgroundColor: "#e0e0e0",
        // padding: 8,
        flex: 1,
        // width: 140,
        borderRadius: 15,
    },
    // triggerWrapper: {
    //     // textAlign: "center",
    //     // backgroundColor: "blue",
    //     // alignItems: "center",
    //     // justifyContent: "center",
    //     // flex: 1,
    // },
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
        padding: 5,
        paddingTop: 30,
    },
    optionsWrapper: {
        backgroundColor: "#e0e0e0",
        borderRadius: 15,
    },
    optionWrapper: {
        // backgroundColor: "yellow",
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
        // borderRadius: 6,
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
        // width: "30%",
        fontSize: 20,
        fontWeight: "700",
        // marginBottom: 16,
        // marginTop: 8,
        color: "#333333",
        textAlign: "left",
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
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

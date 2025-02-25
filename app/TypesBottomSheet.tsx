import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    forwardRef,
} from "react";
import {
    View,
    Text,
    Image,
    Button,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";

interface BottomSheetProps {
    // ref: React.RefObject<BottomSheet>;
    events: EventFeatureCollection;
    onListItemClick: (region: Region) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (isOpen: boolean) => void;
    snapToIndex: (index: number) => void;
    pickedTypes: string[];
    setpickedTypes: (types: string[]) => void;
    handleCancelTypes: () => void;
    handleAcceptTypes: () => void;
}

type Ref = BottomSheet;

// events, onListItemClick, isSearchOpen, setIsSearchOpen
const FiltersBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // hooks
    // const [pickedTypes, setpickedTypes] = useState<string[]>([]);

    // variables
    const snapPoints = useMemo(() => ["85%"], []);
    const uniqueEventTypes = useMemo(
        () =>
            Array.from(
                new Set(
                    props.events.features.map((event) => event.properties?.type)
                )
            ),
        [props.events.features]
    );
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

    useEffect(() => {
        props.setpickedTypes(uniqueEventTypes);
    }, [uniqueEventTypes]);

    const handleSelectClearAll = () => {
        if (props.pickedTypes.length === uniqueEventTypes.length) {
            props.setpickedTypes([]);
        } else {
            props.setpickedTypes(uniqueEventTypes);
        }
    };

    const renderFilterCard = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.cardContainer,
                {
                    backgroundColor: props.pickedTypes.includes(item)
                        ? "lightblue"
                        : "white",
                },
            ]}
            onPress={() => {
                // props.onListItemClick(

                // );
                // props.setIsSearchOpen(false);
                // ref.current?.snapToIndex(0);
                console.log("Filter card pressed");
                if (props.pickedTypes.includes(item)) {
                    props.setpickedTypes(
                        props.pickedTypes.filter((filter) => filter !== item)
                    );
                } else {
                    props.setpickedTypes([...props.pickedTypes, item]);
                }
            }}
        >
            {/* Event Type Indicator */}
            <View
                style={[
                    styles.typeIndicator,
                    // { backgroundColor: item.properties.color },
                ]}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item}</Text>
                {/* <View style={styles.metaContainer}>
                    <Text style={styles.cardSubtitle}>
                        {item.properties.subtitle}
                    </Text>
                    <Text style={styles.cardDate}>
                        {new Date(item.properties.date).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={styles.cardDescription}>
                    {item.properties.description}
                </Text> */}
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
            // enablePanDownToClose={true}
        >
            <View style={styles.horizontalContainer}>
                <Button
                    title="Cancel"
                    // change to cancel and close
                    onPress={props.handleCancelTypes}
                />
                <Text style={styles.header}>Filters</Text>
                <Button
                    title="Accept"
                    // change to accept and close
                    onPress={props.handleAcceptTypes}
                />
            </View>

            <View style={styles.buttonsContainer}>
                <Button
                    title={
                        // alternate between "Clear All" and "Select All"
                        props.pickedTypes.length === uniqueEventTypes.length
                            ? "Clear All"
                            : "Select All"
                    }
                    onPress={handleSelectClearAll}
                />
            </View>

            <BottomSheetFlatList
                // pass unique types of events to flatlist data
                data={uniqueEventTypes}
                keyExtractor={(uniqueEventTypes) => uniqueEventTypes.toString()}
                renderItem={renderFilterCard}
            />
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        // backgroundColor: "white",
    },
    horizontalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 8,
    },

    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
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
});

export default FiltersBottomSheet;

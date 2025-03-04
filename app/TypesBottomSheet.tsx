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
    eventTypes: string[];
    onListItemClick: (region: Region) => void;
    snapToIndex: (index: number) => void;
    pickedTypes: string[];
    // setpickedTypes: (types: string[]) => void;
    // openedFilter: string | null;
    // setOpenedFilter: (filter: "Type" | "Place" | "Date" | null) => void;
    handleCancelTypes: () => void;
    handleAcceptTypes: (types: string[]) => void;
}

type Ref = BottomSheet;

// events, onListItemClick, isSearchOpen, setIsSearchOpen
const TypesBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // hooks
    const [picks, setPicks] = useState<string[]>([]);

    // variables
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

    const handleSelectClearAll = () => {
        if (picks.length === props.eventTypes.length) {
            setPicks([]);
        } else {
            setPicks(props.eventTypes);
        }
    };

    console.log("TypesBottomSheet picks", picks);

    const renderFilterCard = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[
                styles.cardContainer,
                {
                    backgroundColor: picks.includes(item)
                        ? "lightblue"
                        : "white",
                },
            ]}
            onPress={() => {
                // props.setIsSearchOpen(false);
                console.log("Filter card pressed");
                if (picks.includes(item)) {
                    setPicks(picks.filter((filter) => filter !== item));
                } else {
                    setPicks([...picks, item]);
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
                        props.handleCancelTypes();
                        setPicks(props.pickedTypes);
                    }}
                />
                <Text style={styles.header}>Choose Types</Text>
                <Button
                    title="Accept"
                    // change to accept and close
                    onPress={() => props.handleAcceptTypes(picks)}
                />
            </View>

            <View style={styles.buttonsContainer}>
                <Button
                    title={
                        // alternate between "Clear All" and "Select All"
                        picks.length === props.eventTypes.length
                            ? "Clear All"
                            : "Select All"
                    }
                    onPress={handleSelectClearAll}
                />
            </View>

            <BottomSheetFlatList
                // pass unique types of events to flatlist data
                data={props.eventTypes}
                keyExtractor={(eventTypes) => eventTypes.toString()}
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

export default TypesBottomSheet;

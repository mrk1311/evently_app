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
import getMarkerColor from "./functions/getMarkerColor";

interface BottomSheetProps {
    eventTypes: string[];
    pickedTypes: string[];
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

    const renderFilterCard = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={[styles.cardContainer]}
            onPress={() => {
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
                    {
                        backgroundColor: picks.includes(item)
                            ? getMarkerColor(item)
                            : "white",

                        borderColor: getMarkerColor(item),
                    },
                ]}
            />
            <Text style={styles.cardTitle}>{item}</Text>
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
    horizontalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 8,
    },
    buttonsContainer: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: "#eeeeee",
        justifyContent: "center",
        margin: 8,
    },
    typeIndicator: {
        width: 24,
        height: 24,
        borderRadius: 6,
        marginRight: 12,
        borderWidth: 2,
    },
    header: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333333",
        textAlign: "center",
        padding: 8,
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    cardTitle: {
        color: "#333333",
    },
});

export default TypesBottomSheet;

import React, { useState, useMemo, forwardRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";

interface BottomSheetProps {
    // snapToIndex: (index: number) => void;
    handleCancelDates: () => void;
    handleAcceptDates: () => void;
}

type Ref = BottomSheet;

const DateBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // hooks
    const [picks, setPicks] = useState<string[]>([]);

    // variables
    const snapPoints = useMemo(() => ["85%"], []);

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            {...props}
        />
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
            <View style={styles.container}>
                <View style={styles.header}>
                    <Button
                        // style={styles.clearAllButton}
                        title="Cancel"
                        onPress={props.handleCancelDates}
                    />
                    <Text style={styles.headerText}>Select Dates</Text>
                    <Button
                        title="Accept"
                        // style={styles.doneButton}
                        onPress={() => props.handleAcceptDates}
                    />
                </View>
                <BottomSheetFlatList
                    data={["Today", "This Week", "This Month"]}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.cardContainer}
                            onPress={() => {
                                if (picks.includes(item)) {
                                    setPicks(
                                        picks.filter((pick) => pick !== item)
                                    );
                                } else {
                                    setPicks([...picks, item]);
                                }
                            }}
                        >
                            <Text style={styles.cardText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </BottomSheet>
    );
});

export default DateBottomSheet;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
    },
    clearAllText: {
        color: "#007AFF",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    doneButton: {
        padding: 8,
    },
    doneText: {
        color: "#007AFF",
    },
    cardContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eeeeee",
    },
    cardText: {
        // fontSize: 16,
    },
});

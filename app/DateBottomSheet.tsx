// create a bottomsheet with a list of dates of events to show for example "a week from now" "a month from now"

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";

interface BottomSheetProps {
    // snapToIndex: (index: number) => void;
    // handleCancelDates: () => void;
    // handleAcceptDates: (dates: string[]) => void;
}

type Ref = BottomSheet;

const DateBottomSheet = React.forwardRef<Ref, BottomSheetProps>(
    (props, ref) => {
        // hooks
        const [picks, setPicks] = useState<string[]>([]);

        // variables
        const snapPoints = ["85%"];

        const renderBackdrop = (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        );

        const handleSelectClearAll = () => {
            if (picks.length === 3) {
                setPicks([]);
            } else {
                setPicks(["Today", "This Week", "This Month"]);
            }
        };

        return (
            <BottomSheet
                ref={ref}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.clearAllButton}
                            onPress={handleSelectClearAll}
                        >
                            <Text style={styles.clearAllText}>Clear All</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Select Dates</Text>
                        <TouchableOpacity
                            style={styles.doneButton}
                            // onPress={() => props.handleAcceptDates(picks)}
                        >
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
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
                                            picks.filter(
                                                (pick) => pick !== item
                                            )
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
    }
);

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
        borderBottomColor: "#E2E2E2",
    },
    clearAllButton: {
        padding: 8,
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
        borderBottomColor: "#E2E2E2",
    },
    cardText: {
        fontSize: 16,
    },
});

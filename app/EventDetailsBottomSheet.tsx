// create a bottom sheet for a event details like website or description that shows up when a user clicks on a marker

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
    event: EventFeature | null;
    handleCancelDetails: () => void;
}

type Ref = BottomSheet;

const EventDetailsBottomSheet = forwardRef<Ref, BottomSheetProps>(
    (props, ref) => {
        // hooks

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
                            title="Cancel"
                            onPress={props.handleCancelDetails}
                        />
                        <Text style={styles.headerText}>
                            {props.event?.properties.name}
                        </Text>
                        <Button title="Website" onPress={() => {}} />
                    </View>
                    <Text style={styles.description}>
                        {props.event?.properties.description}
                    </Text>
                </View>
            </BottomSheet>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
    },
    description: {
        fontSize: 16,
    },
});

export default EventDetailsBottomSheet;

// create a bottom sheet for a event details like website or description that shows up when a user clicks on a marker

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    forwardRef,
    memo,
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
        const snapPoints = useMemo(() => ["30%", "85%"], []);

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
                // enableContentPanningGesture={true}
                enablePanDownToClose={true}
            >
                <View style={styles.container}>
                    {/* <View style={styles.header}> */}
                    {/* <Button
                            title="Cancel"
                            onPress={props.handleCancelDetails}
                        /> */}
                    <Text style={styles.headerText}>
                        {props.event?.properties.name}
                    </Text>
                    {/* <Button title="Website" onPress={() => {}} /> */}
                    {/* </View> */}
                    <Text style={styles.type}>
                        {props.event?.properties.type}
                    </Text>
                    <Text style={styles.description}>
                        {props.event?.properties.description}
                    </Text>
                    <Text style={styles.description}>
                        {"date: " + props.event?.properties.date}
                    </Text>
                    <Text style={styles.description}>
                        {props.event?.properties.link}
                    </Text>
                    <Image
                        source={{ uri: props.event?.properties.photo }}
                        style={{ width: 200, height: 200 }}
                        resizeMode="cover"
                    />
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
        marginBottom: 8,
    },
    headerText: {
        fontSize: 20,
        marginBottom: 8,
        fontWeight: "bold",
        textAlign: "center",
    },
    type: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        marginBottom: 8,
    },
});

export default memo(EventDetailsBottomSheet);

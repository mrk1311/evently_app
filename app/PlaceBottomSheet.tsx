//analogical to typesbottomsheet, creat a new bottom sheet for places filter

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { Region } from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetFlatList from "@gorhom/bottom-sheet";

interface BottomSheetProps {
    // places: PlaceFeatureCollection;
    // onListItemClick: (region: Region) => void;
    // isSearchOpen: boolean;
    // setIsSearchOpen: (isOpen: boolean) => void;
    // snapToIndex: (index: number) => void;
    // pickedTypes: string[];
    // handleCancelTypes: () => void;
    // handleAcceptTypes: (types: string[]) => void;
}

type Ref = BottomSheet;

const PlaceBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
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
            backdropComponent={renderBackdrop}
            enableContentPanningGesture={true}
            enablePanDownToClose={false}
        >
            <View style={styles.cardContainer}>
                <Text>Places</Text>
            </View>
            <Text>Places Bottom Sheet</Text>

            {/* <BottomSheetFlatList
                data={["warsaw", "london", "paris", "berlin", "rome", "madrid", "lisbon", "budapest", "prague", "vienna", "amsterdam", "brussels", "copenhagen", "stockholm", "oslo", "helsinki", "moscow", "athens", "ankara", "kiev", "minsk", "bucharest", "sofia", "belgrade", "zagreb", "sarajevo", "skopje", "tirana", "podgorica", "pristina", "ljubljana", "nicosia", "valletta", "reykjavik", "luxembourg", "bern", "andorra la vella", "vaduz", "monaco", "san marino", "vatican city"]}
                keyExtractor={(item: string) => item}
                renderItem={({ item }) => (
                    <PlaceTypeItem
                        type={item}
                        isSelected={picks.includes(item)}
                        onSelect={(type) => {
                            if (picks.includes(type)) {
                                setPicks(picks.filter((pick) => pick !== type));
                            } else {
                                setPicks([...picks, type]);
                            }
                        }}
                    />
                )}
                // ListHeaderComponent={
                // }
                // ListFooterComponent={
                // }
            /> */}
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    cardContainer: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "black",
    },
});

export default PlaceBottomSheet;

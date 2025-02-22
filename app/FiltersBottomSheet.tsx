import React, { forwardRef, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";

interface Props {
    type: string;
    // onSearch: (query: string) => void;
    // onClose: () => void;
}

type Ref = BottomSheet;

const FiltersBottomSheet = forwardRef<Ref, Props>((props, ref) => {
    const snapPoints = useMemo(() => ["25%", "50%"], []);
    return (
        <BottomSheet
            ref={ref}
            // index={1}
            snapPoints={snapPoints}
            // enablePanDownToClose={true}
        >
            <View style={styles.container}>
                <Text>Filters</Text>
            </View>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
    },
});

export default FiltersBottomSheet;

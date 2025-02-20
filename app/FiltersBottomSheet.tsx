import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import type { Region } from "react-native-maps";

interface BottomSheetProps {
    type: string;
    onSearch: (query: string) => void;
    onClose: () => void;
}

const FiltersBottomSheet: React.FC<BottomSheetProps> = ({}) => {
    return (
        <View>
            <Text>Filter</Text>
        </View>
    );
};

export default FiltersBottomSheet;

import ClusteredMap from "./ClusteredMap";
import eventData from "../assets/markers.json";
import type { EventFeatureCollection } from "./ClusteredMap";
import ListBottomSheet from "./ListBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Keyboard, ScrollView } from "react-native";
import React, { useState, useRef } from "react";
import type { Region } from "react-native-maps";
import SearchBar from "./SearchBar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import FiltersBottomSheet from "./FiltersBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";

export default function App() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const filterBottomSheetRef = useRef<BottomSheet>(null);

    const [center, setCenter] = useState<Region>({
        // Center on Europe
        latitude: 51.1657,
        longitude: 10.4515,
        latitudeDelta: 30,
        longitudeDelta: 30,
    });

    const [filteredEvents, setFilteredEvents] =
        useState<EventFeatureCollection>(eventData as EventFeatureCollection);

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const onListItemClick = (region: Region): void => {
        setCenter(region);
    };

    const openSearch = () => {
        setIsSearchOpen(true);
        console.log("Opening search");
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        console.log("Closing search");
    };

    const openFilterBottomSheet = () => {
        filterBottomSheetRef.current?.snapToIndex(2);
        console.log("Opening filter modal");
    };

    const openListBottomSheet = () => {
        bottomSheetRef.current?.snapToIndex(2);
        console.log("Opening filter bottom sheet");
    };

    // const closeListBottomSheet = () => {
    //     bottomSheetRef.current?.close();
    //     console.log("Closing list bottom sheet");
    // };

    return (
        <>
            <SearchBar
                onClose={closeSearch}
                onSearch={(query) => console.log("Search query", query)}
                onOpen={openSearch}
                openFilterBottomSheet={openFilterBottomSheet}
                openListBottomSheet={openListBottomSheet}
                filteredEvents={filteredEvents}
                setFilteredEvents={setFilteredEvents}
                events={eventData as EventFeatureCollection}
            />
            <ScrollView horizontal={true} style={styles.container}>
                <ClusteredMap
                    data={eventData as EventFeatureCollection}
                    center={center}
                />
                <FiltersBottomSheet type="type" ref={bottomSheetRef} />
                <ListBottomSheet
                    ref={bottomSheetRef}
                    events={filteredEvents as EventFeatureCollection}
                    onListItemClick={onListItemClick}
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                    snapToIndex={(index) =>
                        bottomSheetRef.current?.snapToIndex(index)
                    }
                    // openListBottomSheet={openListBottomSheet}
                    // closeListBottomSheet={closeListBottomSheet}
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

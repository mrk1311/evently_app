import ClusteredMap from "./ClusteredMap";
import eventData from "../assets/markers.json";
import type { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import ListBottomSheet from "./ListBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Keyboard, ScrollView } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import type { Region } from "react-native-maps";
import SearchBar from "./SearchBar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TypesBottomSheet from "./TypesBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";

export default function App() {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const filterBottomSheetRef = useRef<BottomSheet>(null);
    const [filteredEvents, setFilteredEvents] =
        useState<EventFeatureCollection>(eventData as EventFeatureCollection);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pickedTypes, setpickedTypes] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [center, setCenter] = useState<Region>({
        // Center on Europe
        latitude: 51.1657,
        longitude: 10.4515,
        latitudeDelta: 30,
        longitudeDelta: 30,
    });

    const filterByType = (
        array: EventFeatureCollection
    ): EventFeatureCollection => {
        console.log("Filtering by type", pickedTypes);
        if (pickedTypes.length === 0) {
            return array;
        }
        const filteredFeatures = array.features.filter((event) =>
            pickedTypes.includes(event.properties?.type)
        );
        console.log(filteredFeatures);
        return {
            type: "FeatureCollection",
            features: filteredFeatures as EventFeature[], // Ensure the filtered features are cast to EventFeature[]
        };
    };

    const filterBySearch = (
        array: EventFeatureCollection
    ): EventFeatureCollection => {
        console.log("Filtering by search", searchQuery);
        const filteredFeatures = array.features.filter((event) =>
            event.properties?.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
        console.log(filteredFeatures);
        return {
            type: "FeatureCollection",
            features: filteredFeatures as EventFeature[], // Ensure the filtered features are cast to EventFeature[]
        };
    };

    useEffect(() => {
        let result = eventData as EventFeatureCollection;
        result = filterByType(result);
        result = filterBySearch(result);
        console.log("Filtered events", result.features.length);
        setFilteredEvents(result);
    }, [pickedTypes, searchQuery]);

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
        filterBottomSheetRef.current?.snapToIndex(0);

        console.log("Opening filter modal");
    };

    // TODO accept and cancel types only on button press
    const handleAcceptTypes = () => {
        console.log("Accepting types");
        filterBottomSheetRef.current?.close();
    };

    const handleCancelTypes = () => {
        console.log("Cancelling types");
        filterBottomSheetRef.current?.close();
    };

    const openListBottomSheet = () => {
        bottomSheetRef.current?.snapToIndex(1);
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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                events={eventData as EventFeatureCollection}
            />

            {/* TODO find another way to dismiss the keyboard than scrollview */}

            <ScrollView horizontal={true} style={styles.container}>
                <ClusteredMap
                    data={filteredEvents as EventFeatureCollection}
                    center={center}
                />

                <ListBottomSheet
                    ref={bottomSheetRef}
                    events={filteredEvents as EventFeatureCollection}
                    onListItemClick={onListItemClick}
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                    snapToIndex={(index) =>
                        bottomSheetRef.current?.snapToIndex(index)
                    }
                />

                <TypesBottomSheet
                    ref={filterBottomSheetRef}
                    events={eventData as EventFeatureCollection}
                    onListItemClick={onListItemClick}
                    isSearchOpen={isSearchOpen}
                    setIsSearchOpen={setIsSearchOpen}
                    snapToIndex={(index) =>
                        bottomSheetRef.current?.snapToIndex(index)
                    }
                    pickedTypes={pickedTypes}
                    setpickedTypes={setpickedTypes}
                    handleAcceptTypes={handleAcceptTypes}
                    handleCancelTypes={handleCancelTypes}
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

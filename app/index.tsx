import ClusteredMap from "./ClusteredMap";
import eventData from "../assets/markers.json";
import type { EventFeatureCollection } from "./ClusteredMap";
import BottomSheetList from "./BottomSheetList";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Keyboard, ScrollView } from "react-native";
import React, { useState } from "react";
import type { Region } from "react-native-maps";
import SearchBar from "./SearchBar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function App() {
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

    return (
        <>
            <GestureHandlerRootView style={styles.container}>
                <BottomSheetModalProvider>
                    <SearchBar
                        onClose={closeSearch}
                        onSearch={(query) => console.log("Search query", query)}
                        onOpen={openSearch}
                        filteredEvents={filteredEvents}
                        setFilteredEvents={setFilteredEvents}
                        events={eventData as EventFeatureCollection}
                    />
                    <ScrollView horizontal={true} style={styles.container}>
                        <ClusteredMap
                            data={eventData as EventFeatureCollection}
                            center={center}
                        />
                        <BottomSheetList
                            events={filteredEvents as EventFeatureCollection}
                            onListItemClick={onListItemClick}
                            isSearchOpen={isSearchOpen}
                            setIsSearchOpen={setIsSearchOpen}
                        />
                    </ScrollView>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

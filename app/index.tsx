import ClusteredMap from "./ClusteredMap";
import eventData from "../assets/markers.json";
import type { EventFeature, EventFeatureCollection } from "./ClusteredMap";
import ListBottomSheet from "./ListBottomSheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, Keyboard, ScrollView } from "react-native";
import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Region } from "react-native-maps";
import SearchBar from "./SearchBar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TypesBottomSheet from "./TypesBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import PlaceBottomSheet from "./PlaceBottomSheet";

import * as Location from "expo-location";

export default function App() {
    const listBottomSheetRef = useRef<BottomSheet>(null);
    const typesBottomSheetRef = useRef<BottomSheet>(null);
    const placeBottomSheetRef = useRef<BottomSheet>(null);
    const [filteredEvents, setFilteredEvents] =
        useState<EventFeatureCollection>(eventData as EventFeatureCollection);
    const [openedFilter, setOpenedFilter] = useState<
        "Type" | "Place" | "Date" | null
    >(null);
    const [activeFilters, setActiveFilters] = useState<"Type" | "Date" | null>(
        null
    );
    const [pickedTypes, setpickedTypes] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [places, setPlaces] = useState<string[]>([
        "Last Search 1",
        "Last Search 2",
        "Last Search 3",
        "Last Search 4",
    ]);

    // user location
    const [location, setLocation] = useState<Location.LocationObject | null>(
        null
    );

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }

        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (location) {
            setCenter({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });
        }
    }, [location]);

    const [center, setCenter] = useState<Region>({
        // Center on Europe
        latitude: 51.1657,
        longitude: 10.4515,
        latitudeDelta: 30,
        longitudeDelta: 30,
    });

    const uniqueEventTypes = useMemo(
        () =>
            Array.from(
                new Set(
                    eventData.features.map((event) => event.properties?.type)
                )
            ),
        [eventData.features]
    );

    const [filteredEventTypes, setFilteredEventTypes] =
        useState<string[]>(uniqueEventTypes);

    const filterByType = (
        array: EventFeatureCollection
    ): EventFeatureCollection => {
        if (pickedTypes.length === 0) {
            return array;
        }
        const filteredFeatures = array.features.filter((event) =>
            pickedTypes.includes(event.properties?.type)
        );
        return {
            type: "FeatureCollection",
            features: filteredFeatures as EventFeature[], // Ensure the filtered features are cast to EventFeature[]
        };
    };

    const filterBySearch = (
        array: EventFeatureCollection
    ): EventFeatureCollection => {
        const filteredFeatures = array.features.filter((event) =>
            event.properties?.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
        return {
            type: "FeatureCollection",
            features: filteredFeatures as EventFeature[], // Ensure the filtered features are cast to EventFeature[]
        };
    };

    const handlePlaceSearch = async () => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
            );
            const data = await response.json();
            // filter by addresstype: "city"

            const placesNames = data;
            // (place: any) => place.addresstype === "city"
            // );
            setPlaces(placesNames.map((place: any) => place.display_name));
            console.log("Location search results:", data);
        } catch (error) {
            console.error("Location search failed:", error);
        }
    };

    // filter events by all the filters, also handle the search query for events, types and places
    useEffect(() => {
        if (openedFilter === "Type") {
            setFilteredEventTypes(
                uniqueEventTypes.filter((type) =>
                    searchQuery === ""
                        ? true
                        : type.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else if (openedFilter === "Place") {
            // search for place only after user stops typing
            handlePlaceSearch();
        } else if (openedFilter === null) {
            let result = eventData as EventFeatureCollection;
            result = filterByType(result);
            result = filterBySearch(result);
            setFilteredEvents(result);
        }
    }, [pickedTypes, searchQuery]);

    const onListItemClick = (region: Region): void => {
        setCenter(region);
    };

    const openTypesBottomSheet = () => {
        setOpenedFilter("Type");
        typesBottomSheetRef.current?.snapToIndex(0);
        placeBottomSheetRef.current?.close();
    };
    const openPlaceBottomSheet = () => {
        setOpenedFilter("Place");
        placeBottomSheetRef.current?.snapToIndex(0);
        typesBottomSheetRef.current?.close();
    };

    const handleAcceptTypes = (types: string[]) => {
        // set opened filter to change the color of the filter button and change the behaviour of the search bar
        handleCloseFilter();

        // set picked types to filter the events
        setpickedTypes(types);

        // set active filters to change their color in the search bar
        if (types.length === 0 || types.length === uniqueEventTypes.length) {
            setActiveFilters(null);
        } else setActiveFilters("Type");

        typesBottomSheetRef.current?.close();
        setFilteredEventTypes(uniqueEventTypes);
    };

    const handleCancelTypes = () => {
        setFilteredEventTypes(uniqueEventTypes);
        handleCloseFilter();
        typesBottomSheetRef.current?.close();
    };

    const handleAcceptPlace = (place: string[]) => {
        placeBottomSheetRef.current?.close();
        handleCloseFilter();
    };

    const handleCancelPlace = () => {
        handleCloseFilter();
        placeBottomSheetRef.current?.close();
    };

    const openListBottomSheet = () => {
        if (openedFilter === null) {
            listBottomSheetRef.current?.snapToIndex(1);
        }
    };

    const handleCloseFilter = () => {
        setOpenedFilter(null);
        setSearchQuery("");
    };

    // const closeListBottomSheet = () => {
    //     bottomSheetRef.current?.close();
    //     console.log("Closing list bottom sheet");
    // };

    return (
        <>
            {/* <SearchBar
                onSearch={(query) => console.log("Search query", query)}
                openTypesBottomSheet={openTypesBottomSheet}
                openPlaceBottomSheet={openPlaceBottomSheet}
                openListBottomSheet={openListBottomSheet}
                openedFilter={openedFilter}
                activeFilters={activeFilters}
                // filteredEvents={filteredEvents}
                // setFilteredEvents={setFilteredEvents}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                events={eventData as EventFeatureCollection}
            /> */}

            {/* TODO find another way to dismiss the keyboard than scrollview */}
            <ScrollView horizontal={true} style={styles.container}>
                <ClusteredMap
                    data={filteredEvents as EventFeatureCollection}
                    center={center}
                    location={location}
                />

                {/* <ListBottomSheet
                    ref={listBottomSheetRef}
                    events={filteredEvents as EventFeatureCollection}
                    onListItemClick={onListItemClick}
                    snapToIndex={(index) =>
                        listBottomSheetRef.current?.snapToIndex(index)
                    }
                />

                <TypesBottomSheet
                    ref={typesBottomSheetRef}
                    eventTypes={filteredEventTypes}
                    onListItemClick={onListItemClick}
                    // openedFilter={openedFilter}
                    // setOpenedFilter={setOpenedFilter}
                    snapToIndex={(index) =>
                        listBottomSheetRef.current?.snapToIndex(index)
                    }
                    pickedTypes={pickedTypes}
                    // setpickedTypes={setpickedTypes}
                    handleAcceptTypes={handleAcceptTypes}
                    handleCancelTypes={handleCancelTypes}
                />

                <PlaceBottomSheet
                    ref={placeBottomSheetRef}
                    handleAcceptPlace={handleAcceptPlace}
                    handleCancelPlace={handleCancelPlace}
                    places={places}
                    // snapToIndex={(index) =>
                    //     placeBottomSheetRef.current?.snapToIndex(index)
                    // }
                /> */}
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

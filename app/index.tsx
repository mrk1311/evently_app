import ClusteredMap from "../components/ClusteredMap";
import mockData from "../assets/markers.json";
import type {
    EventFeature,
    EventFeatureCollection,
} from "../components/ClusteredMap";
import ListBottomSheet from "../components/ListBottomSheet";
import { StyleSheet } from "react-native";
import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Region } from "react-native-maps";
import SearchBar from "../components/SearchBar";
import TypesBottomSheet from "../components/TypesBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import PlaceBottomSheet from "../components/PlaceBottomSheet";
import DateBottomSheet from "../components/DateBottomSheet";
import EventDetailsBottomSheet from "../components/EventDetailsBottomSheet";
import ShowUserLocationButton from "../components/ShowUserLocationButton";
import * as Location from "expo-location";
import { Feature, FeatureCollection, Point } from "geojson";
import throttle from "lodash/throttle";
import { isWithinInterval, parseISO, Interval } from "date-fns";
import { fetchEvents } from "@/utils/fetchEvents";

export default function App() {
    const [eventData, setEvents] = useState<EventFeatureCollection>(
        mockData as EventFeatureCollection
    );

    useEffect(() => {
        let isMounted = true; // Flag to track component mount state

        const loadEvents = async () => {
            try {
                const data = await fetchEvents(); // Add await here
                console.log("Received data:", JSON.stringify(data, null, 2));
                if (isMounted) setEvents(data);
            } catch (error) {
                console.error("Error loading events:", error);
                if (isMounted) setEvents(mockData as EventFeatureCollection);
            }
        };

        loadEvents();

        return () => {
            isMounted = false; // Cleanup if component unmounts
        };
    }, []); // Empty dependency array = runs once on mount
    const listBottomSheetRef = useRef<BottomSheet>(null);
    const typesBottomSheetRef = useRef<BottomSheet>(null);
    const placeBottomSheetRef = useRef<BottomSheet>(null);
    const dateBottomSheetRef = useRef<BottomSheet>(null);
    const EventDetailsBottomSheetRef = useRef<BottomSheet>(null);
    const [filteredEvents, setFilteredEvents] =
        useState<EventFeatureCollection>(eventData as EventFeatureCollection);
    const uniqueEventTypes = useMemo(
        () =>
            Array.from(
                new Set(
                    eventData?.features.map((event) => event.properties?.type)
                )
            ),
        [eventData?.features]
    );
    const [filteredEventTypes, setFilteredEventTypes] =
        useState<string[]>(uniqueEventTypes);
    const [openedFilter, setOpenedFilter] = useState<
        "Type" | "Place" | "Date" | null
    >(null);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [pickedTypes, setpickedTypes] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [places, setPlaces] = useState<FeatureCollection | null>(null);
    const [openEvent, setOpenEvent] = useState<EventFeature | null>(null);
    const [controlledCenter, setControlledCenter] = useState<Region>({
        latitude: 51.1657,
        longitude: 10.4515,
        latitudeDelta: 30,
        longitudeDelta: 30,
    });
    const [centerOnUser, setCenterOnUser] = useState(true);
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(
        new Date(new Date().setDate(new Date().getDate() + 365))
    );
    const [dateInterval, setDateInterval] = useState<Interval | null>(null);
    const [mapViewCenter, setMapViewCenter] =
        useState<Region>(controlledCenter);

    const [pickedSortByOption, setPickedSortByOption] =
        useState<string>("Map Center");

    // user location
    const [location, setLocation] = useState<Location.LocationObject>({
        coords: {
            accuracy: 0,
            altitude: 0,
            altitudeAccuracy: 0,
            heading: 0,
            latitude: 51.1657,
            longitude: 10.4515,
            speed: 0,
        },
        timestamp: 0,
    });

    // get user location
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
    // center map on user location
    useEffect(() => {
        if (location) {
            setControlledCenter({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });
            setCenterOnUser(true);
        }
    }, [location]);

    // hide the list bottom sheet when zooming to a place
    useEffect(() => {
        listBottomSheetRef.current?.snapToIndex(0);
    }, [controlledCenter]);

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

    const filterByDate = (
        array: EventFeatureCollection
    ): EventFeatureCollection => {
        if (!startDate || !endDate) return array;
        const filteredFeatures = array.features.filter((event) => {
            const eventDate = parseISO(event.properties?.date);
            return isWithinInterval(eventDate, {
                start: startDate, // Convert startDate to ISO string
                end: endDate, // Convert endDate to ISO string
            });
        });
        return {
            type: "FeatureCollection",
            features: filteredFeatures as EventFeature[], // Ensure the filtered features are cast to EventFeature[]
        };
    };

    // Haversine formula to calculate distance between two points
    const haversine = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // throttle the region change event to prevent too many updates
    const handleRegionChangeComplete = useMemo(
        () =>
            throttle((region: Region) => {
                setMapViewCenter(region);
            }, 500),
        []
    );

    // sort events by distance from the center of the map
    const sortedEvents = useMemo(() => {
        var features = null;
        if (pickedSortByOption === "Date") {
            features = filteredEvents.features
                .map((feature) => {
                    return feature;
                })
                .sort((a, b) => {
                    const dateA = new Date(a.properties?.date).valueOf();
                    const dateB = new Date(b.properties?.date).valueOf();
                    if (dateA > dateB) {
                        return 1;
                    }
                    return -1;
                });
        } else {
            features = filteredEvents.features
                .map((feature) => {
                    // Ensure we're working with Point geometry
                    if (feature.geometry.type === "Point") {
                        const [lon, lat] = feature.geometry.coordinates;

                        if (pickedSortByOption === "Map Center") {
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    distance: haversine(
                                        lat,
                                        lon,
                                        mapViewCenter.latitude,
                                        mapViewCenter.longitude
                                    ),
                                },
                            };
                        } else if (pickedSortByOption === "User Location") {
                            return {
                                ...feature,
                                properties: {
                                    ...feature.properties,
                                    distance: haversine(
                                        lat,
                                        lon,
                                        location.coords.latitude,
                                        location.coords.longitude
                                    ),
                                },
                            };
                        }
                    }
                    return feature;
                })
                .sort(
                    (a, b) =>
                        (a.properties?.distance || 0) -
                        (b.properties?.distance || 0)
                );
        }

        return {
            type: "FeatureCollection",
            features: features,
        } as EventFeatureCollection;
    }, [filteredEvents, mapViewCenter, pickedSortByOption, location]);

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
                `https://nominatim.openstreetmap.org/search?format=geojson&viewbox=${
                    location.coords.longitude - 0.1
                },${location.coords.latitude - 0.1},${
                    location.coords.longitude + 0.1
                },${
                    location.coords.latitude + 0.1
                }&addressdetails=0&namedetails=0&extratags=0&featureType=city&q=${searchQuery}`
            );
            const data = await response.json();

            setPlaces(data);
        } catch (error) {
            console.error("Place search failed:", error);
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
            result = filterByDate(result);
            setFilteredEvents(result);
        }
    }, [pickedTypes, searchQuery, dateInterval]);

    const openTypesBottomSheet = () => {
        setOpenedFilter("Type");
        typesBottomSheetRef.current?.snapToIndex(0);
        placeBottomSheetRef.current?.close();
        dateBottomSheetRef.current?.close();
        EventDetailsBottomSheetRef.current?.close();
    };
    const openPlaceBottomSheet = () => {
        setOpenedFilter("Place");
        placeBottomSheetRef.current?.snapToIndex(0);
        typesBottomSheetRef.current?.close();
        dateBottomSheetRef.current?.close();
        EventDetailsBottomSheetRef.current?.close();
    };
    const openDateBottomSheet = () => {
        setOpenedFilter("Date");
        dateBottomSheetRef.current?.snapToIndex(0);
        typesBottomSheetRef.current?.close();
        placeBottomSheetRef.current?.close();
        EventDetailsBottomSheetRef.current?.close();
    };

    const handleAcceptTypes = (types: string[]) => {
        // set opened filter to change the color of the filter button and change the behaviour of the search bar
        handleCloseFilter();

        // set picked types to filter the events
        setpickedTypes(types);

        // set active filters to change their color in the search bar
        if (types.length === 0 || types.length === uniqueEventTypes.length) {
            setActiveFilters(
                activeFilters.filter((filter) => filter !== "Type")
            );
        } else setActiveFilters([...activeFilters, "Type"]);

        typesBottomSheetRef.current?.close();
        setFilteredEventTypes(uniqueEventTypes);
    };
    const handleCancelTypes = () => {
        setFilteredEventTypes(uniqueEventTypes);
        handleCloseFilter();
        typesBottomSheetRef.current?.close();
    };

    const handleAcceptPlace = (place: Feature) => {
        // type guard to ensure the place is a point
        if (place.geometry.type === "Point") {
            const coordinates = (place.geometry as Point).coordinates;
            placeBottomSheetRef.current?.close();
            // handleCloseFilter();
            setControlledCenter({
                latitude: coordinates[1],
                longitude: coordinates[0],
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            });
            handleCloseFilter();
        } else {
            console.error("Place is not a point");
        }
    };
    const handleCancelPlace = () => {
        // setPlaces(null);
        handleCloseFilter();
        placeBottomSheetRef.current?.close();
    };

    const handleAcceptDates = () => {
        if (startDate && endDate) {
            setDateInterval({
                start: parseISO(startDate.toISOString()), // Convert startDate to ISO string
                end: parseISO(endDate.toISOString()), // Convert endDate to ISO string
            });
            // add date to active filters array
            setActiveFilters([...activeFilters, "Date"]);
        } else {
            setDateInterval(null);
            setActiveFilters([]);
        }
        dateBottomSheetRef.current?.close();
        handleCloseFilter();
    };

    const handleCancelDates = () => {
        dateBottomSheetRef.current?.close();
        handleCloseFilter();
    };

    const handleCancelDetails = () => {
        EventDetailsBottomSheetRef.current?.close();
        setOpenEvent(null);
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

    return (
        <>
            <ClusteredMap
                data={filteredEvents as EventFeatureCollection}
                center={controlledCenter}
                location={location}
                openEventDetailsBottomSheet={(event) => {
                    setOpenEvent(event);
                    EventDetailsBottomSheetRef.current?.snapToIndex(0);
                }}
                onRegionChangeComplete={handleRegionChangeComplete}
                setCenterOnUser={setCenterOnUser}
            />
            <ShowUserLocationButton
                active={centerOnUser}
                setLocation={setLocation}
            />
            <ListBottomSheet
                ref={listBottomSheetRef}
                events={sortedEvents as EventFeatureCollection}
                setCenter={setControlledCenter}
                snapToIndex={(index) =>
                    listBottomSheetRef.current?.snapToIndex(index)
                }
                openEventDetailsBottomSheet={(event) => {
                    setOpenEvent(event);
                    EventDetailsBottomSheetRef.current?.snapToIndex(0);
                }}
                pickedSortByOption={pickedSortByOption}
                setPickedSortByOption={setPickedSortByOption}
            />

            <TypesBottomSheet
                ref={typesBottomSheetRef}
                eventTypes={filteredEventTypes}
                pickedTypes={pickedTypes}
                handleAcceptTypes={handleAcceptTypes}
                handleCancelTypes={handleCancelTypes}
            />

            <PlaceBottomSheet
                ref={placeBottomSheetRef}
                handleAcceptPlace={handleAcceptPlace}
                handleCancelPlace={handleCancelPlace}
                places={places}
                setPlaces={setPlaces}
                setCenter={setControlledCenter}
            />

            <DateBottomSheet
                ref={dateBottomSheetRef}
                handleAcceptDates={handleAcceptDates}
                handleCancelDates={handleCancelDates}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />

            <EventDetailsBottomSheet
                ref={EventDetailsBottomSheetRef}
                event={openEvent}
                handleCancelDetails={handleCancelDetails}
            />
            <SearchBar
                openTypesBottomSheet={openTypesBottomSheet}
                openPlaceBottomSheet={openPlaceBottomSheet}
                openListBottomSheet={openListBottomSheet}
                openDateBottomSheet={openDateBottomSheet}
                openedFilter={openedFilter}
                activeFilters={activeFilters}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                events={eventData as EventFeatureCollection}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

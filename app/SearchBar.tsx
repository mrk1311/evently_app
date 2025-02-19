import React, {
    useState,
    useRef,
    useMemo,
    useEffect,
    useCallback,
} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ScrollView,
    Keyboard,
} from "react-native";
// import { parseISO, isValid, isWithinInterval } from "date-fns";
import type { EventFeature, EventFeatureCollection } from "./ClusteredMap";

type SearchBarProps = {
    onSearch: (lat: number, lon: number) => void;
    onOpen: () => void;
    onClose: () => void;
    filteredEvents: EventFeatureCollection;
    setFilteredEvents: (events: EventFeatureCollection) => void;
    events: EventFeatureCollection;
};

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    onOpen,
    onClose,
    filteredEvents,
    setFilteredEvents,
    events,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [pickedFilter, setPickedFilter] = useState<
        "Type" | "Place" | "Date" | null
    >(null);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const inputRef = useRef<TextInput>(null);

    const uniqueTypes = useMemo(
        () => [
            ...new Set(events.features.map((event) => event.properties?.type)),
        ],
        [events]
    );

    const handlePlaceSearch = useCallback(async () => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Location search failed:", error);
        }
    }, [searchQuery]);

    const handleTypeSearch = useCallback(() => {
        // const filtered = events.features.filter((event) =>
        //     selectedTypes.includes(event.properties.type)
        // );
        // setFilteredEvents(filtered);
        handleCloseSearch();
    }, [selectedTypes, events]);

    useEffect(() => {
        console.log(searchQuery);
        const filtered: EventFeatureCollection = {
            type: "FeatureCollection",
            features: events.features.filter((event: EventFeature) =>
                event.properties?.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            ),
        };
        setFilteredEvents(filtered);
        console.log(filtered);
    }, [searchQuery, events]);

    const handleDateSearch = useCallback(() => {
        if (!startDate || !endDate) return;

        // const filtered = events.features.filter((event) => {
        //     const eventDate = parseISO(event.properties.date);
        //     return isWithinInterval(eventDate, {
        //         start: parseISO(startDate),
        //         end: parseISO(endDate),
        //     });
        // });

        // setFilteredEvents(filtered);
        handleCloseSearch();
    }, [startDate, endDate, events]);

    const handleSearch = (input: string) => {
        if (pickedFilter === "Type") {
            handleTypeSearch();
        } else if (pickedFilter === "Place") {
            handlePlaceSearch();
        } else if (pickedFilter === "Date") {
            handleDateSearch();
        }
    };
    const handleCloseSearch = useCallback(() => {
        setIsSearchOpen(false);
        setPickedFilter(null);
        setSearchQuery("");
        Keyboard.dismiss();
        onClose();
    }, [onClose]);

    const FilterButton: React.FC<{ type: "Type" | "Place" | "Date" }> = ({
        type,
    }) => {
        const title =
            type === "Type"
                ? "All Events"
                : type === "Place"
                ? "Everywhere"
                : "Any time";

        return (
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    pickedFilter === type && styles.selectedFilter,
                ]}
                onPress={() => {
                    setPickedFilter(type);
                    setIsSearchOpen(true);
                    onOpen();
                }}
            >
                <Text style={styles.filterButtonText}>{title}</Text>
            </TouchableOpacity>
        );
    };

    const TypeSelector = useCallback(
        () => (
            <ScrollView style={styles.typeSelector}>
                <View style={styles.typeButtons}>
                    <TouchableOpacity
                        style={styles.typeControlButton}
                        onPress={() => setSelectedTypes(uniqueTypes)}
                    >
                        <Text>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.typeControlButton}
                        onPress={() => setSelectedTypes([])}
                    >
                        <Text>Clear All</Text>
                    </TouchableOpacity>
                </View>
                {uniqueTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.typeItem,
                            selectedTypes.includes(type) && styles.selectedType,
                        ]}
                        onPress={() =>
                            setSelectedTypes((prev) =>
                                prev.includes(type)
                                    ? prev.filter((t) => t !== type)
                                    : [...prev, type]
                            )
                        }
                    >
                        <Text>{type}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        ),
        [uniqueTypes, selectedTypes]
    );

    const DatePicker = useCallback(
        () => (
            <View style={styles.dateContainer}>
                <Text>From:</Text>
                <TextInput
                    style={styles.dateInput}
                    placeholder="Start Date"
                    value={startDate || ""}
                    onChangeText={setStartDate}
                    onFocus={() => setPickedFilter("Date")}
                />
                <Text>To:</Text>
                <TextInput
                    style={styles.dateInput}
                    placeholder="End Date"
                    value={endDate || ""}
                    onChangeText={setEndDate}
                    onFocus={() => setPickedFilter("Date")}
                />
            </View>
        ),
        [startDate, endDate]
    );

    const SearchResults = useCallback(() => {
        if (pickedFilter === "Place") {
            return (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.resultItem}
                            onPress={() => {
                                onSearch(
                                    parseFloat(item.lat),
                                    parseFloat(item.lon)
                                );
                                handleCloseSearch();
                            }}
                        >
                            <Text>{item.display_name}</Text>
                        </TouchableOpacity>
                    )}
                />
            );
        }
        return null;
    }, [searchResults, pickedFilter, onSearch, handleCloseSearch]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Search for events..."
                    placeholderTextColor={"#666"}
                    // value={searchQuery}
                    onChangeText={(input) => {
                        setSearchQuery(input);
                    }}
                    // onSubmitEditing={handleSearch}
                    onFocus={() => {
                        onOpen();
                        setIsSearchOpen(true);
                    }}
                    onBlur={onClose}
                />
            </View>

            <View style={styles.filterContainer}>
                <FilterButton type="Type" />
                <FilterButton type="Place" />
                <FilterButton type="Date" />
            </View>

            {/* {isSearchOpen && (


                // <View style={styles.searchContainer}>
                //     <TouchableOpacity
                //         style={styles.closeButton}
                //         onPress={handleCloseSearch}
                //     >
                //         <Text style={styles.closeButtonText}>×</Text>
                //     </TouchableOpacity>

                //     {pickedFilter === "Type" && <TypeSelector />}
                //     {pickedFilter === "Place" && (
                //         <>
                //             <TextInput
                //                 ref={inputRef}
                //                 style={styles.input}
                //                 placeholder="Search location..."
                //                 value={searchQuery}
                //                 onChangeText={setSearchQuery}
                //                 onSubmitEditing={handleSearch}
                //             />
                //             <SearchResults />
                //         </>
                //     )}
                //     {pickedFilter === "Date" && (
                //         <>
                //             <DatePicker />
                //             <TouchableOpacity
                //                 style={styles.searchButton}
                //                 onPress={handleSearch}
                //             >
                //                 <Text>Apply Dates</Text>
                //             </TouchableOpacity>
                //         </>
                //     )}
                // </View>
            )} */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 50,
        width: "90%",
        alignSelf: "center",
        zIndex: 1000,
    },
    filterContainer: {
        position: "relative",
        top: -20,
        flexDirection: "row",
        justifyContent: "space-around",
        // marginBottom: 10,
        backgroundColor: "white",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: 20,
        padding: 5,
        zIndex: 10,
    },
    filterButton: {
        padding: 8,
        width: "30%",
        alignItems: "center",
        borderRadius: 15,
        backgroundColor: "#e0e0e0",
    },
    selectedFilter: {
        backgroundColor: "#2196F3",
    },
    filterButtonText: {
        color: "#333",
    },
    searchContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        paddingLeft: 10,
        zIndex: 1000,
    },
    closeButton: {
        position: "absolute",
        right: 10,
        top: 10,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 20,
        color: "#666",
    },
    input: {
        height: 40,
        paddingHorizontal: 10,
    },
    typeSelector: {
        maxHeight: 200,
    },
    typeButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    typeControlButton: {
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    typeItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    selectedType: {
        backgroundColor: "#e3f2fd",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },
    dateInput: {
        flex: 1,
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    resultItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchButton: {
        padding: 10,
        backgroundColor: "#2196F3",
        borderRadius: 8,
        alignItems: "center",
    },
});

export default SearchBar;

import React, {
    useState,
    useRef,
    useMemo,
    useEffect,
    useCallback,
    act,
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
import { debounce } from "lodash";

type SearchBarProps = {
    onSearch: (lat: number, lon: number) => void;
    openTypesBottomSheet: () => void;
    openPlaceBottomSheet: () => void;
    openListBottomSheet: () => void;
    openDateBottomSheet: () => void;
    openedFilter: string | null;
    activeFilters: "Type" | "Date" | null;
    // filteredEvents: EventFeatureCollection;
    // setFilteredEvents: (events: EventFeatureCollection) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    events: EventFeatureCollection;
};

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const inputRef = useRef<TextInput>(null);

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
        // handleCloseSearch();
    }, [startDate, endDate, props.events]);

    console.log("acitve filters", props.activeFilters);

    const FilterButton: React.FC<{ type: "Type" | "Place" | "Date" }> = ({
        type,
    }) => {
        const title =
            type === "Type" ? "Types" : type === "Place" ? "Place" : "Time";

        return (
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    props.activeFilters === type && styles.activeFilter,
                    props.openedFilter === type && styles.selectedFilter,
                ]}
                onPress={() => {
                    // setPickedFilter(type);
                    // setIsSearchOpen(true);
                    // onOpen();
                    if (type === "Type") {
                        props.openTypesBottomSheet();
                    } else if (type === "Place") {
                        props.openPlaceBottomSheet();
                    } else if (type === "Date") {
                        props.openDateBottomSheet();
                    }
                    inputRef.current?.blur();
                    inputRef.current?.clear();
                }}
            >
                <Text style={styles.filterButtonText}>{title}</Text>
            </TouchableOpacity>
        );
    };

    // clear search query when closing the search
    useEffect(() => {
        console.log("opened filter", props.openedFilter);
        if (props.openedFilter === null) {
            console.log("clearing search query");
            inputRef.current?.clear();
        }
    }, [props.openedFilter]);

    const DatePicker = useCallback(
        () => (
            <View style={styles.dateContainer}>
                <Text>From:</Text>
                <TextInput
                    style={styles.dateInput}
                    placeholder="Start Date"
                    value={startDate || ""}
                    onChangeText={setStartDate}
                    // onFocus={() => setPickedFilter("Date")}
                />
                <Text>To:</Text>
                <TextInput
                    style={styles.dateInput}
                    placeholder="End Date"
                    value={endDate || ""}
                    onChangeText={setEndDate}
                    // onFocus={() => setPickedFilter("Date")}
                />
            </View>
        ),
        [startDate, endDate]
    );

    const handleQuerySearch = useCallback(
        debounce((input) => {
            props.setSearchQuery(input);
        }, 500),
        []
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                {props.openedFilter !== "Date" && (
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder={
                            //depending on the picked filter, the placeholder will change
                            props.openedFilter === "Type"
                                ? "Find event types..."
                                : props.openedFilter === "Place"
                                ? "Find location..."
                                : "Find events..."
                        }
                        placeholderTextColor={"#666"}
                        // value={searchQuery}
                        onChangeText={(input) => {
                            handleQuerySearch(input);
                            // debounce(() => props.setSearchQuery(input), 5);
                            // props.setSearchQuery(input);
                        }}
                        // onSubmitEditing={handleSearch}
                        onFocus={() => {
                            // props.onOpen();
                            setIsSearchOpen(true);
                            props.openListBottomSheet();
                        }}
                        // onBlur={props.onClose}
                    />
                )}
                {/* if opened filter = date, show date picker */}
                {props.openedFilter === "Date" && <DatePicker />}
            </View>

            <View style={styles.filterContainer}>
                <FilterButton type="Type" />
                <FilterButton type="Place" />
                <FilterButton type="Date" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 45,
        width: "90%",
        alignSelf: "center",
        zIndex: 1000,
    },
    filterContainer: {
        position: "relative",
        top: -20,
        flexDirection: "row",
        justifyContent: "space-around",
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
    activeFilter: {
        backgroundColor: "#8eb3ed",
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
    },
    dateInput: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        // backgroundColor: "#f0f0f0",
        borderRadius: 20,
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

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
import DateTimePicker from "@react-native-community/datetimepicker";

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

// TODO memoize the function to prevent re-rendering

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const inputRef = useRef<TextInput>(null);
    const [date, setDate] = useState(new Date());
    const [datePickerOpen, setDatePickerOpen] = useState(false);

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

    const DateInputField = useCallback(
        () => (
            <View style={styles.dateContainer}>
                <Text>From:</Text>
                <DateTimePicker
                    style={styles.dateInput}
                    value={date}
                    mode={"date"}
                    onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || date;
                        setDatePickerOpen(false);
                        setDate(currentDate);
                    }}
                />
                <Text>To:</Text>
                <DateTimePicker
                    style={styles.dateInput}
                    value={date}
                    mode={"date"}
                    onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || date;
                        setDatePickerOpen(false);
                        setDate(currentDate);
                    }}
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
                    <View style={styles.dateContainer}>
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
                    </View>
                )}
                {/* if opened filter = date, show date picker */}
                {props.openedFilter === "Date" && <DateInputField />}
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
        paddingRight: 10,
        zIndex: 1000,
    },
    input: {
        height: 40,
        paddingHorizontal: 10,
    },
    typeControlButton: {
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        // paddingLeft: 20,
        gap: 10,
    },
    dateInput: {
        position: "relative",
        right: 20,
        flex: 1,
        height: 40,
        // backgroundColor: "#f0f0f0",
    },
});

export default SearchBar;

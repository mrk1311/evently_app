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
import { debounce, set } from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";
import { isWithinInterval, parseISO } from "date-fns";
import AntDesign from "@expo/vector-icons/AntDesign";

type SearchBarProps = {
    onSearch: (lat: number, lon: number) => void;
    openTypesBottomSheet: () => void;
    openPlaceBottomSheet: () => void;
    openListBottomSheet: () => void;
    openDateBottomSheet: () => void;
    openedFilter: string | null;
    activeFilters: string[];
    startDate: Date;
    endDate: Date;
    setStartDate: (date: Date) => void;
    setEndDate: (date: Date) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    events: EventFeatureCollection;
};

// TODO memoize the function to prevent re-rendering

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const FilterButton: React.FC<{ type: "Type" | "Place" | "Date" }> = ({
        type,
    }) => {
        const title =
            type === "Type" ? "Types" : type === "Place" ? "Place" : "Time";

        return (
            <TouchableOpacity
                style={[
                    styles.filterButton,
                    props.activeFilters.includes(type) && styles.activeFilter,
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
            <View style={styles.inputContainer}>
                <Text>From:</Text>
                <DateTimePicker
                    style={styles.dateInput}
                    value={props.startDate}
                    mode={"date"}
                    onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || props.startDate;
                        // setDatePickerOpen(false);
                        // setDate(currentDate);
                        props.setStartDate(currentDate);
                    }}
                />
                <Text>To:</Text>
                <DateTimePicker
                    style={styles.dateInput}
                    value={props.endDate}
                    mode={"date"}
                    onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || props.endDate;
                        // setDatePickerOpen(false);
                        // setDate(currentDate);
                        props.setEndDate(currentDate);
                    }}
                />
            </View>
        ),
        [props.startDate, props.endDate]
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
                    <View style={styles.inputContainer}>
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
                <AntDesign name="user" size={24} color="black" />
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
    },
    filterContainer: {
        position: "relative",
        top: -20,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "white",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: 20,
        padding: 5,
        zIndex: 10,
    },
    filterButton: {
        padding: 8,
        width: "31%",
        height: 30,
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
        paddingRight: 40,
        paddingTop: 10,
        zIndex: 1000,
        display: "flex",
        flexDirection: "row",
    },
    input: {
        height: 40,
        width: "100%",
        paddingHorizontal: 10,
    },
    typeControlButton: {
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    inputContainer: {
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

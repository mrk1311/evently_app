import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Button,
} from "react-native";
import type { EventFeatureCollection } from "./ClusteredMap";
import { debounce } from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

type SearchBarProps = {
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

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const [text, onChangeText] = useState("");
    const inputRef = useRef<TextInput>(null);
    const router = useRouter();

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
        if (props.openedFilter === null) {
            inputRef.current?.clear();
        }
    }, [props.openedFilter]);

    const DateInputField = useCallback(
        () => (
            <View style={styles.inputContainer}>
                <View style={styles.dateContainer}>
                    <Text>From:</Text>
                    <DateTimePicker
                        style={styles.dateInput}
                        value={props.startDate}
                        mode={"date"}
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || props.startDate;
                            props.setStartDate(currentDate);
                        }}
                    />
                </View>
                <View style={styles.dateContainer}>
                    <Text>To:</Text>
                    <DateTimePicker
                        style={styles.dateInput}
                        value={props.endDate}
                        mode={"date"}
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || props.endDate;
                            props.setEndDate(currentDate);
                        }}
                    />
                </View>
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

    useEffect(() => {
        handleQuerySearch(text);
    }, [text]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                {props.openedFilter !== "Date" && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={text}
                            placeholder={
                                //depending on the picked filter, the placeholder will change
                                props.openedFilter === "Type"
                                    ? "Find event types..."
                                    : props.openedFilter === "Place"
                                    ? "Find location..."
                                    : "Find events..."
                            }
                            placeholderTextColor={"#666"}
                            onChangeText={(input) => onChangeText(input)}
                            onFocus={() => {
                                props.openListBottomSheet();
                            }}
                        />
                    </View>
                )}
                {/* if opened filter = date, show date picker */}
                {props.openedFilter === "Date" && <DateInputField />}
                {props.searchQuery !== "" && (
                    <TouchableOpacity onPress={() => onChangeText("")}>
                        <MaterialIcons name="cancel" size={33} color="#333" />
                    </TouchableOpacity>
                )}
                {props.openedFilter === null && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => router.navigate("/userPage")}
                    >
                        <AntDesign name="user" size={18} color="#333" />
                    </TouchableOpacity>
                )}
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
        paddingLeft: 5,
        paddingRight: 5,
        zIndex: 1000,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
        justifyContent: "space-around",
        flex: 1,
        // gap: 10,
    },
    dateInput: {
        display: "flex",
        height: 40,
        width: 100,
    },
    dateContainer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    rightIcon: {
        backgroundColor: "#e0e0e0",
        borderRadius: 25,
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default SearchBar;

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Button,
    Keyboard,
    Platform,
} from "react-native";
import type { EventFeatureCollection } from "./ClusteredMap";
import { debounce, set } from "lodash";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";

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
    closeFilter: () => void;
    setPreviousStartDate: (date: Date) => void;
    setPreviousEndDate: (date: Date) => void;
};

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const [text, onChangeText] = useState("");
    const inputRef = useRef<TextInput>(null);
    const router = useRouter();

    // save the start and end dates to go back to them if needed
    useEffect(() => {
        props.setPreviousStartDate(props.startDate);
        props.setPreviousEndDate(props.endDate);
    }, [props.openedFilter]);

    const FilterButton: React.FC<{ type: "Type" | "Place" | "Date" }> = ({
        type,
    }) => {
        const title =
            type === "Type" ? "Rodzaj" : type === "Place" ? "Miejsce" : "Data";

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
                        inputRef.current?.blur();
                    } else if (type === "Place") {
                        props.openPlaceBottomSheet();
                        inputRef.current?.focus();
                    } else if (type === "Date") {
                        props.openDateBottomSheet();
                    }
                    // inputRef.current?.blur();
                    inputRef.current?.clear();
                }}
            >
                <Text
                    style={[
                        styles.filterButtonText,
                        props.activeFilters.includes(type) &&
                            styles.activeFilterText,
                    ]}
                >
                    {title}
                </Text>
            </TouchableOpacity>
        );
    };

    // clear search query when closing the search
    useEffect(() => {
        if (props.openedFilter === null) {
            inputRef.current?.clear();
        }
    }, [props.openedFilter]);

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
                        {/* {text === "" && ( */}
                        {/* // render a search icon */}
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="#ffffff"
                            style={{ marginLeft: 10 }}
                        />
                        {/* )} */}
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={text}
                            placeholder={
                                //depending on the picked filter, the placeholder will change
                                props.openedFilter === "Type"
                                    ? "Wyszukaj rodzaje wydarzeń..."
                                    : props.openedFilter === "Place"
                                    ? "Wyszukaj miejscowość..."
                                    : "Szukaj wydarzeń..."
                            }
                            placeholderTextColor={"#ffffff"}
                            onChangeText={(input) => onChangeText(input)}
                            onFocus={() => {
                                props.openListBottomSheet();
                            }}
                            autoFocus={props.openedFilter === "Place"}
                        />
                    </View>
                )}
                {/* if opened filter = date, show date picker */}
                {props.openedFilter === "Date" && (
                    <View style={styles.inputContainer}>
                        <View style={styles.dateContainer}>
                            <Text style={{ color: "#ffffff" }}>Od:</Text>
                            {/* {showDatePicker && ( */}
                            <DateTimePicker
                                style={styles.dateInput}
                                value={props.startDate}
                                mode={"date"}
                                locale="pl"
                                // minimumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    props.setStartDate(
                                        selectedDate || props.startDate
                                    );
                                }}
                            />
                            {/* )} */}
                        </View>
                        <View style={styles.dateContainer}>
                            <Text style={{ color: "#ffffff" }}>Do:</Text>
                            <DateTimePicker
                                style={styles.dateInput}
                                value={props.endDate}
                                mode={"date"}
                                locale="pl"
                                // minimumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    props.setEndDate(
                                        selectedDate || props.endDate
                                    );
                                }}
                            />
                        </View>
                    </View>
                )}
                {props.searchQuery !== "" && props.openedFilter === null && (
                    <TouchableOpacity onPress={() => onChangeText("")}>
                        <Feather name="x-circle" size={30} color="#ffffff" />
                        {/* <MaterialIcons
                            name="cancel"
                            size={33}
                            color="#ffffff"
                        /> */}
                    </TouchableOpacity>
                )}
                {props.openedFilter === null && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={() => router.navigate("/userPage")}
                    >
                        {/* <AntDesign name="user" size={18} color="#333" /> */}
                        <FontAwesome6
                            style={styles.userIcon}
                            name="user-large"
                            size={15}
                            color={"#78c181"}
                        />
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
        backgroundColor: "#282828",
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
        backgroundColor: "#575757",
    },
    selectedFilter: {
        backgroundColor: "#528759",
    },
    activeFilter: {
        backgroundColor: "#78c181",
    },
    activeFilterText: {
        // backgroundColor: "#78c181",
        color: "black",
    },
    filterButtonText: {
        color: "#ffffff",
    },
    searchContainer: {
        backgroundColor: "#282828",
        borderRadius: 20,
        paddingLeft: 5,
        paddingRight: 5,
        gap: 10,
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
        color: "#ffffff",
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
        backgroundColor: "#528759",
        borderRadius: 50,
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    userIcon: {
        position: "relative",
        // top: 10,
    },
});

export default SearchBar;

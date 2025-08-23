import React, {
    useMemo,
    forwardRef,
    memo,
    useCallback,
    useState,
    useEffect,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Button } from "react-native";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
} from "@gorhom/bottom-sheet";

interface BottomSheetProps {
    handleCancelDates: (previousStartDate: Date, previousEndDate: Date) => void;
    handleAcceptDates: (startDate: Date, endDate: Date) => void;
    startDate: Date;
    endDate: Date;
    previousStartDate: Date;
    previousEndDate: Date;
}

type Ref = BottomSheet;

const DateBottomSheet = forwardRef<Ref, BottomSheetProps>((props, ref) => {
    // variables

    const snapPoints = useMemo(() => ["50%", "85%"], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                {...props}
            />
        ),
        []
    );

    const renderItem = useCallback(
        ({ item }: { item: string }) => (
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={() => {
                    if (item === "Dzisiaj") {
                        props.handleAcceptDates(new Date(), new Date());
                    } else if (item === "W tym tygodniu") {
                        const today = new Date();
                        const startOfWeek = new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            today.getDate() - today.getDay()
                        );
                        const endOfWeek = new Date(
                            startOfWeek.getFullYear(),
                            startOfWeek.getMonth(),
                            startOfWeek.getDate() + 6
                        );
                        props.handleAcceptDates(startOfWeek, endOfWeek);
                    } else if (item === "W tym miesiącu") {
                        const today = new Date();
                        const startOfMonth = new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            1
                        );
                        const endOfMonth = new Date(
                            today.getFullYear(),
                            today.getMonth() + 1,
                            0
                        );
                        props.handleAcceptDates(startOfMonth, endOfMonth);
                    }
                }}
            >
                <Text style={styles.cardText}>{item}</Text>
            </TouchableOpacity>
        ),
        [] // No dependencies needed due to functional update
    );

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            backdropComponent={renderBackdrop}
            enableContentPanningGesture={true}
            enablePanDownToClose={false}
            backgroundStyle={{ backgroundColor: "#282828" }}
            handleIndicatorStyle={{ backgroundColor: "#ffffff" }}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Button
                        title="Anuluj"
                        onPress={() => {
                            console.log(
                                "Anulowanie dat: ",
                                props.previousStartDate,
                                props.previousEndDate
                            );

                            props.handleCancelDates(
                                props.previousStartDate,
                                props.previousEndDate
                            );
                        }}
                    />
                    <Text style={styles.headerText}>Wybierz datę</Text>
                    <Button
                        title="Akceptuj"
                        onPress={() => {
                            props.handleAcceptDates(
                                props.startDate,
                                props.endDate
                            );
                        }}
                    />
                </View>

                <BottomSheetFlatList
                    data={["Dzisiaj", "W tym tygodniu", "W tym miesiącu"]}
                    keyExtractor={(item) => item}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </BottomSheet>
    );
});

export default memo(DateBottomSheet);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#282828",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff",
    },
    doneButton: {
        padding: 8,
    },
    doneText: {
        color: "#007AFF",
    },
    cardContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
        color: "#ffffff",
    },
    cardText: {
        color: "#ffffff",
        fontSize: 16,
    },
});

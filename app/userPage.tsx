import { View, Text, StyleSheet, Button, SafeAreaView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function userPage() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="chevron-left" size={24} />
                <Text style={styles.backText}>Back to map</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        // justifyContent: "flex-start",
        alignItems: "center",
        alignContent: "center",
        height: 50,
        padding: 10,
    },
    backText: {
        // justifyContent: "center",
        // alignItems: "center",
    },
});

import {
    View,
    Text,
    StyleSheet,
    Button,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";

export default function addEvent() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => router.back()}
            >
                <MaterialIcons name="chevron-left" size={24} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
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
    userPreview: {
        flexDirection: "row",
        padding: 20,
        alignItems: "center",
        gap: 30,
        borderBottomWidth: 1,
        borderTopWidth: 1,
    },
    userIcon: {
        backgroundColor: "#e0e0e0",
        borderRadius: 50,
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    menuItem: {
        flexDirection: "row",
        padding: 20,
        alignItems: "center",
        gap: 30,
        borderBottomWidth: 1,
    },
});

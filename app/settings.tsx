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

export default function settings() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/notifications")}
            >
                <MaterialIcons name="notifications" size={36} color="#fff" />
                <Text style={{ color: "#ffffff" }}>Powiadomienia</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                // onPress={() => router.navigate("/userPage/settings")}
            >
                <MaterialIcons name="light-mode" size={36} color="#fff" />
                <Text style={{ color: "#ffffff" }}>
                    Zmiana trybu na jasny (dostępna wkrótce)
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                // onPress={() => router.navigate("/userPage/settings")}
            >
                <MaterialIcons name="password" size={36} color="#fff" />
                <Text style={{ color: "#ffffff" }}>
                    Zmiana hasła (dostępna wkrótce)
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#282828",
    },
    menuItem: {
        flexDirection: "row",
        padding: 20,
        alignItems: "center",
        gap: 30,
        borderBottomWidth: 1,
        borderColor: "#575757",
    },
});

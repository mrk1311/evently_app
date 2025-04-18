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

export default function userPage() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => router.back()}
            >
                {/* <TouchableOpacity onPress={() => router.back()}> */}
                <MaterialIcons name="chevron-left" size={24} />
                <Text style={styles.backText}>Back to map</Text>
                {/* </TouchableOpacity> */}
            </TouchableOpacity>
            <TouchableOpacity style={styles.userPreview}>
                <View style={styles.userIcon}>
                    <AntDesign name="user" size={36} color="#333" />
                </View>

                <Text>Log In / Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
                <AntDesign name="heart" size={36} color="#333" />
                <Text>Favourite events</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
                <MaterialIcons name="event" size={36} color="#333" />
                <Text>Add a event</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <MaterialIcons name="settings" size={36} color="#333" />
                <Text>Settings</Text>
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

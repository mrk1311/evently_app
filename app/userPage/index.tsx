import {
    View,
    Text,
    StyleSheet,
    Button,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Alert } from "react-native";
import AdminDashboard from "./admin";
import { LinearGradient } from "expo-linear-gradient";
// import MaskedView from "@react-native-masked-view/masked-view";

export default function userPage() {
    const router = useRouter();
    const { user, isAdmin } = useUser();
    const [profile, setProfile] = useState<{ username?: string } | null>(null);

    // Fetch profile when user changes
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setProfile(null);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("username")
                .eq("user_id", user.id)
                .single();

            if (!error) setProfile(data);
        };

        fetchProfile();
    }, [user]);

    // Logout
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Logout error:", error);
    };

    const handleAuthPress = () => {
        if (user) {
            Alert.alert("Log Out", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", onPress: handleLogout },
            ]);
        } else {
            router.navigate("/userPage/auth");
        }
    };

    // Admin dashboard button update when user changes and is admin
    const AdminDashboardButton = () => {
        if (!isAdmin) return null;

        return (
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/admin")}
            >
                <MaterialIcons
                    name="admin-panel-settings"
                    size={36}
                    color="#333"
                />
                <Text>Admin Dashboard</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="chevron-left" size={24} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 25,
                        fontWeight: "bold",
                        // margin: "auto",
                    }}
                >
                    MyEventMap
                </Text>
                <Text style={{ width: 94 }} />
            </View>
            <TouchableOpacity
                style={styles.userPreview}
                onPress={handleAuthPress}
            >
                <View style={styles.userIcon}>
                    <FontAwesome6
                        name="user-large"
                        size={30}
                        color={"#78c181"}
                    />
                </View>

                <Text>
                    {user
                        ? profile?.username || user.email
                        : "Log In / Sign Up"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={() =>
                    router.navigate({
                        pathname: "/userPage/favourites",
                        params: { userId: user?.id },
                    })
                }
            >
                <AntDesign name="heart" size={36} color="#d35050" />
                <Text>Favourite events</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/addEvent")}
            >
                <MaterialIcons name="event" size={36} color="#ab64c9" />
                <Text>Submit an event</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/settings")}
            >
                <MaterialIcons name="settings" size={36} color="#50a1d3" />
                <Text>Settings</Text>
            </TouchableOpacity>
            {/* {if user is admin, show an admin dashboard button} */}
            <AdminDashboardButton />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
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
        backgroundColor: "#528759",
        borderRadius: 50,
        width: 80,
        height: 80,
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
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
});

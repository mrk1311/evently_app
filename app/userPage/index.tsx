import {
    View,
    Text,
    StyleSheet,
    Button,
    SafeAreaView,
    TouchableOpacity,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Feather, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
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
            return;
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
                <Text style={{ color: "#ffffff" }}>Admin Dashboard</Text>
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
                    <MaterialIcons
                        name="chevron-left"
                        size={24}
                        color={"#ffffff"}
                    />
                    <Text style={styles.backText}>Cofnij</Text>
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 25,
                        fontWeight: "bold",
                        // margin: "auto",
                        color: "#ffffff",
                    }}
                >
                    MyEventMap
                </Text>
                <Text style={{ width: 94 }} />
            </View>
            {user && (
                <View style={styles.userPreview}>
                    <View style={styles.userIcon}>
                        <FontAwesome6
                            name="user-large"
                            size={30}
                            color={"#78c181"}
                        />
                    </View>

                    <Text style={{ color: "#ffffff" }}>
                        {profile?.username || user.email}
                    </Text>
                </View>
            )}
            {!user && (
                <TouchableOpacity
                    style={styles.userPreview}
                    onPress={() => router.navigate("/userPage/auth")}
                >
                    <View style={styles.userIcon}>
                        <FontAwesome6
                            name="user-large"
                            size={30}
                            color={"#78c181"}
                        />
                    </View>

                    <Text style={{ color: "#ffffff" }}>
                        {"Zaloguj się / Zarejestruj"}
                    </Text>
                </TouchableOpacity>
            )}

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
                <Text style={{ color: "#ffffff" }}>Ulubione wydarzenia</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/addEvent")}
            >
                <MaterialIcons name="event" size={36} color="#ab64c9" />
                <Text style={{ color: "#ffffff" }}>Zaproponuj wydarzenie</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/settings")}
            >
                <MaterialIcons name="settings" size={36} color="#50a1d3" />
                <Text style={{ color: "#ffffff" }}>Ustawienia</Text>
            </TouchableOpacity>
            {/* {if user is admin, show an admin dashboard button} */}
            <AdminDashboardButton />
            <TouchableOpacity
                style={styles.menuItem}
                // onPress={() => router.navigate("/userPage/settings")}
            >
                <MaterialIcons name="star-rate" size={36} color="gold" />
                <Text style={{ color: "#ffffff" }}>Podziel się opinią</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                // onPress={() => router.navigate("/userPage/settings")}
            >
                <Feather name="alert-circle" size={36} color="#fff" />
                <Text style={{ color: "#ffffff" }}>Zgłoś problem</Text>
            </TouchableOpacity>
            {user && (
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() =>
                        Alert.alert(
                            "Log Out",
                            "Are you sure you want to log out?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Log Out", onPress: handleLogout },
                            ]
                        )
                    }
                >
                    <MaterialIcons name="logout" size={36} color="#fff" />
                    <Text style={{ color: "#ffffff" }}>Wyloguj się</Text>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#282828",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        color: "#ffffff",
    },
    userPreview: {
        flexDirection: "row",
        padding: 20,
        alignItems: "center",
        gap: 30,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: "#575757",
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
        borderColor: "#575757",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
});

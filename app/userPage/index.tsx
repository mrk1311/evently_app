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
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useUser } from "@/hooks/useUser";
import { Alert } from "react-native";

export default function userPage() {
    const router = useRouter();
    const { user } = useUser();
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

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => router.back()}
            >
                <MaterialIcons name="chevron-left" size={24} />
                <Text style={styles.backText}>Back to map</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.userPreview}
                onPress={handleAuthPress}
            >
                <View style={styles.userIcon}>
                    <AntDesign name="user" size={36} color="#333" />
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
                <AntDesign name="heart" size={36} color="#333" />
                <Text>Favourite events</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/addEvent")}
            >
                <MaterialIcons name="event" size={36} color="#333" />
                <Text>Add a event</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.navigate("/userPage/settings")}
            >
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

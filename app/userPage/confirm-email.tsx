import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "./../../utils/supabase";
import { StyleSheet } from "react-native";
import React from "react";

export default function ConfirmEmailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const token = params.token as string;

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                const { error } = await supabase.auth.verifyOtp({
                    email: params.email as string, // Added email parameter
                    token,
                    type: "email",
                });

                if (error) throw error;

                // Redirect to app after 2 seconds
                setTimeout(() => {
                    router.replace("/");
                }, 2000);
            } catch (error) {
                console.error("Email confirmation error:", error);
                setTimeout(() => {
                    router.replace("/");
                }, 2000);
            }
        };

        if (token) {
            confirmEmail();
        } else {
            router.replace("/");
        }
    }, [token]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Confirming Email...</Text>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
});

// app/userPage/auth.tsx
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/hooks/useUser";

export default function AuthScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            router.back(); // Return to previous screen after successful login
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setError("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setError("Check your email for confirmation!");
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.title}>Welcome</Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="password"
                    secureTextEntry
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.signUpButton]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() =>
                        supabase.auth.signInWithOAuth({ provider: "google" })
                    }
                >
                    {/* <MaterialIcons name="google" size={24} color="#fff" /> */}
                    <Text style={styles.socialButtonText}>
                        Continue with Google
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.link}>Back to main screen</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    form: {
        padding: 20,
        gap: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#fff",
    },
    button: {
        height: 50,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
    },
    signUpButton: {
        backgroundColor: "#3b82f6",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    socialButton: {
        flexDirection: "row",
        height: 50,
        borderRadius: 8,
        backgroundColor: "#db4437",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    socialButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    link: {
        color: "#2563eb",
        textAlign: "center",
        marginTop: 15,
    },
    error: {
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 10,
    },
});

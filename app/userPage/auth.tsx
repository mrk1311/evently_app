import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/hooks/useUser";

// ... existing imports ...

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const passwordInputRef = useRef<TextInput>(null);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email format";
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrors({ server: error.message });
                return;
            }

            router.back(); // Return to previous screen after successful login
        } catch (err) {
            setErrors({ server: "An unexpected error occurred" });
        } finally {
            setLoading(false);
        }
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
                        fontSize: 20,
                        fontWeight: "bold",
                    }}
                >
                    Sign In
                </Text>
                <Text style={{ width: 94 }} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        <Text style={styles.title}>Welcome Back</Text>

                        {errors.server && (
                            <Text style={styles.error}>{errors.server}</Text>
                        )}

                        <TextInput
                            style={[
                                styles.input,
                                errors.email && styles.inputError,
                            ]}
                            placeholder="Email"
                            placeholderTextColor={"#666"}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() =>
                                passwordInputRef.current?.focus()
                            }
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        <TextInput
                            ref={passwordInputRef}
                            style={[
                                styles.input,
                                errors.password && styles.inputError,
                            ]}
                            placeholder="Password"
                            placeholderTextColor={"#666"}
                            value={password}
                            onChangeText={setPassword}
                            autoComplete="password"
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                        />
                        {errors.password && (
                            <Text style={styles.errorText}>
                                {errors.password}
                            </Text>
                        )}

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

                        <View style={styles.signupPrompt}>
                            <Text style={styles.signupText}>
                                Don't have an account?
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push("/userPage/signup")}
                            >
                                <Text style={styles.signupLink}>
                                    Create Account
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() =>
                                supabase.auth.signInWithOAuth({
                                    provider: "google",
                                })
                            }
                        >
                            <AntDesign name="google" size={24} color="#fff" />
                            <Text style={styles.socialButtonText}>
                                Available soon
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingBottom: 40,
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
        marginTop: 20,
    },
    socialButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    error: {
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 10,
    },
    signupPrompt: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    signupText: {
        color: "#666",
    },
    signupLink: {
        color: "#2563eb",
        fontWeight: "bold",
        marginLeft: 5,
    },
    inputError: {
        borderColor: "#ef4444",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        marginTop: 5,
    },
});

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
import Octicons from "@expo/vector-icons/Octicons";

export default function SignUpScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const confirmEmailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);

    // Password strength checker
    const checkPasswordStrength = (password: string) => {
        const strongRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
        return strongRegex.test(password);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = "Adres e-mail jest wymagany";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Nieprawidłowy format adresu e-mail";
        }

        // Confirm email validation
        if (email !== confirmEmail) {
            newErrors.confirmEmail = "Adresy e-mail nie pasują";
        }

        // Password validation
        if (!password) {
            newErrors.password = "Hasło jest wymagane";
        } else if (password.length < 8) {
            newErrors.password = "Hasło musi mieć co najmniej 8 znaków";
        } else if (!checkPasswordStrength(password)) {
            newErrors.password =
                "Hasło musi zawierać wielką literę, małą literę, cyfrę i znak specjalny";
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Hasła nie pasują";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        // Inside handleSignUp function
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: "MyEventApp://confirm?token=",
            },
        });

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            // Check if email already exists
            const { data: userData, error: userError } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", email)
                .single();

            if (userData) {
                setErrors({ email: "Email is already registered" });
                setLoading(false);
                return;
            }

            // Create account
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                if (error.message.includes("already been registered")) {
                    setErrors({ email: "Email is already registered" });
                } else {
                    setErrors({ server: error.message });
                }
                return;
            }

            // Show success message and navigate back
            setErrors({
                success:
                    "Na twoją skrzynkę został wysłany link. Potwierdź swój adres email!",
            });
            setTimeout(() => router.back(), 3000);
        } catch (err) {
            setErrors({ server: "An unexpected error occurred" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <MaterialIcons
                        name="chevron-left"
                        size={24}
                        color={"#fff"}
                    />
                    <Text style={styles.backText}>Cofnij </Text>
                </TouchableOpacity>
                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#ffffff",
                    }}
                >
                    Zarejestruj się
                </Text>
                <Text style={{ width: 94 }} />
            </View> */}

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        <Text style={styles.title}>Zarejestruj się</Text>

                        {errors.server && (
                            <Text style={styles.error}>{errors.server}</Text>
                        )}

                        {errors.success && (
                            <Text style={styles.success}>{errors.success}</Text>
                        )}

                        <TextInput
                            style={[
                                styles.input,
                                errors.email && styles.inputError,
                            ]}
                            placeholder="Adres e-mail"
                            placeholderTextColor={"#fff"}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() =>
                                confirmEmailInputRef.current?.focus()
                            }
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        <TextInput
                            ref={confirmEmailInputRef}
                            style={[
                                styles.input,
                                errors.confirmEmail && styles.inputError,
                            ]}
                            placeholder="Potwierdź adres e-mail"
                            placeholderTextColor={"#fff"}
                            value={confirmEmail}
                            onChangeText={setConfirmEmail}
                            autoCapitalize="none"
                            autoComplete="email"
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() =>
                                passwordInputRef.current?.focus()
                            }
                        />
                        {errors.confirmEmail && (
                            <Text style={styles.errorText}>
                                {errors.confirmEmail}
                            </Text>
                        )}

                        <TextInput
                            ref={passwordInputRef}
                            style={[
                                styles.input,
                                errors.password && styles.inputError,
                            ]}
                            placeholder="Hasło"
                            placeholderTextColor={"#fff"}
                            value={password}
                            onChangeText={setPassword}
                            autoComplete="password"
                            secureTextEntry
                            returnKeyType="next"
                            onSubmitEditing={() =>
                                confirmPasswordInputRef.current?.focus()
                            }
                        />
                        {errors.password && (
                            <Text style={styles.errorText}>
                                {errors.password}
                            </Text>
                        )}

                        <View style={styles.passwordRules}>
                            <Text style={styles.ruleText}>
                                Hasło musi zawierać:
                            </Text>
                            <View style={styles.ruleItem}>
                                <Octicons
                                    name="dot-fill"
                                    size={24}
                                    // color={
                                    //     password.length >= 8
                                    //         ? "#16a34a"
                                    //         : "#ef4444"
                                    // }
                                    style={[
                                        styles.ruleIcon,
                                        password.length >= 8 &&
                                            styles.ruleValid,
                                    ]}
                                />

                                <Text style={styles.ruleText}>
                                    Co najmniej 8 znaków
                                </Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <Octicons
                                    name="dot-fill"
                                    size={24}
                                    style={[
                                        styles.ruleIcon,
                                        /[A-Z]/.test(password) &&
                                            styles.ruleValid,
                                    ]}
                                />
                                <Text style={styles.ruleText}>
                                    Wielką literę
                                </Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <Octicons
                                    name="dot-fill"
                                    size={24}
                                    style={[
                                        styles.ruleIcon,
                                        /[a-z]/.test(password) &&
                                            styles.ruleValid,
                                    ]}
                                />
                                <Text style={styles.ruleText}>Małą literę</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <Octicons
                                    name="dot-fill"
                                    size={24}
                                    // color={
                                    //     /[0-9]/.test(password)
                                    //         ? "#16a34a"
                                    //         : "#ef4444"
                                    // }
                                    style={[
                                        styles.ruleIcon,
                                        /[0-9]/.test(password) &&
                                            styles.ruleValid,
                                    ]}
                                />
                                <Text style={styles.ruleText}>Cyfrę</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <Octicons
                                    name="dot-fill"
                                    size={24}
                                    // color={
                                    //     /[!@#$%^&*()\-_=+{};:,<.>]/.test(
                                    //         password
                                    //     )
                                    //         ? "#16a34a"
                                    //         : "#ef4444"
                                    // }
                                    // style={styles.ruleIcon}

                                    style={[
                                        styles.ruleIcon,
                                        /[!@#$%^&*()\-_=+{};:,<.>]/.test(
                                            password
                                        ) && styles.ruleValid,
                                    ]}
                                />
                                <Text style={styles.ruleText}>
                                    Znak specjalny
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            ref={confirmPasswordInputRef}
                            style={[
                                styles.input,
                                errors.confirmPassword && styles.inputError,
                            ]}
                            placeholder="Potwierdź hasło"
                            placeholderTextColor={"#fff"}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoComplete="password"
                            secureTextEntry
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>
                                {errors.confirmPassword}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    Zarejestruj się
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* <View style={styles.loginPrompt}>
                            <Text style={styles.loginText}>
                                Masz już konto?
                            </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={styles.loginLink}>
                                    Zaloguj się
                                </Text>
                            </TouchableOpacity>
                        </View> */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#282828",
        borderTopWidth: 1,
        borderColor: "#575757",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
        color: "#ffffff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#575757",
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
        color: "#ffffff",
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#575757",
        color: "#ffffff",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#282828",
    },
    inputError: {
        borderColor: "#ef4444",
    },
    button: {
        height: 50,
        borderRadius: 8,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    error: {
        color: "#ef4444",
        textAlign: "center",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#fee2e2",
        borderRadius: 8,
    },
    success: {
        color: "#16a34a",
        textAlign: "center",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#dcfce7",
        borderRadius: 8,
    },
    errorText: {
        color: "#ef4444",
        marginTop: -10,
        marginBottom: 5,
    },
    loginPrompt: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginText: {
        color: "#fff",
    },
    loginLink: {
        color: "#2563eb",
        fontWeight: "bold",
        marginLeft: 5,
    },
    passwordRules: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: "#282828",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#575757",
    },
    ruleItem: {
        flexDirection: "row",
        alignItems: "center",
        margin: 2,
    },
    ruleIcon: {
        marginLeft: 8,
        color: "#ef4444",
    },
    ruleValid: {
        color: "#16a34a",
    },
    ruleText: {
        color: "#fff",
        fontSize: 12,
        marginLeft: 8,
    },
});

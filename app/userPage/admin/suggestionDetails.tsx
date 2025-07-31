import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { EventSuggestion } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SuggestionDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const { suggestion } = route.params as { suggestion: EventSuggestion };

    const [formData, setFormData] = useState(suggestion);
    const [isLoading, setIsLoading] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const handleChange = (field: keyof EventSuggestion, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await supabase
                .from("event_suggestions")
                .update(formData)
                .eq("id", suggestion.id);

            navigation.goBack();
            Alert.alert("Success", "Suggestion updated successfully");
        } catch (err) {
            Alert.alert("Error", "Failed to update suggestion");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setIsLoading(true);

            // Move to main events table
            await supabase.from("events").insert({
                title: formData.title,
                description: formData.description,
                location: formData.location,
                coordinates: formData.coordinates,
                photo_url: formData.photo_url,
                event_url: formData.event_url,
                event_time: formData.event_time,
                type: formData.type,
                organizer_id: formData.user_id,
            });

            // Update suggestion status
            await supabase
                .from("event_suggestions")
                .update({ status: "approved" })
                .eq("id", suggestion.id);

            navigation.goBack();
            Alert.alert("Approved", "Event has been published");
        } catch (err) {
            Alert.alert("Error", "Failed to approve suggestion");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsLoading(true);
            await supabase
                .from("event_suggestions")
                .update({ status: "rejected" })
                .eq("id", suggestion.id);

            navigation.goBack();
            Alert.alert("Rejected", "Suggestion has been rejected");
        } catch (err) {
            Alert.alert("Error", "Failed to reject suggestion");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialIcons name="chevron-left" size={24} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Suggestion</Text>
                <View style={{ width: 94 }} />
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) => handleChange("title", text)}
                    placeholder="Event title"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description}
                    onChangeText={(text) => handleChange("description", text)}
                    placeholder="Event description"
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(text) => handleChange("location", text)}
                    placeholder="Event location"
                />

                <Text style={styles.label}>Date & Time</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => setDatePickerVisible(true)}
                >
                    <Text>
                        {new Date(formData.event_time).toLocaleString()}
                    </Text>
                </TouchableOpacity>

                {datePickerVisible && (
                    <DateTimePicker
                        value={new Date(formData.event_time)}
                        mode="datetime"
                        onChange={(event, date) => {
                            setDatePickerVisible(false);
                            if (date) {
                                handleChange("event_time", date.toISOString());
                            }
                        }}
                    />
                )}

                <Text style={styles.label}>Event URL</Text>
                <TextInput
                    style={styles.input}
                    value={formData.event_url}
                    onChangeText={(text) => handleChange("event_url", text)}
                    placeholder="https://example.com"
                    keyboardType="url"
                />

                <Text style={styles.label}>Event Type</Text>
                <TextInput
                    style={styles.input}
                    value={formData.type}
                    onChangeText={(text) => handleChange("type", text)}
                    placeholder="music, art, sport..."
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.approveButton]}
                        onPress={handleApprove}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Approve Event</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={handleReject}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Reject Suggestion</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    formContainer: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    buttonContainer: {
        marginTop: 24,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: "#4CAF50",
    },
    approveButton: {
        backgroundColor: "#2196F3",
    },
    rejectButton: {
        backgroundColor: "#F44336",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});

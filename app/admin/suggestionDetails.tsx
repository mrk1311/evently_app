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
    KeyboardAvoidingView,
    Button,
    Image,
    Keyboard,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { EventSuggestion } from "@/types";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToSupabase } from "@/utils/storage";
import { Picker } from "@react-native-picker/picker";
import {
    parseCoordinates,
    formatToPostGisPoint,
    reverseGeocode,
} from "@/utils/geoUtils";

const eventTypes = ["music", "sport", "conference", "festival", "exhibition"];

export default function SuggestionDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const suggestion = JSON.parse(
        params.suggestion as string
    ) as EventSuggestion;

    const [formData, setFormData] = useState(suggestion);
    const [isLoading, setIsLoading] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [geometry, setGeometry] = useState<[number, number]>(
        parseCoordinates(suggestion.coordinates)
    );

    // Handle image selection
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            // aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    // Upload image to Supabase Storage
    const uploadImage = async () => {
        if (!image) return null;

        setUploading(true);

        try {
            return await uploadImageToSupabase(image, "event-images");
        } catch (error) {
            console.error("Image upload failed:", error);
            Alert.alert("Upload failed", "Could not upload image");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await supabase
                .from("event_suggestions")
                .update(formData)
                .eq("id", suggestion.id);

            router.back();
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
            const { error } = await supabase.from("events").insert({
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

            if (error) {
                throw error;
            }

            // Update suggestion status
            await supabase
                .from("event_suggestions")
                .update({ status: "approved" })
                .eq("id", suggestion.id);

            router.back();
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

            router.back();
            Alert.alert("Rejected", "Suggestion has been rejected");
        } catch (err) {
            Alert.alert("Error", "Failed to reject suggestion");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setFormData({
            ...formData,
            coordinates: formatToPostGisPoint(
                coordinate.longitude,
                coordinate.latitude
            ),
        });
        console.log("Selected coordinates:", coordinate);
        setGeometry([coordinate.longitude, coordinate.latitude]);
    };

    return (
        <KeyboardAvoidingView>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <MaterialIcons name="chevron-left" size={24} />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Suggestion</Text>
                        <View style={{ width: 62 }} />
                    </View>

                    <ScrollView
                        style={styles.ScrollViewContainer}
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.label}>Event Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) =>
                                setFormData({ ...formData, title: text })
                            }
                            placeholder="Enter event name"
                        />

                        <Text style={styles.label}>Event Type</Text>
                        <Picker
                            selectedValue={formData.type}
                            onValueChange={(value: any) =>
                                setFormData({ ...formData, type: value })
                            }
                            style={styles.picker}
                        >
                            {eventTypes.map((type) => (
                                <Picker.Item
                                    key={type}
                                    label={
                                        type.charAt(0).toUpperCase() +
                                        type.slice(1)
                                    }
                                    value={type}
                                />
                            ))}
                        </Picker>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.multiline]}
                            value={formData.description}
                            onChangeText={(text) =>
                                setFormData({
                                    ...formData,
                                    description: text,
                                })
                            }
                            placeholder="Enter event description"
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.label}>Website Link</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.event_url}
                            onChangeText={(text) =>
                                setFormData({ ...formData, event_url: text })
                            }
                            placeholder="https://example.com"
                            keyboardType="url"
                        />
                        <Text style={styles.label}>Image</Text>
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                style={styles.imagePreview}
                            />
                        ) : formData.photo_url ? (
                            <Image
                                source={{ uri: formData.photo_url }}
                                style={styles.imagePreview}
                            />
                        ) : null}

                        <View style={styles.imageButtons}>
                            <Button
                                title="Choose Photo"
                                onPress={pickImage}
                                disabled={uploading}
                            />

                            {formData.photo_url && (
                                <Button
                                    title="Remove Photo"
                                    onPress={() => {
                                        setImage(null);
                                        setFormData({
                                            ...formData,
                                            photo_url: "",
                                        });
                                    }}
                                    color="#FF3B30"
                                />
                            )}
                        </View>

                        {/* {uploading && (
                            <ActivityIndicator
                                size="large"
                                style={styles.uploadIndicator}
                            />
                        )} */}

                        <View style={styles.dateContainer}>
                            <Text style={styles.label}>Date</Text>
                            <View style={styles.dateInputContainer}>
                                <DateTimePicker
                                    value={new Date(formData.event_time)}
                                    style={styles.dateInput}
                                    mode="datetime"
                                    minimumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) {
                                            setFormData({
                                                ...formData,
                                                event_time:
                                                    selectedDate.toISOString(),
                                            });
                                        }
                                    }}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Location</Text>
                        <Text style={styles.instruction}>
                            Tap on the map to select location
                        </Text>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: 51.1657,
                                longitude: 10.4515,
                                latitudeDelta: 30,
                                longitudeDelta: 30,
                            }}
                            onPress={handleMapPress}
                            showsCompass={false}
                            showsUserLocation={true}
                            showsMyLocationButton={true}
                            rotateEnabled={false}
                            pitchEnabled={false}
                        >
                            {formData.location && (
                                <Marker
                                    coordinate={{
                                        latitude: geometry[1],
                                        longitude: geometry[0],
                                    }}
                                />
                            )}
                        </MapView>

                        <Text style={styles.label}>Address (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.location}
                            onChangeText={(text) =>
                                setFormData({ ...formData, location: text })
                            }
                            placeholder="Enter human-readable address"
                        />

                        {/* </ScrollView> */}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        Save Changes
                                    </Text>
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
                                    <Text style={styles.buttonText}>
                                        Approve Event
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.rejectButton]}
                                onPress={handleReject}
                                disabled={isLoading}
                            >
                                <Text style={styles.buttonText}>
                                    Reject Suggestion
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
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
    ScrollViewContainer: {
        padding: 16,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        paddingBottom: 250,
    },
    // backButton: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     padding: 16,
    // },
    // backText: {
    //     marginLeft: 8,
    //     fontSize: 16,
    // },
    // header: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "space-between",
    //     // padding: 16,
    //     borderBottomWidth: 1,
    //     borderBottomColor: "#ccc",
    // },
    // label: {
    //     fontSize: 16,
    //     fontWeight: "600",
    //     marginTop: 12,
    //     marginBottom: 8,
    // },
    // input: {
    //     height: 40,
    //     borderColor: "#ccc",
    //     borderWidth: 1,
    //     borderRadius: 8,
    //     paddingHorizontal: 10,
    //     marginBottom: 15,
    // },
    multiline: {
        height: 100,
        textAlignVertical: "top",
    },
    picker: {
        height: 200,
        marginBottom: 15,
    },
    map: {
        height: 300,
        borderRadius: 8,
        marginBottom: 15,
    },
    instruction: {
        color: "#666",
        marginBottom: 8,
        fontStyle: "italic",
    },
    // buttonContainer: {
    //     flexDirection: "row",
    //     justifyContent: "space-around",
    //     marginTop: 20,
    //     marginBottom: 30,
    // },
    dateInput: {
        display: "flex",
        height: 40,
        width: "100%",
    },
    dateContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    dateInputContainer: {
        display: "flex",
        flexGrow: 0,
    },
    imagePreview: {
        width: "100%",
        height: 400,
        resizeMode: "contain",
        borderRadius: 8,
        marginBottom: 15,
    },
    imageButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 15,
    },
    uploadIndicator: {
        marginVertical: 10,
    },
});

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { supabase } from "@/utils/supabase";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@/hooks/useUser";
import { MaterialIcons } from "@expo/vector-icons";
import { formatToPostGisPoint, reverseGeocode } from "@/utils/geoUtils";
import { fetchEvents } from "@/utils/fetchEvents";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { ActivityIndicator } from "react-native";
import { uploadImageToSupabase } from "@/utils/storage";

const eventTypes = ["music", "sport", "conference", "festival", "exhibition"];

export default function AddEventPage() {
    const router = useRouter();
    const { user } = useUser();
    const [formData, setFormData] = useState({
        name: "",
        type: "music",
        description: "",
        link: "",
        photo: "" as string | null,
        date: new Date(),
        location: null as { lat: number; lng: number } | null,
        address: "",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Request camera roll permissions
    useEffect(() => {
        (async () => {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission required",
                    "Please enable photo access in settings"
                );
            }
        })();
    }, []);

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

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setFormData({
            ...formData,
            location: { lat: coordinate.latitude, lng: coordinate.longitude },
        });
    };

    const handleSubmit = async () => {
        if (!formData.location) {
            Alert.alert(
                "Location Required",
                "Please select a location on the map"
            );
            return;
        }

        if (!user) {
            Alert.alert(
                "Authentication Required",
                "Please log in to add events"
            );
            return;
        }

        let photoUrl = formData.photo;

        // Upload new image if selected
        if (image) {
            photoUrl = await uploadImage();
            if (!photoUrl) return;
        }

        setIsSubmitting(true);
        // Convert coordinates to PostGIS format
        const geometry = formatToPostGisPoint(
            formData.location.lng,
            formData.location.lat
        );

        try {
            const { error } = await supabase.from("event_suggestions").insert({
                title: formData.name,
                type: formData.type,
                description: formData.description,
                event_url: formData.link,
                photo_url: photoUrl,
                event_time: formData.date.toISOString(),
                location: formData.address,
                coordinates: geometry,
                organizer_id: user.id,
            });

            if (error) throw error;

            Alert.alert("Success", "Event added successfully");
            router.back();
        } catch (error) {
            console.error("Error adding event:", error);
            Alert.alert("Error", "Failed to add event");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // add a view to avoid keyboard overlap
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            // keyboardVerticalOffset={}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                                // margin: "auto",
                            }}
                        >
                            Submit an Event
                        </Text>
                        <Text style={{ width: 62 }} />
                    </View>
                    {/* if user is not logged in show a message to log in */}
                    {!user && (
                        <Text style={styles.error}>
                            Please log in to add an Event.
                        </Text>
                    )}
                    {user && (
                        <ScrollView
                            style={styles.container}
                            contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Text style={styles.label}>Event Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, name: text })
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
                                value={formData.link}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, link: text })
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
                            ) : formData.photo ? (
                                <Image
                                    source={{ uri: formData.photo }}
                                    style={styles.imagePreview}
                                />
                            ) : null}

                            <View style={styles.imageButtons}>
                                <Button
                                    title="Choose Photo"
                                    onPress={pickImage}
                                    disabled={uploading}
                                />

                                {formData.photo && (
                                    <Button
                                        title="Remove Photo"
                                        onPress={() => {
                                            setImage(null);
                                            setFormData({
                                                ...formData,
                                                photo: "",
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
                                        value={formData.date}
                                        style={styles.dateInput}
                                        mode="datetime"
                                        minimumDate={new Date()}
                                        onChange={(event, selectedDate) => {
                                            // setShowDatePicker(false);
                                            if (selectedDate) {
                                                setFormData({
                                                    ...formData,
                                                    date: selectedDate,
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
                                            latitude: formData.location.lat,
                                            longitude: formData.location.lng,
                                        }}
                                    />
                                )}
                            </MapView>

                            <Text style={styles.label}>Address (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.address}
                                onChangeText={(text) =>
                                    setFormData({ ...formData, address: text })
                                }
                                placeholder="Enter human-readable address"
                            />

                            <View style={styles.buttonContainer}>
                                <Button
                                    title={
                                        isSubmitting ? "Adding..." : "Add Event"
                                    }
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    color="#007AFF"
                                />
                                <Button
                                    title="Cancel"
                                    onPress={() => router.back()}
                                    color="#FF3B30"
                                />
                            </View>
                        </ScrollView>
                    )}
                </SafeAreaView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#282828",
    },
    scrollContainer: {
        paddingBottom: 50,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        // paddingHorizontal: 16,
    },
    backText: {
        marginLeft: 8,
        fontSize: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
        marginBottom: 30,
    },
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
    error: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
        // make it full height
        height: "100%",
        // flex: 1,
        // flexShrink: 0,
        // flexGrow: 1,
    },
});

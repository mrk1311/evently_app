import React, { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { supabase } from "@/utils/supabase";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@/hooks/useUser";
import { MaterialIcons } from "@expo/vector-icons";

const eventTypes = ["music", "sport", "conference", "festival", "exhibition"];

export default function AddEventPage() {
    const router = useRouter();
    const { user } = useUser();
    const [formData, setFormData] = useState({
        name: "",
        type: "music",
        description: "",
        link: "",
        photo: "",
        date: new Date(),
        location: null as { lat: number; lng: number } | null,
        address: "",
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("events").insert({
                name: formData.name,
                type: formData.type,
                description: formData.description,
                link: formData.link,
                photo: formData.photo,
                date: formData.date.toISOString(),
                location: formData.address,
                geometry: {
                    type: "Point",
                    coordinates: [formData.location.lng, formData.location.lat],
                },
                user_id: user.id,
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
                    Add New Event
                </Text>
                <Text style={{ width: 94 }} />
            </View>
            <ScrollView style={styles.container}>
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
                            label={type.charAt(0).toUpperCase() + type.slice(1)}
                            value={type}
                        />
                    ))}
                </Picker>

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.multiline]}
                    value={formData.description}
                    onChangeText={(text) =>
                        setFormData({ ...formData, description: text })
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

                <Text style={styles.label}>Image URL</Text>
                <TextInput
                    style={styles.input}
                    value={formData.photo}
                    onChangeText={(text) =>
                        setFormData({ ...formData, photo: text })
                    }
                    placeholder="https://example.com/photo.jpg"
                    keyboardType="url"
                />

                <View style={styles.dateContainer}>
                    <Text style={styles.label}>Date</Text>
                    <DateTimePicker
                        value={formData.date}
                        style={styles.dateInput}
                        mode="date"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    date: selectedDate,
                                });
                            }
                        }}
                    />
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
                        title={isSubmitting ? "Adding..." : "Add Event"}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
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
        // padding: 16,
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
        width: 100,
    },
    dateContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
});

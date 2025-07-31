import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
    Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useUser } from "@/hooks/useUser";
import { AntDesign } from "@expo/vector-icons";
import getMarkerColor from "@/functions/getMarkerColor";
import { EventSuggestion } from "@/types";

export default function AdminDashboard() {
    const navigation = useNavigation();
    const userData = useUser();
    const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch pending suggestions
    const fetchSuggestions = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("event_suggestions")
                .select("*")
                .eq("status", "pending")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSuggestions(data as EventSuggestion[]);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to load suggestions");
            } else {
                setError("Failed to load suggestions");
            }
            console.error("Error fetching suggestions:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    // Handle suggestion actions
    const handleSuggestionAction = async (
        id: string,
        action: "approve" | "reject"
    ) => {
        try {
            setIsLoading(true);

            if (action === "approve") {
                const suggestion = suggestions.find((s) => s.id === id);
                if (!suggestion) return;

                // Move to main events table
                await supabase.from("events").insert({
                    title: suggestion.title,
                    description: suggestion.description,
                    location: suggestion.location,
                    coordinates: suggestion.coordinates,
                    photo_url: suggestion.photo_url,
                    event_url: suggestion.event_url,
                    event_time: suggestion.event_time,
                    type: suggestion.type,
                    organizer_id: suggestion.user_id,
                });
            }

            // Update suggestion status
            await supabase
                .from("event_suggestions")
                .update({
                    status: action === "approve" ? "approved" : "rejected",
                })
                .eq("id", id);

            // Refresh list
            fetchSuggestions();
        } catch (err) {
            Alert.alert("Error", `Failed to ${action} suggestion`);
            console.error(err);
        }
    };

    const renderSuggestionCard = useCallback(
        ({ item }: { item: EventSuggestion }) => (
            <TouchableOpacity
                style={styles.cardContainer}
                // onPress={() =>
                // navigation.navigate("SuggestionDetail", {
                //     suggestion: item,
                // })
                // }
            >
                <Image
                    source={{
                        uri: item.photo_url || "https://via.placeholder.com/80",
                    }}
                    style={styles.cardImagePlaceholder}
                    resizeMode="cover"
                />

                <View
                    style={[
                        styles.typeIndicator,
                        { backgroundColor: getMarkerColor(item.type) },
                    ]}
                />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                onPress={() =>
                                    handleSuggestionAction(item.id, "approve")
                                }
                                style={styles.actionButton}
                            >
                                <AntDesign
                                    name="check"
                                    size={20}
                                    color="green"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() =>
                                    handleSuggestionAction(item.id, "reject")
                                }
                                style={styles.actionButton}
                            >
                                <AntDesign name="close" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.metaContainer}>
                        <Text style={styles.cardSubtitle}>
                            {item.type.toUpperCase()}
                        </Text>
                        <Text style={styles.cardDate}>
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>

                    <Text
                        style={styles.cardDescription}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.description}
                    </Text>

                    <Text style={styles.userInfo}>
                        Submitted by: {item.user_email || "Anonymous"}
                    </Text>
                </View>
            </TouchableOpacity>
        ),
        [suggestions]
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="chevron-left" size={24} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Suggestions</Text>
                <Text style={{ width: 94 }} />
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : suggestions.length === 0 ? (
                <Text style={styles.emptyText}>No pending suggestions</Text>
            ) : (
                <FlatList
                    data={suggestions}
                    renderItem={renderSuggestionCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
    loader: {
        marginTop: 20,
    },
    error: {
        color: "red",
        textAlign: "center",
        marginTop: 20,
        padding: 16,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
        color: "#666",
    },
    listContent: {
        paddingBottom: 16,
    },
    cardContainer: {
        flexDirection: "row",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#f0f0f0",
    },
    typeIndicator: {
        width: 6,
        position: "absolute",
        top: 16,
        bottom: 16,
        left: 0,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    cardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        marginRight: 8,
    },
    actionsContainer: {
        flexDirection: "row",
    },
    actionButton: {
        padding: 8,
        marginLeft: 4,
    },
    metaContainer: {
        flexDirection: "row",
        marginTop: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
    cardDate: {
        fontSize: 12,
        color: "#999",
        marginLeft: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: "#666",
        marginTop: 8,
    },
    userInfo: {
        fontSize: 12,
        color: "#888",
        marginTop: 8,
        fontStyle: "italic",
    },
});

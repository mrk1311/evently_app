import { Stack } from "expo-router";
import AdminDashboard from "./index";
import SuggestionDetails from "./suggestionDetails";

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Hide the header for all screens
            }}
        >
            <Stack.Screen
                name="admin-dashboard"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SuggestionDetails"
                options={{ title: "Edit Suggestion" }}
            />
        </Stack>
    );
}

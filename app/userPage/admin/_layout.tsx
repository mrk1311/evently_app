import { Stack } from "expo-router";
import AdminDashboard from "./index";
import SuggestionDetail from "./suggestionDetails";

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
                name="SuggestionDetail"
                options={{ title: "Edit Suggestion" }}
            />
        </Stack>
    );
}

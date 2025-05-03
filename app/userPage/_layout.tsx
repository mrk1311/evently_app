import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Hide the header for all screens
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="favourites" />
            <Stack.Screen name="addEvent" />
            <Stack.Screen name="settings" />
        </Stack>
    );
}

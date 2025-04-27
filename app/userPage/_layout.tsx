import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen name="auth" />
            <Stack.Screen name="favourites" />
            <Stack.Screen name="add-event" />
            <Stack.Screen name="settings" />
        </Stack>
    );
}

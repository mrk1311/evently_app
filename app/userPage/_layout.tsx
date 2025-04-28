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
            <Stack.Screen name="(user)/auth" />
            <Stack.Screen name="(user)/favourites" />
            <Stack.Screen name="(user)/add-event" />
            <Stack.Screen name="(user)/settings" />
        </Stack>
    );
}

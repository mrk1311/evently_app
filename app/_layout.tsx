import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MapProvider } from "@/contexts/MapContext";

export const unstable_settings = {
    initialRouteName: "index",
};

export default function RootLayout() {
    return (
        <GestureHandlerRootView>
            <FavoritesProvider>
                <MapProvider>
                    <Stack
                        screenOptions={{
                            // headerShown: false, // Hide the header for all screens
                            headerStyle: {
                                backgroundColor: "#282828", // Light background color
                            },
                            headerTitleStyle: {
                                color: "#ffffff", // Light text color
                            },
                            headerBackTitle: "Wróć", // Polish for "Back"
                            // headerShadowVisible: false, // Hide the shadow under the header
                        }}
                    >
                        <Stack.Screen
                            name="index"
                            options={{
                                headerTitle: "Map", // Custom title for the index screen
                                headerShown: false, // Hide the header for the index screen
                            }}
                        />
                        <Stack.Screen
                            name="userPage"
                            options={{
                                headerTitle: "Panel użytkownika", // Custom title for userPage
                            }}
                        />
                        <Stack.Screen
                            name="auth"
                            options={{
                                headerTitle: "Zaloguj się", // Custom title for auth screen
                            }}
                        />
                        <Stack.Screen
                            name="signup"
                            options={{
                                headerTitle: "Rejestracja", // Custom title for signup screen
                            }}
                        />
                        <Stack.Screen
                            name="favourites"
                            options={{
                                headerTitle: "Ulubione", // Custom title for favourites screen
                            }}
                        />
                        <Stack.Screen name="addEvent" />
                        <Stack.Screen name="settings" />
                        <Stack.Screen name="admin" />
                        <Stack.Screen name="confirm-email" />
                        <Stack.Screen
                            name="resetPassword"
                            options={{
                                headerTitle: "Resetuj hasło", // Custom title for resetPassword screen
                            }}
                        />
                    </Stack>
                </MapProvider>
            </FavoritesProvider>
        </GestureHandlerRootView>
    );
}

// małgosia

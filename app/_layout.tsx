import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export default function RootLayout() {
    return (
        <MenuProvider>
            <GestureHandlerRootView>
                <FavoritesProvider>
                    <Stack
                        screenOptions={{
                            headerShown: false, // Hide the header for all screens
                        }}
                    >
                        <Stack.Screen name="index" />
                        <Stack.Screen name="userPage" />
                    </Stack>
                </FavoritesProvider>
            </GestureHandlerRootView>
        </MenuProvider>
    );
}

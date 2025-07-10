import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { MapProvider } from "@/contexts/MapContext";

export default function RootLayout() {
    return (
        <MenuProvider>
            <GestureHandlerRootView>
                <FavoritesProvider>
                    <MapProvider>
                        <Stack
                            screenOptions={{
                                headerShown: false, // Hide the header for all screens
                            }}
                        >
                            <Stack.Screen name="index" />
                            <Stack.Screen name="userPage" />
                        </Stack>
                    </MapProvider>
                </FavoritesProvider>
            </GestureHandlerRootView>
        </MenuProvider>
    );
}

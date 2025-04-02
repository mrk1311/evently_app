import { FunctionComponent, memo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import * as Location from "expo-location";

interface Props {
    active: boolean;
    setLocation: (location: Location.LocationObject) => void;
}

const ShowUserLocationButton: FunctionComponent<Props> = memo(
    ({ active, setLocation }) => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }

        return (
            <TouchableOpacity
                style={styles.button}
                onPress={getCurrentLocation}
            >
                <MaterialIcons
                    name={active ? "my-location" : "location-searching"}
                    size={20}
                    color="#2196F3"
                    // style={styles.markerIcon}
                />
            </TouchableOpacity>
        );
    }
);

export default ShowUserLocationButton;

const styles = StyleSheet.create({
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 15,
        width: 50,
        height: 50,
        position: "absolute",
        bottom: 150,
        right: 20,
        backgroundColor: "white",
    },
});

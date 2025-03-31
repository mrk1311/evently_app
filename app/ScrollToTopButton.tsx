import { FunctionComponent, memo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

interface Props {
    active: boolean;
}

const ShowUserLocationButton: FunctionComponent<Props> = memo(({ active }) => {
    return (
        <TouchableOpacity
            style={styles.button}
            // onPress={}
        >
            <MaterialIcons
                name={"arrow-upward"}
                size={20}
                color="#fff"
                // style={styles.markerIcon}
            />
        </TouchableOpacity>
    );
});

export default ShowUserLocationButton;

const styles = StyleSheet.create({
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        width: 50,
        height: 50,
        position: "absolute",
        bottom: 150,
        right: 20,
        backgroundColor: "#2196F3",
    },
});

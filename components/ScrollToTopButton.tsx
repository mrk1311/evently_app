import { FunctionComponent, memo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

interface Props {
    active: boolean;
    listToTop: () => void;
    setButtonShown: (boolean: boolean) => void;
}

const ScrollToTopButton: FunctionComponent<Props> = memo(
    ({ active, listToTop, setButtonShown }) => {
        if (active) {
            return (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        listToTop();
                        setButtonShown(false);
                    }}
                >
                    <MaterialIcons
                        name={"arrow-upward"}
                        size={20}
                        color="#fff"
                        // style={styles.markerIcon}
                    />
                </TouchableOpacity>
            );
        } else return;
    }
);

export default ScrollToTopButton;

const styles = StyleSheet.create({
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        width: 50,
        height: 50,
        position: "absolute",
        bottom: 50,
        right: 30,
        backgroundColor: "#2196F3",
    },
});

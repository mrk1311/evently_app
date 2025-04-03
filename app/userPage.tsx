import { View, Text, StyleSheet } from "react-native";

export default function userPage() {
    return (
        <View style={styles.userPage}>
            <Text>User Page</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    userPage: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
    },
});

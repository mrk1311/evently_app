import React from "react";
import { View, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import getMarkerStyle from "../functions/getMarkerStyle";

interface EventMarkerProps {
    type: string | null;
    componentWidth: number;
    componentHeight: number;
    iconSize?: number;
}

const EventPhotoPlaceholder: React.FC<EventMarkerProps> = ({
    type,
    componentWidth,
    componentHeight,
    iconSize,
}) => {
    const { color, icon } = getMarkerStyle(type);

    return (
        <View
            style={[
                styles.markerWrapper,
                { height: componentHeight, width: componentWidth },
            ]}
        >
            <View style={[styles.marker, { backgroundColor: color }]}>
                {/* Diagonal Lines */}
                <View style={styles.patternContainer}>
                    {[...Array(componentHeight / 10)].map((_, i) => (
                        <View key={i} style={[styles.line, { top: i * 20 }]} />
                    ))}
                </View>

                {/* Vignette Overlay */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.35)"]}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Icon */}
                <FontAwesome5 name={icon} size={iconSize} color="white" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    markerWrapper: {
        borderRadius: 8,
        overflow: "hidden",
        marginHorizontal: 8,
        marginVertical: "auto",
    },
    marker: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    patternContainer: {
        ...StyleSheet.absoluteFillObject,
        // tranform to the left to fill the space after rotation
        left: -80,
        transform: [{ rotate: "-45deg" }],
    },
    line: {
        position: "absolute",
        width: "200%",
        height: 10,
        backgroundColor: "rgba(0,0,0,0.1)",
        left: -40, // keeps lines centered after rotation
    },
});

export default EventPhotoPlaceholder;

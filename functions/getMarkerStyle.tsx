type EventType =
    | "music"
    | "sport"
    | "conference"
    | "art"
    | "theatre"
    | "festival";

const getMarkerStyle = (type: string | null) => {
    const styles: Record<EventType, { color: string; icon: string }> = {
        music: { color: "#FF4081", icon: "music" },
        sport: { color: "#7C4DFF", icon: "football-ball" },
        conference: { color: "#00BCD4", icon: "users" },
        art: { color: "#FF9800", icon: "paint-brush" },
        theatre: { color: "#4CAF50", icon: "theater-masks" },
        festival: { color: "#9C27B0", icon: "sun" },
    };

    if (type && type in styles) {
        return styles[type as EventType];
    }
    // default if unknown or null
    return { color: "#2196F3", icon: "calendar" };
};

export default getMarkerStyle;

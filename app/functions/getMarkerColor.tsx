const getMarkerColor = (type: string | null) => {
    const colors: { [key: string]: string } = {
        music: "#FF4081",
        sport: "#7C4DFF",
        conference: "#00BCD4",
        art: "#FF9800",
        theatre: "#4CAF50",
        festival: "#9C27B0",
    };
    if (type !== null) {
        return colors[type] || "#2196F3";
    } else {
        return "#2196F3";
    }
};

export default getMarkerColor;

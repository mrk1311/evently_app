import React, { createContext, useContext, useState } from "react";

interface MapContextType {
    centerOnCoordinates: { latitude: number; longitude: number } | null;
    requestCenter: (coords: { latitude: number; longitude: number }) => void;
}

const MapContext = createContext<MapContextType>({
    centerOnCoordinates: null,
    requestCenter: () => {},
});

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [centerOnCoordinates, setCenterOnCoordinates] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const requestCenter = (coords: { latitude: number; longitude: number }) => {
        setCenterOnCoordinates(coords);
        setTimeout(() => setCenterOnCoordinates(null), 1000);
    };

    return (
        <MapContext.Provider value={{ centerOnCoordinates, requestCenter }}>
            {children}
        </MapContext.Provider>
    );
};

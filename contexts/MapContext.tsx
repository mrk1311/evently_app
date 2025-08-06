import React, { createContext, useContext, useState } from "react";

interface MapContextType {
    centerOnCoordinates: { latitude: number; longitude: number } | null;
    requestCenter: (coords: { latitude: number; longitude: number }) => void;
    eventIdForDetails: string | null;
    openEventDetailsOnMap: (eventId: string) => void;
}

const MapContext = createContext<MapContextType>({
    centerOnCoordinates: null,
    requestCenter: () => {},
    eventIdForDetails: null,
    openEventDetailsOnMap: () => {},
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

    const [eventIdForDetails, setEventIdForDetails] = useState<string | null>(
        null
    );

    const openEventDetailsOnMap = (eventId: string) => {
        setEventIdForDetails(eventId);
        setTimeout(() => setEventIdForDetails(null), 1000);
    };

    return (
        <MapContext.Provider
            value={{
                centerOnCoordinates,
                requestCenter,
                eventIdForDetails,
                openEventDetailsOnMap,
            }}
        >
            {children}
        </MapContext.Provider>
    );
};

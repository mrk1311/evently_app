import ClusteredMap from "./map";
import eventData from "../assets/markers.json";
import type { EventFeatureCollection } from "./map";

export default function App() {
    return <ClusteredMap data={eventData as EventFeatureCollection} />;
}

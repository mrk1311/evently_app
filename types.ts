export type EventSuggestion = {
    id: string;
    title: string;
    description: string;
    location: string;
    coordinates: string; // "SRID=4326;POINT(lng lat)"
    photo_url: string;
    event_url: string;
    event_time: Date;
    type: string;
    user_id: string;
    user_email?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
};
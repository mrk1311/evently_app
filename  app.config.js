module.exports = {
    expo: {
        name: "Your App Name",
        slug: "your-app-slug",
        // ... other existing config

        extra: {
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
        android: {
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                },
            },
        },
        ios: {
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
        },
    },
};

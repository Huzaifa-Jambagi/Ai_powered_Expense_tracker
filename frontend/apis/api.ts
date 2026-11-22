import axios from "axios";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
console.log("BACKEND URL:", process.env.EXPO_PUBLIC_BACKEND_URL);

api.interceptors.request.use((config) => {
    config.headers.set(
        "X-Timezone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    return config;
});


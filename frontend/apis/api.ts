import axios from "axios";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    config.headers.set(
        "X-Timezone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    return config;
});
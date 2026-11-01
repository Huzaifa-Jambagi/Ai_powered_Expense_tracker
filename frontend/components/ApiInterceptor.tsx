import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { api } from "../apis/api";

export default function ApiInterceptor() {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptorId = api.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        console.log(token);
        

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      }
    );

     return () => {
    api.interceptors.request.eject(interceptorId);
  };
  }, [getToken]);

  return null;
}
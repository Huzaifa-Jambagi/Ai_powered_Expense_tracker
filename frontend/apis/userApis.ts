import { api } from "./api";

export const getUserDetails = async () => {
  const { data } = await api.get("/api/v1/users/get");

  return data.data;
};
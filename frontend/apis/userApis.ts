import { api } from "./api";

export const getUserDetails = async () => {
  const { data } = await api.get("/api/v1/users/get");
    console.log("user fetched",data.data)
  return data.data;
};
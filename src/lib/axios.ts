import axios from "axios";
import { BOT_TOKEN } from "../config";

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const getAxiosInstance = () => {
  try{
  return {
    get(method: string, params: any){
      return axios({
        method: "get",
        url: `${BASE_URL}/${method}`,
        params: params,
      })
    },
    post(method: any, data: any) {
      return axios({
        method: "post",
        baseURL: BASE_URL,
        url: `/${method}`,
        data,
      });
    },
  };
} catch (error) {
  console.error("Error from getAxiosInstance:", error);
}
};

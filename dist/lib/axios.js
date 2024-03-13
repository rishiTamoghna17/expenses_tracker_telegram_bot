"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxiosInstance = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const BASE_URL = `https://api.telegram.org/bot${config_1.BOT_TOKEN}`;
const getAxiosInstance = () => {
    try {
        return {
            get(method, params) {
                return (0, axios_1.default)({
                    method: "get",
                    url: `${BASE_URL}/${method}`,
                    params: params,
                });
            },
            post(method, data) {
                return (0, axios_1.default)({
                    method: "post",
                    baseURL: BASE_URL,
                    url: `/${method}`,
                    data,
                });
            },
        };
    }
    catch (error) {
        console.error("Error from getAxiosInstance:", error);
    }
};
exports.getAxiosInstance = getAxiosInstance;

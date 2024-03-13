"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMessage = void 0;
const axios_1 = require("../lib/axios");
const sendMessage = (messageObject, messageText) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const axiosInstance = (0, axios_1.getAxiosInstance)();
        const response = axiosInstance && (yield axiosInstance.get("sendMessage", {
            chat_id: messageObject.chat.id,
            text: messageText,
        }));
        console.log("Message sent successfully:", response && response.data);
        return response;
    }
    catch (error) {
        console.error("Error from sendMessage:", error);
        // Handle the error appropriately, e.g., log it or send an error message to the user
    }
});
const handleMessage = (messageObject) => {
    try {
        const messageText = messageObject.text || "";
        if (messageText[0] === "/") {
            const commend = messageText.substr(1);
            switch (commend) {
                case "start":
                    return sendMessage(messageObject, "Hello, how can I help you?");
                default:
                    return sendMessage(messageObject, "I don't understand you");
            }
        }
        else {
            //we send some message back to the user
            return sendMessage(messageObject, messageText);
        }
    }
    catch (error) {
        console.error("Error from handleMessage:", error);
    }
};
exports.handleMessage = handleMessage;

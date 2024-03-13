import { getAxiosInstance } from "../lib/axios";

const sendMessage = async(messageObject: any, messageText: string) => {
  try {
    const axiosInstance = getAxiosInstance();
    const response = axiosInstance && await axiosInstance.get("sendMessage", {
      chat_id: messageObject.chat.id,
      text: messageText,
    }) ;
    console.log("Message sent successfully:", response &&response.data);
    return response;
  } catch (error) {
    console.error("Error from sendMessage:", error);
    // Handle the error appropriately, e.g., log it or send an error message to the user
  }
};

export const handleMessage = (messageObject: any) => {
  try{
    const messageText = messageObject.text || "";
    if (messageText[0] === "/") {
      const commend = messageText.substr(1);
      switch (commend) {
        case "start":
          return sendMessage(messageObject, "Hello, how can I help you?");
        default:
          return sendMessage(messageObject, "I don't understand you");
      }
    } else {
      //we send some message back to the user
      return sendMessage(messageObject, messageText);
    }
  }catch (error){
    console.error("Error from handleMessage:", error);
  }
 
};

import { getAxiosInstance } from '../lib/axios';
import { getAccessTOken, getNewUrl } from '../lib/google_auth';
import { getRefreshTokenFromDb } from './dbHandler';
import { readSheetValues } from './googleSheet';
export const chat_id = '1149737484';
const sendMessage = async (messageObject: any, messageText: string) => {
  try {
    const axiosInstance = getAxiosInstance();
    const response =
      axiosInstance &&
      (await axiosInstance.get('sendMessage', {
        chat_id: messageObject.chat.id,
        text: messageText,
      }));
    console.log('Message sent successfully:', response && response.data);
    return response;
  } catch (error) {
    console.error('Error from sendMessage:', error);
    // Handle the error appropriately, e.g., log it or send an error message to the user
  }
};

export const handleMessage = async (messageObject: any) => {
  try {
    const messageText = messageObject.text || '';
    if (messageText[0] === '/') {
      const commend = messageText.substr(1);
      switch (commend) {
        case 'start':
          return sendMessage(messageObject, 'Hello, how can I help you?');
        case 'getlogin':
          const data = await getNewUrl();
          const parseUrl = data.config.url?.replace(/\s/g, '');
          return parseUrl && (await sendMessage(messageObject, parseUrl));
        case 'getspreadSheet':
          const refreshtoken = await getRefreshTokenFromDb();
          // console.log("refreshtoken---------->", refreshtoken);
          const accessTokenData = await getAccessTOken(refreshtoken);
          const spreadsheetId = '15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM';
          const range = 'A2:B2'; // Adjust range as needed
          // console.log("accessTokenData---------->", accessTokenData.data.access_token);
          const getSpreadsheet = await readSheetValues(
            spreadsheetId,
            accessTokenData.data.access_token,
            range,
          );
          // console.log("data--------->>",getSpreadsheet?.data?.spreadsheetUrl)
          return await sendMessage(messageObject, getSpreadsheet?.data?.spreadsheetUrl);
        default:
          return sendMessage(messageObject, "I don't understand you");
      }
    } else {
      //we send some message back to the user
      return sendMessage(messageObject, messageText);
    }
  } catch (error) {
    console.error('Error from handleMessage:', error);
  }
};

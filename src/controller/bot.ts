import { getAxiosInstance } from '../lib/axios';
import { getGoogleAuth, getNewUrl } from '../lib/google_auth';
import { checkAccessToken } from '../utils';
import { getRefreshTokenFromDb } from './dbHandler';
import { createSpreadsheet, editSpreadsheet, readSheetValues } from './googleSheet';
import { getFromSheetsUinggGoogleSdk } from './googlesheet-sdk';
export const chat_id = '1149737484';
export const sendMessage = async (messageObject: any, messageText: string) => {
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

        case 'log_in':
          const data = await getNewUrl();
          const parseUrl = data && data.config.url?.replace(/\s/g, '');
          return parseUrl && (await sendMessage(messageObject, parseUrl));

        case 'creat_spread_sheet':
          const accessToken = await checkAccessToken(messageObject);
          const newSpreadsheet = await createSpreadsheet('new_TEST_sheet', accessToken);
          return sendMessage(messageObject, newSpreadsheet.spreadsheetId);

        case 'get_spread_sheet':
          const accessTokenData = await checkAccessToken(messageObject);

          // const spreadsheetId = '1kAG7L2PwjpOv1qUptalc93QlXgrXIMtx-MCVP4CZ1eU';
          // const range = 'A2:B2';
          // const getSpreadsheet = await readSheetValues(spreadsheetId, accessTokenData, range);
          const getGoogleAuthData = getGoogleAuth(accessTokenData);
          const req = {
            range: 'A2:B2',
            spreadsheetId: '15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM',
            auth: getGoogleAuthData,
          };
          const getSpreadsheet = await getFromSheetsUinggGoogleSdk(req);
          if (!getSpreadsheet) {
            return sendMessage(messageObject, 'you are not othorized to do that!!!!');
          }
          console.log('getSpreadsheet---->>', getSpreadsheet, 'end-----------\\');
          return await sendMessage(messageObject, 'getSpreadsheet?.data?.spreadsheetUrl');
        case 'test':
          const spreadSheetId = '1kAG7L2PwjpOv1qUptalc93QlXgrXIMtx-MCVP4CZ1eU';
          const accessTokn = await checkAccessToken(messageObject);
          const test = await editSpreadsheet(spreadSheetId, accessTokn);
          console.log('test------------>', test?.data);
          if (!test) {
            return sendMessage(messageObject, 'test not found');
          }
          return sendMessage(messageObject, test?.data?.spreadsheetId);
        default:
          return sendMessage(messageObject, "I don't understand you");
      }
    } else {
      return sendMessage(messageObject, messageText);
    }
  } catch (error) {
    console.error('Error from handleMessage:', error);
  }
};

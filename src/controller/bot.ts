import { getAxiosInstance } from '../lib/axios';
import { getGoogleAuth, getNewUrl } from '../lib/google_auth';
import {
  TOdayDate,
  checkAccessToken,
  getCurrentMonth,
  isFirstDateOfMonth,
  userName,
} from '../utils';
import { getRefreshTokenFromDb, getSpreadSheetFromDb, updatespreadsheetIdInDB } from './dbHandler';
import {
  appendRow,
  createSheet,
  createSpreadsheet,
  editSpreadsheet,
  getAllSheetIds,
  getLatestSheetId,
  getSheetName,
  readSheetValues,
} from './googleSheet';
import {
  editSpreadsheetUingGoogleSdk,
  getFromSheetsUingGoogleSdk,
  rowEntry,
} from './googlesheet-sdk';
import {
  addExpenses,
  createSpreadSheetProcess,
  editExpenses,
  getDataFromSpecificSheet,
} from './messageHandler';
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
      const commend = messageText.substr(1).split(' ')[0];
      switch (commend) {
        case 'start':
          return sendMessage(messageObject, 'Hello, how can I help you?');

        case 'log_in':
          const data = await getNewUrl();
          const parseUrl = data && data.config.url?.replace(/\s/g, '');
          return parseUrl && (await sendMessage(messageObject, parseUrl));

        case 'creat_spread_sheet':
          sendMessage(messageObject, 'creating Spreadsheet..... just wait a second.........');
          const newSpreadsheet = await createSpreadSheetProcess(messageObject);
          const newSpreadsheetUrl = newSpreadsheet && newSpreadsheet.data;
          console.log('newSpreadsheet---->>', newSpreadsheet);
          return sendMessage(
            messageObject,
            `Your first Spreadsheet created successfully!!!! \n The spreadsheet name is: Monthly expense report \n The spreadsheet url is: ${newSpreadsheetUrl}`,
          );

        case 'new':
          const addExpense = await addExpenses(messageObject);
          return (
            addExpense.tableRange && sendMessage(messageObject, 'Expenses are added successfully')
          );

        case 'edit':
          const editExpense = await editExpenses(messageObject);
          return editExpense && sendMessage(messageObject, 'Expenses are edited successfully');
        case 'get_spread_sheet':
          const accessTokenData = await checkAccessToken(messageObject);

          // const spreadsheetId = '1kAG7L2PwjpOv1qUptalc93QlXgrXIMtx-MCVP4CZ1eU';
          // const range = 'A2:B2';
          // const getSpreadsheet = await readSheetValues(spreadsheetId, accessTokenData, range);
          const getGoogleAuthData = getGoogleAuth(accessTokenData);
          const spreadSheetId = await getSpreadSheetFromDb(userName(messageObject));
          const req = {
            range: 'April-expense!A3:A',
            spreadsheetId: spreadSheetId,
            auth: getGoogleAuthData,
          };
          const getSpreadsheet = await getFromSheetsUingGoogleSdk(req);
          if (!getSpreadsheet) {
            return sendMessage(messageObject, 'you are not othorized to do that!!!!');
          }
          console.log('getSpreadsheet---->>', getSpreadsheet, 'end-----------\\');
          return await sendMessage(messageObject, 'getSpreadsheet?.data?.spreadsheetUrl');

        case 'test':
          // console.log('user name-------->>', userName(messageObject));
          // const test = await getDataFromSpecificSheet({ messageObject: messageObject });
          // console.log('test===========>>', test);
          // createSheet()
          // const spreadSheetId = '1LlJmduV-w0dUIONdEzV3J6eecW94V-e3pDrUtwtXZa0';
          // const accessTokn = await checkAccessToken(messageObject);
          // // const sheetId = await getLatestSheetId(spreadSheetId, accessTokn);
          // const test = await getSheetName(spreadSheetId, accessTokn);
          // console.log('test------------>', test);
          // if (!test) {
          //   return sendMessage(messageObject, 'test not found');
          // }
          return sendMessage(messageObject, 'test run successfully');

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

import { getAxiosInstance } from '../lib/axios';
import { getGoogleAuth, getNewUrl } from '../lib/google_auth';
import {
  TOdayDate,
  checkAccessToken,
  getCurrentMonth,
  isFirstDateOfMonth,
  userName,
  valuesFromMessage,
} from '../utils';
import { getRefreshTokenFromDb, getSpreadSheetFromDb, updatespreadsheetIdInDB } from './dbHandler';
import {
  appendRow,
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
import { addExpenses, createSpreadSheetProcess } from './messageHandler';
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
          const accessToken = await checkAccessToken(messageObject);

          const createSpreadParams = {
            access_token: accessToken,
            sheetTitle: `${getCurrentMonth(new Date())}-expense`,
            messageObject: messageObject,
            title: 'Monthly expense report',
          };
          const newSpreadsheet = await createSpreadSheetProcess(createSpreadParams);
          const newSpreadsheetUrl = newSpreadsheet && newSpreadsheet.data;
          console.log('newSpreadsheet---->>', newSpreadsheet);
          return sendMessage(
            messageObject,
            `Your first Spreadsheet created successfully!!!! \n The spreadsheet name is: MOnthly expense report \n The spreadsheet url is: ${newSpreadsheetUrl}`,
          );

        case 'new':
          // const date = new Date()
          const testdate = new Date(2024, 2, 1);
          const formattedDate = TOdayDate(testdate);
          if (isFirstDateOfMonth(testdate)) {
            sendMessage(messageObject, 'new month');
          }
          console.log('testdate->', testdate, 'formattedDate->', formattedDate);
          const addExpense = await addExpenses(messageObject);
          return (
            addExpense.tableRange && sendMessage(messageObject, 'Expenses are added successfully')
          );

        case 'get_spread_sheet':
        // const accessTokenData = await checkAccessToken(messageObject);

        // // const spreadsheetId = '1kAG7L2PwjpOv1qUptalc93QlXgrXIMtx-MCVP4CZ1eU';
        // // const range = 'A2:B2';
        // // const getSpreadsheet = await readSheetValues(spreadsheetId, accessTokenData, range);
        // const getGoogleAuthData = getGoogleAuth(accessTokenData);
        // const req = {
        //   range: 'March Expenses!A2:A',
        //   spreadsheetId: '15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM',
        //   auth: getGoogleAuthData,
        // };
        // const getSpreadsheet = await getFromSheetsUingGoogleSdk(req);
        // if (!getSpreadsheet) {
        //   return sendMessage(messageObject, 'you are not othorized to do that!!!!');
        // }
        // console.log('getSpreadsheet---->>', getSpreadsheet, 'end-----------\\');
        // return await sendMessage(messageObject, 'getSpreadsheet?.data?.spreadsheetUrl');

        case 'test':
          console.log('user name-------->>', userName(messageObject));

          // const spreadSheetId = '1LlJmduV-w0dUIONdEzV3J6eecW94V-e3pDrUtwtXZa0';
          // const accessTokn = await checkAccessToken(messageObject);
          // // const sheetId = await getLatestSheetId(spreadSheetId, accessTokn);
          // const test = await getSheetName(spreadSheetId, accessTokn);
          // console.log('test------------>', test);
          // if (!test) {
          //   return sendMessage(messageObject, 'test not found');
          // }
          return sendMessage(messageObject, 'test run successfully');

        // case 'test-2':
        //   const spreadSheetId = '1PrlC-OZfMdIeL_Czf7ScphddKM3Fs9Q8glZ634RgSsA';
        //   const accessTokn = await checkAccessToken(messageObject);
        //   const rex = { spreadSheetId: spreadSheetId, accessTokn: accessTokn, sheetId: 386568529 };
        //   const test = await editSpreadsheetUingGoogleSdk(rex);
        //   console.log('test------------>', test);
        //   if (!test) {
        //     return sendMessage(messageObject, 'test not found');
        //   }
        //   return sendMessage(messageObject, test?.data?.spreadsheetId);

        // case 'test-3':
        //   const spreadSheetId = '1PrlC-OZfMdIeL_Czf7ScphddKM3Fs9Q8glZ634RgSsA';
        //   const accessTokn = await checkAccessToken(messageObject);
        //   const rex = { spreadSheetId: spreadSheetId, accessTokn: accessTokn, range: "marge-table-1!A:B:C" };
        //   const test = await rowEntry(rex);
        //   console.log('test------------>', test);
        //   if (!test) {
        //     return sendMessage(messageObject, 'test not found');
        //   }
        //   return sendMessage(messageObject, "data updated successfully");

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

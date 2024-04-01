import { getAxiosInstance } from '../lib/axios';
import { getGoogleAuth, getNewUrl } from '../lib/google_auth';
import { TOdayDate, checkAccessToken, valuesFromMessage } from '../utils';
import { getRefreshTokenFromDb } from './dbHandler';
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
          const reqe = {
            title: 'new_TEST_sheet',
            access_token: accessToken,
            sheetTitle: 'test_spread_sheet',
          };
          const newSpreadsheet = await createSpreadsheet(reqe);
          const spreadsheetId1 = newSpreadsheet.spreadsheetId;
          const latestSheet = await getLatestSheetId(spreadsheetId1, accessToken);
          const sheetTitle = 'test_spread_sheet';
          latestSheet &&
            (await editSpreadsheet(spreadsheetId1, accessToken, latestSheet, sheetTitle));
          const parameter = {
            spreadsheetId: spreadsheetId1,
            accessToken: accessToken,
            range: `${sheetTitle}!A:F`,
            values: [['Data', 'Category', 'Amount', 'Payment Method', 'Daily expenses']],
          };
          const secondRow = await appendRow(parameter);
          console.log('secondRow---->>', secondRow);
          sendMessage(messageObject, 'Spreadsheet created successfully!!!!');
          return sendMessage(messageObject, newSpreadsheet.spreadsheetUrl);

        case 'get_spread_sheet':
          const accessTokenData = await checkAccessToken(messageObject);

          // const spreadsheetId = '1kAG7L2PwjpOv1qUptalc93QlXgrXIMtx-MCVP4CZ1eU';
          // const range = 'A2:B2';
          // const getSpreadsheet = await readSheetValues(spreadsheetId, accessTokenData, range);
          const getGoogleAuthData = getGoogleAuth(accessTokenData);
          const req = {
            range: 'March Expenses!A2:A',
            spreadsheetId: '15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM',
            auth: getGoogleAuthData,
          };
          const getSpreadsheet = await getFromSheetsUingGoogleSdk(req);
          if (!getSpreadsheet) {
            return sendMessage(messageObject, 'you are not othorized to do that!!!!');
          }
          console.log('getSpreadsheet---->>', getSpreadsheet, 'end-----------\\');
          return await sendMessage(messageObject, 'getSpreadsheet?.data?.spreadsheetUrl');

        // case 'new':
        //   const spreadSheetId = '1PrlC-OZfMdIeL_Czf7ScphddKM3Fs9Q8glZ634RgSsA';
        //   const accessTokn = await checkAccessToken(messageObject);
        //   const value = valuesFromMessage(messageObject);

        //   console.log('value---------->', value);
        //   const range = 'marge-table-first!A:F';
        //   const rex = {
        //     spreadsheetId: spreadSheetId,
        //     accessToken: accessTokn,
        //     range: range,
        //     values: [value],
        //   };
        //   const test = await appendRow(rex);
        //   console.log('test------------>', test);
        //   if (!test) {
        //     return sendMessage(messageObject, 'test not found');
        //   }
        //   return sendMessage(messageObject, 'data updated successfully');

        case 'test':
          const spreadSheetId = '19EKwLduOTWv_qnHIwNb22OdW1s3lfKkrrj3t8RD8OO4';
          const accessTokn = await checkAccessToken(messageObject);
          const sheetId = await getLatestSheetId(spreadSheetId, accessTokn);
          const test = sheetId && (await getSheetName(spreadSheetId, accessTokn, sheetId));
          console.log('test------------>', test);
          if (!test) {
            return sendMessage(messageObject, 'test not found');
          }
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

import { getGoogleAuth } from '../lib/google_auth';
import {
  TOdayDate,
  checkAccessToken,
  getCurrentMonth,
  isFirstDateOfMonth,
  userName,
  valuesFromMessage,
} from '../utils';
import { sendMessage } from './bot';
import { getSpreadSheetFromDb, updatespreadsheetIdInDB } from './dbHandler';
import {
  getLatestSheetId,
  editSpreadsheet,
  appendRow,
  createSpreadsheet,
  createSheet,
} from './googleSheet';
import { getFromSheetsUingGoogleSdk } from './googlesheet-sdk';

export const createSpreadSheetProcess = async (req: any) => {
  try {
    const { access_token, sheetTitle, messageObject } = req;
    const newSpreadsheet = await createSpreadsheet(req);
    const spreadsheetId = newSpreadsheet.spreadsheetId;
    await updatespreadsheetIdInDB(spreadsheetId, userName(messageObject));
    const latestSheet = await getLatestSheetId(spreadsheetId, access_token);
    const parameter = {
      access_token: access_token,
      sheetTitle: sheetTitle,
      spreadsheetId: spreadsheetId,
      sheetId: latestSheet,
    };
    const secondRow = await addSheet(parameter);
    return (
      secondRow && {
        message: 'Spreadsheet created successfully',
        data: newSpreadsheet.spreadsheetUrl,
      }
    );
  } catch (err) {
    console.log({ message: 'err in createSpreadsheet', err: err });
  }
};
const addSheet = async (req: any) => {
  try {
    const { access_token, sheetTitle, spreadsheetId, sheetId } = req;
    await editSpreadsheet(spreadsheetId, access_token, sheetId, sheetTitle);
    const parameter = {
      spreadsheetId: spreadsheetId,
      accessToken: access_token,
      range: `${sheetTitle}!A:E`,
      values: [['Data', 'Category', 'Amount', 'Payment Method', 'Daily expenses']],
      backgroundColor: true,
      sheetId: sheetId,
    };
    const secondRow = await appendRow(parameter);
    return secondRow;
  } catch (err) {
    console.log({ message: 'err in addSheet', err: err });
  }
};
export const addExpenses = async (messageObject: any) => {
  try {
    const spreadSheetId = await getSpreadSheetFromDb(userName(messageObject));
    const accessTokn = await checkAccessToken(messageObject);
    const date = new Date();
    const sheetTitle = `${getCurrentMonth(date)}-expense`;

    console.log('to date---------: ', TOdayDate(date));
    const todayString = TOdayDate(date);
    const sheetrange = `${sheetTitle}!A3:A`;
    const req = { messageObject: messageObject, range: sheetrange };
    const dateArr = await getDataFromSpecificSheet(req);
    // console.log('dateArr---------: ' , dateArr);
    if (dateArr.includes(todayString)) {
      console.log('Date present');
    } else {
      console.log('Date npt present present');
    }

    const expenseData = valuesFromMessage(messageObject);
    console.log(' expenseData---------: ', expenseData);
    const totalDailyExpenseValue = dailyExpenseValues({ value: expenseData, date: date });
    console.log(' totalDailyExpenseValue---------: ', totalDailyExpenseValue);

    const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, accessTokn));
    const rex = {
      spreadsheetId: spreadSheetId,
      accessToken: accessTokn,
      range: `${sheetTitle}!A:E`,
      values: [expenseData],
      sheetId: sheetId,
    };

    const testdate = new Date(2024, 8, 1);
    const formattedDate = TOdayDate(testdate);
    if (isFirstDateOfMonth(date)) {
      const sheetParams = {
        spreadsheetId: spreadSheetId,
        access_token: accessTokn,
        sheetTitle: `${getCurrentMonth(testdate)}-expense`,
      };
      const newSheet = await createSheet(sheetParams);
      const sheetId = newSheet.replies[0].addSheet.properties.sheetId;
      const sheetTitle = `${getCurrentMonth(testdate)}-expense`;
      const parameter = {
        access_token: accessTokn,
        sheetTitle: sheetTitle,
        spreadsheetId: spreadSheetId,
        sheetId: sheetId,
      };
      const addNewSheet = await addSheet(parameter);
      console.log('addNewSheet---->>', addNewSheet);
      const rex = {
        spreadsheetId: spreadSheetId,
        accessToken: accessTokn,
        range: `${sheetTitle}!A:E`,
        values: [totalDailyExpenseValue],
        sheetId: sheetId,
      };

      console.log('check------------>1', rex);
      const expenseAdded = await appendRow(rex);
      console.log('check------------>2');
      sendMessage(messageObject, 'new sheet added for this month');
      return expenseAdded;
    }

    console.log('check------------>3');

    console.log('testdate->', testdate, 'formattedDate->', formattedDate);

    const expenseAdded = await appendRow(rex);
    console.log('expenseAdded------------>', expenseAdded);
    if (!expenseAdded) {
      return sendMessage(
        messageObject,
        'sorry, internal issues were not able to process your request',
      );
    }
    return expenseAdded;
  } catch (err) {
    console.log({ message: 'err in addExpenses', err: err });
  }
};

export const dailyExpenseValues = (req: any) => {
  try {
    const { value, date } = req;
    const calculateDate = dateForCalculation(date);
    const dailyExpense = `=SUMIFS(C3:C, A3:A, ${calculateDate})`;
    value.push(dailyExpense);
    return value;
  } catch (err) {
    console.log({ message: 'err in dailyExpenseValues', err: err });
  }
};

export const dateForCalculation = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // January is 0
  const day = date.getDate();
  return `DATE(${year},${month},${day})`;
};

export const getDataFromSpecificSheet = async (req: any) => {
  try {
    const { messageObject, range } = req;
    const accessTokenData = await checkAccessToken(messageObject);
    const getGoogleAuthData = getGoogleAuth(accessTokenData);
    const spreadSheetId = await getSpreadSheetFromDb(userName(messageObject));
    const params = {
      range: range,
      spreadsheetId: spreadSheetId,
      auth: getGoogleAuthData,
    };
    const getSpreadsheet = await getFromSheetsUingGoogleSdk(params);
    if (!getSpreadsheet) {
      return sendMessage(messageObject, 'you are not othorized to do that!!!!');
    }
    const extractDates = (getSpreadsheet as any)?.map((entry: any[]) => entry[0]);
    return extractDates;
  } catch (err) {
    console.log({ message: 'err in getDataFromSpecificSheet', err: err });
  }
};

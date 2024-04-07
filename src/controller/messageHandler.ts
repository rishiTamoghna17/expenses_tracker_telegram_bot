import { getGoogleAuth } from '../lib/google_auth';
import {
  TOdayDate,
  checkAccessToken,
  dateForCalculation,
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
    // const date = new Date(2024, 0, 2)
    const sheetTitle = `${getCurrentMonth(date)}-expense`;

    console.log('to date---------: ', TOdayDate(date));
    const todayString = TOdayDate(date);
    const sheetrange = `${sheetTitle}!A3:A`;
    const req = { messageObject: messageObject, range: sheetrange };
    const dateValueArr = await getDataFromSpecificSheet(req);
    console.log('dateValueArr---------: ', dateValueArr);
    let expenseData: any;
    if (dateValueArr && dateValueArr?.includes(todayString)) {
      const valuesFromMessageParams = { messageObject: messageObject, date: date };
      expenseData = valuesFromMessage(valuesFromMessageParams);
      console.log('Date present');
    } else {
      const valuesFromMessageParams = { messageObject: messageObject, date: date };
      const value = valuesFromMessage(valuesFromMessageParams);
      expenseData = dailyExpenseValues({ value: value, date: date });
      console.log(' totalDailyExpenseValue---------: ', expenseData);
      console.log('Date npt present present');
    }

    // const expenseData = valuesFromMessage(messageObject);
    // console.log(' expenseData---------: ', expenseData);
    // const totalDailyExpenseValue = dailyExpenseValues({ value: expenseData, date: date });
    // console.log(' totalDailyExpenseValue---------: ', totalDailyExpenseValue);

    const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, accessTokn));
    const rex = {
      spreadsheetId: spreadSheetId,
      accessToken: accessTokn,
      range: `${sheetTitle}!A:E`,
      values: [expenseData],
      sheetId: sheetId,
    };

    if (isFirstDateOfMonth(date) && dateValueArr === null) {
      const sheetParams = {
        spreadsheetId: spreadSheetId,
        access_token: accessTokn,
        sheetTitle: `${getCurrentMonth(date)}-expense`,
      };
      const newSheet = await createSheet(sheetParams);
      const sheetId = newSheet.replies[0].addSheet.properties.sheetId;
      const sheetTitle = `${getCurrentMonth(date)}-expense`;
      const parameter = {
        access_token: accessTokn,
        sheetTitle: sheetTitle,
        spreadsheetId: spreadSheetId,
        sheetId: sheetId,
      };
      const addNewSheet = await addSheet(parameter);
      console.log('addNewSheet---->>', addNewSheet);
      const valueForNewSheetParams = { messageObject: messageObject, date: date };
      const valueForNewSheet = valuesFromMessage(valueForNewSheetParams);
      console.log(' expenseData---------: ', expenseData);
      const expenseDataForNewSheet = dailyExpenseValues({ value: valueForNewSheet, date: date });

      const paramForNewSheet = {
        spreadsheetId: spreadSheetId,
        accessToken: accessTokn,
        range: `${sheetTitle}!A:E`,
        values: [expenseDataForNewSheet],
        sheetId: sheetId,
      };

      const expenseAdded = await appendRow(paramForNewSheet);
      sendMessage(messageObject, 'new sheet added for this month');
      return expenseAdded;
    }

    // console.log('testdate->', testdate, 'formattedDate->', formattedDate);

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
    console.log('calculateDate------->>', calculateDate);
    const dailyExpense = `=SUMIFS(C3:C, A3:A, ${calculateDate})`;
    value.push(dailyExpense);
    return value;
  } catch (err) {
    console.log({ message: 'err in dailyExpenseValues', err: err });
  }
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
    console.log('getSpreadsheet', getSpreadsheet);
    if (!getSpreadsheet) {
      return null;
    }
    const extractDates = (getSpreadsheet as any)?.map((entry: any[]) => entry[0]);
    console.log('extractDates----->', extractDates);
    return extractDates;
  } catch (err) {
    console.log({ message: 'err in getDataFromSpecificSheet', err: err });
    return null;
  }
};

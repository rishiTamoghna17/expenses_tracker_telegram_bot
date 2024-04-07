import { getGoogleAuth } from '../lib/google_auth';
import {
  TOdayDate,
  checkAccessToken,
  dateForCalculation,
  editedDateFromMessage,
  editedValuesFromMessage,
  getCurrentMonth,
  getCurrentYear,
  isFirstDateOfMonth,
  removeEmptyElements,
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

export const createSpreadSheetProcess = async (messageObject: any) => {
  try {
    const access_token = await checkAccessToken(messageObject);
    const spreadSheetId = await getSpreadSheetFromDb(userName(messageObject));
    if (spreadSheetId) {
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadSheetId}`;
      return {
        message:
          'Spreadsheet is present in your google account. \n if you delete this spreadsheet, please use url and restore it.',
        data: spreadsheetUrl,
      };
    }
    const date = new Date();
    const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
    const title = 'Monthly expense report';
    const req = {
      access_token: access_token,
      sheetTitle: sheetTitle,
      messageObject: messageObject,
      title: title,
    };
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
        message: `Spreadsheet created successfully!!! \n The spreadsheet name is: ${title}`,
        data: newSpreadsheet.spreadsheetUrl,
      }
    );
  } catch (err) {
    console.log({ message: 'err in createSpreadsheet', err: err });
  }
};

export const addExpenses = async (messageObject: any) => {
  try {
    const spreadSheetId = await getSpreadSheetFromDb(userName(messageObject));
    const accessToken = await checkAccessToken(messageObject);
    const date = new Date();
    // const date = new Date(2024, 2, 3);
    const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;

    console.log('to date---------: ', TOdayDate(date));
    const todayString = TOdayDate(date);
    const sheetrange = `${sheetTitle}!A3:A`;
    const req = {
      range: sheetrange,
      accessToken: accessToken,
      spreadSheetId: spreadSheetId,
      messageObject: messageObject,
    };
    const dateValueArr = await getDataFromSpecificSheet(req);
    console.log('dateValueArr---------: ', dateValueArr); //
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
      console.log('Date not present present');
    }

    const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, accessToken));
    const rex = {
      spreadsheetId: spreadSheetId,
      accessToken: accessToken,
      range: `${sheetTitle}!A:E`,
      values: [expenseData],
      sheetId: sheetId,
    };

    if (isFirstDateOfMonth(date) && dateValueArr === null) {
      const sheetParams = {
        spreadsheetId: spreadSheetId,
        access_token: accessToken,
        sheetTitle: `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`,
      };
      const newSheet = await createSheet(sheetParams);
      const sheetId = newSheet.replies[0].addSheet.properties.sheetId;
      const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
      const parameter = {
        access_token: accessToken,
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
        accessToken: accessToken,
        range: `${sheetTitle}!A:E`,
        values: [expenseDataForNewSheet],
        sheetId: sheetId,
      };

      const expenseAdded = await appendRow(paramForNewSheet);
      sendMessage(messageObject, 'new sheet added for this month');
      return expenseAdded;
    }
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

export const editExpenses = async (messageObject: any) => {
  try {
    const messageText = (messageObject as { text: string }).text || '';
    const messagetext = messageText.substr(1).split(' ');
    // messageObject.
    // [[date, 'Groceries', '7000', 'online', 'Daily expenses']];
    const messages = removeEmptyElements(messagetext);
    console.log('check------------>>>1', messages);
    if (messages.length < 5) {
      return sendMessage(
        messageObject,
        `Sorry, your command looks like this : ${messageObject.text} \n your command must look like \n this: /edit date catagory amount paymentMethod \n example: /edit 24/6/2024 groceries 7000 online ;  \n another example: /edit 24-06-2023 food 500 cash`,
      );
    } else {
      console.log('check------------>>>2');

      const dateValuesFromMessageParams = { messageObject: messageObject };
      const date = editedDateFromMessage(dateValuesFromMessageParams);

      console.log('edited date------->', date);

      const spreadSheetId = await getSpreadSheetFromDb(userName(messageObject));
      const accessToken = await checkAccessToken(messageObject);
      const sheetTitle = date && `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
      console.log('sheetTitle----->>', sheetTitle);
      const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, accessToken));
      const sheetrange = `${sheetTitle}!A3:A`;
      const req = {
        range: sheetrange,
        accessToken: accessToken,
        spreadSheetId: spreadSheetId,
        messageObject: messageObject,
      };
      const dateValueArr = await getDataFromSpecificSheet(req);
      console.log('dateValueArr---------: ', dateValueArr);

      if (dateValueArr.length > 0) {
        const valuesFromMessageParams = { messageObject: messageObject, date: date };
        const expenseData = editedValuesFromMessage(valuesFromMessageParams);
        console.log('expenseData------------------->>', expenseData);
        const rex = {
          spreadsheetId: spreadSheetId,
          accessToken: accessToken,
          range: `${sheetTitle}!A:E`,
          values: [expenseData],
          sheetId: sheetId,
        };
        console.log('rex------------------->>', rex);
        const expenseAdded = await appendRow(rex);
        return expenseAdded;
      } else {
        return sendMessage(
          messageObject,
          'sorry, date does not exist in this sheet , enter a valid date',
        );
      }
    }
  } catch (err) {
    console.log({ message: 'err in editExpense', err: err });
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
    const { range, accessToken, spreadSheetId, messageObject } = req;
    console.log('req---------------->', req);
    const getGoogleAuthData = getGoogleAuth(accessToken);
    const params = {
      range: range,
      spreadsheetId: spreadSheetId,
      auth: getGoogleAuthData,
    };
    const getSpreadsheet = await getFromSheetsUingGoogleSdk(params);
    console.log('getSpreadsheet--------->>', getSpreadsheet);
    if (!getSpreadsheet) {
      return null;
    }
    const extractDates = (getSpreadsheet as any)?.map((entry: any[]) => entry[0]);
    console.log('extractDates----->', extractDates);
    return extractDates;
  } catch (err) {
    console.log({ message: 'err in getDataFromSpecificSheet---------------->>>>' });
    return null;
  }
};

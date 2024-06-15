import { getGoogleAuth } from '../lib/google_auth';
import { MessageObjectType } from '../types';
import {
  TOdayDate,
  checkAccessToken,
  dateForCalculation,
  editedDateFromMessage,
  editedValuesFromMessage,
  getCurrentMonth,
  getCurrentYear,
  isFirstDateOfMonth,
  isValidEmail,
  removeEmptyElements,
  retrieveChatId,
  userName,
  valuesFromMessage,
} from '../utils';
import { sendMessage } from './bot';
import {
  createUserInDb,
  findEmailFromTheDb,
  getSpreadSheetFromDb,
  updatespreadsheetIdInDB,
  userExists,
} from './dbHandler';
import {
  getLatestSheetId,
  editSpreadsheet,
  appendRow,
  createSpreadsheet,
  createSheet,
} from './googleSheet';
import { getFromSheetsUingGoogleSdk } from './googlesheet-sdk';

export const syncEmail = async (messageObject: MessageObjectType): Promise<{ message: string }> => {
  try {
    const messageText = (messageObject as { text: string }).text || '';
    const messagetext = messageText.substr(1).split(' ');
    const messages = removeEmptyElements(messagetext);
    if (messages.length < 2) {
      return {
        message: `Sorry, your command must look like \n example: /sync example@gmail.com`,
      };
    }
    const email = removeEmptyElements(messagetext)[1];
    const user = await userExists(email);

    if (!isValidEmail(email) && !user) {
      return {
        message:
          "The email you provided is invalid or you signed in with a different account. Please check your email and try again, or ensure you're using the correct account.",
      };
    }
    const user_id = retrieveChatId(messageObject);
    user_id && (await createUserInDb({ user_id: user_id, email: email }));
    return { message: 'your account is synced' };
  } catch (error) {
    console.log(error);
    return { message: 'An error occurred while syncing your account' };
  }
};
export const createSpreadSheetProcess = async (messageObject: MessageObjectType) => {
  try {
    const access_token = await checkAccessToken(messageObject);
    const user_id = retrieveChatId(messageObject);
    const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
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
      title: title,
    };
    const newSpreadsheet = await createSpreadsheet(req);
    const spreadsheetId = newSpreadsheet.spreadsheetId;
    const email = user_id && (await findEmailFromTheDb(user_id));
    user_id && email && (await updatespreadsheetIdInDB(spreadsheetId, user_id, email));
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

export const addExpenses = async (messageObject: MessageObjectType) => {
  try {
    const access_token = await checkAccessToken(messageObject);
    const user_id = retrieveChatId(messageObject);
    const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
    const date = new Date();
    // const date = new Date(2024, 2, 3);
    const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;

    const todayString = TOdayDate(date);
    const sheetrange = `${sheetTitle}!A3:A`;
    const req = {
      range: sheetrange,
      accessToken: access_token,
      spreadSheetId: spreadSheetId,
      messageObject: messageObject,
    };
    const dateValueArr = await getDateDataFromSpecificSheet(req);
    let expenseData: any;
    if (dateValueArr && dateValueArr?.includes(todayString)) {
      const valuesFromMessageParams = { messageObject: messageObject, date: date };
      expenseData = valuesFromMessage(valuesFromMessageParams);
    } else {
      const valuesFromMessageParams = { messageObject: messageObject, date: date };
      const value = valuesFromMessage(valuesFromMessageParams);
      expenseData = dailyExpenseValues({ value: value, date: date });
    }

    const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, access_token));
    const rex = {
      spreadsheetId: spreadSheetId,
      accessToken: access_token,
      range: `${sheetTitle}!A:E`,
      values: [expenseData],
      sheetId: sheetId,
    };

    if (isFirstDateOfMonth(date) && dateValueArr === null) {
      const sheetParams = {
        spreadsheetId: spreadSheetId,
        access_token: access_token,
        sheetTitle: `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`,
      };
      const newSheet = await createSheet(sheetParams);
      const sheetId = newSheet.replies[0].addSheet.properties.sheetId;
      const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
      const parameter = {
        access_token: access_token,
        sheetTitle: sheetTitle,
        spreadsheetId: spreadSheetId,
        sheetId: sheetId,
      };
      const addNewSheet = await addSheet(parameter);
      const valueForNewSheetParams = { messageObject: messageObject, date: date };
      const valueForNewSheet = valuesFromMessage(valueForNewSheetParams);
      const expenseDataForNewSheet = dailyExpenseValues({ value: valueForNewSheet, date: date });

      const paramForNewSheet = {
        spreadsheetId: spreadSheetId,
        accessToken: access_token,
        range: `${sheetTitle}!A:E`,
        values: [expenseDataForNewSheet],
        sheetId: sheetId,
      };

      const expenseAdded = await appendRow(paramForNewSheet);
      sendMessage(messageObject, 'new sheet added for this month');
      return expenseAdded;
    }
    const expenseAdded = await appendRow(rex);
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

export const editExpenses = async (messageObject: MessageObjectType) => {
  try {
    const access_token = await checkAccessToken(messageObject);

    const messageText = (messageObject as { text: string }).text || '';
    const messagetext = messageText.substr(1).split(' ');
    // messageObject.
    // [[date, 'Groceries', '7000', 'online', 'Daily expenses']];
    const messages = removeEmptyElements(messagetext);
    if (messages.length < 5) {
      return sendMessage(
        messageObject,
        `Sorry, your command looks like this : ${messageObject.text} \n your command must look like \n this: /edit date catagory amount paymentMethod \n example: /edit 24/6/2024 groceries 7000 online ;  \n another example: /edit 24-06-2023 food 500 cash`,
      );
    } else {
      const dateValuesFromMessageParams = { messageObject: messageObject };
      const date = editedDateFromMessage(dateValuesFromMessageParams);
      const user_id = retrieveChatId(messageObject);
      const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
      const sheetTitle = date && `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
      const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, access_token));
      const sheetrange = `${sheetTitle}!A3:A`;
      const req = {
        range: sheetrange,
        accessToken: access_token,
        spreadSheetId: spreadSheetId,
        messageObject: messageObject,
      };
      const dateValueArr = await getDateDataFromSpecificSheet(req);
      if (dateValueArr.length > 0) {
        const valuesFromMessageParams = { messageObject: messageObject, date: date };
        const expenseData = editedValuesFromMessage(valuesFromMessageParams);
        const rex = {
          spreadsheetId: spreadSheetId,
          accessToken: access_token,
          range: `${sheetTitle}!A:E`,
          values: [expenseData],
          sheetId: sheetId,
        };
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

export const getSpreadSheet = async (messageObject: MessageObjectType) => {
  try {
    const user_id = retrieveChatId(messageObject);
    const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
    if (spreadSheetId) {
      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadSheetId}`;
      return {
        message: 'Spreadsheet is present in your google account. ',
        data: spreadsheetUrl,
      };
    }
  } catch (err) {
    console.log('error comes from getSpreadSheet', err);
  }
};

export const currentDayTotalExpanses = async (messageObject: MessageObjectType) => {
  try {
    const access_token = await checkAccessToken(messageObject);
    const date = new Date();
    const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
    const sheetrange = `${sheetTitle}!A:E`;
    const user_id = retrieveChatId(messageObject);
    const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
    const req = {
      range: sheetrange,
      accessToken: access_token,
      spreadSheetId: spreadSheetId,
    };
    const data: any = await getDataFromSpecificSheet(req);
    const todayString = TOdayDate(date);

    let totalAmount = 0;

    // Iterate through the rows and sum up today's amounts
    for (let i = 1; i < data.length; i++) {
      // Start from 1 to skip header
      const row = data[i];
      const rowDate = row[0];
      const amount = parseFloat(row[2]) || 0; // Assuming amount is in the third column
      if (rowDate === todayString) {
        totalAmount += amount;
      }
    }

    return { message: `Today's total amount: ${totalAmount}`, data: totalAmount };
  } catch (err) {
    console.log({ message: 'err in currentDayTotalExpanses', err: err });
    return { message: `no expenses for today`, data: 0 };
  }
};

export const currentDayTotalExpansesDetails = async (messageObject: MessageObjectType) => {
  try {
    const access_token = await checkAccessToken(messageObject);
    const date = new Date();
    const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
    const sheetrange = `${sheetTitle}!A:E`;
    const user_id = retrieveChatId(messageObject);
    const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
    const req = {
      range: sheetrange,
      accessToken: access_token,
      spreadSheetId: spreadSheetId,
    };
    const data: any = await getDataFromSpecificSheet(req);
    const todayString = TOdayDate(date);

    let totalAmount = 0;
    const todayExpenses: string[] = [];

    // Iterate through the rows and sum up today's amounts
    for (let i = 1; i < data.length; i++) {
      // Start from 1 to skip header
      const row = data[i];
      const rowDate = row[0];
      const category = row[1];
      const amount = parseFloat(row[2]) || 0; // Assuming amount is in the third column
      const paymentMethod = row[3];

      if (rowDate === todayString) {
        totalAmount += amount;
        todayExpenses.push(`${category} | ${amount} | ${paymentMethod}`);
      }
    }
    // Create the chart representation
    let chartMessage = "Today's Expenses:\n";
    chartMessage += 'Category    | Amount | Payment Method\n';
    chartMessage += '------------------------------------------------\n';
    todayExpenses.forEach((expense) => {
      chartMessage += `${expense}\n`;
    });
    chartMessage += '------------------------------------------------\n';
    chartMessage += `Total: ${totalAmount}`;

    return {
      message: chartMessage,
    };
  } catch (err) {
    console.log({ message: 'err in currentDayTotalExpansesDetails', err: err });
  }
};

export const TotalMontlyExpansesDetails = async (messageObject: MessageObjectType) => {
  try {
    const access_token = await checkAccessToken(messageObject);
    const date = new Date();
    const sheetTitle = `${getCurrentMonth(date)}-${getCurrentYear(date)}-expense`;
    const sheetrange = `${sheetTitle}!A:E`;
    const user_id = retrieveChatId(messageObject);
    const spreadSheetId = user_id && (await getSpreadSheetFromDb(user_id));
    const req = {
      range: sheetrange,
      accessToken: access_token,
      spreadSheetId: spreadSheetId,
    };
    const data: any = await getDataFromSpecificSheet(req);

    let totalAmount = 0;
    const Expenses: string[] = [];

    // Iterate through the rows and sum up today's amounts
    for (let i = 2; i < data.length; i++) {
      // Start from 1 to skip header
      const row = data[i];
      const rowDate = row[0];
      const category = row[1];
      const amount = parseFloat(row[2]) || 0; // Assuming amount is in the third column
      const paymentMethod = row[3];

      totalAmount += amount;
      Expenses.push(`${rowDate} | ${category} | ${amount} | ${paymentMethod}`);
    }
    // Create the chart representation
    let chartMessage = 'Monthly Expenses:\n';
    chartMessage += 'date            | Category    | Amount | Payment Method\n';
    chartMessage += '------------------------------------------------\n';
    Expenses.forEach((expense) => {
      chartMessage += `${expense}\n`;
    });
    chartMessage += '------------------------------------------------\n';
    chartMessage += `Total: ${totalAmount}`;
    return {
      message: chartMessage,
    };
  } catch (err) {
    console.log({ message: 'err in TotalMontlyExpansesDetails', err: err });
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
    const dailyExpense = `=SUMIFS(C3:C, A3:A, ${calculateDate})`;
    value.push(dailyExpense);
    return value;
  } catch (err) {
    console.log({ message: 'err in dailyExpenseValues', err: err });
  }
};
export const getDataFromSpecificSheet = async (req: any) => {
  try {
    const { range, accessToken, spreadSheetId } = req;
    const getGoogleAuthData = getGoogleAuth(accessToken);
    const params = {
      range: range,
      spreadsheetId: spreadSheetId,
      auth: getGoogleAuthData,
    };
    const getSpreadsheet = await getFromSheetsUingGoogleSdk(params);
    return getSpreadsheet;
  } catch (err) {
    console.log({ message: 'err in getDataFromSpecificSheet---------------->>>>' });
    return null;
  }
};
export const getDateDataFromSpecificSheet = async (req: any) => {
  try {
    const { range, accessToken, spreadSheetId } = req;
    const getGoogleAuthData = getGoogleAuth(accessToken);
    const params = {
      range: range,
      spreadsheetId: spreadSheetId,
      auth: getGoogleAuthData,
    };
    const getSpreadsheet = await getFromSheetsUingGoogleSdk(params);
    if (!getSpreadsheet) {
      return null;
    }
    const extractDates = (getSpreadsheet as any)?.map((entry: any[]) => entry[0]);
    return extractDates;
  } catch (err) {
    console.log({ message: 'err in getDateDataFromSpecificSheet---------------->>>>' });
    return null;
  }
};

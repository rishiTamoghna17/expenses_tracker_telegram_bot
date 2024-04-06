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

export const createSpreadSheetProcess = async (req: any) => {
  try {
    const { access_token, sheetTitle, messageObject } = req;
    const newSpreadsheet = await createSpreadsheet(req);
    const spreadsheetId = newSpreadsheet.spreadsheetId;
    await updatespreadsheetIdInDB(spreadsheetId, userName(messageObject));
    const latestSheet = await getLatestSheetId(spreadsheetId, access_token);
    // latestSheet && (await editSpreadsheet(spreadsheetId1, access_token, latestSheet, sheetTitle));
    // const parameter = {
    //   spreadsheetId: spreadsheetId1,
    //   accessToken: access_token,
    //   range: `${sheetTitle}!A:E`,
    //   values: [['Data', 'Category', 'Amount', 'Payment Method', 'Daily expenses']],
    //   backgroundColor: true,
    //   sheetId: latestSheet,
    // };
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
    const expenseData = valuesFromMessage(messageObject);
    const sheetId = spreadSheetId && (await getLatestSheetId(spreadSheetId, accessTokn));
    const date = new Date();
    const sheetTitle = `${getCurrentMonth(date)}-expense`;
    const rex = {
      spreadsheetId: spreadSheetId,
      accessToken: accessTokn,
      range: `${sheetTitle}!A:E`,
      values: [expenseData],
      sheetId: sheetId,
    };

    const testdate = new Date(2024, 8, 1);
    const formattedDate = TOdayDate(testdate);
    if (isFirstDateOfMonth(testdate)) {
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
        values: [expenseData],
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

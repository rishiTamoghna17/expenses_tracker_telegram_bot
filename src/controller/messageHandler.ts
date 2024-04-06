import { checkAccessToken, getCurrentMonth, userName, valuesFromMessage } from '../utils';
import { sendMessage } from './bot';
import { getSpreadSheetFromDb, updatespreadsheetIdInDB } from './dbHandler';
import { getLatestSheetId, editSpreadsheet, appendRow, createSpreadsheet } from './googleSheet';

export const createSpreadSheetProcess = async (req: any) => {
  try {
    const { access_token, sheetTitle, messageObject } = req;
    const newSpreadsheet = await createSpreadsheet(req);
    const spreadsheetId1 = newSpreadsheet.spreadsheetId;
    await updatespreadsheetIdInDB(spreadsheetId1, userName(messageObject));
    const latestSheet = await getLatestSheetId(spreadsheetId1, access_token);
    latestSheet && (await editSpreadsheet(spreadsheetId1, access_token, latestSheet, sheetTitle));
    const parameter = {
      spreadsheetId: spreadsheetId1,
      accessToken: access_token,
      range: `${sheetTitle}!A:E`,
      values: [['Data', 'Category', 'Amount', 'Payment Method', 'Daily expenses']],
      backgroundColor: true,
      sheetId: latestSheet,
    };
    const secondRow = await appendRow(parameter);
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
      range: `${sheetTitle}!A:D`,
      values: [expenseData],
      sheetId: sheetId,
    };
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

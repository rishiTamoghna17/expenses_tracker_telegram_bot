import { getAxiosInstance } from '../lib/axios';
import { getNewUrl } from '../lib/google_auth';
import { MessageObjectType } from '../types';
import { checkAccessToken } from '../utils';
import {
  TotalMontlyExpansesDetails,
  addExpenses,
  createSpreadSheetProcess,
  currentDayTotalExpanses,
  currentDayTotalExpansesDetails,
  editExpenses,
  getSpreadSheet,
} from './messageHandler';
export const sendMessage = async (messageObject: MessageObjectType, messageText: string) => {
  try {
    const axiosInstance = getAxiosInstance();
    const response =
      axiosInstance &&
      (await axiosInstance.get('sendMessage', {
        chat_id: messageObject.chat.id,
        text: messageText,
      }));
    return response;
  } catch (error) {
    console.error('Error from sendMessage:', error);
    // Handle the error appropriately, e.g., log it or send an error message to the user
  }
};

export const handleMessage = async (messageObject: MessageObjectType) => {
  try {
    const messageText = messageObject.text || '';
    if (messageText[0] === '/') {
      const commend = messageText.substr(1).split(' ')[0];
      switch (commend) {
        case 'start':
          const messages =
            "Hi, I'm your Personal Expense Tracker. \nLet me help you manage your expenses... \n 1. you have to log in with /log_in command. \n 2. you can create spreadsheet with /creat_spread_sheet command. \n 3. you can add expenses with /add catagory amount paymentMethod. \n example: /add groceries 7000 online.\n 4. you can add expenses for specific date with /edit date catagory amount paymentMethod. \n example: /edit 24/6/2024 groceries 7000 online.\n 5. you can get spreadsheet with /get_spread_sheet command.";
          return sendMessage(messageObject, messages);
        case 'log_in':
          const data = await getNewUrl(messageObject);
          return data && (await sendMessage(messageObject, data));
        case 'creat_spread_sheet':
          sendMessage(messageObject, 'creating Spreadsheet..... just wait a second.........');
          const newSpreadsheet = await createSpreadSheetProcess(messageObject);
          const newSpreadsheetUrl = newSpreadsheet && newSpreadsheet.data;
          const newSpreadsheetmessage = newSpreadsheet && newSpreadsheet.message;
          return sendMessage(
            messageObject,
            `${newSpreadsheetmessage} \n The spreadsheet url is: ${newSpreadsheetUrl}`,
          );

        case 'add':
          const addExpense = await addExpenses(messageObject);
          return (
            addExpense.tableRange && sendMessage(messageObject, 'Expenses are added successfully')
          );

        case 'edit':
          const editExpense = await editExpenses(messageObject);
          return editExpense && sendMessage(messageObject, 'Expenses are edited successfully');

        case 'get_spread_sheet':
          const getSpreadsheet = await getSpreadSheet(messageObject);
          return await sendMessage(
            messageObject,
            `${getSpreadsheet?.message} \n The spreadsheet url is: ${getSpreadsheet?.data}`,
          );
        case 'today_total_expense_amount':
          const totalExpanses = await currentDayTotalExpanses(messageObject);
          return await sendMessage(messageObject, totalExpanses?.message);
        case 'today_expense_detail':
          const totalExpanseDetails = await currentDayTotalExpansesDetails(messageObject);
          return (
            totalExpanseDetails && (await sendMessage(messageObject, totalExpanseDetails?.message))
          );
        case 'total_monthly_expense_amount':
          const totalMonthlyExpanseDetails = await TotalMontlyExpansesDetails(messageObject);
          return (
            totalMonthlyExpanseDetails &&
            (await sendMessage(messageObject, totalMonthlyExpanseDetails?.message))
          );
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

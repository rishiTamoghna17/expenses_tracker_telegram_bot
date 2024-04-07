import { sendMessage } from '../controller/bot';
import { getRefreshTokenFromDb } from '../controller/dbHandler';
import { getAccessTOken } from '../lib/google_auth';

export const checkAccessToken = async (messageObject: any) => {
  try {
    const refreshtoken = await getRefreshTokenFromDb();
    console.log(`get_spread_sheet: refreshtoken: ${refreshtoken}`);
    if (!refreshtoken) {
      return sendMessage(messageObject, 'CANT GET FROM DATABASE');
    }
    const accessToken = await getAccessTOken(refreshtoken);
    if (!accessToken) {
      return sendMessage(messageObject, 'CANT GET accessToken');
    }
    return accessToken;
  } catch (error) {
    console.error('Error from checkAccessToken:', error);
  }
};

export const TOdayDate = (date: Date) => {
  // Extract day, month, and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Adding 1 because January is 0-indexed
  const year = date.getFullYear();

  // Format day and month to have leading zeros if necessary
  const formattedDay: string = day < 10 ? '0' + day : day.toString();
  const formattedMonth: string = month < 10 ? '0' + month : month.toString();

  // Concatenate components in desired format
  var formattedDate = formattedDay + '/' + formattedMonth + '/' + year;

  // Print the formatted date
  return formattedDate;
};
export const dateForCalculation = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // January is 0
  const day = date.getDate();
  return `DATE(${year},${month},${day})`;
};

export const isFirstDateOfMonth = (date: Date): boolean => {
  // Extract the day component of the date
  const day = date.getDate();

  // Check if the day is equal to 1
  return day === 1;
};

export const valuesFromMessage = (req: any) => {
  try {
    const { messageObject, date } = req;
    const messageText = (messageObject as { text: string }).text || '';
    const messages = messageText.substr(1).split(' ');
    // messageObject.
    // [[date, 'Groceries', '7000', 'online', 'Daily expenses']];
    console.log('messages---------->', messages);
    if (messages.length < 4) {
      return sendMessage(
        messageObject,
        `Sorry, your command looks like this : ${messageObject.text} \n your command must look like \n this: /new catagory amount paymentMethod \n example: /new groceries 7000 online ;  \n another example: /new food 500 cash`,
      );
    }
    const dateData = TOdayDate(date);
    messages[0] = dateData;
    console.log('new messages -------->>', messages);
    const messageArray = messages.map((message) => {
      return message.trim().toLowerCase();
    });
    return messageArray;
  } catch (err) {
    console.log('err in values', err);
  }
};

export const getCurrentMonth = (date: Date) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const now = date;
  return months[now.getMonth()];
};

export const getCurrentYear = (date: Date) => {
  return date.getFullYear();
};

export const userName = (messageObject: any) => {
  const {
    chat: { first_name, last_name },
  } = messageObject;

  const fullName = `${first_name} ${last_name}`;
  return fullName;
};

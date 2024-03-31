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

export const TOdayDate = () => {
  var today = new Date();

  // Extract day, month, and year
  const day = today.getDate();
  const month = today.getMonth() + 1; // Adding 1 because January is 0-indexed
  const year = today.getFullYear();

  // Format day and month to have leading zeros if necessary
  const formattedDay: string = day < 10 ? '0' + day : day.toString();
  const formattedMonth: string = month < 10 ? '0' + month : month.toString();

  // Concatenate components in desired format
  var formattedDate = formattedDay + '/' + formattedMonth + '/' + year;

  // Print the formatted date
  return formattedDate;
};

export const valuesFromMessage = (messageObject: any) => {
  try {
    const messageText = messageObject.text || '';
    const messages = messageText.substr(1).split(' ');
    // messageObject.
    // [[date, 'Groceries', '7000', 'online', 'Daily expenses']];
    const date = TOdayDate();
    messages[0] = date;
    return messages;
  } catch (err) {
    console.log('err in values', err);
  }
};

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

import { getNewRefreshToken, getNewUrl, getAccessTOken } from '../lib/google_auth';
import { handleMessage } from './bot';
import { Request } from 'express';
import { createSpreadsheet } from './googleSheet';
export const handler = async (req: Request, method?: string) => {
  try {
    if (method === 'GET') {
      if (req.url === '/test') {
        const data = await getNewUrl();
        console.log('getNewUrl------------>>>', data);
        const parseUrl = data.config.url?.replace(/\s/g, '');
        return parseUrl;
      }
      if (req.url.indexOf('/gtoken') > -1) {
        const data = req.query;
        const code = data.code;
        console.log('data-------------->>>>>>>>', data);
        const refreshtoken = await getNewRefreshToken(code);
        console.log('Refresh token---------> ' + JSON.stringify(refreshtoken.data, null, 2));
        const refresh_token = refreshtoken.data.refresh_token;
        return refresh_token;
      }
      if (req.url === '/get-access-token') {
        const refreshtoken =
          '1//0gcAiOQqdeWGjCgYIARAAGBASNwF-L9IrvA52nlxDdLyEYTKZ5unnDyWBWK-EqHYxp_XiicTN5-uBDPToS7o1po0VVR1rNzahpY0';
        const accessTokenData = await getAccessTOken(refreshtoken);
        return accessTokenData.data;
      }
      if (req.url === '/speadsheet') {
        const access_token =
          'ya29.a0Ad52N39CpZ8VhamDBLblPeYKF2ETZn8jC45YPQvJpQ2gZpqSHDUogHa_6W1od4FwZJXf2ZJSFLCApoaq2Mmk-Np-nleTYjL9K9eqbOZBK8KaRoWjdY5QKcS_hdhIicR3CEX1cmxqGsQxHFVUOosREwZMJP6_LgOzNKCBaCgYKAToSARISFQHGX2MiJBmYBCfkQQcEgKApvjmBbg0171';
        var jdn = '';
        // const spreadsheetId = "15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM";
        const sheetName = 'test_spsheet';
        const data = await createSpreadsheet(sheetName, access_token);
        console.log('readSheetValues---------->', JSON.stringify(data, null, 2));
        return JSON.stringify(data, null, 2);
      }
      return 'unknown get';
    }
    const body = req.body;

    if (body) {
      const messageObject = body.message;
      await handleMessage(messageObject);
    }
    return;
  } catch (error) {
    console.error('Error message from handler function:', error);
  }
};

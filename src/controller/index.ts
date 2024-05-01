import { getNewRefreshToken, getNewUrl, getAccessTOken, getUserDetail } from '../lib/google_auth';
import { handleMessage } from './bot';
import { Request } from 'express';
import { readSheetValues } from './googleSheet';
import { supabase } from '../lib/supabaseClient';
import { getRefreshTokenFromDb, CreateRefreshTokenInDB, updateRefreshTokenInDB } from './dbHandler';
export const handler = async (req: Request, method?: string) => {
  try {
    if (method === 'GET') {
      // if (req.url === '/test') {
      //   const data = await getNewUrl();
      //   console.log('getNewUrl------------>>>', data);
      //   const parseUrl = data.config.url?.replace(/\s/g, '');
      //   return parseUrl;
      // }
      if (req.path === '/gtoken') {
        console.log('get object->>>>>>', req);
        const data = req.query;
        const code = data.code;
        console.log('code----------->', code);

        const refreshtoken = await getNewRefreshToken(code);
        console.log('refreshtoken.data----------->', refreshtoken.data);
        const { refresh_token, access_token, id_token } = refreshtoken.data;
        console.log('access_token----------->', access_token);
        console.log('id_token----------->', id_token);

        const { email } = await getUserDetail({ access_token, id_token });
        // await CreateRefreshTokenInDB({refresh_token:refresh_token,email:email});
        await updateRefreshTokenInDB({ refresh_token: refresh_token, email: email });
        return 'token update successfull in database';
      }
      // if (req.url === '/get-access-token') {
      //   const refreshtoken =
      //     '1//0gdNsGgqqxY8gCgYIARAAGBASNwF-L9IryDYomYp9i_Ux3Sg1yMg3yenFmT4qYNT8xpzLbbut0lSKM-D-5sREgjNQR3q947yeuO0';
      //   const accessTokenData = await getAccessTOken(refreshtoken);
      //   return accessTokenData.data;
      // }
      // if (req.url === '/speadsheet') {
      //   const access_token =
      //     'ya29.a0Ad52N3-PHoX3Ybh_SkWFJSwxM-obipztlkGigNU6Yn4NKKpe6kzY4pgRNR1Jn_GK5ZvGY9ERfnwAZtQFZor4Ni-bgVyUiKxrDstbB2-hXH-wZ4GgfP7kim0LAeYGjyv2zT0MI3F9AQPC__nv1xvxXQaU27fMwgwpO_ZkaCgYKAU4SARISFQHGX2Mib-gsQWJaPMM68RjmjHM_Dw0171';
      //   // var jdn = '';
      //   const spreadsheetId = '15EU70BC_DuAa4V-GFQ5ni7ZiOf7bF6Ey0NP2aS1vRYM';
      //   // const sheetName = 'test_spsheet';
      //   const data = await readSheetValues(spreadsheetId, access_token);
      //   console.log('readSheetValues---------->', data && data.data);
      //   return data && data.data;
      // }
      // if (req.url === '/testSuparBase') {
      //   console.log('supabase---------->', supabase);
      //   return 'supabase client detected';
      // }
      // if (req.url === '/updateRefreshTokenInDB') {
      //   updateRefreshTokenInDB('1234567890');
      //   console.log('updateRefreshTokenInDB---------->');
      //   return 'update Refresh Token In DB!!!!!!';
      // }
      // if (req.url === '/getRefreshTokenFromDb') {
      //   const data = await getRefreshTokenFromDb();
      //   console.log('getRefreshTokenFromDb---------->', data?.data);
      //   return data?.data;
      // }
      return 'unknown get-----';
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

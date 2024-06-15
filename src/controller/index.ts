import { getNewRefreshToken, getNewUrl, getAccessTOken, getUserDetail } from '../lib/google_auth';
import { handleMessage } from './bot';
import { Request, Response } from 'express';
import { readSheetValues } from './googleSheet';
import { supabase } from '../lib/supabaseClient';
import { updateRefreshTokenInDB } from './dbHandler';
import { BOT_URL } from '../config';
export const handler = async (req: Request, res: Response, method?: string) => {
  try {
    if (method === 'GET') {
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
        await updateRefreshTokenInDB({ refresh_token: refresh_token, email: email });

        res.redirect(BOT_URL);
        return;
      }
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

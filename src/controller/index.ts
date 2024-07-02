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
        const data = req.query;
        const code = data.code;
        const state = decodeURIComponent(data?.state as string);

        const refreshtoken = await getNewRefreshToken(code);
        const { refresh_token, access_token, id_token } = refreshtoken.data;

        const { email } = await getUserDetail({ access_token, id_token });
        await updateRefreshTokenInDB({
          refresh_token: refresh_token,
          email: email,
          chat_Id: state,
        });

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

import { supabase } from '../lib/supabaseClient';

export const updateRefreshTokenInDB = async (token: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          key: 'tele_bot_google_refresh_token',
          value: token,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error to undate refresh token in db', error);
  }
};

export const getRefreshTokenFromDb = async () => {
  try {
    const data = await supabase
      .from('users')
      .select('*')
      .eq('key', 'tele_bot_google_refresh_token');
    // if (error) throw error;
    console.log('data from db', data);
    return data;
  } catch (error) {
    console.log('error to get refresh token from db', error);
  }
};

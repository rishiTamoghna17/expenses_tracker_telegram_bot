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
    const { data, error } = await supabase
      .from('users')
      .select('value') // Only select the 'value' column
      .eq('key', 'tele_bot_google_refresh_token')
      .order('id', { ascending: false }) // Order by id descending
      .limit(1); // Limit to 1 row (the latest)

    if (error) throw error;

    if (data.length === 0) {
      // Handle the case where no records are found
      console.log('No refresh token found in the database');
      return null; // Or return an empty string/default value
    }

    const latestRefreshToken = data[0].value;
    console.log('Latest refresh token:---------', latestRefreshToken);
    return latestRefreshToken;
  } catch (error) {
    console.log('error to get refresh token from db', error);
  }
};

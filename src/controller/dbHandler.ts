import { supabase } from '../lib/supabaseClient';

export const updateRefreshTokenInDB = async (token: string) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          key: 'tele_bot_google_refresh_token',
          value: token,
        },
      ])
      .select();
    console.log('completed updateRefreshTokenInDB----------');
    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error to undate refresh token in db', error);
  }
};

export const getRefreshTokenFromDb = async () => {
  try {
    const { data, error } = await supabase
      .from('User')
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
    // console.log('Latest refresh token:---------', latestRefreshToken);
    return latestRefreshToken;
  } catch (error) {
    console.log('error to get refresh token from db', error);
  }
};
export const updatespreadsheetIdInDB = async (spreadsheetId: string, userName: string) => {
  try {
    const { data, error } = await supabase
      .from('SpreadSheet')
      .insert([
        {
          user: userName,
          spreadsheetId: spreadsheetId,
        },
      ])
      .select();
    console.log('completed updatespreadsheetIdInDB----------');
    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error to undate refresh token in db', error);
  }
};

export const getSpreadSheetFromDb = async (user: string) => {
  try {
    const { data, error } = await supabase
      .from('SpreadSheet')
      .select('spreadsheetId') // Only select the 'value' column
      .eq('user', user)
      .order('id', { ascending: false }) // Order by id descending
      .limit(1); // Limit to 1 row (the latest)

    if (error) throw error;

    if (data.length === 0) {
      // Handle the case where no records are found
      console.log('No refresh token found in the database');
      return null; // Or return an empty string/default value
    }
    const latestSpreadSheetId: string = data[0].spreadsheetId;
    console.log('Latest SpreadSheetId:---------', latestSpreadSheetId);
    return latestSpreadSheetId;
  } catch (error) {
    console.log('error to get refresh token from db', error);
  }
};

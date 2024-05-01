import { supabase } from '../lib/supabaseClient';

export const CreateRefreshTokenInDB = async (params: { refresh_token: string; email: string }) => {
  try {
    const { refresh_token, email } = params;
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          key: email,
          value: refresh_token,
        },
      ])
      .select();
    console.log('completed CreateRefreshTokenInDB----------');
    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error to undate refresh token in db', error);
  }
};

export const updateRefreshTokenInDB = async (params: { refresh_token: string; email: string }) => {
  try {
    const { refresh_token, email } = params;

    // Check if the user exists
    const user = await userExists(email);

    if (!user) {
      await CreateRefreshTokenInDB({ refresh_token: refresh_token, email: email });
    }

    // Update the refresh token
    const { error: updateError } = await supabase
      .from('User')
      .update({ value: refresh_token })
      .eq('key', email);

    if (updateError) {
      throw updateError;
    }

    console.log('Refresh token updated successfully');
  } catch (error) {
    console.log('Error updating refresh token in DB:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
};

async function userExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('User').select('id').eq('key', email);

    if (error) {
      throw error;
    }

    return !!data && data.length > 0;
  } catch (error) {
    console.log('Error checking user existence:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

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

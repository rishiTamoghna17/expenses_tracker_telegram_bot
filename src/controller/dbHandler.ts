import { supabase } from '../lib/supabaseClient';
import { MessageObjectType } from '../types/index';
import { retrieveChatId } from '../utils';

export const createUserInDb = async (params: { user_id: number; email: string }) => {
  try {
    const { user_id, email } = params;
    const { error: updateError } = await supabase
      .from('User')
      .update({ user_id: user_id, is_active: true })
      .eq('email_id', email);
    if (updateError) {
      throw updateError;
    }
  } catch (err) {
    console.log('error to create user in db :', err);
  }
};
export const CreateRefreshTokenInDB = async (params: {
  refresh_token: string;
  email: string;
  chat_Id: string;
}) => {
  try {
    const { refresh_token, email, chat_Id } = params;
    const { data, error } = await supabase
      .from('User')
      .insert([
        {
          email_id: email,
          refresh_token: refresh_token,
          user_id: chat_Id,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error to creating refresh token in db :', error);
  }
};

export const updateRefreshTokenInDB = async (params: {
  refresh_token: string;
  email: string;
  chat_Id: string;
}) => {
  try {
    const { refresh_token, email, chat_Id } = params;

    // Check if the user exists
    const user = await userExists(email);

    if (!user) {
      await CreateRefreshTokenInDB({
        refresh_token: refresh_token,
        email: email,
        chat_Id: chat_Id,
      });
    }

    // Update the refresh token
    await supabase.from('User').update({ refresh_token: refresh_token }).eq('email_id', email);
  } catch (error) {
    console.log('Error updating refresh token in DB:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
};

export const findEmailFromTheDb = async (user_id: number) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('email_id') // Only select the 'value' column
      .eq('user_id', user_id)
      .order('id', { ascending: false }) // Order by id descending
      .limit(1); // Limit to 1 row (the latest)

    if (error) throw error;
    return data[0].email_id;
  } catch (err) {
    console.log('Error finding email from the db :', err);
  }
};

export async function userExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('User').select('id').eq('email_id', email);

    return !!data && data.length > 0;
  } catch (error) {
    console.log('Error checking user existence:', error);
    throw error; // Rethrow the error to handle it elsewhere if needed
  }
}

export const getRefreshTokenFromDb = async (MessageObject: MessageObjectType) => {
  try {
    const chatId = retrieveChatId(MessageObject);
    const { data, error } = await supabase
      .from('User')
      .select('refresh_token') // Only select the 'value' column
      .eq('user_id', chatId)
      .order('id', { ascending: false }) // Order by id descending
      .limit(1); // Limit to 1 row (the latest)

    if (error) throw error;

    if (data.length === 0) {
      // Handle the case where no records are found
      return null; // Or return an empty string/default value
    }

    const latestRefreshToken = data[0]?.refresh_token;
    return latestRefreshToken;
  } catch (error) {
    console.log('error to get refresh token from db', error);
  }
};
export const updatespreadsheetIdInDB = async (
  spreadsheetId: string,
  user_id: number,
  email_id: string,
) => {
  try {
    const { data, error } = await supabase
      .from('SpreadSheet')
      .insert([
        {
          user_id: user_id,
          spreadsheetId: spreadsheetId,
          email_id: email_id,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error to undate refresh token in db', error);
  }
};

export const getSpreadSheetFromDb = async (userId: number) => {
  try {
    const { data, error } = await supabase
      .from('SpreadSheet')
      .select('spreadsheetId') // Only select the 'value' column
      .eq('user_id', userId)
      .order('id', { ascending: false }) // Order by id descending
      .limit(1); // Limit to 1 row (the latest)

    if (error) throw error;

    if (data.length === 0) {
      // Handle the case where no records are found
      return null; // Or return an empty string/default value
    }
    const latestSpreadSheetId: string = data[0].spreadsheetId;
    return latestSpreadSheetId;
  } catch (error) {
    console.log('error to get refresh token from db', error);
  }
};

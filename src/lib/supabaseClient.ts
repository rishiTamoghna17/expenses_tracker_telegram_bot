import { createClient } from '@supabase/supabase-js';
import { SUPABASE_API_KEY, SUPABASE_URL } from '../config';

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_API_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

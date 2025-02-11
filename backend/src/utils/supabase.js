import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const getSupabaseClient = (authToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
          headers: {
              Authorization: `Bearer ${authToken}`
          }
      }
  });
};


export const verifySupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('pg_stat_activity')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
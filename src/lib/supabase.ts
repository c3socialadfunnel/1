import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.includes('YOUR_SUPABASE_URL')) {
  throw new Error('VITE_SUPABASE_URL is not configured. Please check your .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not configured. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

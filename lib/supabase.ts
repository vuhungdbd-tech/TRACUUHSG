import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://bzjuzlyhvxlrcywatliz.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7CRlZcyHUn0LXzfTBEWT-w_qh9fNAtI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('[dailyS] Supabase env vars ausentes. Preencha .env.local');
}

export const supabase = createClient(url ?? '', anonKey ?? '');
export default supabase;

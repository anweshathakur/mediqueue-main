import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sdjiykjqamkgnongtjul.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PZMG3JWQrlPag_19rfRu1Q_fOnNmoqg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

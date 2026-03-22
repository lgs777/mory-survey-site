import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase;

export function isDatabaseConfigured() {
  return Boolean(supabaseUrl && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

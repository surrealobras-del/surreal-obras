import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gukpisxmjvmfukxhkmrt.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8rgC3KL03MLP_bKd76ciCA_X0M63Y-p";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variáveis do Supabase não configuradas. Verifique o arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

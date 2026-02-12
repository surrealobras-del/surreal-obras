"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gukpisxmjvmfukxhkmrt.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8rgC3KL03MLP_bKd76ciCA_X0M63Y-p";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variáveis do Supabase não configuradas. Verifique o arquivo .env"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

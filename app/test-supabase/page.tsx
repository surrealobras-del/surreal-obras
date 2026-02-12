"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

const supabase = createClient();

export default function TestSupabase() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function testConnection() {
      try {
        // Testa a conexão fazendo uma query simples
        const { data, error } = await supabase.from("_test").select("count").limit(1);
        
        if (error && error.code !== "PGRST116") {
          // PGRST116 é erro de tabela não encontrada, mas significa que a conexão funciona
          throw error;
        }
        
        setStatus("success");
        setMessage("✅ Conexão com Supabase estabelecida com sucesso!");
      } catch (error: any) {
        setStatus("error");
        setMessage(`❌ Erro na conexão: ${error.message || "Erro desconhecido"}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="rounded-lg border p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "Não configurado"}
          </p>
          <div className="mt-4">
            {status === "loading" && (
              <p className="text-yellow-600">🔄 Testando conexão...</p>
            )}
            {status === "success" && (
              <p className="text-green-600 font-semibold">{message}</p>
            )}
            {status === "error" && (
              <p className="text-red-600 font-semibold">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

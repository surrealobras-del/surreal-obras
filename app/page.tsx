"use client";

import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">
          Bem-vindo ao sistema CRM para cadastrar obras
        </p>
        {user && (
          <div className="rounded-lg border p-4 bg-card">
            <p className="text-sm text-muted-foreground">
              Logado como: <span className="font-medium">{user.email}</span>
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

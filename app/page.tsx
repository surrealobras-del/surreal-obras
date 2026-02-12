"use client";

import { AppLayout } from "@/components/app-layout";
import { DashboardStats } from "./components/dashboard-stats";

export default function Home() {

  return (
    <AppLayout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Dashboard
        </h1>
        <p className="text-muted-foreground mb-6">
          Bem-vindo ao sistema CRM para cadastrar obras
        </p>
        
        {/* Estatísticas do Dashboard */}
        <DashboardStats />
      </div>
    </AppLayout>
  );
}

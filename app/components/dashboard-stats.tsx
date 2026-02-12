"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Wrench, CheckCircle2, Power, PowerOff } from "lucide-react";

const supabase = createClient();

interface DashboardData {
  total: number;
  in_progress: number;
  completed: number;
  active: number;
  inactive: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: DashboardData[];
}

export function DashboardStats() {
  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_dashboard"
      );

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao buscar dados do dashboard.");
      }

      if (rpcData && !rpcData.status) {
        throw new Error(rpcData.message || "Erro ao buscar dados do dashboard.");
      }

      return rpcData as ApiResponse;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
        <p className="font-semibold">Erro ao carregar estatísticas</p>
        <p className="mt-1">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <p className="text-muted-foreground">Nenhum dado disponível.</p>
      </div>
    );
  }

  const stats = data.data[0];

  const statCards = [
    {
      title: "Total de Obras",
      value: stats.total,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Em Andamento",
      value: stats.in_progress,
      icon: Wrench,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Concluídas",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Ativas",
      value: stats.active,
      icon: Power,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Inativas",
      value: stats.inactive,
      icon: PowerOff,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

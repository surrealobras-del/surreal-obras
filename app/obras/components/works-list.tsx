"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { X } from "lucide-react";
import Link from "next/link";

const supabase = createClient();

interface BuildingWork {
  id: string;
  created_at: string;
  title: string;
  is_active: boolean;
  main_image: string | null;
}

interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: BuildingWork[];
  pagination: Pagination;
}

export function WorksList() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"in_progress" | "completed" | "">("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [order, setOrder] = useState<"most_recent" | "oldest">("most_recent");

  // Debounce para o filtro de título
  const [debouncedTitleFilter, setDebouncedTitleFilter] = useState(titleFilter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTitleFilter(titleFilter);
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timer);
  }, [titleFilter]);

  // Reset página quando filtros mudarem (exceto título que usa debounce)
  useEffect(() => {
    setPage(1);
  }, [debouncedTitleFilter, statusFilter, isActiveFilter, order]);

  const clearFilters = () => {
    setTitleFilter("");
    setStatusFilter("");
    setIsActiveFilter(null);
    setOrder("most_recent");
    setPage(1);
  };

  const hasActiveFilters =
    titleFilter !== "" ||
    statusFilter !== "" ||
    isActiveFilter !== null ||
    order !== "most_recent";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Usa o título com debounce na query
  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: [
      "building_works",
      page,
      itemsPerPage,
      debouncedTitleFilter,
      statusFilter,
      isActiveFilter,
      order,
    ],
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_building_works",
        {
          p_page: page,
          p_items_page: itemsPerPage,
          p_title: debouncedTitleFilter || null,
          p_status: statusFilter || null,
          p_is_active: isActiveFilter,
          p_order: order,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao buscar obras.");
      }

      if (rpcData && !rpcData.status) {
        throw new Error(rpcData.message || "Erro ao buscar obras.");
      }

      return rpcData as ApiResponse;
    },
  });

  return (
    <div className="space-y-6">
      {/* Filtros - Sempre visível */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros e Ordenação</h2>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Título */}
              <div className="space-y-2">
                <Label htmlFor="titleFilter">Buscar por Título</Label>
                <Input
                  id="titleFilter"
                  placeholder="Digite o título..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                />
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as "in_progress" | "completed" | "")
                  }
                >
                  <SelectTrigger id="statusFilter" placeholder="Todos">
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </div>

              {/* Filtro por Ativo/Inativo */}
              <div className="space-y-2">
                <Label htmlFor="isActiveFilter">Status da Obra</Label>
                <Select
                  value={
                    isActiveFilter === null
                      ? "all"
                      : isActiveFilter
                      ? "active"
                      : "inactive"
                  }
                  onValueChange={(value) => {
                    if (value === "all") {
                      setIsActiveFilter(null);
                    } else {
                      setIsActiveFilter(value === "active");
                    }
                  }}
                >
                  <SelectTrigger id="isActiveFilter">
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="inactive">Inativa</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <Label htmlFor="order">Ordenar por</Label>
                <Select
                  value={order}
                  onValueChange={(value) =>
                    setOrder(value as "most_recent" | "oldest")
                  }
                >
                  <SelectTrigger id="order">
                    <SelectContent>
                      <SelectItem value="most_recent">Mais Recentes</SelectItem>
                      <SelectItem value="oldest">Mais Antigas</SelectItem>
                    </SelectContent>
                  </SelectTrigger>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estados de loading e erro */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Carregando obras...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          <p className="font-semibold">Erro ao carregar obras</p>
          <p className="mt-1">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-4"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Grid de obras */}
      {!isLoading && !error && data && data.data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((work) => (
              <Link key={work.id} href={`/obras/${work.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="relative h-48 w-full bg-muted overflow-hidden">
                    {work.main_image ? (
                      <img
                        src={work.main_image}
                        alt={work.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Se a imagem falhar ao carregar, mostra o placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground"><span class="text-4xl">🏗️</span></div>';
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <span className="text-4xl">🏗️</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          work.is_active
                            ? "bg-green-500/90 text-white"
                            : "bg-gray-500/90 text-white"
                        }`}
                      >
                        {work.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {work.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Criada em: {formatDate(work.created_at)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Paginação */}
          {data.pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {((page - 1) * itemsPerPage) + 1} -{" "}
                {Math.min(page * itemsPerPage, data.pagination.total_items)} de{" "}
                {data.pagination.total_items} obras
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, data.pagination.total_pages) }, (_, i) => {
                    let pageNum: number;
                    if (data.pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= data.pagination.total_pages - 2) {
                      pageNum = data.pagination.total_pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        disabled={isLoading}
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(data.pagination.total_pages, p + 1))}
                  disabled={page === data.pagination.total_pages || isLoading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mensagem quando não há resultados */}
      {!isLoading && !error && (!data || !data.data || data.data.length === 0) && (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? "Nenhuma obra encontrada com os filtros aplicados."
              : "Nenhuma obra encontrada."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

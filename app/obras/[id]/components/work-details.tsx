"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, XCircle, Play, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

const supabase = createClient();

interface Image {
  id: string;
  url: string;
  order: number;
  created_at: string;
}

interface Video {
  id: string;
  url: string;
  order: number;
  created_at: string;
}

interface BuildingWork {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  address: string | null;
  status: "in_progress" | "completed";
  is_active: boolean;
  images: Image[];
  videos: Video[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: BuildingWork[];
}

interface WorkDetailsProps {
  workId: string;
}

export function WorkDetails({ workId }: WorkDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["building_work", workId],
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_building_work",
        {
          p_id: workId,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao buscar obra.");
      }

      if (rpcData && !rpcData.status) {
        throw new Error(rpcData.message || "Erro ao buscar obra.");
      }

      return rpcData as ApiResponse;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // Extrai o ID do vídeo do YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "delete_building_work",
        {
          p_id: workId,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao excluir obra.");
      }

      if (rpcData && !rpcData.status) {
        throw new Error(rpcData.message || "Erro ao excluir obra.");
      }

      // Invalida as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["building_works"] });
      queryClient.invalidateQueries({ queryKey: ["building_work", workId] });

      // Redireciona para a lista de obras
      router.push("/obras");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erro ao excluir obra. Tente novamente.");
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando obra...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
        <p className="font-semibold">Erro ao carregar obra</p>
        <p className="mt-1">{error instanceof Error ? error.message : "Erro desconhecido"}</p>
        <Link href="/obras">
          <Button variant="outline" className="mt-4">
            Voltar para lista
          </Button>
        </Link>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <p className="text-muted-foreground mb-4">Obra não encontrada.</p>
        <Link href="/obras">
          <Button variant="outline">Voltar para lista</Button>
        </Link>
      </div>
    );
  }

  const work = data.data[0];

  return (
    <div className="space-y-6">
      {/* Header com botão voltar e editar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/obras">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">{work.title}</h1>
            <p className="text-muted-foreground mt-1">
              Criada em {formatDate(work.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/obras/${work.id}/editar`}>
            <Button className="bg-primary hover:bg-primary/90">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a obra "{work.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Informações principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card principal com informações */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descrição */}
          {work.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {work.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Imagens */}
          {work.images && work.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {work.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-video rounded-lg overflow-hidden border"
                    >
                      <img
                        src={image.url}
                        alt={`Imagem ${image.order}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="flex items-center justify-center h-full text-muted-foreground"><span class="text-4xl">🏗️</span></div>';
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vídeos */}
          {work.videos && work.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vídeos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {work.videos.map((video) => {
                    const embedUrl = getYouTubeEmbedUrl(video.url);
                    return (
                      <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden border">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={`Vídeo ${video.order}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <Play className="h-5 w-5" />
                              <span>Assistir no YouTube</span>
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar com informações adicionais */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                {work.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {work.status === "completed" ? "Concluída" : "Em Andamento"}
                  </p>
                </div>
              </div>

              {/* Status da Obra */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    work.is_active ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium">Status da Obra</p>
                  <p className="text-sm text-muted-foreground">
                    {work.is_active ? "Ativa" : "Inativa"}
                  </p>
                </div>
              </div>

              {/* Endereço */}
              {work.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">{work.address}</p>
                  </div>
                </div>
              )}

              {/* Data de criação */}
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Data de Criação</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(work.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

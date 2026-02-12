"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const supabase = createClient();

interface ImageFile {
  file: File;
  preview: string;
}

interface ExistingImage {
  url: string;
  id: string;
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    address: string | null;
    status: "in_progress" | "completed";
    is_active: boolean;
    images: Array<{ id: string; url: string; order: number; created_at: string }>;
    videos: Array<{ id: string; url: string; order: number; created_at: string }>;
  }>;
}

interface EditWorkFormProps {
  workId: string;
}

export function EditWorkForm({ workId }: EditWorkFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"in_progress" | "completed" | "">("");
  const [isActive, setIsActive] = useState(true);
  const [newImages, setNewImages] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Carrega os dados da obra
  const { data: workData, isLoading: isLoadingWork } = useQuery<ApiResponse>({
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

  // Preenche os campos quando os dados são carregados
  useEffect(() => {
    if (workData && workData.data && workData.data.length > 0) {
      const work = workData.data[0];
      setTitle(work.title);
      setDescription(work.description || "");
      setAddress(work.address || "");
      setStatus(work.status);
      setIsActive(work.is_active);
      setExistingImages(
        work.images.map((img) => ({ url: img.url, id: img.id }))
      );
      setVideos(work.videos.map((video) => video.url));
    }
  }, [workData]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione apenas arquivos de imagem.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImages((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(existingImages.filter((img) => img.url !== url));
  };

  const addVideo = () => {
    if (currentVideoUrl.trim()) {
      setVideos([...videos, currentVideoUrl.trim()]);
      setCurrentVideoUrl("");
    }
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];

    const uploadedUrls: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i];
      const fileExt = image.file.name.split(".").pop();
      const fileName = `${timestamp}-${i}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("building_work")
        .upload(fileName, image.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("building_work").getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploading(true);

    // Validações
    if (!title.trim()) {
      setError("O campo título é obrigatório.");
      setLoading(false);
      setUploading(false);
      return;
    }

    if (!status) {
      setError("O campo status é obrigatório.");
      setLoading(false);
      setUploading(false);
      return;
    }

    try {
      // Faz upload das novas imagens
      let newImageUrls: string[] = [];
      if (newImages.length > 0) {
        newImageUrls = await uploadNewImages();
      }

      // Combina imagens existentes (que não foram removidas) com as novas
      const allImageUrls = [
        ...existingImages.map((img) => img.url),
        ...newImageUrls,
      ];

      // Atualiza a obra
      const { data, error: rpcError } = await supabase.rpc("patch_building_work", {
        p_id: workId,
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_address: address.trim() || null,
        p_status: status,
        p_is_active: isActive,
        p_images: allImageUrls.length > 0 ? allImageUrls : null,
        p_videos: videos.length > 0 ? videos : null,
      });

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao atualizar obra.");
      }

      if (data && !data.status) {
        throw new Error(data.message || "Erro ao atualizar obra.");
      }

      // Invalida as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["building_works"] });
      queryClient.invalidateQueries({ queryKey: ["building_work", workId] });

      // Sucesso - redireciona para a visualização da obra
      router.push(`/obras/${workId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar obra. Tente novamente.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
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
      setError(err.message || "Erro ao excluir obra. Tente novamente.");
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoadingWork) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando obra...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dados</CardTitle>
          <CardDescription>
            Edite os dados da obra abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Reforma do apartamento 101"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Descrição e Endereço lado a lado em telas grandes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva os detalhes da obra..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Ex: Rua das Flores, 123 - Centro"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Status e Ativo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "in_progress" | "completed")
                }
                disabled={loading}
              >
                <SelectTrigger id="status" placeholder="Selecione o status">
                  <SelectContent>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status da Obra</Label>
              <Select
                value={isActive ? "active" : "inactive"}
                onValueChange={(value) => setIsActive(value === "active")}
                disabled={loading}
              >
                <SelectTrigger id="isActive">
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Container Mídia - Fora do Card principal */}
      <div className="space-y-4 rounded-lg border p-6 bg-card w-full">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">Mídia</h3>
          <p className="text-sm text-muted-foreground">
            Adicione imagens e vídeos do YouTube relacionados à obra
          </p>
        </div>

        <div className="space-y-6">
          {/* Container de Imagens */}
          <div className="space-y-4 rounded-lg border p-4 bg-background">
            <div className="space-y-2">
              <Label htmlFor="images" className="text-base font-semibold">
                Imagens
              </Label>
              <p className="text-sm text-muted-foreground">
                Selecione novas imagens da obra para fazer upload
              </p>
            </div>
            <div>
              <Input
                ref={fileInputRef}
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                disabled={loading || uploading}
                className="cursor-pointer"
              />
            </div>

            {/* Imagens existentes */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Imagens existentes:</p>
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {existingImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group rounded-md border overflow-hidden bg-card"
                    >
                      <img
                        src={image.url}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover"
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingImage(image.url)}
                        disabled={loading || uploading}
                        className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Novas imagens */}
            {newImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Novas imagens:</p>
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {newImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group rounded-md border overflow-hidden bg-card"
                    >
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNewImage(index)}
                        disabled={loading || uploading}
                        className="absolute top-2 right-2 bg-destructive/80 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {image.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {existingImages.length === 0 && newImages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma imagem adicionada
              </p>
            )}
          </div>

          {/* Container de Vídeos */}
          <div className="space-y-4 rounded-lg border p-4 bg-background">
            <div className="space-y-2">
              <Label htmlFor="videos" className="text-base font-semibold">
                Vídeos do YouTube
              </Label>
              <p className="text-sm text-muted-foreground">
                Adicione URLs de vídeos do YouTube
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                id="videos"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={currentVideoUrl}
                onChange={(e) => setCurrentVideoUrl(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVideo();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addVideo}
                disabled={loading || !currentVideoUrl.trim()}
                variant="outline"
              >
                Adicionar
              </Button>
            </div>
            {videos.length > 0 && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {videos.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-2 text-sm bg-card"
                  >
                    <span className="truncate flex-1 mr-2">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(index)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {videos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum vídeo adicionado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-4 justify-between">
        <Button
          type="button"
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={loading || uploading || deleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir Obra
        </Button>
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading || uploading || deleting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || uploading || deleting} className="bg-primary">
            {uploading
              ? "Enviando imagens..."
              : loading
              ? "Salvando..."
              : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita.
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
    </form>
  );
}

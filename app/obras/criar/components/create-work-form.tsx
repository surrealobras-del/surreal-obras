"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { X } from "lucide-react";

const supabase = createClient();

interface ImageFile {
  file: File;
  preview: string;
}

export function CreateWorkForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<"in_progress" | "completed" | "">("");
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        setImages((prev) => [
          ...prev,
          {
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadedUrls: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
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

      // Obtém a URL pública da imagem
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
      // Faz upload das imagens primeiro
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      // Cria a obra com as URLs das imagens
      const { data, error: rpcError } = await supabase.rpc("post_building_work", {
        p_title: title.trim(),
        p_description: description.trim() || null,
        p_address: address.trim() || null,
        p_status: status,
        p_is_active: isActive,
        p_images: imageUrls.length > 0 ? imageUrls : null,
        p_videos: videos.length > 0 ? videos : null,
      });

      if (rpcError) {
        throw new Error(rpcError.message || "Erro ao criar obra.");
      }

      if (data && !data.status) {
        throw new Error(data.message || "Erro ao criar obra.");
      }

      // Invalida as queries de obras para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["building_works"] });

      // Sucesso - redireciona para a lista de obras
      router.push("/obras");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao criar obra. Tente novamente.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dados</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para cadastrar uma nova obra
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
                Selecione imagens da obra para fazer upload
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
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {images.map((image, index) => (
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
                      onClick={() => removeImage(index)}
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
            )}
            {images.length === 0 && (
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
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading || uploading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || uploading} className="bg-primary">
          {uploading
            ? "Enviando imagens..."
            : loading
            ? "Criando obra..."
            : "Criar Obra"}
        </Button>
      </div>
    </form>
  );
}

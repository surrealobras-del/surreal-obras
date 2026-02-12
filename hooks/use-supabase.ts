import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

// Hook genérico para queries do Supabase
export function useSupabaseQuery<T>(
  queryKey: string[],
  table: string,
  options?: {
    select?: string;
    filters?: Record<string, any>;
    enabled?: boolean;
  }
) {
  return useQuery<T[], PostgrestError>({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table).select(options?.select || "*");

      // Aplica filtros se fornecidos
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: options?.enabled !== false,
  });
}

// Hook genérico para mutations do Supabase
export function useSupabaseMutation<T = any>(
  table: string,
  options?: {
    onSuccess?: () => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<T> | Partial<T>[]) => {
      const isArray = Array.isArray(data);
      
      if (isArray) {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data as T[]);
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from(table)
          .insert(data as T);
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      // Invalida queries relacionadas
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.();
    },
  });
}

// Hook para atualizar dados
export function useSupabaseUpdate<T = any>(
  table: string,
  options?: {
    onSuccess?: () => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: Partial<T> }) => {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.();
    },
  });
}

// Hook para deletar dados
export function useSupabaseDelete(
  table: string,
  options?: {
    onSuccess?: () => void;
    invalidateQueries?: string[][];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options?.onSuccess?.();
    },
  });
}

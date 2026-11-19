import { useEffect, useState } from "react";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { Listing } from "./model";

type Filters = {
  p_query?: string;
  p_category?: string;
  p_locality?: string;
  p_modality?: string;
  p_partner?: string;
  p_service?: string;
  p_offset?: number;
};

export const catalogQuery = (filters: Filters) =>
  queryOptions({
    queryKey: ["feira360-catalog", filters],
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("feira360_catalog", filters);
      if (error) throw new Error("A vitrine está temporariamente indisponível.");
      return data as unknown as Listing[];
    },
  });

export async function account<T>(action: string, fields: Json = {}): Promise<T> {
  const { data, error } = await supabase.rpc("feira360_account", {
    p_action: action,
    p_data: fields,
  });
  if (error) {
    if (error.code === "23505")
      throw new Error("Já existe um cadastro para esta conta ou este endereço já está em uso.");
    if (error.code === "22023" || error.code === "42501") throw new Error(error.message);
    throw new Error("Não foi possível concluir a operação. Verifique os dados e tente novamente.");
  }
  return data as T;
}

export function useAccountIdentity() {
  const [identity, setIdentity] = useState<string | null>();
  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIdentity(session?.user.id ?? null);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setIdentity(data.session?.user.id ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  return identity;
}

export async function journey<T>(action: string, fields: Json = {}): Promise<T> {
  const { data, error } = await supabase.rpc("feira360_journeys", {
    p_action: action,
    p_data: fields,
  });
  if (error) {
    if (error.code === "22023" || error.code === "42501") throw new Error(error.message);
    throw new Error("Não foi possível concluir a operação. Verifique os dados e tente novamente.");
  }
  return data as T;
}

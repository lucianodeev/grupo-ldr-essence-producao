import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMySupportConversations } from "@/lib/ecosystem-support.functions";

type Conversation = { id: string; protocol: string; subject: string; status: string; lastReplyAt: string | null };
const EVENT = "ldr-support-read";
function storageKey(userId: string) { return `ldr-support-read:${userId}`; }
function readMarkers(userId: string): Record<string, string> {
  try { const value = JSON.parse(localStorage.getItem(storageKey(userId)) || "{}"); return value && typeof value === "object" && !Array.isArray(value) ? value : {}; } catch { return {}; }
}

export function useSupportInbox() {
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [markers, setMarkers] = useState<Record<string, string>>({});
  const list = useServerFn(listMySupportConversations);
  useEffect(() => {
    let alive = true;
    const update = (id: string | null) => { if (alive) { setUserId(id); setReady(true); } };
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => update(session?.user.id ?? null));
      void supabase.auth.getSession().then(({ data }) => update(data.session?.user.id ?? null)).catch(() => update(null));
      return () => { alive = false; data.subscription.unsubscribe(); };
    } catch { update(null); return () => { alive = false; }; }
  }, []);
  useEffect(() => {
    const refresh = () => setMarkers(userId ? readMarkers(userId) : {});
    refresh(); window.addEventListener(EVENT, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [userId]);
  const query = useQuery({ queryKey: ["support-inbox", userId], queryFn: () => list(), enabled: !!userId, refetchInterval: 30000, staleTime: 15000, retry: 1 });
  const contacts = (query.data ?? []) as Conversation[];
  const isUnread = (contact: Conversation) => !!contact.lastReplyAt && (!markers[contact.id] || contact.lastReplyAt > markers[contact.id]);
  function markRead(id: string, at: string | null) {
    if (!userId || !at) return;
    const next = { ...readMarkers(userId), [id]: at };
    try { localStorage.setItem(storageKey(userId), JSON.stringify(next)); } catch {}
    setMarkers(next); window.dispatchEvent(new Event(EVENT));
  }
  return { userId, ready, query, contacts, isUnread, markRead, unread: contacts.filter(isUnread).length };
}

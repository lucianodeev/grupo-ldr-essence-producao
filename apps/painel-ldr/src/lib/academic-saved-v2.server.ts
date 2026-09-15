import { supabaseAdmin } from "@/integrations/supabase/client.server";
const db = supabaseAdmin as any;

export async function savedAcademicContent(userId: string, requestedOffset = 0) {
  const offset = Math.max(0, Math.floor(Number(requestedOffset) || 0)), pageSize = 50;
  const saves = await Promise.all([
    db.from("academic_saved_posts").select("post_id,created_at").eq("user_id", userId).order("created_at", { ascending: false }).range(offset, offset + pageSize),
    db.from("academic_saved_articles").select("article_id,created_at").eq("user_id", userId).order("created_at", { ascending: false }).range(offset, offset + pageSize),
    db.from("academic_saved_editorial_posts").select("post_id,created_at").eq("user_id", userId).order("created_at", { ascending: false }).range(offset, offset + pageSize),
  ]);
  if (saves.some(result => result.error)) throw new Error("Não foi possível carregar os itens salvos.");
  const hasMore = saves.some(result => (result.data?.length ?? 0) > pageSize);
  const [postSaves = [], articleSaves = [], editorialSaves = []] = saves.map(result => (result.data ?? []).slice(0, pageSize));
  const postIds = postSaves.map((x: any) => x.post_id), articleIds = articleSaves.map((x: any) => x.article_id), editorialIds = editorialSaves.map((x: any) => x.post_id);
  const contents = await Promise.all([
    postIds.length ? db.from("academic_posts").select("id,body,post_type,anonymous,created_at,status").in("id", postIds).eq("status", "active") : { data: [] },
    articleIds.length ? db.from("academic_articles").select("id,slug,title,summary,category,created_at,status").in("id", articleIds).eq("status", "active") : { data: [] },
    editorialIds.length ? db.from("academic_editorial_posts").select("id,body,post_type,published_at,profile_id").in("id", editorialIds).eq("status", "active") : { data: [] },
  ]);
  if (contents.some(result => result.error)) throw new Error("Não foi possível carregar as publicações salvas.");
  const [posts = [], articles = [], editorialPosts = []] = contents.map(result => result.data ?? []);
  const profiles = editorialPosts.length ? await db.from("academic_editorial_profiles").select("id,username,display_name").in("id", editorialPosts.map((p: any) => p.profile_id)) : { data: [] };
  if (profiles.error) throw new Error("Não foi possível carregar os autores das publicações salvas.");
  const profileMap = new Map((profiles.data ?? []).map((p: any) => [p.id, p]));
  const postMap = new Map(posts.map((p: any) => [p.id, p])), articleMap = new Map(articles.map((a: any) => [a.id, a]));
  const editorialMap = new Map(editorialPosts.map((p: any) => [p.id, { ...p, editorial: true, profile: profileMap.get(p.profile_id) }]));
  return {
    hasMore, nextOffset: offset + pageSize,
    posts: [...postSaves.map((s: any) => postMap.get(s.post_id)), ...editorialSaves.map((s: any) => editorialMap.get(s.post_id))].filter(Boolean),
    articles: articleSaves.map((s: any) => articleMap.get(s.article_id)).filter(Boolean),
  };
}

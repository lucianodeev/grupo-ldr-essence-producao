from pathlib import Path

p = Path("apps/painel-ldr/src/integrations/supabase/types.ts")
text = p.read_text()

required = (
    "academic_comments",
    "academic_connections",
    "academic_conversations",
    "academic_messages",
    "academic_post_media",
    "academic_posts",
    "academic_profiles",
    "academic_reactions",
    "academic_saved_posts",
)
present = [name for name in required if f"      {name}: {{" in text]
if len(present) == len(required):
    print("Academic Network table types already present and complete")
    raise SystemExit(0)
if present:
    missing = sorted(set(required) - set(present))
    raise SystemExit(
        "Partial Academic Network type set detected; refusing an unsafe mixed sync. "
        f"Present={present}; missing={missing}"
    )

marker = "      app_bootstrap: {"
if marker not in text:
    raise SystemExit("Supabase type insertion marker not found")

academic = '''      academic_comments: {
        Row: { anonymous: boolean; body: string; created_at: string; id: string; post_id: string; status: string; updated_at: string; user_id: string }
        Insert: { anonymous?: boolean; body: string; created_at?: string; id?: string; post_id: string; status?: string; updated_at?: string; user_id: string }
        Update: { anonymous?: boolean; body?: string; created_at?: string; id?: string; post_id?: string; status?: string; updated_at?: string; user_id?: string }
        Relationships: []
      }
      academic_connections: {
        Row: { created_at: string; id: string; receiver_user_id: string; requester_user_id: string; status: string; updated_at: string }
        Insert: { created_at?: string; id?: string; receiver_user_id: string; requester_user_id: string; status?: string; updated_at?: string }
        Update: { created_at?: string; id?: string; receiver_user_id?: string; requester_user_id?: string; status?: string; updated_at?: string }
        Relationships: []
      }
      academic_conversations: {
        Row: { created_at: string; id: string; last_message_at: string | null; updated_at: string; user_one_id: string; user_two_id: string }
        Insert: { created_at?: string; id?: string; last_message_at?: string | null; updated_at?: string; user_one_id: string; user_two_id: string }
        Update: { created_at?: string; id?: string; last_message_at?: string | null; updated_at?: string; user_one_id?: string; user_two_id?: string }
        Relationships: []
      }
      academic_messages: {
        Row: { body: string; conversation_id: string; created_at: string; id: string; read_at: string | null; sender_user_id: string; shared_post_id: string | null }
        Insert: { body?: string; conversation_id: string; created_at?: string; id?: string; read_at?: string | null; sender_user_id: string; shared_post_id?: string | null }
        Update: { body?: string; conversation_id?: string; created_at?: string; id?: string; read_at?: string | null; sender_user_id?: string; shared_post_id?: string | null }
        Relationships: []
      }
      academic_post_media: {
        Row: { alt_text: string; created_at: string; file_name: string | null; id: string; mime_type: string; owner_user_id: string; post_id: string; sort_order: number; storage_path: string }
        Insert: { alt_text?: string; created_at?: string; file_name?: string | null; id?: string; mime_type: string; owner_user_id: string; post_id: string; sort_order?: number; storage_path: string }
        Update: { alt_text?: string; created_at?: string; file_name?: string | null; id?: string; mime_type?: string; owner_user_id?: string; post_id?: string; sort_order?: number; storage_path?: string }
        Relationships: []
      }
      academic_posts: {
        Row: { anonymous: boolean; body: string; community_id: string | null; created_at: string; id: string; is_pinned: boolean; location_city: string | null; location_country: string | null; location_label: string | null; original_post_id: string | null; post_type: string; share_comment: string | null; share_slug: string | null; status: string; updated_at: string; user_id: string }
        Insert: { anonymous?: boolean; body: string; community_id?: string | null; created_at?: string; id?: string; is_pinned?: boolean; location_city?: string | null; location_country?: string | null; location_label?: string | null; original_post_id?: string | null; post_type?: string; share_comment?: string | null; share_slug?: string | null; status?: string; updated_at?: string; user_id: string }
        Update: { anonymous?: boolean; body?: string; community_id?: string | null; created_at?: string; id?: string; is_pinned?: boolean; location_city?: string | null; location_country?: string | null; location_label?: string | null; original_post_id?: string | null; post_type?: string; share_comment?: string | null; share_slug?: string | null; status?: string; updated_at?: string; user_id?: string }
        Relationships: []
      }
      academic_profiles: {
        Row: { avatar_path: string | null; bio: string; city: string; country: string; courses: string[]; created_at: string; display_role: string; id: string; interests: string[]; profession: string; profile_visibility: string; show_location: boolean; show_name: boolean; updated_at: string; user_id: string; username: string | null }
        Insert: { avatar_path?: string | null; bio?: string; city?: string; country?: string; courses?: string[]; created_at?: string; display_role?: string; id?: string; interests?: string[]; profession?: string; profile_visibility?: string; show_location?: boolean; show_name?: boolean; updated_at?: string; user_id: string; username?: string | null }
        Update: { avatar_path?: string | null; bio?: string; city?: string; country?: string; courses?: string[]; created_at?: string; display_role?: string; id?: string; interests?: string[]; profession?: string; profile_visibility?: string; show_location?: boolean; show_name?: boolean; updated_at?: string; user_id?: string; username?: string | null }
        Relationships: []
      }
      academic_reactions: {
        Row: { created_at: string; post_id: string; reaction_type: string; user_id: string }
        Insert: { created_at?: string; post_id: string; reaction_type?: string; user_id: string }
        Update: { created_at?: string; post_id?: string; reaction_type?: string; user_id?: string }
        Relationships: []
      }
      academic_saved_posts: {
        Row: { created_at: string; post_id: string; user_id: string }
        Insert: { created_at?: string; post_id: string; user_id: string }
        Update: { created_at?: string; post_id?: string; user_id?: string }
        Relationships: []
      }
'''

synced = text.replace(marker, academic + marker, 1)
for name in required:
    if f"      {name}: {{" not in synced:
        raise SystemExit(f"Academic type sync failed for {name}")

p.write_text(synced)
print("Synced and validated core Academic Network table types from current Supabase schema")
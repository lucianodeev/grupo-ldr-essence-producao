export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_access_trials: {
        Row: {
          created_at: string
          expires_at: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      academic_article_comments: {
        Row: {
          anonymous: boolean
          article_id: string
          body: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean
          article_id: string
          body: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous?: boolean
          article_id?: string
          body?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academic_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_article_reactions: {
        Row: {
          article_id: string
          created_at: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_article_reactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academic_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_articles: {
        Row: {
          body_html: string
          category: string
          community_id: string | null
          cover_path: string | null
          created_at: string
          id: string
          is_pinned: boolean
          keywords: string[]
          location_city: string | null
          location_country: string | null
          location_label: string | null
          references_text: string
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_html: string
          category?: string
          community_id?: string | null
          cover_path?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          keywords?: string[]
          location_city?: string | null
          location_country?: string | null
          location_label?: string | null
          references_text?: string
          slug: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_html?: string
          category?: string
          community_id?: string | null
          cover_path?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          keywords?: string[]
          location_city?: string | null
          location_country?: string | null
          location_label?: string | null
          references_text?: string
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_articles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "academic_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_challenge_entries: {
        Row: {
          article_id: string | null
          badge: string | null
          challenge_id: string
          community_score: number | null
          created_at: string
          entry_type: string
          final_score: number | null
          id: string
          jury_score: number | null
          post_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          article_id?: string | null
          badge?: string | null
          challenge_id: string
          community_score?: number | null
          created_at?: string
          entry_type: string
          final_score?: number | null
          id?: string
          jury_score?: number | null
          post_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          article_id?: string | null
          badge?: string | null
          challenge_id?: string
          community_score?: number | null
          created_at?: string
          entry_type?: string
          final_score?: number | null
          id?: string
          jury_score?: number | null
          post_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_challenge_entries_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academic_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "academic_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_challenge_entries_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_challenge_jury_scores: {
        Row: {
          challenge_entry_id: string
          created_at: string
          juror_user_id: string
          notes: string
          score: number
          updated_at: string
        }
        Insert: {
          challenge_entry_id: string
          created_at?: string
          juror_user_id: string
          notes?: string
          score: number
          updated_at?: string
        }
        Update: {
          challenge_entry_id?: string
          created_at?: string
          juror_user_id?: string
          notes?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_challenge_jury_scores_challenge_entry_id_fkey"
            columns: ["challenge_entry_id"]
            isOneToOne: false
            referencedRelation: "academic_challenge_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_challenges: {
        Row: {
          category: string
          community_weight: number
          created_at: string
          created_by: string
          description: string
          eligible_roles: string[]
          ends_at: string
          id: string
          image_path: string | null
          jury_weight: number
          rules: string
          slug: string
          starts_at: string
          status: string
          theme: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          community_weight?: number
          created_at?: string
          created_by: string
          description?: string
          eligible_roles?: string[]
          ends_at: string
          id?: string
          image_path?: string | null
          jury_weight?: number
          rules?: string
          slug: string
          starts_at: string
          status?: string
          theme: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          community_weight?: number
          created_at?: string
          created_by?: string
          description?: string
          eligible_roles?: string[]
          ends_at?: string
          id?: string
          image_path?: string | null
          jury_weight?: number
          rules?: string
          slug?: string
          starts_at?: string
          status?: string
          theme?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      academic_comments: {
        Row: {
          anonymous: boolean
          body: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean
          body: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous?: boolean
          body?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "academic_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_communities: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          is_open: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          is_open?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          is_open?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      academic_community_members: {
        Row: {
          community_id: string
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "academic_communities"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_connections: {
        Row: {
          created_at: string
          id: string
          receiver_user_id: string
          requester_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_user_id: string
          requester_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_user_id?: string
          requester_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      academic_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
          user_one_id: string
          user_two_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
          user_one_id: string
          user_two_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
          user_one_id?: string
          user_two_id?: string
        }
        Relationships: []
      }
      academic_diary_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          prompt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academic_editorial_articles: {
        Row: {
          body: string
          created_at: string
          editorial_generated_at: string
          editorial_seed: boolean
          id: string
          keywords: string[]
          language: string
          profile_id: string
          published_at: string
          slug: string
          status: string
          summary: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          editorial_generated_at?: string
          editorial_seed?: boolean
          id?: string
          keywords?: string[]
          language: string
          profile_id: string
          published_at?: string
          slug: string
          status?: string
          summary?: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          editorial_generated_at?: string
          editorial_seed?: boolean
          id?: string
          keywords?: string[]
          language?: string
          profile_id?: string
          published_at?: string
          slug?: string
          status?: string
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_editorial_articles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_editorial_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          language: string
          post_id: string
          profile_id: string
          published_at: string
          status: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          language: string
          post_id: string
          profile_id: string
          published_at?: string
          status?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          language?: string
          post_id?: string
          profile_id?: string
          published_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_editorial_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_editorial_comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_editorial_follows: {
        Row: {
          created_at: string
          editorial_profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          editorial_profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          editorial_profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_editorial_follows_editorial_profile_id_fkey"
            columns: ["editorial_profile_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_editorial_posts: {
        Row: {
          body: string
          created_at: string
          editorial_generated_at: string
          editorial_seed: boolean
          id: string
          language: string
          location_label: string | null
          media_alt: string | null
          media_url: string | null
          post_type: string
          profile_id: string
          published_at: string
          status: string
          topics: string[]
        }
        Insert: {
          body: string
          created_at?: string
          editorial_generated_at?: string
          editorial_seed?: boolean
          id?: string
          language: string
          location_label?: string | null
          media_alt?: string | null
          media_url?: string | null
          post_type?: string
          profile_id: string
          published_at?: string
          status?: string
          topics?: string[]
        }
        Update: {
          body?: string
          created_at?: string
          editorial_generated_at?: string
          editorial_seed?: boolean
          id?: string
          language?: string
          location_label?: string | null
          media_alt?: string | null
          media_url?: string | null
          post_type?: string
          profile_id?: string
          published_at?: string
          status?: string
          topics?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "academic_editorial_posts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_editorial_profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          bio: string
          city: string | null
          country: string
          created_at: string
          display_name: string
          id: string
          interests: string[]
          language: string
          profession: string
          specialty: string
          updated_at: string
          username: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          bio?: string
          city?: string | null
          country: string
          created_at?: string
          display_name: string
          id?: string
          interests?: string[]
          language: string
          profession?: string
          specialty?: string
          updated_at?: string
          username: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          bio?: string
          city?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id?: string
          interests?: string[]
          language?: string
          profession?: string
          specialty?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      academic_editorial_reactions: {
        Row: {
          created_at: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_editorial_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_editorial_settings: {
        Row: {
          high_activity_percent: number
          id: boolean
          low_activity_percent: number
          manual_max_percent: number
          medium_activity_percent: number
          mode: string
          updated_at: string
        }
        Insert: {
          high_activity_percent?: number
          id?: boolean
          low_activity_percent?: number
          manual_max_percent?: number
          medium_activity_percent?: number
          mode?: string
          updated_at?: string
        }
        Update: {
          high_activity_percent?: number
          id?: boolean
          low_activity_percent?: number
          manual_max_percent?: number
          medium_activity_percent?: number
          mode?: string
          updated_at?: string
        }
        Relationships: []
      }
      academic_editorial_user_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_editorial_user_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_follows: {
        Row: {
          created_at: string
          followed_user_id: string
          follower_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          followed_user_id: string
          follower_user_id: string
          status?: string
        }
        Update: {
          created_at?: string
          followed_user_id?: string
          follower_user_id?: string
          status?: string
        }
        Relationships: []
      }
      academic_mentions: {
        Row: {
          actor_user_id: string
          article_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          mentioned_user_id: string
          post_id: string | null
        }
        Insert: {
          actor_user_id: string
          article_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_user_id: string
          post_id?: string | null
        }
        Update: {
          actor_user_id?: string
          article_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          mentioned_user_id?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_mentions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academic_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_mentions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "academic_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_mentions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_user_id: string
          shared_post_id: string | null
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id: string
          shared_post_id?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id?: string
          shared_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "academic_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_messages_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_network_preferences: {
        Row: {
          interests: string[]
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          interests?: string[]
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          interests?: string[]
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academic_notification_reads: {
        Row: {
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_post_media: {
        Row: {
          alt_text: string
          created_at: string
          file_name: string | null
          id: string
          mime_type: string
          owner_user_id: string
          post_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type: string
          owner_user_id: string
          post_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string
          owner_user_id?: string
          post_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_post_topics: {
        Row: {
          created_at: string
          post_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_post_topics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_post_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "academic_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_posts: {
        Row: {
          anonymous: boolean
          body: string
          community_id: string | null
          created_at: string
          id: string
          is_pinned: boolean
          location_city: string | null
          location_country: string | null
          location_label: string | null
          original_post_id: string | null
          post_type: string
          share_comment: string | null
          share_slug: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anonymous?: boolean
          body: string
          community_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          location_city?: string | null
          location_country?: string | null
          location_label?: string | null
          original_post_id?: string | null
          post_type?: string
          share_comment?: string | null
          share_slug?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anonymous?: boolean
          body?: string
          community_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          location_city?: string | null
          location_country?: string | null
          location_label?: string | null
          original_post_id?: string | null
          post_type?: string
          share_comment?: string | null
          share_slug?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "academic_communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_posts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_profiles: {
        Row: {
          academic_area: string | null
          available_for_collaboration: boolean
          available_for_opportunities: boolean
          avatar_path: string | null
          bio: string
          city: string
          competencies: string[]
          country: string
          courses: string[]
          created_at: string
          display_role: string
          id: string
          institution: string | null
          interests: string[]
          languages: string[]
          linkedin_url: string | null
          profession: string
          professional_objective: string | null
          profile_visibility: string
          research_topics: string[]
          show_location: boolean
          show_name: boolean
          updated_at: string
          user_id: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          academic_area?: string | null
          available_for_collaboration?: boolean
          available_for_opportunities?: boolean
          avatar_path?: string | null
          bio?: string
          city?: string
          competencies?: string[]
          country?: string
          courses?: string[]
          created_at?: string
          display_role?: string
          id?: string
          institution?: string | null
          interests?: string[]
          languages?: string[]
          linkedin_url?: string | null
          profession?: string
          professional_objective?: string | null
          profile_visibility?: string
          research_topics?: string[]
          show_location?: boolean
          show_name?: boolean
          updated_at?: string
          user_id: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          academic_area?: string | null
          available_for_collaboration?: boolean
          available_for_opportunities?: boolean
          avatar_path?: string | null
          bio?: string
          city?: string
          competencies?: string[]
          country?: string
          courses?: string[]
          created_at?: string
          display_role?: string
          id?: string
          institution?: string | null
          interests?: string[]
          languages?: string[]
          linkedin_url?: string | null
          profession?: string
          professional_objective?: string | null
          profile_visibility?: string
          research_topics?: string[]
          show_location?: boolean
          show_name?: boolean
          updated_at?: string
          user_id?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      academic_promotions: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          metadata: Json
          sponsor_label: string
          starts_at: string | null
          status: string
          target_ref: string
          target_type: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          metadata?: Json
          sponsor_label?: string
          starts_at?: string | null
          status?: string
          target_ref: string
          target_type: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          metadata?: Json
          sponsor_label?: string
          starts_at?: string | null
          status?: string
          target_ref?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      academic_reactions: {
        Row: {
          created_at: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_reflection_prompts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          text: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: []
      }
      academic_reports: {
        Row: {
          article_id: string | null
          comment_id: string | null
          created_at: string
          details: string
          id: string
          post_id: string | null
          reason: string
          reporter_user_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          article_id?: string | null
          comment_id?: string | null
          created_at?: string
          details?: string
          id?: string
          post_id?: string | null
          reason: string
          reporter_user_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          article_id?: string | null
          comment_id?: string | null
          created_at?: string
          details?: string
          id?: string
          post_id?: string | null
          reason?: string
          reporter_user_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_reports_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academic_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "academic_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_saved_articles: {
        Row: {
          article_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_saved_articles_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "academic_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_saved_editorial_posts: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_saved_editorial_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_editorial_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_saved_posts: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "academic_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_topics: {
        Row: {
          created_at: string
          id: string
          label: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          slug?: string
        }
        Relationships: []
      }
      academy_institution_members: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_institution_members_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "academy_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_institution_students: {
        Row: {
          course_label: string | null
          created_at: string
          external_student_ref: string | null
          id: string
          institution_id: string
          joined_at: string | null
          status: string
          student_user_id: string
          updated_at: string
        }
        Insert: {
          course_label?: string | null
          created_at?: string
          external_student_ref?: string | null
          id?: string
          institution_id: string
          joined_at?: string | null
          status?: string
          student_user_id: string
          updated_at?: string
        }
        Update: {
          course_label?: string | null
          created_at?: string
          external_student_ref?: string | null
          id?: string
          institution_id?: string
          joined_at?: string | null
          status?: string
          student_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_institution_students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "academy_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_institutions: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          owner_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          owner_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      academy_student_attention_signals: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          observed_at: string
          rationale: Json
          resolved_at: string | null
          severity: string
          signal_type: string
          source_type: string
          student_user_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          observed_at?: string
          rationale?: Json
          resolved_at?: string | null
          severity?: string
          signal_type: string
          source_type?: string
          student_user_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          observed_at?: string
          rationale?: Json
          resolved_at?: string | null
          severity?: string
          signal_type?: string
          source_type?: string
          student_user_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_student_attention_signals_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "academy_institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      app_bootstrap: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: boolean
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: boolean
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target?: string | null
        }
        Relationships: []
      }
      business_projects: {
        Row: {
          business_name: string | null
          channels: string | null
          costs: string | null
          created_at: string
          goals_indicators: string | null
          id: string
          idea_pitch: string | null
          participant_id: string
          partners_resources: string | null
          plan_30_60_90: string | null
          pricing: string | null
          problem: string | null
          product_service: string | null
          revenues: string | null
          risks_responses: string | null
          sales: string | null
          solution: string | null
          target_audience: string | null
          updated_at: string
          value_proposition: string | null
        }
        Insert: {
          business_name?: string | null
          channels?: string | null
          costs?: string | null
          created_at?: string
          goals_indicators?: string | null
          id?: string
          idea_pitch?: string | null
          participant_id: string
          partners_resources?: string | null
          plan_30_60_90?: string | null
          pricing?: string | null
          problem?: string | null
          product_service?: string | null
          revenues?: string | null
          risks_responses?: string | null
          sales?: string | null
          solution?: string | null
          target_audience?: string | null
          updated_at?: string
          value_proposition?: string | null
        }
        Update: {
          business_name?: string | null
          channels?: string | null
          costs?: string | null
          created_at?: string
          goals_indicators?: string | null
          id?: string
          idea_pitch?: string | null
          participant_id?: string
          partners_resources?: string | null
          plan_30_60_90?: string | null
          pricing?: string | null
          problem?: string | null
          product_service?: string | null
          revenues?: string | null
          risks_responses?: string | null
          sales?: string | null
          solution?: string | null
          target_audience?: string | null
          updated_at?: string
          value_proposition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_projects_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      career_applications: {
        Row: {
          accessibility_needs: string | null
          allow_ldr_accessibility_support: boolean
          candidate_email: string
          candidate_location: string | null
          candidate_name: string
          candidate_phone: string | null
          candidate_user_id: string | null
          claim_token_hash: string | null
          communication_preference: string | null
          company_note: string | null
          created_at: string
          id: string
          job_id: string
          profile_url: string | null
          rejection_reason: string | null
          resume_path: string | null
          share_accessibility_with_company: boolean
          status: string
          summary: string
          triaged_at: string | null
          triaged_by: string | null
          updated_at: string
        }
        Insert: {
          accessibility_needs?: string | null
          allow_ldr_accessibility_support?: boolean
          candidate_email: string
          candidate_location?: string | null
          candidate_name: string
          candidate_phone?: string | null
          candidate_user_id?: string | null
          claim_token_hash?: string | null
          communication_preference?: string | null
          company_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          profile_url?: string | null
          rejection_reason?: string | null
          resume_path?: string | null
          share_accessibility_with_company?: boolean
          status?: string
          summary: string
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string
        }
        Update: {
          accessibility_needs?: string | null
          allow_ldr_accessibility_support?: boolean
          candidate_email?: string
          candidate_location?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          candidate_user_id?: string | null
          claim_token_hash?: string | null
          communication_preference?: string | null
          company_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          profile_url?: string | null
          rejection_reason?: string | null
          resume_path?: string | null
          share_accessibility_with_company?: boolean
          status?: string
          summary?: string
          triaged_at?: string | null
          triaged_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "career_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      career_candidate_evidence: {
        Row: {
          competency_key: string
          created_at: string
          evidence: Json
          evidence_type: string
          id: string
          journey_id: string
          stage_id: string | null
          validity_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          competency_key: string
          created_at?: string
          evidence?: Json
          evidence_type: string
          id?: string
          journey_id: string
          stage_id?: string | null
          validity_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          competency_key?: string
          created_at?: string
          evidence?: Json
          evidence_type?: string
          id?: string
          journey_id?: string
          stage_id?: string | null
          validity_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_candidate_evidence_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "career_selection_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_candidate_evidence_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "career_journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      career_candidate_profiles: {
        Row: {
          career_goal: string | null
          resume_summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_goal?: string | null
          resume_summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          career_goal?: string | null
          resume_summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_companies: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          owner_user_id: string | null
          professional_email: string | null
          responsible_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          owner_user_id?: string | null
          professional_email?: string | null
          responsible_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string | null
          professional_email?: string | null
          responsible_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      career_interest_leads: {
        Row: {
          audience_type: string
          city: string | null
          company_name: string | null
          company_sector: string | null
          consent: boolean
          consent_at: string
          country: string
          created_at: string
          email: string
          estimated_openings: string | null
          hiring_status: string | null
          id: string
          name: string
          opportunity_type: string | null
          phone: string | null
          professional_area: string | null
        }
        Insert: {
          audience_type: string
          city?: string | null
          company_name?: string | null
          company_sector?: string | null
          consent?: boolean
          consent_at?: string
          country: string
          created_at?: string
          email: string
          estimated_openings?: string | null
          hiring_status?: string | null
          id?: string
          name: string
          opportunity_type?: string | null
          phone?: string | null
          professional_area?: string | null
        }
        Update: {
          audience_type?: string
          city?: string | null
          company_name?: string | null
          company_sector?: string | null
          consent?: boolean
          consent_at?: string
          country?: string
          created_at?: string
          email?: string
          estimated_openings?: string | null
          hiring_status?: string | null
          id?: string
          name?: string
          opportunity_type?: string | null
          phone?: string | null
          professional_area?: string | null
        }
        Relationships: []
      }
      career_interview_records: {
        Row: {
          application_id: string
          company_id: string
          created_at: string
          experience_evidence: string | null
          id: string
          interviewer_user_id: string
          knowledge_evidence: string | null
          situation_evidence: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          company_id: string
          created_at?: string
          experience_evidence?: string | null
          id?: string
          interviewer_user_id: string
          knowledge_evidence?: string | null
          situation_evidence?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          company_id?: string
          created_at?: string
          experience_evidence?: string | null
          id?: string
          interviewer_user_id?: string
          knowledge_evidence?: string | null
          situation_evidence?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_interview_records_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "career_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_interview_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "career_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      career_job_competencies: {
        Row: {
          competency_key: string
          created_at: string
          description: string | null
          evidence_mode: string
          id: string
          job_id: string
          label: string
          position: number
          requirement_type: string
        }
        Insert: {
          competency_key: string
          created_at?: string
          description?: string | null
          evidence_mode?: string
          id?: string
          job_id: string
          label: string
          position?: number
          requirement_type: string
        }
        Update: {
          competency_key?: string
          created_at?: string
          description?: string | null
          evidence_mode?: string
          id?: string
          job_id?: string
          label?: string
          position?: number
          requirement_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_job_competencies_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "career_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      career_job_matches: {
        Row: {
          created_at: string
          id: string
          job_id: string
          rationale: Json
          status: string
          talent_pool_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          rationale?: Json
          status?: string
          talent_pool_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          rationale?: Json
          status?: string
          talent_pool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "career_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_job_matches_talent_pool_id_fkey"
            columns: ["talent_pool_id"]
            isOneToOne: false
            referencedRelation: "career_talent_pool"
            referencedColumns: ["id"]
          },
        ]
      }
      career_jobs: {
        Row: {
          accessibility_designated_disability: boolean
          accessibility_details: string | null
          accessibility_features: string[]
          accessibility_inclusive: boolean
          availability_details: string | null
          category: string | null
          city: string | null
          close_reason: string | null
          closed_at: string | null
          company_id: string | null
          contract_type: string
          country: string | null
          created_at: string
          description: string | null
          estimated_duration: string | null
          estimated_workload: string | null
          expected_start_date: string | null
          external_apply_url: string | null
          external_checked_at: string | null
          external_source_name: string | null
          external_source_url: string | null
          freelance_project_type: string | null
          id: string
          listing_origin: string
          publication_language: string
          published_at: string | null
          required_languages: string[]
          requirements: string | null
          responsibilities: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          salary_period: string | null
          status: string
          timezone: string | null
          title: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          accessibility_designated_disability?: boolean
          accessibility_details?: string | null
          accessibility_features?: string[]
          accessibility_inclusive?: boolean
          availability_details?: string | null
          category?: string | null
          city?: string | null
          close_reason?: string | null
          closed_at?: string | null
          company_id?: string | null
          contract_type?: string
          country?: string | null
          created_at?: string
          description?: string | null
          estimated_duration?: string | null
          estimated_workload?: string | null
          expected_start_date?: string | null
          external_apply_url?: string | null
          external_checked_at?: string | null
          external_source_name?: string | null
          external_source_url?: string | null
          freelance_project_type?: string | null
          id?: string
          listing_origin?: string
          publication_language?: string
          published_at?: string | null
          required_languages?: string[]
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          status?: string
          timezone?: string | null
          title: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          accessibility_designated_disability?: boolean
          accessibility_details?: string | null
          accessibility_features?: string[]
          accessibility_inclusive?: boolean
          availability_details?: string | null
          category?: string | null
          city?: string | null
          close_reason?: string | null
          closed_at?: string | null
          company_id?: string | null
          contract_type?: string
          country?: string | null
          created_at?: string
          description?: string | null
          estimated_duration?: string | null
          estimated_workload?: string | null
          expected_start_date?: string | null
          external_apply_url?: string | null
          external_checked_at?: string | null
          external_source_name?: string | null
          external_source_url?: string | null
          freelance_project_type?: string | null
          id?: string
          listing_origin?: string
          publication_language?: string
          published_at?: string | null
          required_languages?: string[]
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          status?: string
          timezone?: string | null
          title?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "career_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      career_journey_stages: {
        Row: {
          created_at: string
          id: string
          journey_id: string
          metadata: Json
          position: number
          required: boolean
          stage_key: string
          stage_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          journey_id: string
          metadata?: Json
          position: number
          required?: boolean
          stage_key: string
          stage_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          journey_id?: string
          metadata?: Json
          position?: number
          required?: boolean
          stage_key?: string
          stage_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_journey_stages_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "career_selection_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      career_selection_journeys: {
        Row: {
          application_id: string
          completed_at: string | null
          created_at: string
          id: string
          job_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_selection_journeys_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "career_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_selection_journeys_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "career_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      career_talent_pool: {
        Row: {
          active: boolean
          candidate_user_id: string
          consented_at: string
          created_at: string
          id: string
          source_application_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          candidate_user_id: string
          consented_at: string
          created_at?: string
          id?: string
          source_application_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          candidate_user_id?: string
          consented_at?: string
          created_at?: string
          id?: string
          source_application_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_talent_pool_source_application_id_fkey"
            columns: ["source_application_id"]
            isOneToOne: false
            referencedRelation: "career_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          access_tier: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          locale: string
          post_type: string
          published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_tier?: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          post_type?: string
          published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_tier?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          post_type?: string
          published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          employee_count: number
          extra_credits: number
          id: string
          monthly_amount_cents: number
          organization_id: string
          plan_code: string
          region: string
          services: Json
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          employee_count: number
          extra_credits?: number
          id?: string
          monthly_amount_cents: number
          organization_id: string
          plan_code: string
          region: string
          services?: Json
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          employee_count?: number
          extra_credits?: number
          id?: string
          monthly_amount_cents?: number
          organization_id?: string
          plan_code?: string
          region?: string
          services?: Json
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_product_submissions: {
        Row: {
          admin_notes: string | null
          bio: string | null
          category: string
          city: string | null
          country: string | null
          created_at: string
          creator_due_cents: number
          creator_name: string
          creator_share_percent: number
          currency: string
          description: string
          email: string
          files: Json
          gross_sales_cents: number
          id: string
          keywords: string[]
          ldr_commission_cents: number
          ldr_commission_percent: number
          locale: string
          net_sales_cents: number
          payout_status: string
          phone: string | null
          product_language: string
          product_type: string
          public_name: string | null
          published_at: string | null
          published_product_key: string | null
          rights_accepted_at: string
          short_description: string | null
          status: string
          subtitle: string | null
          suggested_price_cents: number | null
          target_audience: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          category: string
          city?: string | null
          country?: string | null
          created_at?: string
          creator_due_cents?: number
          creator_name: string
          creator_share_percent?: number
          currency?: string
          description: string
          email: string
          files?: Json
          gross_sales_cents?: number
          id?: string
          keywords?: string[]
          ldr_commission_cents?: number
          ldr_commission_percent?: number
          locale?: string
          net_sales_cents?: number
          payout_status?: string
          phone?: string | null
          product_language?: string
          product_type: string
          public_name?: string | null
          published_at?: string | null
          published_product_key?: string | null
          rights_accepted_at: string
          short_description?: string | null
          status?: string
          subtitle?: string | null
          suggested_price_cents?: number | null
          target_audience?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          category?: string
          city?: string | null
          country?: string | null
          created_at?: string
          creator_due_cents?: number
          creator_name?: string
          creator_share_percent?: number
          currency?: string
          description?: string
          email?: string
          files?: Json
          gross_sales_cents?: number
          id?: string
          keywords?: string[]
          ldr_commission_cents?: number
          ldr_commission_percent?: number
          locale?: string
          net_sales_cents?: number
          payout_status?: string
          phone?: string | null
          product_language?: string
          product_type?: string
          public_name?: string | null
          published_at?: string | null
          published_product_key?: string | null
          rights_accepted_at?: string
          short_description?: string | null
          status?: string
          subtitle?: string | null
          suggested_price_cents?: number | null
          target_audience?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          auth_user_id: string | null
          birth_date: string | null
          country: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          language: string | null
          next_day_off: string | null
          notes: string | null
          phone: string | null
          portal_active: boolean
          portal_linked_at: string | null
          source: string | null
          updated_at: string
          vacation_end: string | null
          vacation_start: string | null
        }
        Insert: {
          auth_user_id?: string | null
          birth_date?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          language?: string | null
          next_day_off?: string | null
          notes?: string | null
          phone?: string | null
          portal_active?: boolean
          portal_linked_at?: string | null
          source?: string | null
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
        }
        Update: {
          auth_user_id?: string | null
          birth_date?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          language?: string | null
          next_day_off?: string | null
          notes?: string | null
          phone?: string | null
          portal_active?: boolean
          portal_linked_at?: string | null
          source?: string | null
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          approved_at: string | null
          assignee_id: string | null
          client_note: string | null
          client_visible: boolean
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivered_at: string | null
          delivery_url: string | null
          description: string | null
          due_date: string | null
          id: string
          needs_client_approval: boolean
          order_id: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          assignee_id?: string | null
          client_note?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_url?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          needs_client_approval?: boolean
          order_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          assignee_id?: string | null
          client_note?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivery_url?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          needs_client_approval?: boolean
          order_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_events: {
        Row: {
          actor_id: string | null
          actor_kind: string
          actor_label: string | null
          comment: string | null
          created_at: string
          delivery_id: string
          event: Database["public"]["Enums"]["delivery_event_type"]
          id: string
        }
        Insert: {
          actor_id?: string | null
          actor_kind?: string
          actor_label?: string | null
          comment?: string | null
          created_at?: string
          delivery_id: string
          event: Database["public"]["Enums"]["delivery_event_type"]
          id?: string
        }
        Update: {
          actor_id?: string | null
          actor_kind?: string
          actor_label?: string | null
          comment?: string | null
          created_at?: string
          delivery_id?: string
          event?: Database["public"]["Enums"]["delivery_event_type"]
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_events_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_product_content: {
        Row: {
          active: boolean
          content: Json
          locale: string
          product_key: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          active?: boolean
          content: Json
          locale: string
          product_key: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          active?: boolean
          content?: Json
          locale?: string
          product_key?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      ecosystem_contact_attachments: {
        Row: {
          contact_id: string
          created_at: string
          direction: string
          id: string
          message_id: string | null
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          direction: string
          id?: string
          message_id?: string | null
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          direction?: string
          id?: string
          message_id?: string | null
          mime_type?: string
          original_name?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_contact_attachments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_contact_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_contact_messages: {
        Row: {
          body: string
          channel: string
          contact_id: string
          created_at: string
          created_by: string | null
          direction: string
          external_message_id: string | null
          id: string
          recipient: string | null
          sender: string | null
          sent_at: string | null
        }
        Insert: {
          body: string
          channel?: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          direction: string
          external_message_id?: string | null
          id?: string
          recipient?: string | null
          sender?: string | null
          sent_at?: string | null
        }
        Update: {
          body?: string
          channel?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          direction?: string
          external_message_id?: string | null
          id?: string
          recipient?: string | null
          sender?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_contact_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_contacts: {
        Row: {
          consent_contact: boolean
          created_at: string
          email: string
          first_response_at: string | null
          id: string
          language: string
          message: string
          name: string
          phone: string | null
          priority: string
          protocol: string
          resolved_at: string | null
          response_due_at: string
          source_project: string
          source_url: string | null
          status: string
          subject: string
          updated_at: string
          upload_token_expires_at: string | null
          upload_token_hash: string | null
          wants_luciano: boolean
        }
        Insert: {
          consent_contact?: boolean
          created_at?: string
          email: string
          first_response_at?: string | null
          id?: string
          language?: string
          message: string
          name: string
          phone?: string | null
          priority?: string
          protocol?: string
          resolved_at?: string | null
          response_due_at?: string
          source_project?: string
          source_url?: string | null
          status?: string
          subject: string
          updated_at?: string
          upload_token_expires_at?: string | null
          upload_token_hash?: string | null
          wants_luciano?: boolean
        }
        Update: {
          consent_contact?: boolean
          created_at?: string
          email?: string
          first_response_at?: string | null
          id?: string
          language?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string
          protocol?: string
          resolved_at?: string | null
          response_due_at?: string
          source_project?: string
          source_url?: string | null
          status?: string
          subject?: string
          updated_at?: string
          upload_token_expires_at?: string | null
          upload_token_hash?: string | null
          wants_luciano?: boolean
        }
        Relationships: []
      }
      editorial_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          market: string
          monthly_amount_cents: number
          product_key: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          market: string
          monthly_amount_cents: number
          product_key: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          market?: string
          monthly_amount_cents?: number
          product_key?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      film_pitch_requests: {
        Row: {
          company: string
          country: string
          created_at: string
          email: string
          id: string
          language: string
          message: string | null
          name: string
          professional_capacity: boolean
          professional_role: string
          status: string
        }
        Insert: {
          company: string
          country: string
          created_at?: string
          email: string
          id?: string
          language?: string
          message?: string | null
          name: string
          professional_capacity: boolean
          professional_role: string
          status?: string
        }
        Update: {
          company?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          language?: string
          message?: string | null
          name?: string
          professional_capacity?: boolean
          professional_role?: string
          status?: string
        }
        Relationships: []
      }
      integration_events: {
        Row: {
          created_at: string
          customer_id: string | null
          event_id: string
          event_type: string
          id: string
          occurred_at: string
          order_id: string | null
          source: string
          status: string
          summary: Json
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          event_id: string
          event_type: string
          id?: string
          occurred_at?: string
          order_id?: string | null
          source: string
          status?: string
          summary?: Json
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          event_id?: string
          event_type?: string
          id?: string
          occurred_at?: string
          order_id?: string | null
          source?: string
          status?: string
          summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_career_goals: {
        Row: {
          created_at: string
          id: string
          status: string
          target_competency_keys: string[]
          target_country: string | null
          target_title: string
          target_work_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          target_competency_keys?: string[]
          target_country?: string | null
          target_title: string
          target_work_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          target_competency_keys?: string[]
          target_country?: string | null
          target_title?: string
          target_work_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ldr_copilot_actions: {
        Row: {
          action_type: string
          context_reference: string | null
          context_type: string
          created_at: string
          expires_at: string | null
          generated_at: string
          id: string
          rationale: Json
          status: string
          title: string
          user_id: string
        }
        Insert: {
          action_type: string
          context_reference?: string | null
          context_type: string
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          rationale?: Json
          status?: string
          title: string
          user_id: string
        }
        Update: {
          action_type?: string
          context_reference?: string | null
          context_type?: string
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          rationale?: Json
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ldr_ecosystem_links: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          relation_type: string
          source_reference: string
          source_type: string
          target_reference: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          relation_type: string
          source_reference: string
          source_type: string
          target_reference: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          relation_type?: string
          source_reference?: string
          source_type?: string
          target_reference?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      ldr_experience_challenges: {
        Row: {
          brief: string | null
          competency_keys: string[]
          created_at: string
          id: string
          position: number
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          brief?: string | null
          competency_keys?: string[]
          created_at?: string
          id?: string
          position?: number
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          brief?: string | null
          competency_keys?: string[]
          created_at?: string
          id?: string
          position?: number
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_experience_challenges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ldr_experience_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_experience_participants: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          joined_at: string | null
          participation_role: string
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          joined_at?: string | null
          participation_role?: string
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          joined_at?: string | null
          participation_role?: string
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_experience_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ldr_experience_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_experience_projects: {
        Row: {
          compensation_amount: number | null
          compensation_type: string
          created_at: string
          currency: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_public: boolean
          metadata: Json
          modality: string
          organization_name: string | null
          owner_user_id: string
          starts_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          compensation_amount?: number | null
          compensation_type?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          modality: string
          organization_name?: string | null
          owner_user_id: string
          starts_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          compensation_amount?: number | null
          compensation_type?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          modality?: string
          organization_name?: string | null
          owner_user_id?: string
          starts_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ldr_identity_roles: {
        Row: {
          activated_at: string
          created_at: string
          deactivated_at: string | null
          id: string
          is_active: boolean
          role_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          role_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          role_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ldr_market_radar_signals: {
        Row: {
          active: boolean
          competency_key: string | null
          created_at: string
          evidence: Json
          expires_at: string | null
          id: string
          market_scope: string
          observed_at: string
          signal_type: string
          title: string
        }
        Insert: {
          active?: boolean
          competency_key?: string | null
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          market_scope: string
          observed_at: string
          signal_type: string
          title: string
        }
        Update: {
          active?: boolean
          competency_key?: string | null
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          id?: string
          market_scope?: string
          observed_at?: string
          signal_type?: string
          title?: string
        }
        Relationships: []
      }
      ldr_opportunity_feedback_events: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          metadata: Json
          opportunity_title: string | null
          opportunity_type: string
          rationale_snapshot: Json | null
          recommendation_id: string | null
          source_reference: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: string
          id?: string
          metadata?: Json
          opportunity_title?: string | null
          opportunity_type: string
          rationale_snapshot?: Json | null
          recommendation_id?: string | null
          source_reference?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          metadata?: Json
          opportunity_title?: string | null
          opportunity_type?: string
          rationale_snapshot?: Json | null
          recommendation_id?: string | null
          source_reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_opportunity_feedback_events_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ldr_opportunity_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_opportunity_recommendations: {
        Row: {
          created_at: string
          expires_at: string | null
          generated_at: string
          id: string
          opportunity_type: string
          rationale: Json
          source_reference: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          opportunity_type: string
          rationale?: Json
          source_reference?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          generated_at?: string
          id?: string
          opportunity_type?: string
          rationale?: Json
          source_reference?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      ldr_pass_subscriptions: {
        Row: {
          amount_cents: number
          billing_cycle: string
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          ldr_one_offer: string | null
          ldr_one_seats: number | null
          market: string
          plan: string
          source: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          billing_cycle: string
          cancel_at_period_end?: boolean
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          ldr_one_offer?: string | null
          ldr_one_seats?: number | null
          market: string
          plan: string
          source?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          billing_cycle?: string
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          ldr_one_offer?: string | null
          ldr_one_seats?: number | null
          market?: string
          plan?: string
          source?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_pass_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_proofs: {
        Row: {
          artifact_url: string | null
          competency_key: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          metadata: Json
          occurred_at: string | null
          proof_type: string
          source_label: string | null
          source_reference: string | null
          source_type: string
          title: string
          updated_at: string
          user_id: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          artifact_url?: string | null
          competency_key?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          occurred_at?: string | null
          proof_type: string
          source_label?: string | null
          source_reference?: string | null
          source_type: string
          title: string
          updated_at?: string
          user_id: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          artifact_url?: string | null
          competency_key?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          metadata?: Json
          occurred_at?: string | null
          proof_type?: string
          source_label?: string | null
          source_reference?: string | null
          source_type?: string
          title?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      ldr_sales_training_progress: {
        Row: {
          certificate_code: string | null
          certificate_issued_at: string | null
          completed_at: string | null
          completed_modules: number[]
          current_module: number
          last_access_at: string | null
          quiz_answers: Json
          quiz_correct: number
          quiz_total: number
          seller_id: string
          started_at: string | null
          updated_at: string
        }
        Insert: {
          certificate_code?: string | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          completed_modules?: number[]
          current_module?: number
          last_access_at?: string | null
          quiz_answers?: Json
          quiz_correct?: number
          quiz_total?: number
          seller_id: string
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          certificate_code?: string | null
          certificate_issued_at?: string | null
          completed_at?: string | null
          completed_modules?: number[]
          current_module?: number
          last_access_at?: string | null
          quiz_answers?: Json
          quiz_correct?: number
          quiz_total?: number
          seller_id?: string
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_sales_training_progress_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_seller_catalog: {
        Row: {
          active: boolean
          allow_quantity: boolean
          amount_cents: number
          billing_cadence: string | null
          billing_mode: string
          catalog_key: string
          commission_rate: number
          created_at: string
          currency: string
          name: string
          portal_kind: string
          portal_target: string | null
          product_url: string | null
          sales_category: string
          seller_enabled: boolean
          source_category: string | null
          source_metadata: Json
          source_site: string
          stripe_payment_link_id: string | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_quantity?: boolean
          amount_cents: number
          billing_cadence?: string | null
          billing_mode?: string
          catalog_key: string
          commission_rate: number
          created_at?: string
          currency: string
          name: string
          portal_kind?: string
          portal_target?: string | null
          product_url?: string | null
          sales_category: string
          seller_enabled?: boolean
          source_category?: string | null
          source_metadata?: Json
          source_site: string
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_quantity?: boolean
          amount_cents?: number
          billing_cadence?: string | null
          billing_mode?: string
          catalog_key?: string
          commission_rate?: number
          created_at?: string
          currency?: string
          name?: string
          portal_kind?: string
          portal_target?: string | null
          product_url?: string | null
          sales_category?: string
          seller_enabled?: boolean
          source_category?: string | null
          source_metadata?: Json
          source_site?: string
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ldr_seller_referrals: {
        Row: {
          amount_cents: number | null
          catalog_key: string
          commission_rate: number
          created_at: string
          currency: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          expires_at: string
          id: string
          market: string
          paid_at: string | null
          plan_code: string
          portal_kind: string
          seller_id: string
          seller_sale_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_event_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          catalog_key: string
          commission_rate: number
          created_at?: string
          currency?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          expires_at?: string
          id?: string
          market: string
          paid_at?: string | null
          plan_code: string
          portal_kind: string
          seller_id: string
          seller_sale_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          catalog_key?: string
          commission_rate?: number
          created_at?: string
          currency?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          expires_at?: string
          id?: string
          market?: string
          paid_at?: string | null
          plan_code?: string
          portal_kind?: string
          seller_id?: string
          seller_sale_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_seller_referrals_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ldr_seller_referrals_seller_sale_id_fkey"
            columns: ["seller_sale_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_seller_stripe_events: {
        Row: {
          event_id: string
          event_type: string
          payload_summary: Json
          processed_at: string
          sale_id: string | null
        }
        Insert: {
          event_id: string
          event_type: string
          payload_summary?: Json
          processed_at?: string
          sale_id?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string
          payload_summary?: Json
          processed_at?: string
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ldr_seller_stripe_events_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_simple_admin: {
        Row: {
          email: string
          id: boolean
          password_hash: string
          updated_at: string
        }
        Insert: {
          email: string
          id?: boolean
          password_hash: string
          updated_at?: string
        }
        Update: {
          email?: string
          id?: boolean
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      ldr_simple_candidate_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_by_admin_at: string | null
          read_by_seller_at: string | null
          seller_id: string
          sender_role: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_by_admin_at?: string | null
          read_by_seller_at?: string | null
          seller_id: string
          sender_role: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_by_admin_at?: string | null
          read_by_seller_at?: string | null
          seller_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_simple_candidate_messages_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_simple_payment_details: {
        Row: {
          account_holder_name: string
          bank_country: string | null
          bank_name: string | null
          bic_swift: string | null
          created_at: string
          iban: string | null
          payout_type: string
          pix_key: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          account_holder_name: string
          bank_country?: string | null
          bank_name?: string | null
          bic_swift?: string | null
          created_at?: string
          iban?: string | null
          payout_type: string
          pix_key?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          account_holder_name?: string
          bank_country?: string | null
          bank_name?: string | null
          bic_swift?: string | null
          created_at?: string
          iban?: string | null
          payout_type?: string
          pix_key?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_simple_payment_details_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_simple_payouts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string
          payment_reference: string | null
          seller_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency: string
          id?: string
          paid_at?: string
          payment_reference?: string | null
          seller_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string
          payment_reference?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_simple_payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_simple_sales: {
        Row: {
          access_email_sent_at: string | null
          amount_cents: number
          catalog_key: string | null
          category: string
          checkout_url: string | null
          commission_adjustment_required: boolean
          commission_cents: number
          commission_converted_cents: number | null
          commission_original_cents: number | null
          commission_rate: number
          confirmed_at: string | null
          conversion_status: string
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          exchange_rate: number | null
          exchange_rate_date: string | null
          exchange_source: string | null
          id: string
          paid_at: string | null
          payment_expires_at: string | null
          payment_status: string
          payment_updated_at: string | null
          payout_currency: string | null
          payout_id: string | null
          refund_amount_cents: number
          sale_source: string
          seller_id: string
          service_name: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_event_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_link_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          access_email_sent_at?: string | null
          amount_cents: number
          catalog_key?: string | null
          category?: string
          checkout_url?: string | null
          commission_adjustment_required?: boolean
          commission_cents: number
          commission_converted_cents?: number | null
          commission_original_cents?: number | null
          commission_rate: number
          confirmed_at?: string | null
          conversion_status?: string
          created_at?: string
          currency: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          exchange_rate?: number | null
          exchange_rate_date?: string | null
          exchange_source?: string | null
          id?: string
          paid_at?: string | null
          payment_expires_at?: string | null
          payment_status?: string
          payment_updated_at?: string | null
          payout_currency?: string | null
          payout_id?: string | null
          refund_amount_cents?: number
          sale_source?: string
          seller_id: string
          service_name: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          access_email_sent_at?: string | null
          amount_cents?: number
          catalog_key?: string | null
          category?: string
          checkout_url?: string | null
          commission_adjustment_required?: boolean
          commission_cents?: number
          commission_converted_cents?: number | null
          commission_original_cents?: number | null
          commission_rate?: number
          confirmed_at?: string | null
          conversion_status?: string
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          exchange_rate?: number | null
          exchange_rate_date?: string | null
          exchange_source?: string | null
          id?: string
          paid_at?: string | null
          payment_expires_at?: string | null
          payment_status?: string
          payment_updated_at?: string | null
          payout_currency?: string | null
          payout_id?: string | null
          refund_amount_cents?: number
          sale_source?: string
          seller_id?: string
          service_name?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_event_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ldr_simple_sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_simple_sellers: {
        Row: {
          application_status: string
          application_updated_at: string
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          interview_at: string | null
          interview_link: string | null
          interview_mode: string | null
          interview_notes: string | null
          interview_timezone: string | null
          introduction: string | null
          password_hash: string
          phone: string | null
          preferred_currency: string
          preferred_language: string
          sales_experience: string | null
          status: string
        }
        Insert: {
          application_status?: string
          application_updated_at?: string
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          interview_at?: string | null
          interview_link?: string | null
          interview_mode?: string | null
          interview_notes?: string | null
          interview_timezone?: string | null
          introduction?: string | null
          password_hash: string
          phone?: string | null
          preferred_currency?: string
          preferred_language?: string
          sales_experience?: string | null
          status?: string
        }
        Update: {
          application_status?: string
          application_updated_at?: string
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interview_at?: string | null
          interview_link?: string | null
          interview_mode?: string | null
          interview_notes?: string | null
          interview_timezone?: string | null
          introduction?: string | null
          password_hash?: string
          phone?: string | null
          preferred_currency?: string
          preferred_language?: string
          sales_experience?: string | null
          status?: string
        }
        Relationships: []
      }
      ldr_simple_sessions: {
        Row: {
          created_at: string
          expires_at: string
          role: string
          seller_id: string | null
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          role: string
          seller_id?: string | null
          token?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          role?: string
          seller_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_simple_sessions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "ldr_simple_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_squad_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          role_label: string | null
          squad_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          role_label?: string | null
          squad_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          role_label?: string | null
          squad_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "ldr_squads"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_squads: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_user_id: string
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_user_id: string
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ldr_squads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ldr_experience_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ldr_work_preferences: {
        Row: {
          active: boolean
          competency_keys: string[]
          country_codes: string[]
          created_at: string
          currency: string | null
          minimum_compensation_cents: number | null
          modalities: string[]
          opportunity_types: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          competency_keys?: string[]
          country_codes?: string[]
          created_at?: string
          currency?: string | null
          minimum_compensation_cents?: number | null
          modalities?: string[]
          opportunity_types?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          competency_keys?: string[]
          country_codes?: string[]
          created_at?: string
          currency?: string | null
          minimum_compensation_cents?: number | null
          modalities?: string[]
          opportunity_types?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      library_comments: {
        Row: {
          author_kind: string
          author_label: string | null
          author_user_id: string
          body: string
          created_at: string
          customer_id: string
          id: string
          parent_id: string | null
          product_key: string | null
          status: string
          training_id: string | null
          updated_at: string
        }
        Insert: {
          author_kind: string
          author_label?: string | null
          author_user_id: string
          body: string
          created_at?: string
          customer_id: string
          id?: string
          parent_id?: string | null
          product_key?: string | null
          status?: string
          training_id?: string | null
          updated_at?: string
        }
        Update: {
          author_kind?: string
          author_label?: string | null
          author_user_id?: string
          body?: string
          created_at?: string
          customer_id?: string
          id?: string
          parent_id?: string | null
          product_key?: string | null
          status?: string
          training_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_comments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "library_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_comments_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      library_progress: {
        Row: {
          current_location: string | null
          customer_id: string
          id: string
          product_key: string
          progress_percent: number
          updated_at: string
        }
        Insert: {
          current_location?: string | null
          customer_id: string
          id?: string
          product_key: string
          progress_percent?: number
          updated_at?: string
        }
        Update: {
          current_location?: string | null
          customer_id?: string
          id?: string
          product_key?: string
          progress_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_progress_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      library_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          market: string
          monthly_amount_cents: number
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          currency: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          market: string
          monthly_amount_cents: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          market?: string
          monthly_amount_cents?: number
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_bookings: {
        Row: {
          checkout_expires_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          customer_auth_user_id: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          ends_at: string
          gross_amount_cents: number
          id: string
          modality: string
          professional_profile_id: string
          professional_service_id: string
          provider_label: string
          service_provider_type: string
          starts_at: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          checkout_expires_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency: string
          customer_auth_user_id?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          ends_at: string
          gross_amount_cents: number
          id?: string
          modality: string
          professional_profile_id: string
          professional_service_id: string
          provider_label?: string
          service_provider_type?: string
          starts_at: string
          status?: string
          timezone: string
          updated_at?: string
        }
        Update: {
          checkout_expires_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          customer_auth_user_id?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          ends_at?: string
          gross_amount_cents?: number
          id?: string
          modality?: string
          professional_profile_id?: string
          professional_service_id?: string
          provider_label?: string
          service_provider_type?: string
          starts_at?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_bookings_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_bookings_professional_service_id_fkey"
            columns: ["professional_service_id"]
            isOneToOne: false
            referencedRelation: "professional_services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_ledger: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          currency: string
          description: string | null
          entry_type: string
          id: string
          idempotency_key: string
          payment_id: string | null
          professional_account_id: string
          stripe_event_id: string | null
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string
          currency: string
          description?: string | null
          entry_type: string
          id?: string
          idempotency_key: string
          payment_id?: string | null
          professional_account_id: string
          stripe_event_id?: string | null
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          entry_type?: string
          id?: string
          idempotency_key?: string
          payment_id?: string | null
          professional_account_id?: string
          stripe_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_ledger_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "marketplace_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_ledger_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_payments: {
        Row: {
          adjustment_cents: number
          booking_id: string | null
          created_at: string
          currency: string
          gross_amount_cents: number
          id: string
          paid_at: string | null
          payment_fee_cents: number
          platform_fee_cents: number
          platform_fee_percent_at_transaction: number | null
          platform_fee_rate: number
          professional_account_id: string
          provider_net_cents: number
          refund_amount_cents: number
          status: string
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          adjustment_cents?: number
          booking_id?: string | null
          created_at?: string
          currency: string
          gross_amount_cents: number
          id?: string
          paid_at?: string | null
          payment_fee_cents?: number
          platform_fee_cents?: number
          platform_fee_percent_at_transaction?: number | null
          platform_fee_rate: number
          professional_account_id: string
          provider_net_cents?: number
          refund_amount_cents?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          adjustment_cents?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          gross_amount_cents?: number
          id?: string
          paid_at?: string | null
          payment_fee_cents?: number
          platform_fee_cents?: number
          platform_fee_percent_at_transaction?: number | null
          platform_fee_rate?: number
          professional_account_id?: string
          provider_net_cents?: number
          refund_amount_cents?: number
          status?: string
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_payments_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          client_notes: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number
          id: string
          internal_notes: string | null
          meeting_url: string | null
          mentorship_id: string
          scheduled_at: string | null
          session_number: number | null
          status: Database["public"]["Enums"]["session_status"]
          title: string
          updated_at: string
        }
        Insert: {
          client_notes?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          internal_notes?: string | null
          meeting_url?: string | null
          mentorship_id: string
          scheduled_at?: string | null
          session_number?: number | null
          status?: Database["public"]["Enums"]["session_status"]
          title?: string
          updated_at?: string
        }
        Update: {
          client_notes?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number
          id?: string
          internal_notes?: string | null
          meeting_url?: string | null
          mentorship_id?: string
          scheduled_at?: string | null
          session_number?: number | null
          status?: Database["public"]["Enums"]["session_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_mentorship_id_fkey"
            columns: ["mentorship_id"]
            isOneToOne: false
            referencedRelation: "mentorships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorships: {
        Row: {
          client_summary: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          external_ref: string | null
          goal: string | null
          id: string
          intake_answers: string | null
          next_steps: string | null
          notes: string | null
          order_id: string | null
          participant_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          program_name: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["mentorship_status"]
          updated_at: string
        }
        Insert: {
          client_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          external_ref?: string | null
          goal?: string | null
          id?: string
          intake_answers?: string | null
          next_steps?: string | null
          notes?: string | null
          order_id?: string | null
          participant_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          program_name?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Update: {
          client_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          external_ref?: string | null
          goal?: string | null
          id?: string
          intake_answers?: string | null
          next_steps?: string | null
          notes?: string | null
          order_id?: string | null
          participant_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          program_name?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorships_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorships_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          attempts: number
          audience_type: string
          body: string
          channel: string
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          last_error: string | null
          metadata: Json
          organization_id: string | null
          recipient: string | null
          scheduled_for: string
          sent_at: string | null
          status: string
          subject: string | null
          target_id: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          audience_type: string
          body: string
          channel: string
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          last_error?: string | null
          metadata?: Json
          organization_id?: string | null
          recipient?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          target_id?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          audience_type?: string
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          last_error?: string | null
          metadata?: Json
          organization_id?: string | null
          recipient?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          target_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          appointment_reminders: boolean
          audience_type: string
          birthday_messages: boolean
          created_at: string
          day_off_messages: boolean
          email_enabled: boolean
          locale: string
          marketing_enabled: boolean
          sms_enabled: boolean
          target_id: string
          updated_at: string
          vacation_messages: boolean
        }
        Insert: {
          appointment_reminders?: boolean
          audience_type: string
          birthday_messages?: boolean
          created_at?: string
          day_off_messages?: boolean
          email_enabled?: boolean
          locale?: string
          marketing_enabled?: boolean
          sms_enabled?: boolean
          target_id: string
          updated_at?: string
          vacation_messages?: boolean
        }
        Update: {
          appointment_reminders?: boolean
          audience_type?: string
          birthday_messages?: boolean
          created_at?: string
          day_off_messages?: boolean
          email_enabled?: boolean
          locale?: string
          marketing_enabled?: boolean
          sms_enabled?: boolean
          target_id?: string
          updated_at?: string
          vacation_messages?: boolean
        }
        Relationships: []
      }
      order_history: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          created_at: string
          field: string
          id: string
          new_value: string | null
          note: string | null
          old_value: string | null
          order_id: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          field: string
          id?: string
          new_value?: string | null
          note?: string | null
          old_value?: string | null
          order_id: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          field?: string
          id?: string
          new_value?: string | null
          note?: string | null
          old_value?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number | null
          assignee_id: string | null
          catalog_key: string | null
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          description: string | null
          due_date: string | null
          external_ref: string | null
          id: string
          internal_notes: string | null
          is_request: boolean
          metadata: Json
          order_number: string
          organization_id: string | null
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          priority: Database["public"]["Enums"]["priority_level"]
          quantity: number
          service_type: Database["public"]["Enums"]["service_type"]
          source: string
          status: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_link_id: string | null
          stripe_price_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          assignee_id?: string | null
          catalog_key?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          external_ref?: string | null
          id?: string
          internal_notes?: string | null
          is_request?: boolean
          metadata?: Json
          order_number: string
          organization_id?: string | null
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          priority?: Database["public"]["Enums"]["priority_level"]
          quantity?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          source?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          assignee_id?: string | null
          catalog_key?: string | null
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          description?: string | null
          due_date?: string | null
          external_ref?: string | null
          id?: string
          internal_notes?: string | null
          is_request?: boolean
          metadata?: Json
          order_number?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          priority?: Database["public"]["Enums"]["priority_level"]
          quantity?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          source?: string
          status?: Database["public"]["Enums"]["order_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_benefit_allocations: {
        Row: {
          catalog_key: string
          created_at: string
          credits_granted: number
          credits_used: number
          id: string
          member_id: string
          organization_id: string
          purchase_id: string | null
          requested_at: string | null
          schedule_status: string
          scheduled_at: string | null
          scheduled_note: string | null
          status: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          catalog_key: string
          created_at?: string
          credits_granted?: number
          credits_used?: number
          id?: string
          member_id: string
          organization_id: string
          purchase_id?: string | null
          requested_at?: string | null
          schedule_status?: string
          scheduled_at?: string | null
          scheduled_note?: string | null
          status?: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          catalog_key?: string
          created_at?: string
          credits_granted?: number
          credits_used?: number
          id?: string
          member_id?: string
          organization_id?: string
          purchase_id?: string | null
          requested_at?: string | null
          schedule_status?: string
          scheduled_at?: string | null
          scheduled_note?: string | null
          status?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_benefit_allocations_catalog_key_fkey"
            columns: ["catalog_key"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "organization_benefit_allocations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_benefit_allocations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_benefit_allocations_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "organization_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          auth_user_id: string | null
          birth_date: string | null
          created_at: string
          department: string | null
          email: string
          employee_code: string | null
          full_name: string
          id: string
          next_day_off: string | null
          organization_id: string
          phone: string | null
          portal_active: boolean
          updated_at: string
          vacation_end: string | null
          vacation_start: string | null
        }
        Insert: {
          auth_user_id?: string | null
          birth_date?: string | null
          created_at?: string
          department?: string | null
          email: string
          employee_code?: string | null
          full_name: string
          id?: string
          next_day_off?: string | null
          organization_id: string
          phone?: string | null
          portal_active?: boolean
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
        }
        Update: {
          auth_user_id?: string | null
          birth_date?: string | null
          created_at?: string
          department?: string | null
          email?: string
          employee_code?: string | null
          full_name?: string
          id?: string
          next_day_off?: string | null
          organization_id?: string
          phone?: string | null
          portal_active?: boolean
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_purchase_members: {
        Row: {
          member_id: string
          purchase_id: string
        }
        Insert: {
          member_id: string
          purchase_id: string
        }
        Update: {
          member_id?: string
          purchase_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_purchase_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_purchase_members_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "organization_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_purchases: {
        Row: {
          catalog_key: string
          created_at: string
          id: string
          order_id: string | null
          organization_id: string
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          catalog_key: string
          created_at?: string
          id?: string
          order_id?: string | null
          organization_id: string
          quantity: number
          status?: string
          updated_at?: string
        }
        Update: {
          catalog_key?: string
          created_at?: string
          id?: string
          order_id?: string | null
          organization_id?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_purchases_catalog_key_fkey"
            columns: ["catalog_key"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "organization_purchases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_service_catalog: {
        Row: {
          active: boolean
          catalog_key: string
          created_at: string
          max_quantity: number
          min_quantity: number
          unit_label: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          catalog_key: string
          created_at?: string
          max_quantity?: number
          min_quantity?: number
          unit_label?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          catalog_key?: string
          created_at?: string
          max_quantity?: number
          min_quantity?: number
          unit_label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_service_catalog_catalog_key_fkey"
            columns: ["catalog_key"]
            isOneToOne: true
            referencedRelation: "service_catalog"
            referencedColumns: ["catalog_key"]
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean
          billing_email: string
          country: string | null
          created_at: string
          id: string
          name: string
          owner_auth_user_id: string
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_email: string
          country?: string | null
          created_at?: string
          id?: string
          name: string
          owner_auth_user_id: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_email?: string
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_auth_user_id?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          birth_date: string | null
          business_area: string | null
          business_stage: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          goal: string | null
          id: string
          notes: string | null
          phone: string | null
          professional_account_id: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          business_area?: string | null
          business_stage?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          goal?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          professional_account_id?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          business_area?: string | null
          business_stage?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          goal?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          professional_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_documents: {
        Row: {
          currency: string | null
          declared_amount_cents: number | null
          document_type: string
          id: string
          mime_type: string | null
          original_filename: string | null
          payout_id: string
          period_end: string | null
          period_start: string | null
          professional_account_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          currency?: string | null
          declared_amount_cents?: number | null
          document_type: string
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          payout_id: string
          period_end?: string | null
          period_start?: string | null
          professional_account_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          currency?: string | null
          declared_amount_cents?: number | null
          document_type?: string
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          payout_id?: string
          period_end?: string | null
          period_start?: string | null
          professional_account_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_documents_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_documents_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          adjustment_cents: number
          created_at: string
          currency: string
          gross_cents: number
          id: string
          net_cents: number
          paid_at: string | null
          payment_fee_cents: number
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          platform_fee_cents: number
          professional_account_id: string
          refund_cents: number
          scheduled_for: string | null
          status: string
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          adjustment_cents?: number
          created_at?: string
          currency: string
          gross_cents?: number
          id?: string
          net_cents?: number
          paid_at?: string | null
          payment_fee_cents?: number
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          platform_fee_cents?: number
          professional_account_id: string
          refund_cents?: number
          scheduled_for?: string | null
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          adjustment_cents?: number
          created_at?: string
          currency?: string
          gross_cents?: number
          id?: string
          net_cents?: number
          paid_at?: string | null
          payment_fee_cents?: number
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          platform_fee_cents?: number
          professional_account_id?: string
          refund_cents?: number
          scheduled_for?: string | null
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pde_records: {
        Row: {
          competencies: string | null
          created_at: string
          evolution: string | null
          id: string
          participant_id: string
          recommendations: string | null
          strengths: string | null
          updated_at: string
        }
        Insert: {
          competencies?: string | null
          created_at?: string
          evolution?: string | null
          id?: string
          participant_id: string
          recommendations?: string | null
          strengths?: string | null
          updated_at?: string
        }
        Update: {
          competencies?: string | null
          created_at?: string
          evolution?: string | null
          id?: string
          participant_id?: string
          recommendations?: string | null
          strengths?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pde_records_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_library_files: {
        Row: {
          author: string | null
          category: string
          created_at: string
          file_size: number
          id: string
          mime_type: string
          notes: string | null
          original_file_name: string
          publication_year: number | null
          storage_path: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string
          created_at?: string
          file_size: number
          id?: string
          mime_type?: string
          notes?: string | null
          original_file_name: string
          publication_year?: number | null
          storage_path: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string
          created_at?: string
          file_size?: number
          id?: string
          mime_type?: string
          notes?: string | null
          original_file_name?: string
          publication_year?: number | null
          storage_path?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_financial_config: {
        Row: {
          active: boolean
          config_key: string
          id: string
          json_value: Json | null
          numeric_value: number | null
          text_value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          config_key: string
          id?: string
          json_value?: Json | null
          numeric_value?: number | null
          text_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          config_key?: string
          id?: string
          json_value?: Json | null
          numeric_value?: number | null
          text_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      postgraduate_interest_leads: {
        Row: {
          course_key: string
          course_title: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          source: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          course_key: string
          course_title: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          course_key?: string
          course_title?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      press_article_sources: {
        Row: {
          article_id: string
          created_at: string
          id: string
          professional_profile_id: string | null
          quote_or_note: string | null
          source_name: string
          source_role: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          professional_profile_id?: string | null
          quote_or_note?: string | null
          source_name: string
          source_role?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          professional_profile_id?: string | null
          quote_or_note?: string | null
          source_name?: string
          source_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "press_article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "press_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "press_article_sources_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      press_articles: {
        Row: {
          author_name: string
          author_user_id: string | null
          body: string
          category: string
          content_type: string
          cover_image_url: string | null
          created_at: string
          editor_name: string | null
          excerpt: string | null
          id: string
          locale: string
          published_at: string | null
          scheduled_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
          workflow_status: string
        }
        Insert: {
          author_name: string
          author_user_id?: string | null
          body?: string
          category?: string
          content_type?: string
          cover_image_url?: string | null
          created_at?: string
          editor_name?: string | null
          excerpt?: string | null
          id?: string
          locale?: string
          published_at?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
          workflow_status?: string
        }
        Update: {
          author_name?: string
          author_user_id?: string | null
          body?: string
          category?: string
          content_type?: string
          cover_image_url?: string | null
          created_at?: string
          editor_name?: string | null
          excerpt?: string | null
          id?: string
          locale?: string
          published_at?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          workflow_status?: string
        }
        Relationships: []
      }
      press_collaboration_opportunities: {
        Row: {
          career_job_id: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string
          id: string
          languages: string[]
          role_type: string
          status: string
          title: string
          updated_at: string
          work_mode: string
        }
        Insert: {
          career_job_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description: string
          id?: string
          languages?: string[]
          role_type: string
          status?: string
          title: string
          updated_at?: string
          work_mode?: string
        }
        Update: {
          career_job_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string
          id?: string
          languages?: string[]
          role_type?: string
          status?: string
          title?: string
          updated_at?: string
          work_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "press_collaboration_opportunities_career_job_id_fkey"
            columns: ["career_job_id"]
            isOneToOne: false
            referencedRelation: "career_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      press_contact_requests: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          languages: string | null
          message: string | null
          name: string
          organization: string | null
          professional_link: string | null
          request_type: string
          role: string | null
          status: string
          topics: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          languages?: string | null
          message?: string | null
          name: string
          organization?: string | null
          professional_link?: string | null
          request_type: string
          role?: string | null
          status?: string
          topics?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          languages?: string | null
          message?: string | null
          name?: string
          organization?: string | null
          professional_link?: string | null
          request_type?: string
          role?: string | null
          status?: string
          topics?: string | null
        }
        Relationships: []
      }
      press_journalist_profiles: {
        Row: {
          auth_user_id: string
          availability_status: string
          bio: string | null
          city: string | null
          collaboration_role: string
          country: string | null
          coverage_cities: string[]
          coverage_countries: string[]
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          languages: string[]
          organization: string | null
          professional_link: string | null
          role: string | null
          topics: string[]
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          availability_status?: string
          bio?: string | null
          city?: string | null
          collaboration_role?: string
          country?: string | null
          coverage_cities?: string[]
          coverage_countries?: string[]
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          languages?: string[]
          organization?: string | null
          professional_link?: string | null
          role?: string | null
          topics?: string[]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          availability_status?: string
          bio?: string | null
          city?: string | null
          collaboration_role?: string
          country?: string | null
          coverage_cities?: string[]
          coverage_countries?: string[]
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          languages?: string[]
          organization?: string | null
          professional_link?: string | null
          role?: string | null
          topics?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      press_source_matches: {
        Row: {
          created_at: string
          id: string
          match_reasons: string[]
          match_score: number
          professional_profile_id: string
          source_request_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_reasons?: string[]
          match_score?: number
          professional_profile_id: string
          source_request_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_reasons?: string[]
          match_score?: number
          professional_profile_id?: string
          source_request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "press_source_matches_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "press_source_matches_source_request_id_fkey"
            columns: ["source_request_id"]
            isOneToOne: false
            referencedRelation: "press_source_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      press_source_requests: {
        Row: {
          country: string | null
          created_at: string
          deadline: string | null
          description: string
          expert_type: string | null
          id: string
          interview_format: string | null
          journalist_email: string
          journalist_name: string
          journalist_user_id: string | null
          language: string | null
          organization: string | null
          status: string
          topic: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          expert_type?: string | null
          id?: string
          interview_format?: string | null
          journalist_email: string
          journalist_name: string
          journalist_user_id?: string | null
          language?: string | null
          organization?: string | null
          status?: string
          topic: string
        }
        Update: {
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          expert_type?: string | null
          id?: string
          interview_format?: string | null
          journalist_email?: string
          journalist_name?: string
          journalist_user_id?: string | null
          language?: string | null
          organization?: string | null
          status?: string
          topic?: string
        }
        Relationships: []
      }
      prive_profile_photos: {
        Row: {
          created_at: string
          id: number
          is_primary: boolean
          sort_order: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          is_primary?: boolean
          sort_order?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          is_primary?: boolean
          sort_order?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      prive_profiles: {
        Row: {
          bio: string | null
          birth_date: string
          city: string
          country: string
          created_at: string
          is_online: boolean
          is_published: boolean
          languages: string | null
          public_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          birth_date: string
          city: string
          country: string
          created_at?: string
          is_online?: boolean
          is_published?: boolean
          languages?: string | null
          public_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          birth_date?: string
          city?: string
          country?: string
          created_at?: string
          is_online?: boolean
          is_published?: boolean
          languages?: string | null
          public_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prive_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          current_period_end: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professional_accounts: {
        Row: {
          auth_user_id: string
          connect_status: string
          country_code: string | null
          created_at: string
          custom_commission_rate: number | null
          engagement_model: string
          id: string
          managed_by_admin: boolean
          onboarding_completed: boolean
          onboarding_step: number
          payout_method_status: string
          preferred_currency: string | null
          status: string
          stripe_connected_account_id: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          connect_status?: string
          country_code?: string | null
          created_at?: string
          custom_commission_rate?: number | null
          engagement_model?: string
          id?: string
          managed_by_admin?: boolean
          onboarding_completed?: boolean
          onboarding_step?: number
          payout_method_status?: string
          preferred_currency?: string | null
          status?: string
          stripe_connected_account_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          connect_status?: string
          country_code?: string | null
          created_at?: string
          custom_commission_rate?: number | null
          engagement_model?: string
          id?: string
          managed_by_admin?: boolean
          onboarding_completed?: boolean
          onboarding_step?: number
          payout_method_status?: string
          preferred_currency?: string | null
          status?: string
          stripe_connected_account_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      professional_availability: {
        Row: {
          active: boolean
          buffer_minutes: number
          created_at: string
          effective_from: string | null
          effective_until: string | null
          end_time: string | null
          id: string
          location_label: string | null
          modality: string | null
          professional_profile_id: string
          professional_service_id: string | null
          slot_interval_minutes: number
          start_time: string | null
          timezone: string
          weekday: number | null
        }
        Insert: {
          active?: boolean
          buffer_minutes?: number
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string | null
          id?: string
          location_label?: string | null
          modality?: string | null
          professional_profile_id: string
          professional_service_id?: string | null
          slot_interval_minutes?: number
          start_time?: string | null
          timezone?: string
          weekday?: number | null
        }
        Update: {
          active?: boolean
          buffer_minutes?: number
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          end_time?: string | null
          id?: string
          location_label?: string | null
          modality?: string | null
          professional_profile_id?: string
          professional_service_id?: string | null
          slot_interval_minutes?: number
          start_time?: string | null
          timezone?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_availability_professional_service_id_fkey"
            columns: ["professional_service_id"]
            isOneToOne: false
            referencedRelation: "professional_services"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_categories: {
        Row: {
          active: boolean
          created_at: string
          fee_compliance_status: string
          id: string
          name_en: string | null
          name_es: string | null
          name_fr: string | null
          name_pt: string
          network_group: string | null
          regulated_by_default: boolean
          requires_admin_review: boolean
          requires_documents: boolean
          requires_license: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          fee_compliance_status?: string
          id?: string
          name_en?: string | null
          name_es?: string | null
          name_fr?: string | null
          name_pt: string
          network_group?: string | null
          regulated_by_default?: boolean
          requires_admin_review?: boolean
          requires_documents?: boolean
          requires_license?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          fee_compliance_status?: string
          id?: string
          name_en?: string | null
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string
          network_group?: string | null
          regulated_by_default?: boolean
          requires_admin_review?: boolean
          requires_documents?: boolean
          requires_license?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      professional_category_specialties: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          specialty_id: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          specialty_id: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_category_specialties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_category_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "professional_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_consents: {
        Row: {
          auth_user_id: string | null
          consent_key: string
          created_at: string
          granted: boolean
          id: string
          ip_hash: string | null
          legal_basis: string | null
          locale: string | null
          policy_version: string
          professional_account_id: string | null
          user_agent_hash: string | null
        }
        Insert: {
          auth_user_id?: string | null
          consent_key: string
          created_at?: string
          granted: boolean
          id?: string
          ip_hash?: string | null
          legal_basis?: string | null
          locale?: string | null
          policy_version: string
          professional_account_id?: string | null
          user_agent_hash?: string | null
        }
        Update: {
          auth_user_id?: string | null
          consent_key?: string
          created_at?: string
          granted?: boolean
          id?: string
          ip_hash?: string | null
          legal_basis?: string | null
          locale?: string | null
          policy_version?: string
          professional_account_id?: string | null
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_consents_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_conversations: {
        Row: {
          created_at: string
          customer_auth_user_id: string
          id: string
          last_message_at: string | null
          professional_account_id: string
          professional_profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_auth_user_id: string
          id?: string
          last_message_at?: string | null
          professional_account_id: string
          professional_profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_auth_user_id?: string
          id?: string
          last_message_at?: string | null
          professional_account_id?: string
          professional_profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_conversations_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_conversations_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_country_rules: {
        Row: {
          active: boolean
          advertising_restrictions: Json
          allowed_modalities: Json
          category_id: string
          consumer_rules: Json
          country_code: string
          created_at: string
          emergency_notice: string | null
          fiscal_requirements: Json
          id: string
          legal_notice: string | null
          public_disclosures: Json
          registration_label: string | null
          required_documents: Json
          requires_manual_review: boolean
          requires_registration: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          rule_version: string
          title_label: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          advertising_restrictions?: Json
          allowed_modalities?: Json
          category_id: string
          consumer_rules?: Json
          country_code: string
          created_at?: string
          emergency_notice?: string | null
          fiscal_requirements?: Json
          id?: string
          legal_notice?: string | null
          public_disclosures?: Json
          registration_label?: string | null
          required_documents?: Json
          requires_manual_review?: boolean
          requires_registration?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_version?: string
          title_label?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          advertising_restrictions?: Json
          allowed_modalities?: Json
          category_id?: string
          consumer_rules?: Json
          country_code?: string
          created_at?: string
          emergency_notice?: string | null
          fiscal_requirements?: Json
          id?: string
          legal_notice?: string | null
          public_disclosures?: Json
          registration_label?: string | null
          required_documents?: Json
          requires_manual_review?: boolean
          requires_registration?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_version?: string
          title_label?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_country_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_credentials: {
        Row: {
          category_id: string | null
          country_code: string | null
          created_at: string
          credential_number: string | null
          credential_type: string
          id: string
          issuing_body: string | null
          meets_title_requirement: boolean
          professional_account_id: string
          qualification_name: string | null
          region: string | null
          status: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category_id?: string | null
          country_code?: string | null
          created_at?: string
          credential_number?: string | null
          credential_type: string
          id?: string
          issuing_body?: string | null
          meets_title_requirement?: boolean
          professional_account_id: string
          qualification_name?: string | null
          region?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category_id?: string | null
          country_code?: string | null
          created_at?: string
          credential_number?: string | null
          credential_type?: string
          id?: string
          issuing_body?: string | null
          meets_title_requirement?: boolean
          professional_account_id?: string
          qualification_name?: string | null
          region?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_credentials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_credentials_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_documents: {
        Row: {
          country_code: string | null
          created_at: string
          document_type: string
          expires_at: string | null
          id: string
          mime_type: string | null
          original_filename: string | null
          professional_account_id: string
          rejection_reason: string | null
          status: string
          storage_path: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          document_type: string
          expires_at?: string | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          professional_account_id: string
          rejection_reason?: string | null
          status?: string
          storage_path: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          document_type?: string
          expires_at?: string | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          professional_account_id?: string
          rejection_reason?: string | null
          status?: string
          storage_path?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_documents_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_event_registrations: {
        Row: {
          event_id: string
          id: string
          professional_account_id: string
          registered_at: string
          status: string
        }
        Insert: {
          event_id: string
          id?: string
          professional_account_id: string
          registered_at?: string
          status?: string
        }
        Update: {
          event_id?: string
          id?: string
          professional_account_id?: string
          registered_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "professional_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_event_registrations_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_events: {
        Row: {
          access_tier: string
          audience: Json
          created_at: string
          description: string | null
          ends_at: string | null
          event_type: string
          id: string
          instructor: string | null
          meeting_url: string | null
          published: boolean
          starts_at: string
          timezone: string
          title: string
          updated_at: string
        }
        Insert: {
          access_tier?: string
          audience?: Json
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type: string
          id?: string
          instructor?: string | null
          meeting_url?: string | null
          published?: boolean
          starts_at: string
          timezone?: string
          title: string
          updated_at?: string
        }
        Update: {
          access_tier?: string
          audience?: Json
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: string
          id?: string
          instructor?: string | null
          meeting_url?: string | null
          published?: boolean
          starts_at?: string
          timezone?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_external_reviews: {
        Row: {
          body: string
          created_at: string
          id: string
          imported_by: string | null
          professional_profile_id: string
          published: boolean
          rating: number
          review_date: string
          reviewer_name: string
          source: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          imported_by?: string | null
          professional_profile_id: string
          published?: boolean
          rating: number
          review_date: string
          reviewer_name: string
          source?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          imported_by?: string | null
          professional_profile_id?: string
          published?: boolean
          rating?: number
          review_date?: string
          reviewer_name?: string
          source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_external_reviews_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_auth_user_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_auth_user_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_auth_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "professional_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          about: string | null
          available_for_press: boolean
          category_id: string
          city: string | null
          compliance_status: string
          country_code: string
          created_at: string
          display_name: string
          documents_verified: boolean
          education_summary: string | null
          experience_summary: string | null
          id: string
          identity_verified: boolean
          in_person_enabled: boolean
          international_positioning: string | null
          intro_video_url: string | null
          is_public: boolean
          languages: string[]
          lgbtq_self_identified: boolean | null
          online_enabled: boolean
          open_to_international_projects: boolean
          open_to_partnerships: boolean
          operating_countries: string[]
          photo_url: string | null
          press_contact_consent: boolean
          press_languages: string[]
          press_topics: string[]
          professional_account_id: string
          professional_title: string
          profile_headline: string | null
          profile_status: string
          profile_verified: boolean
          public_region: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          show_lgbtq_badge: boolean
          show_passport_badge: boolean
          slug: string
          specialties: string[]
          updated_at: string
          view_count: number
        }
        Insert: {
          about?: string | null
          available_for_press?: boolean
          category_id: string
          city?: string | null
          compliance_status?: string
          country_code: string
          created_at?: string
          display_name: string
          documents_verified?: boolean
          education_summary?: string | null
          experience_summary?: string | null
          id?: string
          identity_verified?: boolean
          in_person_enabled?: boolean
          international_positioning?: string | null
          intro_video_url?: string | null
          is_public?: boolean
          languages?: string[]
          lgbtq_self_identified?: boolean | null
          online_enabled?: boolean
          open_to_international_projects?: boolean
          open_to_partnerships?: boolean
          operating_countries?: string[]
          photo_url?: string | null
          press_contact_consent?: boolean
          press_languages?: string[]
          press_topics?: string[]
          professional_account_id: string
          professional_title: string
          profile_headline?: string | null
          profile_status?: string
          profile_verified?: boolean
          public_region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          show_lgbtq_badge?: boolean
          show_passport_badge?: boolean
          slug: string
          specialties?: string[]
          updated_at?: string
          view_count?: number
        }
        Update: {
          about?: string | null
          available_for_press?: boolean
          category_id?: string
          city?: string | null
          compliance_status?: string
          country_code?: string
          created_at?: string
          display_name?: string
          documents_verified?: boolean
          education_summary?: string | null
          experience_summary?: string | null
          id?: string
          identity_verified?: boolean
          in_person_enabled?: boolean
          international_positioning?: string | null
          intro_video_url?: string | null
          is_public?: boolean
          languages?: string[]
          lgbtq_self_identified?: boolean | null
          online_enabled?: boolean
          open_to_international_projects?: boolean
          open_to_partnerships?: boolean
          operating_countries?: string[]
          photo_url?: string | null
          press_contact_consent?: boolean
          press_languages?: string[]
          press_topics?: string[]
          professional_account_id?: string
          professional_title?: string
          profile_headline?: string | null
          profile_status?: string
          profile_verified?: boolean
          public_region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          show_lgbtq_badge?: boolean
          show_passport_badge?: boolean
          slug?: string
          specialties?: string[]
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_profiles_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: true
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          professional_profile_id: string | null
          report_type: string
          reporter_auth_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          professional_profile_id?: string | null
          report_type: string
          reporter_auth_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          professional_profile_id?: string | null
          report_type?: string
          reporter_auth_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_reports_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_reviews: {
        Row: {
          body: string | null
          booking_id: string
          created_at: string
          customer_auth_user_id: string | null
          customer_id: string | null
          id: string
          moderated_at: string | null
          moderation_note: string | null
          professional_profile_id: string
          professional_reply: string | null
          rating: number
          replied_at: string | null
          status: string
          verified_booking: boolean
        }
        Insert: {
          body?: string | null
          booking_id: string
          created_at?: string
          customer_auth_user_id?: string | null
          customer_id?: string | null
          id?: string
          moderated_at?: string | null
          moderation_note?: string | null
          professional_profile_id: string
          professional_reply?: string | null
          rating: number
          replied_at?: string | null
          status?: string
          verified_booking?: boolean
        }
        Update: {
          body?: string | null
          booking_id?: string
          created_at?: string
          customer_auth_user_id?: string | null
          customer_id?: string | null
          id?: string
          moderated_at?: string | null
          moderation_note?: string | null
          professional_profile_id?: string
          professional_reply?: string | null
          rating?: number
          replied_at?: string | null
          status?: string
          verified_booking?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_service_catalog: {
        Row: {
          active: boolean
          allowed_modalities: string[]
          catalog_key: string
          category_id: string
          created_at: string
          default_billing_unit: string
          default_duration_minutes: number | null
          description_pt: string | null
          fee_compliance_status: string
          id: string
          name_en: string | null
          name_es: string | null
          name_fr: string | null
          name_pt: string
          requires_admin_review: boolean
          requires_license: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_modalities?: string[]
          catalog_key: string
          category_id: string
          created_at?: string
          default_billing_unit?: string
          default_duration_minutes?: number | null
          description_pt?: string | null
          fee_compliance_status?: string
          id?: string
          name_en?: string | null
          name_es?: string | null
          name_fr?: string | null
          name_pt: string
          requires_admin_review?: boolean
          requires_license?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_modalities?: string[]
          catalog_key?: string
          category_id?: string
          created_at?: string
          default_billing_unit?: string
          default_duration_minutes?: number | null
          description_pt?: string | null
          fee_compliance_status?: string
          id?: string
          name_en?: string | null
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string
          requires_admin_review?: boolean
          requires_license?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_service_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_service_eligibility: {
        Row: {
          active: boolean
          allowed_modalities: string[]
          catalog_key: string
          category_id: string
          country_code: string | null
          created_at: string
          id: string
          notes: string | null
          requires_admin_review: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_modalities?: string[]
          catalog_key: string
          category_id: string
          country_code?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requires_admin_review?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_modalities?: string[]
          catalog_key?: string
          category_id?: string
          country_code?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requires_admin_review?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_service_eligibility_catalog_key_fkey"
            columns: ["catalog_key"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "professional_service_eligibility_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "professional_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_service_price_reference: {
        Row: {
          active: boolean
          billing_unit: string
          catalog_service_id: string
          created_at: string
          currency: string
          id: string
          market_code: string
          max_amount_cents: number | null
          min_amount_cents: number | null
          notes: string | null
          source_date: string | null
          source_label: string | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_unit?: string
          catalog_service_id: string
          created_at?: string
          currency: string
          id?: string
          market_code: string
          max_amount_cents?: number | null
          min_amount_cents?: number | null
          notes?: string | null
          source_date?: string | null
          source_label?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_unit?: string
          catalog_service_id?: string
          created_at?: string
          currency?: string
          id?: string
          market_code?: string
          max_amount_cents?: number | null
          min_amount_cents?: number | null
          notes?: string | null
          source_date?: string | null
          source_label?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_service_price_reference_catalog_service_id_fkey"
            columns: ["catalog_service_id"]
            isOneToOne: false
            referencedRelation: "professional_service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_services: {
        Row: {
          active: boolean
          approval_status: string
          available_for_company: boolean
          available_for_private: boolean
          billing_unit: string
          booking_enabled: boolean
          catalog_key: string | null
          city: string | null
          country_codes: string[]
          created_at: string
          currency: string | null
          description: string | null
          duration_minutes: number
          fee_compliance_note: string | null
          fee_compliance_status: string
          id: string
          image_url: string | null
          language_codes: string[]
          modality: string
          name: string
          price_cents: number | null
          professional_catalog_key: string | null
          professional_profile_id: string
          public_location: string | null
          quote_required: boolean
          requires_admin_review: boolean
          sort_order: number
          source_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          approval_status?: string
          available_for_company?: boolean
          available_for_private?: boolean
          billing_unit?: string
          booking_enabled?: boolean
          catalog_key?: string | null
          city?: string | null
          country_codes?: string[]
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes: number
          fee_compliance_note?: string | null
          fee_compliance_status?: string
          id?: string
          image_url?: string | null
          language_codes?: string[]
          modality: string
          name: string
          price_cents?: number | null
          professional_catalog_key?: string | null
          professional_profile_id: string
          public_location?: string | null
          quote_required?: boolean
          requires_admin_review?: boolean
          sort_order?: number
          source_type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          approval_status?: string
          available_for_company?: boolean
          available_for_private?: boolean
          billing_unit?: string
          booking_enabled?: boolean
          catalog_key?: string | null
          city?: string | null
          country_codes?: string[]
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes?: number
          fee_compliance_note?: string | null
          fee_compliance_status?: string
          id?: string
          image_url?: string | null
          language_codes?: string[]
          modality?: string
          name?: string
          price_cents?: number | null
          professional_catalog_key?: string | null
          professional_profile_id?: string
          public_location?: string | null
          quote_required?: boolean
          requires_admin_review?: boolean
          sort_order?: number
          source_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_catalog_key_fkey"
            columns: ["catalog_key"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "professional_services_professional_catalog_key_fkey"
            columns: ["professional_catalog_key"]
            isOneToOne: false
            referencedRelation: "professional_service_catalog"
            referencedColumns: ["catalog_key"]
          },
          {
            foreignKeyName: "professional_services_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_specialties: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name_en: string | null
          name_es: string | null
          name_fr: string | null
          name_pt: string
          sort_order: number
          specialty_key: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name_en?: string | null
          name_es?: string | null
          name_fr?: string | null
          name_pt: string
          sort_order?: number
          specialty_key: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name_en?: string | null
          name_es?: string | null
          name_fr?: string | null
          name_pt?: string
          sort_order?: number
          specialty_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      professional_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          professional_account_id: string
          status: string
          stripe_checkout_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          professional_account_id: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          professional_account_id?: string
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_subscriptions_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_unavailability: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          professional_profile_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          professional_profile_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          professional_profile_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_unavailability_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_written_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          sender_type: string
          sender_user_id: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          sender_type: string
          sender_user_id?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          sender_type?: string
          sender_user_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_written_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "professional_written_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_written_promos: {
        Row: {
          created_at: string
          customer_id: string
          first_purchase_at: string
          promo_expires_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          first_purchase_at: string
          promo_expires_at: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          first_purchase_at?: string
          promo_expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_written_promos_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_written_sessions: {
        Row: {
          amount_cents: number
          auth_user_id: string
          consent_at: string | null
          created_at: string
          currency: string
          customer_id: string
          ended_at: string | null
          id: string
          last_client_message_at: string | null
          last_professional_message_at: string | null
          last_timer_started_at: string | null
          order_id: string | null
          package_minutes: number
          promo_applied: boolean
          purchased_seconds: number
          remaining_seconds: number
          started_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          timer_running: boolean
          updated_at: string
        }
        Insert: {
          amount_cents: number
          auth_user_id: string
          consent_at?: string | null
          created_at?: string
          currency: string
          customer_id: string
          ended_at?: string | null
          id?: string
          last_client_message_at?: string | null
          last_professional_message_at?: string | null
          last_timer_started_at?: string | null
          order_id?: string | null
          package_minutes: number
          promo_applied?: boolean
          purchased_seconds: number
          remaining_seconds: number
          started_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          timer_running?: boolean
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          auth_user_id?: string
          consent_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          ended_at?: string | null
          id?: string
          last_client_message_at?: string | null
          last_professional_message_at?: string | null
          last_timer_started_at?: string | null
          order_id?: string | null
          package_minutes?: number
          promo_applied?: boolean
          purchased_seconds?: number
          remaining_seconds?: number
          started_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          timer_running?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_written_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_written_sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          next_day_off: string | null
          phone: string | null
          updated_at: string
          vacation_end: string | null
          vacation_start: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          next_day_off?: string | null
          phone?: string | null
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          next_day_off?: string | null
          phone?: string | null
          updated_at?: string
          vacation_end?: string | null
          vacation_start?: string | null
        }
        Relationships: []
      }
      provider_balances: {
        Row: {
          available_cents: number
          currency: string
          lifetime_gross_cents: number
          lifetime_platform_fee_cents: number
          lifetime_refunds_cents: number
          pending_cents: number
          professional_account_id: string
          updated_at: string
        }
        Insert: {
          available_cents?: number
          currency: string
          lifetime_gross_cents?: number
          lifetime_platform_fee_cents?: number
          lifetime_refunds_cents?: number
          pending_cents?: number
          professional_account_id: string
          updated_at?: string
        }
        Update: {
          available_cents?: number
          currency?: string
          lifetime_gross_cents?: number
          lifetime_platform_fee_cents?: number
          lifetime_refunds_cents?: number
          pending_cents?: number
          professional_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_balances_professional_account_id_fkey"
            columns: ["professional_account_id"]
            isOneToOne: false
            referencedRelation: "professional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      psychoanalytic_written_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          sender_type: string
          sender_user_id: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          sender_type: string
          sender_user_id?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          sender_type?: string
          sender_user_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychoanalytic_written_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "psychoanalytic_written_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      psychoanalytic_written_promos: {
        Row: {
          created_at: string
          customer_id: string
          first_purchase_at: string
          promo_expires_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          first_purchase_at?: string
          promo_expires_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          first_purchase_at?: string
          promo_expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychoanalytic_written_promos_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      psychoanalytic_written_sessions: {
        Row: {
          amount_cents: number
          auth_user_id: string
          consent_at: string | null
          created_at: string
          currency: string
          customer_id: string
          ended_at: string | null
          id: string
          last_client_message_at: string | null
          last_professional_message_at: string | null
          last_timer_started_at: string | null
          order_id: string | null
          package_minutes: number
          promo_applied: boolean
          purchased_seconds: number
          remaining_seconds: number
          started_at: string | null
          status: string
          stripe_checkout_session_id: string | null
          timer_running: boolean
          updated_at: string
        }
        Insert: {
          amount_cents: number
          auth_user_id: string
          consent_at?: string | null
          created_at?: string
          currency: string
          customer_id: string
          ended_at?: string | null
          id?: string
          last_client_message_at?: string | null
          last_professional_message_at?: string | null
          last_timer_started_at?: string | null
          order_id?: string | null
          package_minutes: number
          promo_applied?: boolean
          purchased_seconds: number
          remaining_seconds: number
          started_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          timer_running?: boolean
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          auth_user_id?: string
          consent_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          ended_at?: string | null
          id?: string
          last_client_message_at?: string | null
          last_professional_message_at?: string | null
          last_timer_started_at?: string | null
          order_id?: string | null
          package_minutes?: number
          promo_applied?: boolean
          purchased_seconds?: number
          remaining_seconds?: number
          started_at?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          timer_running?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "psychoanalytic_written_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psychoanalytic_written_sessions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      s8_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_seconds: number
          id: string
          main_answers: string | null
          participant_id: string
          professional_notes: string | null
          scale: number | null
          session_date: string | null
          session_number: number
          task: string | null
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          id?: string
          main_answers?: string | null
          participant_id: string
          professional_notes?: string | null
          scale?: number | null
          session_date?: string | null
          session_number: number
          task?: string | null
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          id?: string
          main_answers?: string | null
          participant_id?: string
          professional_notes?: string | null
          scale?: number | null
          session_date?: string | null
          session_number?: number
          task?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "s8_sessions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_accounts: {
        Row: {
          application_id: string | null
          country: string
          created_at: string
          email: string
          full_name: string
          payment_details: Json
          payment_method: string | null
          phone: string | null
          preferred_currency: string
          referral_code: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          country: string
          created_at?: string
          email: string
          full_name: string
          payment_details?: Json
          payment_method?: string | null
          phone?: string | null
          preferred_currency?: string
          referral_code: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          country?: string
          created_at?: string
          email?: string
          full_name?: string
          payment_details?: Json
          payment_method?: string | null
          phone?: string | null
          preferred_currency?: string
          referral_code?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_accounts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "seller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_applications: {
        Row: {
          country: string
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_currency: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          country: string
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone?: string | null
          preferred_currency?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          country?: string
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_currency?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      seller_payouts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          seller_user_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          seller_user_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          seller_user_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_payouts_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "seller_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      seller_sales: {
        Row: {
          amount_cents: number
          commission_cents: number
          commission_rate: number
          confirmed_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          payment_reference: string | null
          product_category: string
          product_name: string
          seller_user_id: string
          sold_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          commission_cents: number
          commission_rate: number
          confirmed_at?: string | null
          created_at?: string
          currency: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          product_category?: string
          product_name: string
          seller_user_id: string
          sold_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          commission_cents?: number
          commission_rate?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          product_category?: string
          product_name?: string
          seller_user_id?: string
          sold_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_sales_seller_user_id_fkey"
            columns: ["seller_user_id"]
            isOneToOne: false
            referencedRelation: "seller_accounts"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          active: boolean
          amount_cents: number
          billing_cadence: string
          billing_model: string
          catalog_key: string
          category: string
          created_at: string
          currency: string
          is_clinical: boolean
          name: string
          package_sessions: number
          payment_url: string | null
          repeat_payment_url: string | null
          sort_order: number
          stripe_payment_link_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount_cents: number
          billing_cadence?: string
          billing_model?: string
          catalog_key: string
          category?: string
          created_at?: string
          currency?: string
          is_clinical?: boolean
          name: string
          package_sessions?: number
          payment_url?: string | null
          repeat_payment_url?: string | null
          sort_order?: number
          stripe_payment_link_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount_cents?: number
          billing_cadence?: string
          billing_model?: string
          catalog_key?: string
          category?: string
          created_at?: string
          currency?: string
          is_clinical?: boolean
          name?: string
          package_sessions?: number
          payment_url?: string | null
          repeat_payment_url?: string | null
          sort_order?: number
          stripe_payment_link_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_credits: {
        Row: {
          catalog_key: string | null
          created_at: string
          customer_id: string | null
          granted: number
          id: string
          order_id: string
          source: string
        }
        Insert: {
          catalog_key?: string | null
          created_at?: string
          customer_id?: string | null
          granted?: number
          id?: string
          order_id: string
          source?: string
        }
        Update: {
          catalog_key?: string | null
          created_at?: string
          customer_id?: string | null
          granted?: number
          id?: string
          order_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_credits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
        }
        Relationships: []
      }
      subscription_plan_entitlements: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          entitlement_key: string
          plan_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          entitlement_key: string
          plan_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          entitlement_key?: string
          plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean
          admin_config: Json
          amount_cents: number
          benefits: Json
          created_at: string
          currency: string
          id: string
          interval: string
          market: string
          name: string
          plan_code: string
          sort_order: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          admin_config?: Json
          amount_cents: number
          benefits?: Json
          created_at?: string
          currency: string
          id?: string
          interval?: string
          market: string
          name: string
          plan_code: string
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          admin_config?: Json
          amount_cents?: number
          benefits?: Json
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          market?: string
          name?: string
          plan_code?: string
          sort_order?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      training_announcements: {
        Row: {
          body: string
          created_at: string
          id: string
          published: boolean
          title: string
          training_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          published?: boolean
          title: string
          training_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_announcements_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_certificates: {
        Row: {
          available_at: string
          certificate_code: string
          created_at: string
          enrollment_id: string
          hours: number
          id: string
          issued_at: string | null
          metadata: Json
          signer_name: string
        }
        Insert: {
          available_at: string
          certificate_code: string
          created_at?: string
          enrollment_id: string
          hours?: number
          id?: string
          issued_at?: string | null
          metadata?: Json
          signer_name?: string
        }
        Update: {
          available_at?: string
          certificate_code?: string
          created_at?: string
          enrollment_id?: string
          hours?: number
          id?: string
          issued_at?: string | null
          metadata?: Json
          signer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: true
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_cohorts: {
        Row: {
          capacity: number
          cohort_number: number
          created_at: string
          id: string
          starts_at: string | null
          status: string
          training_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          cohort_number: number
          created_at?: string
          id?: string
          starts_at?: string | null
          status?: string
          training_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          cohort_number?: number
          created_at?: string
          id?: string
          starts_at?: string | null
          status?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_cohorts_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_enrollments: {
        Row: {
          access_expires_at: string | null
          active: boolean
          amount_minor: number | null
          certificate_available_at: string | null
          cohort_id: string | null
          completed_at: string | null
          currency: string | null
          customer_id: string
          enrolled_at: string
          id: string
          paid_at: string | null
          product_key: string | null
          progress_percent: number
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          stripe_payment_link_id: string | null
          stripe_price_id: string | null
          training_id: string
        }
        Insert: {
          access_expires_at?: string | null
          active?: boolean
          amount_minor?: number | null
          certificate_available_at?: string | null
          cohort_id?: string | null
          completed_at?: string | null
          currency?: string | null
          customer_id: string
          enrolled_at?: string
          id?: string
          paid_at?: string | null
          product_key?: string | null
          progress_percent?: number
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          training_id: string
        }
        Update: {
          access_expires_at?: string | null
          active?: boolean
          amount_minor?: number | null
          certificate_available_at?: string | null
          cohort_id?: string | null
          completed_at?: string | null
          currency?: string | null
          customer_id?: string
          enrolled_at?: string
          id?: string
          paid_at?: string | null
          product_key?: string | null
          progress_percent?: number
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_enrollments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "training_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_forum_posts: {
        Row: {
          author_label: string | null
          author_user_id: string
          body: string
          created_at: string
          id: string
          status: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_label?: string | null
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          status?: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_label?: string | null
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          status?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "training_forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      training_forum_topics: {
        Row: {
          author_label: string | null
          author_user_id: string
          body: string
          created_at: string
          id: string
          module_id: string | null
          pinned: boolean
          status: string
          title: string
          training_id: string
          updated_at: string
        }
        Insert: {
          author_label?: string | null
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          module_id?: string | null
          pinned?: boolean
          status?: string
          title: string
          training_id: string
          updated_at?: string
        }
        Update: {
          author_label?: string | null
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          module_id?: string | null
          pinned?: boolean
          status?: string
          title?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_forum_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_forum_topics_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_live_sessions: {
        Row: {
          cohort_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          journey_month: number | null
          meeting_url: string | null
          published: boolean
          recording_url: string | null
          sequence_no: number | null
          starts_at: string
          title: string
          training_id: string
          updated_at: string
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          journey_month?: number | null
          meeting_url?: string | null
          published?: boolean
          recording_url?: string | null
          sequence_no?: number | null
          starts_at: string
          title: string
          training_id: string
          updated_at?: string
        }
        Update: {
          cohort_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          journey_month?: number | null
          meeting_url?: string | null
          published?: boolean
          recording_url?: string | null
          sequence_no?: number | null
          starts_at?: string
          title?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_live_sessions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "training_cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_live_sessions_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_materials: {
        Row: {
          body: string | null
          created_at: string
          description: string | null
          id: string
          material_type: string
          module_id: string | null
          position: number
          published: boolean
          title: string
          training_id: string
          updated_at: string
          url: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          description?: string | null
          id?: string
          material_type?: string
          module_id?: string | null
          position?: number
          published?: boolean
          title: string
          training_id: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          description?: string | null
          id?: string
          material_type?: string
          module_id?: string | null
          position?: number
          published?: boolean
          title?: string
          training_id?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_materials_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_materials_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          position: number
          published: boolean
          title: string
          training_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          published?: boolean
          title: string
          training_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          published?: boolean
          title?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          extra_project_review_brl_minor: number
          extra_project_review_eur_minor: number
          id: string
          lifetime_access: boolean
          live_sessions_included: number
          minimum_days: number
          projects_included: number
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          extra_project_review_brl_minor?: number
          extra_project_review_eur_minor?: number
          id?: string
          lifetime_access?: boolean
          live_sessions_included?: number
          minimum_days?: number
          projects_included?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          extra_project_review_brl_minor?: number
          extra_project_review_eur_minor?: number
          id?: string
          lifetime_access?: boolean
          live_sessions_included?: number
          minimum_days?: number
          projects_included?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_progress_items: {
        Row: {
          completed: boolean
          created_at: string
          data: Json
          enrollment_id: string
          id: string
          item_key: string
          item_type: string
          module_key: string | null
          score: number | null
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          data?: Json
          enrollment_id: string
          id?: string
          item_key: string
          item_type: string
          module_key?: string | null
          score?: number | null
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          data?: Json
          enrollment_id?: string
          id?: string
          item_key?: string
          item_type?: string
          module_key?: string | null
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_items_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_project_review_credits: {
        Row: {
          amount_minor: number | null
          created_at: string
          currency: string | null
          customer_id: string
          enrollment_id: string | null
          id: string
          order_id: string | null
          source: string
          status: string
          stripe_checkout_session_id: string | null
          training_id: string
          used_at: string | null
        }
        Insert: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          customer_id: string
          enrollment_id?: string | null
          id?: string
          order_id?: string | null
          source: string
          status?: string
          stripe_checkout_session_id?: string | null
          training_id: string
          used_at?: string | null
        }
        Update: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          customer_id?: string
          enrollment_id?: string | null
          id?: string
          order_id?: string | null
          source?: string
          status?: string
          stripe_checkout_session_id?: string | null
          training_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_project_review_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_project_review_credits_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_project_review_credits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_project_review_credits_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_project_submissions: {
        Row: {
          created_at: string
          customer_id: string
          enrollment_id: string
          feedback: string | null
          id: string
          project_text: string | null
          project_url: string | null
          review_credit_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_number: number
          submitted_at: string
          title: string
          training_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          enrollment_id: string
          feedback?: string | null
          id?: string
          project_text?: string | null
          project_url?: string | null
          review_credit_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_number: number
          submitted_at?: string
          title: string
          training_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          enrollment_id?: string
          feedback?: string | null
          id?: string
          project_text?: string | null
          project_url?: string | null
          review_credit_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_number?: number
          submitted_at?: string
          title?: string
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_project_submissions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_project_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "training_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_project_submissions_review_credit_id_fkey"
            columns: ["review_credit_id"]
            isOneToOne: true
            referencedRelation: "training_project_review_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_project_submissions_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_state: {
        Row: {
          certificate_available_at: string | null
          completed_at: string | null
          created_at: string
          current_panel: string | null
          customer_id: string
          id: string
          progress_percent: number
          started_at: string
          state: Json
          training_id: string
          updated_at: string
        }
        Insert: {
          certificate_available_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_panel?: string | null
          customer_id: string
          id?: string
          progress_percent?: number
          started_at?: string
          state?: Json
          training_id: string
          updated_at?: string
        }
        Update: {
          certificate_available_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_panel?: string | null
          customer_id?: string
          id?: string
          progress_percent?: number
          started_at?: string
          state?: Json
          training_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_state_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_state_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      undergraduate_interest_leads: {
        Row: {
          country: string | null
          course_key: string
          course_title: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          source: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          country?: string | null
          course_key: string
          course_title: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          country?: string | null
          course_key?: string
          course_title?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      academy_institution_metrics: {
        Args: { p_institution_id: string }
        Returns: {
          active_students: number
          high_attention_signals: number
          linked_students: number
          open_signals: number
        }[]
      }
      admin_review_seller_application: {
        Args: { p_approve: boolean; p_id: string }
        Returns: boolean
      }
      admin_set_seller_sale_status: {
        Args: { p_id: string; p_status: string }
        Returns: boolean
      }
      assign_do_mamao_training_enrollment: {
        Args: {
          _amount_minor?: number
          _checkout_session_id?: string
          _currency?: string
          _customer_id: string
          _payment_intent_id?: string
          _price_id?: string
        }
        Returns: string
      }
      audit_event: {
        Args: { _action: string; _details: Json; _target: string }
        Returns: undefined
      }
      bootstrap_seller_admin: { Args: { p_token: string }; Returns: boolean }
      finalize_professional_payout: {
        Args: {
          p_actor_id: string
          p_payment_method?: string
          p_payment_reference: string
          p_payout_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authorized: { Args: { _user_id: string }; Returns: boolean }
      is_seller_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      ldr_refresh_career_intelligence_atomic: {
        Args: { p_actions?: Json; p_recommendations?: Json; p_user_id: string }
        Returns: Json
      }
      ldr_seller_catalog: { Args: { p_token: string }; Returns: Json }
      ldr_seller_checkout_attach: {
        Args: {
          p_checkout_session_id: string
          p_checkout_url: string
          p_expires_at?: string
          p_sale_id: string
          p_stripe_price_id?: string
          p_token: string
        }
        Returns: boolean
      }
      ldr_seller_checkout_prepare: {
        Args: {
          p_catalog_key: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone?: string
          p_quantity?: number
          p_token: string
        }
        Returns: Json
      }
      ldr_seller_purchase_provision_service: {
        Args: { p_sale_id: string }
        Returns: Json
      }
      ldr_seller_referral_bind_checkout_service: {
        Args: {
          p_amount_cents: number
          p_checkout_session_id: string
          p_currency: string
          p_ref: string
        }
        Returns: boolean
      }
      ldr_seller_referral_create: {
        Args: {
          p_catalog_key: string
          p_customer_email: string
          p_customer_name: string
          p_customer_phone?: string
          p_token: string
        }
        Returns: Json
      }
      ldr_seller_referral_get_service: {
        Args: { p_ref: string }
        Returns: Json
      }
      ldr_seller_referral_list: { Args: { p_token: string }; Returns: Json }
      ldr_seller_referral_paid_service: {
        Args: {
          p_amount_cents: number
          p_checkout_session_id: string
          p_currency: string
          p_event_id: string
          p_event_type: string
          p_payment_intent_id?: string
          p_ref: string
          p_subscription_id?: string
        }
        Returns: Json
      }
      ldr_seller_referral_status_service: {
        Args: { p_ref: string; p_status: string }
        Returns: boolean
      }
      ldr_seller_referral_validate_service: {
        Args: {
          p_email: string
          p_market: string
          p_plan_code: string
          p_portal_kind: string
          p_ref: string
        }
        Returns: Json
      }
      ldr_seller_stripe_apply: {
        Args: {
          p_amount_cents?: number
          p_checkout_session_id?: string
          p_currency?: string
          p_event_id: string
          p_event_type: string
          p_payment_intent_id?: string
          p_payment_status: string
          p_refund_amount_cents?: number
          p_sale_id: string
          p_server_token: string
          p_subscription_id?: string
          p_summary?: Json
        }
        Returns: Json
      }
      ldr_seller_stripe_apply_service: {
        Args: {
          p_amount_cents?: number
          p_checkout_session_id?: string
          p_currency?: string
          p_event_id: string
          p_event_type: string
          p_payment_intent_id?: string
          p_payment_status: string
          p_refund_amount_cents?: number
          p_sale_id: string
          p_subscription_id?: string
          p_summary?: Json
        }
        Returns: Json
      }
      ldr_seller_stripe_renewal_apply: {
        Args: {
          p_amount_cents: number
          p_currency: string
          p_event_id: string
          p_event_type: string
          p_original_sale_id: string
          p_payment_intent_id?: string
          p_server_token: string
          p_subscription_id?: string
          p_summary?: Json
        }
        Returns: Json
      }
      ldr_seller_stripe_renewal_service: {
        Args: {
          p_amount_cents: number
          p_currency: string
          p_event_id: string
          p_event_type: string
          p_original_sale_id: string
          p_payment_intent_id?: string
          p_subscription_id?: string
          p_summary?: Json
        }
        Returns: Json
      }
      ldr_simple_admin_candidate_message: {
        Args: { p_body: string; p_seller_id: string; p_token: string }
        Returns: string
      }
      ldr_simple_admin_candidate_thread: {
        Args: { p_seller_id: string; p_token: string }
        Returns: Json
      }
      ldr_simple_admin_candidate_update: {
        Args: {
          p_interview_at?: string
          p_link?: string
          p_mode?: string
          p_notes?: string
          p_seller_id: string
          p_status: string
          p_timezone?: string
          p_token: string
        }
        Returns: boolean
      }
      ldr_simple_admin_candidates: { Args: { p_token: string }; Returns: Json }
      ldr_simple_admin_dashboard: { Args: { p_token: string }; Returns: Json }
      ldr_simple_admin_login: {
        Args: { p_email: string; p_password: string }
        Returns: string
      }
      ldr_simple_admin_pay_seller: {
        Args: {
          p_currency: string
          p_reference?: string
          p_seller_id: string
          p_token: string
        }
        Returns: Json
      }
      ldr_simple_admin_payment_list: {
        Args: { p_token: string }
        Returns: Json
      }
      ldr_simple_admin_sale_status: {
        Args: { p_sale_id: string; p_status: string; p_token: string }
        Returns: boolean
      }
      ldr_simple_admin_toggle_seller: {
        Args: { p_seller_id: string; p_token: string }
        Returns: string
      }
      ldr_simple_assert_approved: { Args: { p_token: string }; Returns: string }
      ldr_simple_candidate_portal: { Args: { p_token: string }; Returns: Json }
      ldr_simple_candidate_send_message: {
        Args: { p_body: string; p_token: string }
        Returns: string
      }
      ldr_simple_create_sale: {
        Args: {
          p_amount: number
          p_category?: string
          p_currency: string
          p_customer_name: string
          p_service_name: string
          p_token: string
        }
        Returns: string
      }
      ldr_simple_create_sale_fx: {
        Args: {
          p_amount: number
          p_category?: string
          p_currency: string
          p_customer_name: string
          p_exchange_rate?: number
          p_exchange_rate_date?: string
          p_exchange_source?: string
          p_service_name: string
          p_token: string
        }
        Returns: string
      }
      ldr_simple_logout: { Args: { p_token: string }; Returns: boolean }
      ldr_simple_next_payment_date: { Args: never; Returns: string }
      ldr_simple_payment_get: { Args: { p_token: string }; Returns: Json }
      ldr_simple_payment_save: {
        Args: {
          p_account_holder_name: string
          p_bank_country?: string
          p_bank_name?: string
          p_bic_swift?: string
          p_iban?: string
          p_payout_type: string
          p_pix_key?: string
          p_token: string
        }
        Returns: Json
      }
      ldr_simple_pending_fx_sales_service: {
        Args: never
        Returns: {
          currency: string
          payout_currency: string
          sale_id: string
        }[]
      }
      ldr_simple_rate: { Args: { p_category: string }; Returns: number }
      ldr_simple_seller_dashboard: { Args: { p_token: string }; Returns: Json }
      ldr_simple_seller_login: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
      ldr_simple_seller_signup:
        | {
            Args: {
              p_country?: string
              p_currency?: string
              p_email: string
              p_name: string
              p_password: string
              p_phone?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_country?: string
              p_currency?: string
              p_email: string
              p_introduction?: string
              p_language?: string
              p_name: string
              p_password: string
              p_phone?: string
              p_sales_experience?: string
            }
            Returns: Json
          }
      ldr_simple_set_sale_fx: {
        Args: {
          p_exchange_rate: number
          p_exchange_rate_date: string
          p_exchange_source: string
          p_sale_id: string
          p_token: string
        }
        Returns: Json
      }
      ldr_simple_set_sale_fx_service: {
        Args: {
          p_exchange_rate: number
          p_exchange_rate_date: string
          p_exchange_source: string
          p_sale_id: string
        }
        Returns: Json
      }
      ldr_simple_valid_session: {
        Args: { p_role: string; p_token: string }
        Returns: boolean
      }
      ldr_training_admin_dashboard: { Args: { p_token: string }; Returns: Json }
      ldr_training_complete: { Args: { p_token: string }; Returns: Json }
      ldr_training_get: { Args: { p_token: string }; Returns: Json }
      ldr_training_save: {
        Args: {
          p_mark_complete?: boolean
          p_module: number
          p_quiz_answered?: boolean
          p_quiz_correct?: boolean
          p_quiz_value?: string
          p_token: string
        }
        Returns: Json
      }
      ldr_training_summary: { Args: { p_token: string }; Returns: Json }
      process_site_order: {
        Args: { _payload: Json; _source: string }
        Returns: Json
      }
      seller_admin_mark_sale_paid: {
        Args: { p_payment_reference?: string; p_sale_id: string }
        Returns: boolean
      }
      seller_admin_pay_available: {
        Args: {
          p_currency: string
          p_payment_reference?: string
          p_seller_user_id: string
        }
        Returns: string
      }
      seller_admin_review_application: {
        Args: { p_application_id: string; p_approve: boolean }
        Returns: boolean
      }
      seller_admin_set_sale_status: {
        Args: { p_sale_id: string; p_status: string }
        Returns: boolean
      }
      seller_claim_account: { Args: never; Returns: boolean }
      seller_register_sale: {
        Args: {
          p_amount: number
          p_currency: string
          p_customer_email: string
          p_customer_name: string
          p_notes?: string
          p_payment_reference: string
          p_product_category: string
          p_product_name: string
        }
        Returns: string
      }
      seller_self_register: {
        Args: {
          p_country: string
          p_full_name: string
          p_phone: string
          p_preferred_currency: string
        }
        Returns: {
          application_id: string | null
          country: string
          created_at: string
          email: string
          full_name: string
          payment_details: Json
          payment_method: string | null
          phone: string | null
          preferred_currency: string
          referral_code: string
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "seller_accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      simple_admin_change_password: {
        Args: {
          p_current_password: string
          p_new_password: string
          p_token: string
        }
        Returns: boolean
      }
      simple_admin_dashboard: { Args: { p_token: string }; Returns: Json }
      simple_admin_login: {
        Args: { p_password: string; p_username: string }
        Returns: string
      }
      simple_admin_pay_available: {
        Args: {
          p_currency: string
          p_payment_reference?: string
          p_seller_user_id: string
          p_token: string
        }
        Returns: string
      }
      simple_admin_set_sale_status: {
        Args: { p_sale_id: string; p_status: string; p_token: string }
        Returns: boolean
      }
      simple_admin_set_seller_status: {
        Args: { p_seller_user_id: string; p_status: string; p_token: string }
        Returns: boolean
      }
      simple_admin_valid: { Args: { p_token: string }; Returns: boolean }
      submit_ecosystem_contact: {
        Args: {
          p_consent: boolean
          p_email: string
          p_language: string
          p_message: string
          p_name: string
          p_phone: string
          p_source_project: string
          p_source_url: string
          p_subject: string
          p_wants_luciano: boolean
          p_website?: string
        }
        Returns: Json
      }
      touch_site_integration_token: {
        Args: { _id: string }
        Returns: undefined
      }
      verify_site_integration_token: {
        Args: { _token_sha256: string }
        Returns: {
          id: string
          source: string
        }[]
      }
    }
    Enums: {
      app_role: "superadmin" | "colaborador"
      delivery_event_type:
        | "entregue"
        | "aprovada"
        | "ajuste_solicitado"
        | "comentario"
        | "revisada"
      delivery_status:
        | "pendente"
        | "em_producao"
        | "em_revisao"
        | "entregue"
        | "cancelada"
      mentorship_status:
        | "intake"
        | "aguardando_pagamento"
        | "aguardando_agendamento"
        | "agendada"
        | "em_andamento"
        | "concluida"
        | "cancelada"
      order_status:
        | "novo"
        | "em_analise"
        | "em_andamento"
        | "aguardando_cliente"
        | "em_revisao"
        | "concluido"
        | "cancelado"
      payment_status: "pendente" | "pago" | "reembolsado" | "falhou"
      priority_level: "baixa" | "media" | "alta" | "urgente"
      service_type:
        | "recrutamento_selecao"
        | "site"
        | "mentoria"
        | "produto_digital"
        | "palestra"
        | "outros"
      session_status: "agendada" | "concluida" | "cancelada" | "reagendada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "colaborador"],
      delivery_event_type: [
        "entregue",
        "aprovada",
        "ajuste_solicitado",
        "comentario",
        "revisada",
      ],
      delivery_status: [
        "pendente",
        "em_producao",
        "em_revisao",
        "entregue",
        "cancelada",
      ],
      mentorship_status: [
        "intake",
        "aguardando_pagamento",
        "aguardando_agendamento",
        "agendada",
        "em_andamento",
        "concluida",
        "cancelada",
      ],
      order_status: [
        "novo",
        "em_analise",
        "em_andamento",
        "aguardando_cliente",
        "em_revisao",
        "concluido",
        "cancelado",
      ],
      payment_status: ["pendente", "pago", "reembolsado", "falhou"],
      priority_level: ["baixa", "media", "alta", "urgente"],
      service_type: [
        "recrutamento_selecao",
        "site",
        "mentoria",
        "produto_digital",
        "palestra",
        "outros",
      ],
      session_status: ["agendada", "concluida", "cancelada", "reagendada"],
    },
  },
} as const

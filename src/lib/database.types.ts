// Generado desde Supabase (MCP generate_typescript_types). No editar a mano: regenerar tras cada migracion.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id?: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mutes: {
        Row: {
          conversation_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          user_id?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mutes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_mutes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          created_at: string
          id: string
          image_path: string | null
          parent_id: string | null
          post_id: string
          reply_to_id: string | null
          text: string
        }
        Insert: {
          author_id?: string
          created_at?: string
          id?: string
          image_path?: string | null
          parent_id?: string | null
          post_id: string
          reply_to_id?: string | null
          text?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          image_path?: string | null
          parent_id?: string | null
          post_id?: string
          reply_to_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          buyer_read_at: string
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          listing_id: string | null
          seller_id: string
          seller_read_at: string
        }
        Insert: {
          buyer_id?: string
          buyer_read_at?: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          listing_id: string | null
          seller_id: string
          seller_read_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_read_at?: string
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          listing_id?: string | null
          seller_id?: string
          seller_read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_hidden_users: {
        Row: {
          created_at: string
          hidden_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          hidden_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_hidden_users_hidden_id_fkey"
            columns: ["hidden_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_hidden_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id?: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          colors: string[]
          created_at: string
          id: string
          is_private: boolean
          name: string
          owner_id: string
          photos: string[]
          seasons: string[]
          team: string | null
          type: string
        }
        Insert: {
          colors?: string[]
          created_at?: string
          id?: string
          is_private?: boolean
          name: string
          owner_id?: string
          photos?: string[]
          seasons?: string[]
          team?: string | null
          type: string
        }
        Update: {
          colors?: string[]
          created_at?: string
          id?: string
          is_private?: boolean
          name?: string
          owner_id?: string
          photos?: string[]
          seasons?: string[]
          team?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          city: string
          colors: string[]
          condition: string
          country: string
          created_at: string
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_radius_km: number | null
          description: string
          id: string
          photos: string[]
          price: number
          seasons: string[]
          seller_id: string
          size: string
          status: string
          team: string | null
          title: string
          type: string
        }
        Insert: {
          city: string
          colors?: string[]
          condition: string
          country: string
          created_at?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_radius_km?: number | null
          description?: string
          id?: string
          photos?: string[]
          price: number
          seasons?: string[]
          seller_id?: string
          size?: string
          status?: string
          team?: string | null
          title: string
          type?: string
        }
        Update: {
          city?: string
          colors?: string[]
          condition?: string
          country?: string
          created_at?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_radius_km?: number | null
          description?: string
          id?: string
          photos?: string[]
          price?: number
          seasons?: string[]
          seller_id?: string
          size?: string
          status?: string
          team?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          message_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          image_path: string | null
          item_id: string | null
          post_id: string | null
          sender_id: string
          shared_type: string | null
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          image_path?: string | null
          item_id?: string | null
          post_id?: string | null
          sender_id?: string
          shared_type?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          image_path?: string | null
          item_id?: string | null
          post_id?: string | null
          sender_id?: string
          shared_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_items: {
        Row: {
          item_id: string
          outfit_id: string
        }
        Insert: {
          item_id: string
          outfit_id: string
        }
        Update: {
          item_id?: string
          outfit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          created_at: string
          id: string
          in_closet: boolean
          is_public: boolean
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          in_closet?: boolean
          is_public?: boolean
          name?: string
          owner_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          in_closet?: boolean
          is_public?: boolean
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfits_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          aspect: number
          author_id: string
          caption: string
          created_at: string
          id: string
          outfit_id: string | null
          photos: string[]
          seasons: string[]
        }
        Insert: {
          aspect?: number
          author_id?: string
          caption?: string
          created_at?: string
          id?: string
          outfit_id?: string | null
          photos: string[]
          seasons?: string[]
        }
        Update: {
          aspect?: number
          author_id?: string
          caption?: string
          created_at?: string
          id?: string
          outfit_id?: string | null
          photos?: string[]
          seasons?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string
          closet_public: boolean
          cover_path: string | null
          created_at: string
          id: string
          name: string
          socials: Json
          username: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string
          closet_public?: boolean
          cover_path?: string | null
          created_at?: string
          id: string
          name: string
          socials?: Json
          username: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string
          closet_public?: boolean
          cover_path?: string | null
          created_at?: string
          id?: string
          name?: string
          socials?: Json
          username?: string
        }
        Relationships: []
      }
      shares: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      featured_posts: {
        Args: { how_many?: number }
        Returns: Database["public"]["Tables"]["posts"]["Row"][]
        SetofOptions: {
          from: "*"
          to: "posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      listing_sizes: {
        Args: never
        Returns: string[]
      }
      mark_chat_read: {
        Args: { chat: string }
        Returns: undefined
      }
      normalize_text: {
        Args: { value: string }
        Returns: string
      }
      search_listings: {
        Args: {
          colors?: string[]
          conditions?: string[]
          max_price?: number
          min_price?: number
          near_city?: string
          near_country?: string
          near_lat?: number
          near_lng?: number
          only_city?: string
          only_country?: string
          page_limit?: number
          page_offset?: number
          search?: string
          seasons?: string[]
          sizes?: string[]
          sort?: string
        }
        Returns: Json
      }
      unread_counts: {
        Args: never
        Returns: {
          conversation_id: string
          unread: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]

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
          created_at: string
          id: string
          listing_id: string
          seller_id: string
        }
        Insert: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id: string
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          seller_id?: string
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
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
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
          is_public: boolean
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
        }
        Update: {
          created_at?: string
          id?: string
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
          author_id: string
          caption: string
          created_at: string
          id: string
          outfit_id: string | null
          photos: string[]
        }
        Insert: {
          author_id?: string
          caption?: string
          created_at?: string
          id?: string
          outfit_id?: string | null
          photos: string[]
        }
        Update: {
          author_id?: string
          caption?: string
          created_at?: string
          id?: string
          outfit_id?: string | null
          photos?: string[]
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
      listing_sizes: {
        Args: never
        Returns: string[]
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

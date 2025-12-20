export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    linkedin_url: string | null
                    struggle: string | null
                    helping_others: string | null
                    expertise: string[] | null
                    hobbies: string[] | null
                    role: 'admin' | 'member'
                    timezone: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    linkedin_url?: string | null
                    struggle?: string | null
                    helping_others?: string | null
                    expertise?: string[] | null
                    hobbies?: string[] | null
                    role?: 'admin' | 'member'
                    timezone?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    linkedin_url?: string | null
                    struggle?: string | null
                    helping_others?: string | null
                    expertise?: string[] | null
                    hobbies?: string[] | null
                    role?: 'admin' | 'member'
                    timezone?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            invitations: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    linkedin_url: string | null
                    community_id: string | null
                    status: 'pending' | 'registered'
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    linkedin_url?: string | null
                    community_id?: string | null
                    status?: 'pending' | 'registered'
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    linkedin_url?: string | null
                    community_id?: string | null
                    status?: 'pending' | 'registered'
                    created_at?: string
                }
            }
            app_config: {
                Row: {
                    id: number
                    ai_script: Json | null
                    updated_at: string | null
                }
                Insert: {
                    id?: number
                    ai_script?: Json | null
                    updated_at?: string | null
                }
                Update: {
                    id?: number
                    ai_script?: Json | null
                    updated_at?: string | null
                }
            }
            feedback: {
                Row: {
                    id: string
                    match_id: string | null
                    user_id: string | null
                    rating: number | null
                    did_connect: boolean | null
                    comments: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    match_id?: string | null
                    user_id?: string | null
                    rating?: number | null
                    did_connect?: boolean | null
                    comments?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    match_id?: string | null
                    user_id?: string | null
                    rating?: number | null
                    did_connect?: boolean | null
                    comments?: string | null
                    created_at?: string
                }
            }
            matches: {
                Row: {
                    id: string
                    community_id: string | null
                    event_series_id: string | null
                    scheduled_at: string
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    community_id?: string | null
                    event_series_id?: string | null
                    scheduled_at: string
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string | null
                    event_series_id?: string | null
                    scheduled_at?: string
                    status?: string
                    created_at?: string
                }
            }
            time_slots: {
                Row: {
                    id: string
                    community_id: string | null
                    day_of_week: number
                    time_utc: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    community_id?: string | null
                    day_of_week: number
                    time_utc: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string | null
                    day_of_week?: number
                    time_utc?: string
                    created_at?: string
                }
            }
            user_availability: {
                Row: {
                    user_id: string
                    slot_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    slot_id: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    slot_id?: string
                    created_at?: string
                }
            }
            event_series: {
                Row: {
                    id: string
                    community_id: string | null
                    title: string
                    slug: string
                    description: string | null
                    poster_url: string | null
                    start_date: string
                    end_date: string
                    location_type: 'online' | 'in_person'
                    location_address: string | null
                    ai_script_override: Json | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    community_id?: string | null
                    title: string
                    slug: string
                    description?: string | null
                    poster_url?: string | null
                    start_date: string
                    end_date: string
                    location_type?: 'online' | 'in_person'
                    location_address?: string | null
                    ai_script_override?: Json | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string | null
                    title?: string
                    slug?: string
                    description?: string | null
                    poster_url?: string | null
                    start_date?: string
                    end_date?: string
                    location_type?: 'online' | 'in_person'
                    location_address?: string | null
                    ai_script_override?: Json | null
                    is_active?: boolean
                    created_at?: string
                }
            }
        }
    }
}

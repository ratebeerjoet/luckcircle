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
                    linkedin_url: string | null
                    struggle: string | null
                    helping_others: string | null
                    expertise: string[] | null
                    hobbies: string[] | null
                    role: 'admin' | 'member'
                    created_at: string
                }
                Insert: {
                    id: string
                    linkedin_url?: string | null
                    struggle?: string | null
                    helping_others?: string | null
                    expertise?: string[] | null
                    hobbies?: string[] | null
                    role?: 'admin' | 'member'
                    created_at?: string
                }
                Update: {
                    id?: string
                    linkedin_url?: string | null
                    struggle?: string | null
                    helping_others?: string | null
                    expertise?: string[] | null
                    hobbies?: string[] | null
                    role?: 'admin' | 'member'
                    created_at?: string
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
                    scheduled_at: string
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    community_id?: string | null
                    scheduled_at: string
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    community_id?: string | null
                    scheduled_at?: string
                    status?: string
                    created_at?: string
                }
            }
        }
    }
}

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
                    created_at: string
                }
                Insert: {
                    id: string
                    linkedin_url?: string | null
                    struggle?: string | null
                    helping_others?: string | null
                    expertise?: string[] | null
                    hobbies?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    linkedin_url?: string | null
                    struggle?: string | null
                    helping_others?: string | null
                    expertise?: string[] | null
                    hobbies?: string[] | null
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

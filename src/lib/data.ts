import { createClient } from "@/lib/supabase/server";

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return profile;
}

export async function getUpcomingMatches() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Join match_participants -> matches
    // Note: This relies on Supabase being able to detect the relationship or using specific syntax
    // Custom query might be needed if automatic relationship detection fails without FK names

    const { data } = await supabase
        .from("match_participants")
        .select(`
      match:matches (
        id,
        scheduled_at,
        status
      )
    `)
        .eq("user_id", user.id)
        .neq("matches.status", "completed")
    // This filter is tricky in Supabase JS syntax with nested join
    // Usually handled by filtering on the client or better query.
    // For MVP, we fetch all and filter in JS if list is small.

    // Clean up data structure
    // @ts-ignore
    const matches = data?.map(d => d.match).filter(m => m) || [];
    return matches;
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Invite = {
    email: string;
    name: string;
    linkedin_url?: string;
};

export async function uploadInvites(invites: Invite[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Check role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admins only" };
    }

    // Insert
    const { error } = await supabase.from("invitations").insert(
        invites.map(invite => ({
            email: invite.email,
            name: invite.name,
            linkedin_url: invite.linkedin_url,
            // default status is pending
        }))
    );

    if (error) {
        console.error("Upload error", error);
        // Supabase might return error for duplicates if email is unique
        return { error: "Failed to upload invites. " + error.message };
    }

    revalidatePath("/admin");
    return { success: true, count: invites.length };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAiScript() {
    const supabase = await createClient();

    // Default script if none exists
    const defaultScript = {
        openers: ["What's bringing you joy lately?", "What's a problem you're solving right now?"],
        rules: ["No sales pitches", "Ban the question 'What do you do?'"],
        tone: "Casual, warm, curious"
    };

    const { data } = await supabase
        .from("app_config")
        .select("ai_script")
        .eq("id", 1)
        .single();

    if (!data?.ai_script) {
        return defaultScript;
    }

    return data.ai_script;
}

export async function updateAiScript(script: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: "Unauthorized: Admins only" };
    }

    const { error } = await supabase
        .from("app_config")
        .upsert({
            id: 1,
            ai_script: script,
            updated_at: new Date().toISOString()
        });

    if (error) {
        console.error("Config update error", error);
        return { error: "Failed to update config." };
    }

    revalidatePath("/admin/config");
    return { success: true };
}

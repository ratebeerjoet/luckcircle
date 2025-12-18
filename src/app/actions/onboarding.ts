"use server";

import { createClient } from "@/lib/supabase/server";
import { onboardingSchema, OnboardingData } from "@/lib/validations/onboarding";
import { redirect } from "next/navigation";

export async function submitOnboarding(data: OnboardingData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    const result = onboardingSchema.safeParse(data);
    if (!result.success) {
        return { error: "Invalid data", details: result.error.flatten() };
    }

    const embeddingText = `Struggle: ${data.struggle} | Helping: ${data.helpingOthers}`;
    let embedding = null;
    try {
        const { generateEmbedding } = await import("@/lib/embeddings");
        embedding = await generateEmbedding(embeddingText);
    } catch (e) {
        console.error("Embedding generation failed", e);
        // We process anyway, but maybe flag for retry?
    }

    const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        linkedin_url: data.linkedinUrl,
        struggle: data.struggle,
        helping_others: data.helpingOthers,
        embedding: embedding,
        updated_at: new Date().toISOString(),
    });

    if (error) {
        console.error(error);
        return { error: "Failed to save profile. Please try again." };
    }

    redirect("/dashboard");
}

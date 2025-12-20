import { createClient } from "@/lib/supabase/server";
import AvailabilitySelector from "@/components/availability-selector";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AvailabilityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Implementation Detail: Fetching the first community for now. 
    // In a robust multi-tenant system, we'd lookup the user's explicit community membership.
    const { data: communities } = await supabase.from("communities").select("id").limit(1);
    const communityId = communities?.[0]?.id;

    if (!communityId) {
        return (
            <div className="p-8 text-center text-red-600">
                System Error: No community configured. Contact Admin.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/dashboard"
                    className="text-slate-400 hover:text-white text-sm mb-6 inline-flex items-center gap-2 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
                <div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 p-1 md:p-8">
                    <AvailabilitySelector userId={user.id} communityId={communityId} />
                </div>
            </div>
        </div>
    );
}

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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/dashboard"
                    className="text-gray-500 hover:text-gray-800 text-sm mb-6 inline-block"
                >
                    &larr; Back to Dashboard
                </Link>
                <div className="bg-white rounded-2xl shadow-sm border p-1 md:p-8">
                    <AvailabilitySelector userId={user.id} communityId={communityId} />
                </div>
            </div>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { CsvUploader } from "@/components/admin/csv-uploader";

// Opt out of caching for admin data
export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const supabase = await createClient();

    // Fetch stats
    const { count: pendingCount } = await supabase
        .from("invitations")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

    const { count: registeredCount } = await supabase
        .from("invitations")
        .select("*", { count: 'exact', head: true })
    const { count: totalMembers } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Member Invitations</h1>
                <p className="text-slate-400">Manage and invite new members to the community.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Total Members"
                    value={totalMembers || 0}
                    color="text-blue-400"
                />
                <StatCard
                    label="Pending Invites"
                    value={pendingCount || 0}
                    color="text-yellow-400"
                />
                <StatCard
                    label="Accepted Invites"
                    value={registeredCount || 0}
                    color="text-green-400"
                />
            </div>

            <div className="border-t border-slate-800 pt-8">
                <CsvUploader />
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
    return (
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</h3>
            <p className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</p>
        </div>
    );
}

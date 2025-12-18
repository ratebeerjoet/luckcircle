import { getUpcomingMatches, getUserProfile } from "@/lib/data";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await getUserProfile();
    if (!profile || !profile.struggle) {
        redirect("/onboarding");
    }

    const matches = await getUpcomingMatches();
    const nextMatch = matches[0];

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <header className="flex justify-between items-center mb-12 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-white tracking-tight">The Luck Circle</h1>
                <div className="flex gap-4">
                    {/* Profile Avatar / Menu Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 from-neutral-500" />
                </div>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="md:col-span-2 space-y-6">
                    {/* Next Meeting Card */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />

                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-4">Your Next Circle</h2>

                        {nextMatch ? (
                            <div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {new Date(nextMatch.scheduled_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="text-xl text-blue-400 mb-6">
                                    {new Date(nextMatch.scheduled_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </div>
                                <Link
                                    href={`/room/${nextMatch.id}`}
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                                >
                                    Enter Meeting Room
                                </Link>
                            </div>
                        ) : (
                            <div className="py-8 text-center md:text-left">
                                <p className="text-2xl text-slate-200 font-medium mb-2">No upcoming circles.</p>
                                <p className="text-slate-400">Our AI is currently scouting for your perfect match triad.</p>
                            </div>
                        )}
                    </section>

                    {/* Past Matches / Explore */}
                    <section className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Recent Connections</h3>
                        <p className="text-slate-500 italic">No past connections yet. Your journey is just starting.</p>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    {/* Profile Snapshot */}
                    <section className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">My Profile</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current Struggle</div>
                                <p className="text-slate-300 text-sm line-clamp-3">{profile.struggle}</p>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Helping Others</div>
                                <p className="text-slate-300 text-sm line-clamp-3">{profile.helping_others}</p>
                            </div>
                            <Link href="/onboarding" className="text-blue-400 text-sm hover:text-blue-300 mt-2 block">Edit Profile &rarr;</Link>
                        </div>
                    </section>

                    {/* Luck Score */}
                    <section className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
                        <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Luck Surface Area</div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">0</div>
                        <p className="text-xs text-slate-500 mt-2">Attend circles to increase your score.</p>
                    </section>
                </div>
            </main>
        </div>
    );
}

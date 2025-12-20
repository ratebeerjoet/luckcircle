import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return redirect("/dashboard");
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Admin Panel
                    </h1>
                </div>

                <nav className="space-y-2 flex-1">
                    <Link
                        href="/admin"
                        className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        Invitations
                    </Link>
                    <Link
                        href="/admin/config"
                        className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        The Conductor
                    </Link>
                    <Link
                        href="/admin/feedback"
                        className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        The Pulse (Feedback)
                    </Link>
                    <Link
                        href="/admin/schedule/calendar"
                        className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                    >
                        Schedule & Events
                    </Link>
                </nav>

                <div className="pt-4 border-t border-slate-800">
                    <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300">
                        &larr; Back to App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    );
}

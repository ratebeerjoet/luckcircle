"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        full_name: "",
        struggle: "",
        helping_others: "",
        avatar_url: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile(data);
                setForm({
                    full_name: data.full_name || "",
                    struggle: data.struggle || "",
                    helping_others: data.helping_others || "",
                    avatar_url: data.avatar_url || ""
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: form.full_name,
                struggle: form.struggle,
                helping_others: form.helping_others,
                avatar_url: form.avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq("id", profile?.id as string);

        if (error) {
            setMessage("Error saving: " + error.message);
        } else {
            setMessage("Profile updated successfully!");
        }
        setSaving(false);
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <Link href="/dashboard" className="text-slate-400 hover:text-white mb-8 inline-flex items-center gap-2 transition-colors">
                    &larr; Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>

                <form onSubmit={handleSave} className="space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800">

                    {/* Public Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">Public Details</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Avatar URL (Image Address)</label>
                            <input
                                type="url"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.avatar_url}
                                onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                                placeholder="https://..."
                            />
                            {form.avatar_url && (
                                <div className="mt-2">
                                    <img src={form.avatar_url} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-slate-700" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Matching Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-2">Matching Context</h2>
                        <p className="text-slate-500 text-sm">We use this to match you with the right people.</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Current Struggle</label>
                            <textarea
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.struggle}
                                onChange={e => setForm({ ...form, struggle: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">How I Can Help Others</label>
                            <textarea
                                rows={4}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={form.helping_others}
                                onChange={e => setForm({ ...form, helping_others: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <Link href="/profile/availability" className="text-blue-400 hover:text-blue-300">
                            Manage Availability &rarr;
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                    {message && (
                        <div className={`p-4 rounded-lg text-sm text-center ${message.includes("Error") ? "bg-red-900/20 text-red-400" : "bg-green-900/20 text-green-400"}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const supabase = createClient();

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage({ text: error.message, type: "error" });
        } else {
            setMessage({ text: "Check your email for the magic link!", type: "success" });
        }
        setLoading(false);
    };

    const handleLinkedIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "linkedin_oidc",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) console.error(error);
    };

    return (
        <div className="w-full max-w-md space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
                <p className="mt-2 text-sm text-slate-400">Sign in to find your Circle</p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleLinkedIn}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-700 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors font-medium"
                >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Sign in with LinkedIn
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-slate-950 bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Sending link..." : "Send Magic Link"}
                    </button>
                </form>

                {message && (
                    <div
                        className={`p-4 rounded-lg text-sm ${message.type === "success"
                                ? "bg-green-900/20 text-green-400 border border-green-900"
                                : "bg-red-900/20 text-red-400 border border-red-900"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

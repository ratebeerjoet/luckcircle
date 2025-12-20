"use client";

import { useEffect, useState } from "react";
import { getAiScript, updateAiScript } from "@/app/actions/config";
import { Loader2, Save } from "lucide-react";

export default function ConfigPage() {
    const [script, setScript] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadScript();
    }, []);

    const loadScript = async () => {
        try {
            const data = await getAiScript();
            setScript(JSON.stringify(data, null, 4));
        } catch (e) {
            setMessage({ type: 'error', text: "Failed to load config" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const json = JSON.parse(script);
            const res = await updateAiScript(json);
            if (res.success) {
                setMessage({ type: 'success', text: "Configuration saved successfully." });
            } else {
                setMessage({ type: 'error', text: res.error || "Failed to save." });
            }
        } catch (e) {
            setMessage({ type: 'error', text: "Invalid JSON format." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">The Conductor</h1>
                <p className="text-slate-400">
                    Configure the AI Facilitator's script and personality.
                    This controls exactly what the AI says during meetings.
                </p>
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg text-sm text-blue-200">
                    <strong>Tip:</strong> You can define logic like <code>openers</code>, <code>rules</code>, and <code>tone</code>.
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full h-[500px] bg-slate-950 text-slate-300 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    spellCheck={false}
                />
            </div>

            <div className="flex items-center justify-between">
                <div>
                    {message && (
                        <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {message.text}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Configuration
                </button>
            </div>
        </div>
    );
}

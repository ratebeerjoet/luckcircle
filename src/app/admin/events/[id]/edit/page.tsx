"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database.types";
import { format } from "date-fns";

type EventSeries = Database["public"]["Tables"]["event_series"]["Row"];

export default function EditEventSeriesPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        start_date: "",
        end_date: "",
        poster_url: "",
        description: "",
        location_type: "online" as "online" | "in_person",
        location_address: "",
        ai_script_override: "{\n  \"context\": \"...\"\n}"
    });

    useEffect(() => {
        const fetchEvent = async () => {
            const { id } = await params;
            const { data, error } = await supabase
                .from("event_series")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                setError("Event not found");
                setLoading(false);
                return;
            }

            // Populate form
            setFormData({
                title: data.title,
                slug: data.slug,
                start_date: format(new Date(data.start_date), "yyyy-MM-dd"),
                end_date: format(new Date(data.end_date), "yyyy-MM-dd"),
                poster_url: data.poster_url || "",
                description: data.description || "",
                location_type: (data.location_type as "online" | "in_person") || "online",
                location_address: data.location_address || "",
                ai_script_override: JSON.stringify(data.ai_script_override || {}, null, 2)
            });
            setLoading(false);
        };
        fetchEvent();
    }, [params, supabase]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDescriptionAction = (action: "bold" | "italic" | "link") => {
        let val = formData.description;
        if (action === "bold") val += "**bold text**";
        if (action === "italic") val += "_italic text_";
        if (action === "link") val += "[link text](url)";
        handleChange("description", val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        let scriptJson = null;
        try {
            scriptJson = JSON.parse(formData.ai_script_override);
        } catch (err) {
            setError("Invalid JSON in AI Script Override");
            setSaving(false);
            return;
        }

        const { id } = await params;

        const { error: updateError } = await supabase
            .from("event_series")
            .update({
                title: formData.title,
                slug: formData.slug,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString(),
                location_type: formData.location_type,
                location_address: formData.location_address || null,
                poster_url: formData.poster_url,
                description: formData.description,
                ai_script_override: scriptJson
            })
            .eq("id", id);

        if (updateError) {
            setError(updateError.message);
            setSaving(false);
        } else {
            router.push("/admin/schedule/calendar");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading Event...</div>;
    if (error && !formData.title) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-3xl mx-auto p-8 text-slate-200">
            <h1 className="text-3xl font-bold mb-8">Edit Event Series</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">Event Title</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-500">URL Slug</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-slate-500"
                        value={formData.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                    />
                </div>

                {/* Location Type */}
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                    <label className="block text-sm font-medium mb-2 text-slate-300">Event Location</label>
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 transition-colors">
                            <input
                                type="radio"
                                name="location_type"
                                value="online"
                                checked={formData.location_type === "online"}
                                onChange={(e) => handleChange("location_type", "online")}
                                className="w-4 h-4 text-indigo-500 border-slate-600 bg-slate-950 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                            <span className="text-slate-300">🎥 Online (Video Room)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 transition-colors">
                            <input
                                type="radio"
                                name="location_type"
                                value="in_person"
                                checked={formData.location_type === "in_person"}
                                onChange={(e) => handleChange("location_type", "in_person")}
                                className="w-4 h-4 text-indigo-500 border-slate-600 bg-slate-950 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                            <span className="text-slate-300">📍 In Person</span>
                        </label>
                    </div>

                    {formData.location_type === "in_person" && (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-400">Venue Address / Details</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                                placeholder="e.g. 123 Main St, San Francisco, CA"
                                value={formData.location_address}
                                onChange={(e) => handleChange("location_address", e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-400">Start Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none [color-scheme:dark]"
                            value={formData.start_date}
                            onChange={(e) => handleChange("start_date", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-400">End Date</label>
                        <input
                            type="date"
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none [color-scheme:dark]"
                            value={formData.end_date}
                            onChange={(e) => handleChange("end_date", e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">Poster Image URL</label>
                    <input
                        type="url"
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-600"
                        value={formData.poster_url}
                        onChange={(e) => handleChange("poster_url", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">Announcement Post (Markdown)</label>
                    <div className="flex gap-2 mb-2 p-1 bg-slate-900/50 rounded inline-flex">
                        <button type="button" onClick={() => handleDescriptionAction("bold")} className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs font-bold transition-colors">B</button>
                        <button type="button" onClick={() => handleDescriptionAction("italic")} className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs italic transition-colors">I</button>
                        <button type="button" onClick={() => handleDescriptionAction("link")} className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded text-xs underline transition-colors">Link</button>
                    </div>
                    <textarea
                        required
                        rows={6}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-slate-400">AI Meeting Outline Override (JSON)</label>
                    <textarea
                        rows={10}
                        className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-green-400 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.ai_script_override}
                        onChange={(e) => handleChange("ai_script_override", e.target.value)}
                    />
                </div>

                {error && <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm">{error}</div>}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-lg font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving Changes..." : "Update Event Series"}
                    </button>
                </div>
            </form>
        </div>
    );
}

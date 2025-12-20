"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database.types"; // Import types if needed, or just rely on state inference

export default function NewEventSeriesPage() {
    const supabase = createClient();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        start_date: "",
        end_date: "",
        poster_url: "",
        description: "",
        location_type: "online" as "online" | "in_person",
        location_address: "",
        ai_script_override: JSON.stringify({
            context: "This is a themed meeting focusing on...",
            questions: ["Question 1?", "Question 2?"]
        }, null, 2)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === "title") {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            }
            return newData;
        });
    };

    const handleDescriptionAction = (action: "bold" | "italic" | "link") => {
        // Simple appending for now, ideally cursor insertion
        let val = formData.description;
        if (action === "bold") val += "**bold text**";
        if (action === "italic") val += "_italic text_";
        if (action === "link") val += "[link text](url)";
        handleChange("description", val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validate JSON
        let scriptJson = null;
        try {
            scriptJson = JSON.parse(formData.ai_script_override);
        } catch (err) {
            setError("Invalid JSON in AI Script Override");
            setLoading(false);
            return;
        }

        // Get Community ID
        const { data: comms } = await supabase.from("communities").select("id").limit(1);
        const communityId = comms?.[0]?.id;
        if (!communityId) {
            setError("No community found.");
            setLoading(false);
            return;
        }

        const { error: insertError } = await supabase.from("event_series").insert({
            community_id: communityId,
            title: formData.title,
            slug: formData.slug,
            start_date: new Date(formData.start_date).toISOString(),
            end_date: new Date(formData.end_date).toISOString(),
            location_type: formData.location_type,
            location_address: formData.location_address || null, // Ensure empty string becomes null if needed
            poster_url: formData.poster_url,
            description: formData.description,
            ai_script_override: scriptJson,
            is_active: true
        });

        if (insertError) {
            setError(insertError.message);
        } else {
            router.push("/admin/schedule/calendar"); // Redirect to calendar view (to be made)
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Create New Event Series</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">Event Title</label>
                    <input
                        type="text"
                        required
                        className="w-full border rounded p-2"
                        placeholder="e.g. Founder Sales Week"
                        value={formData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-500">URL Slug</label>
                    <input
                        type="text"
                        required
                        className="w-full border rounded p-2 bg-gray-50 text-gray-600"
                        value={formData.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                    />
                </div>

                {/* Location Type */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <label className="block text-sm font-medium mb-2">Event Location</label>
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="location_type"
                                value="online"
                                checked={formData.location_type === "online"}
                                onChange={(e) => handleChange("location_type", "online")}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <span>🎥 Online (Video Room)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="location_type"
                                value="in_person"
                                checked={formData.location_type === "in_person"}
                                onChange={(e) => handleChange("location_type", "in_person")}
                                className="w-4 h-4 text-indigo-600"
                            />
                            <span>📍 In Person</span>
                        </label>
                    </div>

                    {formData.location_type === "in_person" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Venue Address / Details</label>
                            <input
                                type="text"
                                className="w-full border rounded p-2"
                                placeholder="e.g. 123 Main St, San Francisco, CA"
                                value={formData.location_address}
                                onChange={(e) => handleChange("location_address", e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">This address will be shown to confirmed attendees.</p>
                        </div>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            required
                            className="w-full border rounded p-2"
                            value={formData.start_date}
                            onChange={(e) => handleChange("start_date", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            required
                            className="w-full border rounded p-2"
                            value={formData.end_date}
                            onChange={(e) => handleChange("end_date", e.target.value)}
                        />
                    </div>
                </div>

                {/* Poster */}
                <div>
                    <label className="block text-sm font-medium mb-1">Poster Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            className="w-full border rounded p-2"
                            placeholder="https://..."
                            value={formData.poster_url}
                            onChange={(e) => handleChange("poster_url", e.target.value)}
                        />
                        {/* Future: Upload button */}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Announcement Post (Markdown)</label>
                    <div className="flex gap-2 mb-2">
                        <button type="button" onClick={() => handleDescriptionAction("bold")} className="px-2 py-1 bg-gray-200 rounded text-xs font-bold">B</button>
                        <button type="button" onClick={() => handleDescriptionAction("italic")} className="px-2 py-1 bg-gray-200 rounded text-xs italic">I</button>
                        <button type="button" onClick={() => handleDescriptionAction("link")} className="px-2 py-1 bg-gray-200 rounded text-xs underline">Link</button>
                    </div>
                    <textarea
                        required
                        rows={6}
                        className="w-full border rounded p-2 font-mono text-sm"
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </div>

                {/* AI Script */}
                <div>
                    <label className="block text-sm font-medium mb-1">AI Meeting Outline Override (JSON)</label>
                    <p className="text-xs text-gray-500 mb-2">Define the specific structure/questions for this event series.</p>
                    <textarea
                        rows={10}
                        className="w-full border rounded p-2 font-mono text-sm bg-gray-900 text-green-400"
                        value={formData.ai_script_override}
                        onChange={(e) => handleChange("ai_script_override", e.target.value)}
                    />
                </div>

                {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Publish Event Series"}
                </button>
            </form>
        </div>
    );
}

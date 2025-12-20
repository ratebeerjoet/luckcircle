"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { format } from "date-fns";
import Link from "next/link";

type EventSeries = Database["public"]["Tables"]["event_series"]["Row"];

export default function ActiveEventCard() {
    const supabase = createClient();
    const [event, setEvent] = useState<EventSeries | null>(null);

    useEffect(() => {
        // Find *currently active* event series
        // Logic: is_active = true AND current date is between start and end (or just upcoming)
        // For now: Fetch active=true and pick the nearest one.
        const fetchEvent = async () => {
            const { data } = await supabase
                .from("event_series")
                .select("*")
                .eq("is_active", true)
                .gte("end_date", new Date().toISOString())
                .order("start_date", { ascending: true })
                .limit(1);

            if (data && data[0]) {
                setEvent(data[0]);
            }
        };
        fetchEvent();
    }, []);

    if (!event) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {/* Decorative Background Icon or Shape */}
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z" />
                </svg>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 relative z-10">
                {event.poster_url && (
                    <div className="w-full md:w-1/3 aspect-video md:aspect-[4/5] rounded-lg bg-black/50 overflow-hidden flex-shrink-0">
                        <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex-1">
                    <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                        Happening Now
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-indigo-200 text-sm mb-4 flex items-center gap-2">
                        <span>{format(new Date(event.start_date), "MMMM d")} - {format(new Date(event.end_date), "MMMM d, yyyy")}</span>
                        <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                        {event.location_type === 'in_person' ? (
                            <span className="flex items-center gap-1 text-emerald-300">
                                📍 In Person {event.location_address ? `@ ${event.location_address}` : ''}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-blue-300">
                                🎥 Online Event
                            </span>
                        )}
                    </p>

                    {/* Render a snippet of the description */}
                    <div className="prose prose-invert prose-sm line-clamp-3 mb-6 text-slate-300">
                        {/* Very basic markdown stripping or just treating as text for snippet */}
                        {event.description?.replace(/[*_#\[\]]/g, '')}
                    </div>

                    <Link
                        href="/profile/availability"
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Edit Availability for this Event
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

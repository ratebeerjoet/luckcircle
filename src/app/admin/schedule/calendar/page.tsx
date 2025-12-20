"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { format } from "date-fns";
import Link from "next/link";

type EventSeries = Database["public"]["Tables"]["event_series"]["Row"];

export default function AdminCalendarPage() {
    const supabase = createClient();
    const [events, setEvents] = useState<EventSeries[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await supabase
                .from("event_series")
                .select("*")
                .order("start_date", { ascending: true });

            if (data) setEvents(data);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    return (
        <div className="p-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Community Schedule</h1>
                <div className="flex gap-4">
                    <Link
                        href="/admin/schedule/slots"
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                        Manage Weekly Slots
                    </Link>
                    <Link
                        href="/admin/events/new"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                        + New Event Series
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Upcoming Event Series</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading schedule...</div>
                ) : events.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 mb-4">No events scheduled.</p>
                        <Link href="/admin/events/new" className="text-indigo-600 font-medium hover:underline">
                            Create your first Event Series
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y">
                        {events.map(event => (
                            <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 w-24 flex flex-col items-center justify-center bg-indigo-50 text-indigo-900 rounded-lg p-2 border border-indigo-100">
                                    <span className="text-xs font-bold uppercase">{format(new Date(event.start_date), "MMM")}</span>
                                    <span className="text-2xl font-bold">{format(new Date(event.start_date), "d")}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                            <p className="text-gray-500 text-sm">
                                                {format(new Date(event.start_date), "MMM d")} - {format(new Date(event.end_date), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                     ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                                 `}>
                                            {event.is_active ? 'Active' : 'Draft'}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {event.description?.replace(/[*_#\[\]]/g, '')}
                                    </p>

                                    <div className="flex gap-4 text-sm">
                                        <Link
                                            href={`/admin/events/${event.id}/edit`} // To be implemented if needed
                                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Edit Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
// import MeetingClient from "./meeting-client"; // Client component for Daily.co

export default async function MeetingPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { id } = await params;

    // Verify access & Fetch Match Details
    // We need to fetch the match AND its event_series relationship to get location data
    const { data: matchData, error } = await supabase
        .from("match_participants")
        .select(`
            match_id,
            matches:match_id (
                id,
                scheduled_at,
                event_series:event_series_id (
                    title,
                    location_type,
                    location_address
                )
            )
        `)
        .eq("match_id", id)
        .eq("user_id", user.id)
        .single();

    if (!matchData || !matchData.matches) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                You are not a participant of this circle.
            </div>
        );
    }

    // @ts-ignore - Supabase types join handling can be tricky to cast perfectly without generated types update
    const match = matchData.matches as any;
    const event = match.event_series;
    const isOnline = !event || event.location_type === 'online';

    // *** IN-PERSON VIEW ***
    if (!isOnline) {
        const address = event.location_address || "TBD";
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
                    {/* Decorative Top */}
                    <div className="h-32 bg-indigo-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="p-8 relative z-10">
                            <h1 className="text-white text-2xl font-bold">{event?.title || "Community Meetup"}</h1>
                            <p className="text-indigo-200 text-sm">In-Person Event</p>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">When</label>
                            <div className="text-white text-xl font-medium mt-1">
                                {format(new Date(match.scheduled_at), "EEEE, MMMM do")}
                            </div>
                            <div className="text-indigo-400 text-lg">
                                {format(new Date(match.scheduled_at), "h:mm a")}
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Where</label>
                            <div className="text-white text-lg mt-1 font-medium">
                                {address}
                            </div>
                            <a
                                href={mapLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm mt-2 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Get Directions
                            </a>
                        </div>

                        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-6">
                            <p className="text-slate-400 text-sm text-center italic">
                                "Show up 5 mins early to grab a coffee!"
                            </p>
                        </div>

                        <Link
                            href="/dashboard"
                            className="block w-full text-center py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // *** ONLINE VIDEO VIEW ***
    const dailyRoomUrl = `https://luckcircle.daily.co/${id}`;
    // const dailyToken = ...

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            {/* <MeetingClient roomUrl={dailyRoomUrl} token={dailyToken} /> */}
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </div>
                <p>Connecting to Video Room...</p>
                <div className="text-xs font-mono text-slate-700">{dailyRoomUrl}</div>
            </div>
        </div>
    );
}

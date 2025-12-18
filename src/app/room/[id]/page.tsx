import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
// import MeetingClient from "./meeting-client"; // Client component for Daily.co

export default async function MeetingPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { id } = await params;

    // Verify access
    const { data: participant } = await supabase
        .from("match_participants")
        .select("match_id")
        .eq("match_id", id)
        .eq("user_id", user.id)
        .single();

    if (!participant) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                You are not a participant of this circle.
            </div>
        );
    }

    // In a real app, we would generate a Daily.co token here server-side
    const dailyRoomUrl = `https://luckcircle.daily.co/${id}`; // Example
    const dailyToken = "MOCK_TOKEN"; // Would fetch from daily API using API key

    return (
        <div className="h-screen bg-slate-950 flex flex-col">
            {/* Use a client component to load Daily-js */}
            {/* <MeetingClient roomUrl={dailyRoomUrl} token={dailyToken} /> */}
            <div className="flex-1 flex items-center justify-center text-slate-500">
                Meeting Room Placeholder (Daily.co integration pending package install)
            </div>
        </div>
    );
}

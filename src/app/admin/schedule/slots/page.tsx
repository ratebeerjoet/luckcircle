"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { format, parse } from "date-fns";

type TimeSlot = Database["public"]["Tables"]["time_slots"]["Row"];

export default function SlotManagerPage() {
    const supabase = createClient();
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDay, setNewDay] = useState("1"); // 1 = Monday
    const [newTime, setNewTime] = useState("09:00"); // Local time input
    const [status, setStatus] = useState("");

    const fetchSlots = async () => {
        const { data } = await supabase
            .from("time_slots")
            .select("*")
            .order("day_of_week", { ascending: true })
            .order("time_utc", { ascending: true });

        if (data) setSlots(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSlots();
    }, []);

    const addSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Saving...");

        // Convert local input to UTC
        // Logic: Create a Date object for the "Next [Day] at [Time]" in local time, then extract UTC hours/min
        // Actually, simple conversion:
        // 1. Get current date
        // 2. Set hours/min from input
        // 3. Get UTC hours/min

        const localDate = parse(newTime, "HH:mm", new Date());
        const utcTime = format(localDate, "HH:mm:ssXXX").slice(0, 8); // Extract HH:mm:ss, ignoring offset part for string but date-fns handles it?
        // Let's use getUTCHours directly to be safe
        const utcHours = localDate.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, '0');
        const utcString = `${utcHours}:${utcMinutes}:00`;

        // Note: If timezone shift changes the day (e.g. 11pm NY is 4am UTC next day), we need to handle that.
        // For simplicity v1: We assume the Admin understands "Day of Week" is relative to the *Community's* primary timezone?
        // OR we store everything in UTC and the day is UTC day.
        // "Admin selects up to 50 local 45-minute slots"
        // If I select "Monday 11pm" and it saves as "Tuesday 4am UTC", that's mathematically correct.
        // When the user views it, "Tuesday 4am UTC" converts back to "Monday 11pm" for them.
        // So we just need to calculate the day offset.

        let dayOffset = 0;
        if (localDate.getUTCDate() !== localDate.getDate()) {
            // If UTC date is different, we shifted days.
            // This is tricky because 'getDate' relies on the specific dummy date we used (today).
            // A safer way: Compare hours.
            // If local is 23:00 and UTC is 04:00, we crossed midnight forward (+1 day).
            // If local is 01:00 and UTC is 20:00, we crossed midnight backward (-1 day).

            // Let's trust the logic: Users pick "Meeting Time". 
            // We save the UTC Equivalent.
            // We DO need to adjust the stored day_of_week if it crosses midnight.
            // simple check:
            // diff = utcHours - localHours. 
            // Roughly.
            // Let's use the full date object comparison.
            // current: localDate
            // utc version: 
            // We need to set the DAY also.
        }

        // Correct approach:
        // 1. Construct a specific recent instance of "Day + Time" in local.
        // 2. Convert to UTC.
        // 3. Extract UTC Day and UTC Time.

        // 0=Sun, 1=Mon...
        const targetDayIndex = parseInt(newDay);
        const now = new Date();
        const currentDayIndex = now.getDay();
        const distance = (targetDayIndex + 7 - currentDayIndex) % 7;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + distance);
        const [h, m] = newTime.split(':').map(Number);
        targetDate.setHours(h, m, 0, 0);

        const finalUtcDay = targetDate.getUTCDay();
        const finalUtcTime = `${targetDate.getUTCHours().toString().padStart(2, '0')}:${targetDate.getUTCMinutes().toString().padStart(2, '0')}:00`;

        // Fetch community ID (assuming single community for now or first one found)
        const { data: comms } = await supabase.from("communities").select("id").limit(1);
        const communityId = comms?.[0]?.id;

        if (!communityId) {
            setStatus("Error: No community found.");
            return;
        }

        const { error } = await supabase.from("time_slots").insert({
            community_id: communityId,
            day_of_week: finalUtcDay, // Save the UTC day
            time_utc: finalUtcTime
        });

        if (error) {
            setStatus("Error saving: " + error.message);
        } else {
            setStatus("Slot created!");
            fetchSlots();
        }
    };

    const deleteSlot = async (id: string) => {
        await supabase.from("time_slots").delete().eq("id", id);
        fetchSlots();
    };

    return (
        <div className="p-8 max-w-4xl text-slate-200">
            <h1 className="text-3xl font-bold mb-6">Manage Meeting Slots</h1>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4 text-slate-200">Add Recurring Slot</h2>
                <form onSubmit={addSlot} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-400">Day</label>
                        <select
                            value={newDay}
                            onChange={(e) => setNewDay(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded p-2 w-40 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="0">Sunday</option>
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednesday</option>
                            <option value="4">Thursday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-400">Local Time</label>
                        <input
                            type="time"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors font-medium">
                        Add Slot
                    </button>
                </form>
                {status && <p className="mt-2 text-sm text-blue-400">{status}</p>}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 border-b border-slate-800">
                        <tr>
                            <th className="p-4 text-slate-400 font-medium">Day (UTC)</th>
                            <th className="p-4 text-slate-400 font-medium">Time (UTC)</th>
                            <th className="p-4 text-slate-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {loading ? <tr><td className="p-4 text-slate-500">Loading...</td></tr> : slots.map((slot) => (
                            <tr key={slot.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-slate-300">
                                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][slot.day_of_week]}
                                </td>
                                <td className="p-4 font-mono text-slate-400">{slot.time_utc}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => deleteSlot(slot.id)}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && slots.length === 0 && (
                            <tr><td colSpan={3} className="p-4 text-center text-slate-500">No slots defined.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

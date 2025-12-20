"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { format, addDays, startOfWeek } from "date-fns";

type TimeSlot = Database["public"]["Tables"]["time_slots"]["Row"];

export default function AvailabilitySelector({ userId, communityId }: { userId: string, communityId: string }) {
    const supabase = createClient();
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch all slots for community
            const { data: slotsData } = await supabase
                .from("time_slots")
                .select("*")
                .eq("community_id", communityId);

            // Fetch user's current availability
            const { data: userAvailData } = await supabase
                .from("user_availability")
                .select("slot_id")
                .eq("user_id", userId);

            if (slotsData) setSlots(slotsData);
            if (userAvailData) {
                setSelectedSlotIds(new Set(userAvailData.map((ua) => ua.slot_id)));
            }
            setLoading(false);
        };

        fetchData();
    }, [userId, communityId, supabase]);

    const toggleSlot = async (slotId: string) => {
        const newSelected = new Set(selectedSlotIds);
        const isSelected = newSelected.has(slotId);

        if (isSelected) {
            newSelected.delete(slotId);
            setSelectedSlotIds(newSelected); // Optimistic
            await supabase
                .from("user_availability")
                .delete()
                .eq("user_id", userId)
                .eq("slot_id", slotId);
        } else {
            newSelected.add(slotId);
            setSelectedSlotIds(newSelected); // Optimistic
            await supabase
                .from("user_availability")
                .insert({ user_id: userId, slot_id: slotId });
        }
    };

    if (loading) return <div className="p-4 text-center">Loading schedule...</div>;

    // Group slots by Local Day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const slotsByDay: Record<string, { slot: TimeSlot; localTimeStr: string; sortTime: number }[]> = {};

    days.forEach(d => slotsByDay[d] = []);

    slots.forEach((slot) => {
        // strict UTC parsing manually to avoid issues
        const [hours, minutes] = slot.time_utc.split(':').map(Number);

        // Create a reference date for this slot's day of week (in UTC)
        // We pick a known "start of week" (e.g. current week)
        const now = new Date();
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 0 }); // Sunday

        // Add slot.day_of_week days
        const utcDate = addDays(startOfCurrentWeek, slot.day_of_week);
        utcDate.setUTCHours(hours, minutes, 0, 0);

        // Format to local string
        const localDay = format(utcDate, "EEEE"); // "Monday"
        const localTime = format(utcDate, "h:mm a"); // "9:00 AM"

        if (!slotsByDay[localDay]) slotsByDay[localDay] = []; // Should exist but safety

        slotsByDay[localDay].push({
            slot,
            localTimeStr: localTime,
            sortTime: utcDate.getTime()
        });
    });

    return (
        <div className="w-full max-w-4xl mx-auto p-4 text-slate-200">
            <h2 className="text-2xl font-bold mb-4 text-white">Select your Weekly Availability</h2>
            <p className="text-slate-400 mb-6">
                Check the times you are free to meet. These recur every week.
            </p>

            <div className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg mb-8 flex items-center gap-3">
                <span className="text-xl">💡</span>
                <p className="text-indigo-200 text-sm font-medium">Pro Tip: Selecting more slots significantly increases your chance of getting matched!</p>
            </div>

            <div className="grid gap-6">
                {days.map((day) => {
                    const dailySlots = slotsByDay[day] || [];
                    if (dailySlots.length === 0) return null;

                    dailySlots.sort((a, b) => a.sortTime - b.sortTime);

                    return (
                        <div key={day} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-300">{day}</h3>
                            <div className="flex flex-wrap gap-3">
                                {dailySlots.map(({ slot, localTimeStr }) => {
                                    const isSelected = selectedSlotIds.has(slot.id);
                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => toggleSlot(slot.id)}
                                            className={`
                                                px-4 py-2 rounded-lg text-sm font-medium transition-all border
                                                ${isSelected
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500"
                                                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                                                }
                                            `}
                                        >
                                            {localTimeStr}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {slots.length === 0 && (
                <div className="text-center p-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                    <p className="text-slate-500">No meeting slots have been defined by the admin yet.</p>
                </div>
            )}
        </div>
    );
}


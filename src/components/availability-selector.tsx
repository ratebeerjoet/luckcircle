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
        <div className="w-full max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Select your Weekly Availability</h2>
            <p className="text-gray-500 mb-2">
                Check the times you are free to meet. These recur every week.
            </p>
            <p className="text-indigo-600 text-sm font-medium mb-8 bg-indigo-50 inline-block px-3 py-1 rounded-full">
                💡 Pro Tip: Selecting more slots significantly increases your chance of getting matched!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {days.map((day) => {
                    const daySlots = slotsByDay[day] || [];
                    if (daySlots.length === 0) return null;

                    // Sort by time
                    daySlots.sort((a, b) => a.sortTime - b.sortTime);

                    return (
                        <div key={day} className="border rounded-xl p-4 bg-white shadow-sm">
                            <h3 className="font-semibold text-lg mb-3 text-indigo-900">{day}</h3>
                            <div className="flex flex-wrap gap-2">
                                {daySlots.map(({ slot, localTimeStr }) => {
                                    const isSelected = selectedSlotIds.has(slot.id);
                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => toggleSlot(slot.id)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 border
                         ${isSelected
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                                                }`}
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
                <div className="text-center text-gray-400 py-10">
                    No meeting slots defined by the admin yet.
                </div>
            )}
        </div>
    );
}

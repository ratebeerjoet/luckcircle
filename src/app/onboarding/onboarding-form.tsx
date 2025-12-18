"use client";

import { useState, useTransition } from "react";
import { submitOnboarding } from "@/app/actions/onboarding";
import { OnboardingData, onboardingSchema } from "@/lib/validations/onboarding";

export default function OnboardingForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<OnboardingData>>({});
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleNext = () => {
        // Basic Client Validation for current step could go here
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        const finalData = { ...formData } as OnboardingData;
        const result = onboardingSchema.safeParse(finalData);

        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        setError(null);
        startTransition(async () => {
            const resp = await submitOnboarding(finalData);
            if (resp?.error) {
                setError(resp.error);
            }
        });
    };

    return (
        <div className="w-full max-w-2xl bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-slate-800 w-full">
                <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <div className="mt-4 mb-8">
                <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Step {step} of 3</span>
                <h2 className="text-3xl font-bold text-white mt-2">
                    {step === 1 && "Start with your credentials"}
                    {step === 2 && "The Struggle"}
                    {step === 3 && "The Give back"}
                </h2>
                <p className="text-slate-400 mt-2">
                    {step === 1 && "Link your professional profile to verify your identity."}
                    {step === 2 && "What is the one thing keeping you up at night right now?"}
                    {step === 3 && "What is your superpower? What do you love helping others with?"}
                </p>
            </div>

            <div className="space-y-6">
                {step === 1 && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn URL</label>
                        <input
                            type="url"
                            className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder="https://linkedin.com/in/you"
                            value={formData.linkedinUrl || ""}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        />
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Your current challenge</label>
                        <textarea
                            className="w-full h-32 px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                            placeholder="e.g. I'm struggling to find a technical co-founder who understands health-tech..."
                            value={formData.struggle || ""}
                            onChange={(e) => setFormData({ ...formData, struggle: e.target.value })}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">How you can help</label>
                        <textarea
                            className="w-full h-32 px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                            placeholder="e.g. I'm great at GTM strategy and cold outreach scripts..."
                            value={formData.helpingOthers || ""}
                            onChange={(e) => setFormData({ ...formData, helpingOthers: e.target.value })}
                        />
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-900 text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className="px-6 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : <div />}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-lg bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                            {isPending ? "Joining..." : "Join the Circle"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

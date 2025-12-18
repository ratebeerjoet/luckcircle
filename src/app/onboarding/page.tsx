import OnboardingForm from "./onboarding-form";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-950">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] right-[20%] w-[50%] h-[50%] bg-purple-900/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[10%] left-[20%] w-[50%] h-[50%] bg-blue-900/10 blur-[130px] rounded-full" />
            </div>
            <OnboardingForm />
        </div>
    );
}

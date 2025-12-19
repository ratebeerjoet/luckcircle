import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-8">
        <div className="inline-block px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-sm text-slate-400 font-medium tracking-wide mb-4">
          ANTI-NETWORKING FOR ENTREPRENEURS
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 leading-[1.1]">
          Kill the <br className="md:hidden" /> "Elevator Pitch"
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">
          Replace anxiety with connection. The Luck Circle uses AI to synthesize your profile and facilitates
          <span className="text-white font-medium"> 45-minute, 3-person video sessions</span> based on shared challenges, not sales pitches.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link href="/login" className="px-8 py-4 rounded-lg bg-white text-slate-950 font-bold text-lg hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Join the Circle
          </Link>
          <Link href="#how-it-works" className="px-8 py-4 rounded-lg border border-slate-700 hover:border-slate-500 hover:bg-slate-900/50 transition-all text-slate-200 font-medium">
            How it works
          </Link>
        </div>

        {/* Feature Grid */}
        <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <FeatureCard
            title="Triad Stability"
            desc="3 people reduce the pressure of 1-on-1s and eliminate 'dead air'. A perfect balance."
          />
          <FeatureCard
            title="AI-Led Synthesis"
            desc="No awkward intros. The AI introduces you by highlighting shared challenges and complementary strengths."
          />
          <FeatureCard
            title="The Anti-Pitch"
            desc="Moderated to prevent sales pitches. We steer conversations toward vulnerability and 'Giver' behaviors."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm hover:border-slate-700 transition-colors">
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 leading-snug">{desc}</p>
    </div>
  );
}

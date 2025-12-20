export default function FeedbackPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">The Pulse</h1>
                <p className="text-slate-400">
                    Real-time feedback from community meetings. Measure the "Spark Rate".
                </p>
            </div>

            <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-slate-500">
                <p>No feedback collected yet.</p>
                <p className="text-sm mt-2">Feedback will appear here after users complete their first sessions.</p>
            </div>
        </div>
    );
}

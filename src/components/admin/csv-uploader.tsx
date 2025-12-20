"use client";

import { useState } from "react";
import Papa from "papaparse";
import { uploadInvites, Invite } from "@/app/actions/admin";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";

export function CsvUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<Invite[]>([]);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // simple mapping, assuming headers match or we map them
                // flexible mapping: look for 'email', 'name', 'linkedin'
                const parsed = results.data.map((row: any) => ({
                    email: row.Email || row.email,
                    name: row.Name || row.name,
                    linkedin_url: row.LinkedIn || row.Linkedin || row.linkedin_url || row.linkedin
                })).filter(r => r.email); // Must have email at least

                setPreview(parsed as Invite[]);
            },
            error: (error) => {
                console.error(error);
                setResult({ error: "Failed to parse CSV: " + error.message });
            }
        });
    };

    const handleUpload = async () => {
        if (!preview.length) return;
        setUploading(true);
        try {
            const res = await uploadInvites(preview);
            setResult(res);
            if (res.success) {
                setFile(null);
                setPreview([]);
            }
        } catch (e) {
            setResult({ error: "System error during upload." });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Bulk Invite Upload</h2>
                <p className="text-sm text-slate-400">
                    Upload a CSV file with columns: <code className="bg-slate-800 px-1 rounded">Name</code>, <code className="bg-slate-800 px-1 rounded">Email</code>, <code className="bg-slate-800 px-1 rounded">LinkedIn</code>
                </p>
            </div>

            <div className="flex items-center gap-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700
                        cursor-pointer"
                />
            </div>

            {preview.length > 0 && (
                <div className="space-y-4">
                    <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-700">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-200 uppercase bg-slate-800 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">LinkedIn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="px-4 py-2 font-medium text-slate-200">{row.name}</td>
                                        <td className="px-4 py-2">{row.email}</td>
                                        <td className="px-4 py-2 truncate max-w-[200px]">{row.linkedin_url}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading {preview.length} invites...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload {preview.length} Invites
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {result && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${result.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-800'}`}>
                    {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    )}
                    <div>
                        <h4 className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {result.success ? 'Upload Successful' : 'Upload Failed'}
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                            {result.success ? `Successfully processed ${result.count} invitations.` : result.error}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

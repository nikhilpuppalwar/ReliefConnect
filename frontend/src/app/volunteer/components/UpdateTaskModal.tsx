"use client";

import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { X, UploadCloud, CheckCircle } from "lucide-react";

interface UpdateTaskModalProps {
  task: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UpdateTaskModal({ task, onClose, onUpdate }: UpdateTaskModalProps) {
  const [status, setStatus] = useState<string>(task?.status || "assigned");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("status", status);
      if (proofFile) {
        formData.append("proof", proofFile);
      }

      await fetchApi(`\/tasks/${task.id}/status`, {
        method: "PUT",
        body: formData,
        // Don't set Content-Type header so the browser sets it to multipart/form-data with the correct boundary
      });

      onUpdate(); // refresh data
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update task status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-surface-container rounded-2xl w-full max-w-lg overflow-hidden border border-outline-variant/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <h2 className="text-xl font-headline font-bold text-white">Update Task Status</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Task Details</label>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-outline-variant/5">
              <h4 className="font-bold text-white">{task?.title}</h4>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
                Current Status: <span className="text-primary">{task?.status}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">New Status</label>
            <div className="grid grid-cols-2 gap-3">
              {["assigned", "in_progress", "completed", "cancelled"].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all
                  ${
                    status === s
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-slate-900 border-outline-variant/20 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {status === "completed" && (
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Proof of Completion (Optional)</label>
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/30 rounded-xl bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                <UploadCloud size={32} className="text-slate-500 mb-3 group-hover:text-primary transition-colors" />
                <span className="text-sm text-slate-400 group-hover:text-slate-200">
                  {proofFile ? proofFile.name : "Click to upload an image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-outline-variant/20 text-white rounded-xl font-bold transition-all hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-primary text-slate-950 rounded-xl font-bold transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined">sync</span>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

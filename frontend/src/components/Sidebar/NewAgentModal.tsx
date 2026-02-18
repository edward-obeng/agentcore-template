import { useState } from "react";
import { X } from "lucide-react";
import type { Agent } from "../../types";

interface NewAgentModalProps {
  onClose: () => void;
  onCreate: (agent: Omit<Agent, "id" | "created_at">) => Promise<Agent | null>;
}

const PRESETS = [
  { icon: "fa-robot", color: "#0EA5E9" },
  { icon: "fa-search", color: "#8B5CF6" },
  { icon: "fa-pen-nib", color: "#F59E0B" },
  { icon: "fa-chart-line", color: "#10B981" },
  { icon: "fa-bolt", color: "#EF4444" },
  { icon: "fa-leaf", color: "#EC4899" },
  { icon: "fa-brain", color: "#06B6D4" },
  { icon: "fa-bullseye", color: "#F97316" },
];

const CATEGORIES = [
  "General",
  "Research",
  "Creative",
  "Finance",
  "Engineering",
  "Personal",
  "Legal",
  "Medical",
];

export function NewAgentModal({ onClose, onCreate }: NewAgentModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate({
      name: name.trim(),
      description: description.trim() || "Custom AI agent",
      category,
      accent_color: PRESETS[selectedPreset].color,
      status: "online",
      avatar_emoji: PRESETS[selectedPreset].icon,
      system_prompt: systemPrompt.trim(),
    });
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1C1E26] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            New Agent
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedPreset(i)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-150 ${
                  selectedPreset === i
                    ? "ring-2 ring-offset-2 dark:ring-offset-[#1C1E26] scale-110"
                    : "hover:scale-105"
                }`}
                style={{
                  backgroundColor: `${p.color}18`,
                  ...(selectedPreset === i
                    ? { outline: `2px solid ${p.color}`, outlineOffset: "2px" }
                    : {}),
                }}
              >
                <i className={`fas ${p.icon}`} style={{ color: p.color }} />
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nexus, Orion, Muse..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              System Prompt <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define the agent's personality, expertise, and behavior..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors duration-150"
          >
            {loading ? "Creating..." : "Create Agent"}
          </button>
        </form>
      </div>
    </div>
  );
}

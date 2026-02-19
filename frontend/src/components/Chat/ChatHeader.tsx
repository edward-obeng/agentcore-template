import { useEffect, useRef, useState } from "react";
import { Archive, Eraser, Settings2 } from "lucide-react";
import type { Agent } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";

interface ChatHeaderProps {
  agent: Agent;
  agents: Agent[];
  onSelectAgent: (agentId: string) => void;
  onClearMessages: () => void;
}

const STATUS_CONFIG: Record<Agent["status"], { color: string; label: string }> =
  {
    online: { color: "#10B981", label: "Online" },
    busy: { color: "#F59E0B", label: "Busy" },
    offline: { color: "#9CA3AF", label: "Offline" },
  };

export function ChatHeader({
  agent,
  agents,
  onSelectAgent,
  onClearMessages,
}: ChatHeaderProps) {
  const status = STATUS_CONFIG[agent.status];
  const iconClass = getAgentIconClass(agent);

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = pickerRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#161820]">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: `${agent.accent_color}18` }}
        >
          <i
            className={`fas ${iconClass}`}
            style={{ color: agent.accent_color }}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {agent.name}
            </h2>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: `${agent.accent_color}18`,
                color: agent.accent_color,
              }}
            >
              {agent.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="h-8 inline-flex items-center gap-2 px-2.5 rounded-lg text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161820] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150"
            title="Available Agents"
          >
            <Settings2 size={16} />
            <span className="text-xs font-semibold">Available Agents</span>
          </button>

          {pickerOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161820] shadow-lg overflow-hidden z-20">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Agents
              </div>
              <div className="p-1">
                {agents.map((a) => {
                  const aIcon = getAgentIconClass(a);
                  const s = STATUS_CONFIG[a.status];
                  const active = a.id === agent.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        onSelectAgent(a.id);
                        setPickerOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        active
                          ? "bg-orange-50 dark:bg-orange-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${a.accent_color}18` }}
                      >
                        <i
                          className={`fas ${aIcon}`}
                          style={{ color: a.accent_color }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {a.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClearMessages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
          title="Clear messages"
        >
          <Eraser size={15} />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150"
          title="Archive"
        >
          <Archive size={15} />
        </button>
      </div>
    </header>
  );
}

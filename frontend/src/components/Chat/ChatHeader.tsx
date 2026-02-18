import { Archive, Trash2 } from "lucide-react";
import type { Agent } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";

interface ChatHeaderProps {
  agent: Agent;
  onClearMessages: () => void;
}

const STATUS_CONFIG: Record<Agent["status"], { color: string; label: string }> =
  {
    online: { color: "#10B981", label: "Online" },
    busy: { color: "#F59E0B", label: "Busy" },
    offline: { color: "#9CA3AF", label: "Offline" },
  };

export function ChatHeader({ agent, onClearMessages }: ChatHeaderProps) {
  const status = STATUS_CONFIG[agent.status];
  const iconClass = getAgentIconClass(agent);

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
        <button
          onClick={onClearMessages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
          title="Clear conversation"
        >
          <Trash2 size={15} />
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

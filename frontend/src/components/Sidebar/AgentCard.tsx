import type { Agent } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}

const STATUS_COLORS: Record<Agent["status"], string> = {
  online: "#10B981",
  busy: "#F59E0B",
  offline: "#9CA3AF",
};

const STATUS_LABELS: Record<Agent["status"], string> = {
  online: "Online",
  busy: "Busy",
  offline: "Offline",
};

export function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  const iconClass = getAgentIconClass(agent);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 group ${
        isSelected
          ? "bg-orange-50 dark:bg-orange-950/30"
          : "hover:bg-gray-50 dark:hover:bg-white/5"
      }`}
    >
      <div
        className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity duration-150"
        style={{
          backgroundColor: agent.accent_color,
          opacity: isSelected ? 1 : 0,
        }}
      />

      <div
        className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform duration-150 group-hover:scale-105"
        style={{ backgroundColor: `${agent.accent_color}18` }}
      >
        <i
          className={`fas ${iconClass}`}
          style={{ color: agent.accent_color }}
        />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#161820]"
          style={{ backgroundColor: STATUS_COLORS[agent.status] }}
          title={STATUS_LABELS[agent.status]}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-sm font-medium truncate transition-colors duration-150 ${
              isSelected
                ? "text-orange-700 dark:text-orange-300"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {agent.name}
          </span>
          <span
            className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
            style={{
              backgroundColor: `${agent.accent_color}18`,
              color: agent.accent_color,
            }}
          >
            {agent.category}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {agent.description}
        </p>
      </div>
    </button>
  );
}

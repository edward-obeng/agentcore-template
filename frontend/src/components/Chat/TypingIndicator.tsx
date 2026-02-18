import type { Agent } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";

interface TypingIndicatorProps {
  agent: Agent;
}

export function TypingIndicator({ agent }: TypingIndicatorProps) {
  const iconClass = getAgentIconClass(agent);

  return (
    <div className="flex items-end gap-2.5 px-6">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm"
        style={{ backgroundColor: `${agent.accent_color}18` }}
      >
        <i
          className={`fas ${iconClass}`}
          style={{ color: agent.accent_color }}
        />
      </div>
      <div className="bg-white dark:bg-[#1C1E26] border border-gray-100 dark:border-white/[0.08] px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

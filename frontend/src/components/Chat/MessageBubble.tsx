import type { Message, Agent } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";

interface MessageBubbleProps {
  message: Message;
  agent: Agent;
  showAvatar: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  agent,
  showAvatar,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const iconClass = getAgentIconClass(agent);

  if (isUser) {
    return (
      <div className="flex justify-end px-6">
        <div className="max-w-[72%]">
          <div className="bg-orange-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
            {message.content}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right pr-1">
            {formatTime(message.created_at)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 px-6">
      <div className="flex-shrink-0 w-7 h-7 mb-5">
        {showAvatar && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: `${agent.accent_color}18` }}
          >
            <i
              className={`fas ${iconClass}`}
              style={{ color: agent.accent_color }}
            />
          </div>
        )}
      </div>
      <div className="max-w-[72%]">
        <div className="bg-white dark:bg-[#1C1E26] border border-gray-100 dark:border-white/[0.08] px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-sm">
          {message.content}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-1">
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

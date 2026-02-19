import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Message, Agent } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";
import { renderSimpleMarkdown } from "../../lib/simpleMarkdown";

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
  const [copied, setCopied] = useState(false);

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
        <div className="relative group bg-white dark:bg-[#1C1E26] border border-gray-100 dark:border-white/[0.08] px-4 py-2.5 pb-9 rounded-2xl rounded-tl-sm text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-sm">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(message.content);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              } catch {
                // ignore
              }
            }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
            title={copied ? "Copied" : "Copy"}
            aria-label={copied ? "Copied" : "Copy"}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {renderSimpleMarkdown(message.content)}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 pl-1">
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

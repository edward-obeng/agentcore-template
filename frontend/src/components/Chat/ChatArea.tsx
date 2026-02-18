import { useEffect, useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageInput } from "./MessageInput";
import type { Agent, Message } from "../../types";
import { getAgentIconClass } from "../../lib/agentIcons";

interface ChatAreaProps {
  agent: Agent;
  messages: Message[];
  isTyping: boolean;
  messagesLoading: boolean;
  onSend: (content: string) => void;
  onClearMessages: () => void;
}

const WELCOME_STARTERS: Record<string, string[]> = {
  Research: [
    "What should I research today?",
    "Summarize the latest trends in AI",
    "Find key insights on this topic",
  ],
  Creative: [
    "Help me brainstorm ideas",
    "Write an opening paragraph",
    "Give me 5 creative concepts",
  ],
  Finance: [
    "Analyze this financial data",
    "What should I watch in the markets?",
    "Review my budget framework",
  ],
  Engineering: [
    "Review this code approach",
    "Help me debug a problem",
    "Suggest an architecture pattern",
  ],
  Personal: [
    "Plan my week ahead",
    "Help me prioritize tasks",
    "Set a daily routine",
  ],
  General: [
    "How can you help me?",
    "What are you capable of?",
    "Let's get started",
  ],
};

interface WelcomeProps {
  agent: Agent;
  onSend: (content: string) => void;
}

function WelcomeMessage({ agent, onSend }: WelcomeProps) {
  const starters =
    WELCOME_STARTERS[agent.category] || WELCOME_STARTERS["General"];
  const iconClass = getAgentIconClass(agent);

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 pb-12 gap-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: `${agent.accent_color}15` }}
      >
        <i
          className={`fas ${iconClass}`}
          style={{ color: agent.accent_color }}
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {agent.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {agent.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {starters.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-150"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatArea({
  agent,
  messages,
  isTyping,
  messagesLoading,
  onSend,
  onClearMessages,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFC] dark:bg-[#0F1117] overflow-hidden">
      <ChatHeader agent={agent} onClearMessages={onClearMessages} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.1) transparent",
        }}
      >
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : isEmpty ? (
          <WelcomeMessage agent={agent} onSend={onSend} />
        ) : (
          <div className="py-6 space-y-2">
            {messages.map((msg, i) => {
              const prevMsg = messages[i - 1];
              const showAvatar =
                msg.role === "agent" && (!prevMsg || prevMsg.role !== "agent");
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  agent={agent}
                  showAvatar={showAvatar}
                />
              );
            })}
            {isTyping && <TypingIndicator agent={agent} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSend={onSend}
        disabled={isTyping}
        agentName={agent.name}
      />
    </div>
  );
}

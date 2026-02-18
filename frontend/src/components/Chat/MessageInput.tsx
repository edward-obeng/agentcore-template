import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  agentName: string;
}

export function MessageInput({
  onSend,
  disabled,
  agentName,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#161820]">
      <div className="flex items-end gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 transition-all duration-150 focus-within:border-orange-300 dark:focus-within:border-orange-500/40 focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.12)]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${agentName}...`}
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none leading-relaxed"
          style={{ maxHeight: "160px" }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 ${
            canSend
              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md hover:scale-105"
              : "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ArrowUp size={15} />
        </button>
      </div>
      <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}

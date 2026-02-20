import { useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ChatArea } from "./components/Chat/ChatArea";
import { EmptyState } from "./components/Chat/EmptyState";
import { ThemeToggle } from "./components/common/ThemeToggle";
import { useAgents } from "./hooks/useAgents";
import { useMessages } from "./hooks/useMessages";
import { useThreads } from "./hooks/useThreads";
import { useTheme } from "./hooks/useTheme";
import type { Agent } from "./types";
import { supabase } from "./lib/supabase";

type SupabaseDeleteResult = { data: unknown | null; error: unknown | null };
interface SupabaseDeleteQuery {
  delete(): SupabaseDeleteQuery;
  eq(column: string, value: unknown): Promise<SupabaseDeleteResult>;
}
interface SupabaseLike {
  from(table: string): SupabaseDeleteQuery;
}
const sb = supabase as unknown as SupabaseLike;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { agents, loading: agentsLoading } = useAgents();
  const {
    threads,
    loading: threadsLoading,
    createThread,
    setThreadAgent,
    deleteThread,
  } = useThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const selectedThread = selectedThreadId
    ? threads.find((t) => t.id === selectedThreadId) || null
    : threads[0] || null;

  const selectedAgent: Agent | null = selectedThread
    ? agents.find((a) => a.id === selectedThread.agent_id) || null
    : null;

  const {
    messages,
    loading: messagesLoading,
    isTyping,
    sendMessage,
    clearMessages,
  } = useMessages(
    selectedThread?.id ?? null,
    selectedAgent,
    selectedThread?.session_id ?? null,
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFC] dark:bg-[#0F1117] font-sans antialiased">
      <Sidebar
        threads={threads}
        selectedThreadId={selectedThread?.id ?? null}
        onSelectThread={(id: string) => setSelectedThreadId(id)}
        onCreateThread={async () => {
          const t = await createThread();
          setSelectedThreadId(t.id);
        }}
        onDeleteThread={async (id: string) => {
          await sb.from("messages").delete().eq("thread_id", id);
          await deleteThread(id);

          const remaining = threads.filter((t) => t.id !== id);
          const wasSelected = selectedThread?.id === id;
          if (wasSelected) {
            if (remaining.length > 0) {
              setSelectedThreadId(remaining[0].id);
            } else {
              setSelectedThreadId(null);
            }
          }
        }}
        loading={threadsLoading || agentsLoading}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-3 right-4 z-10">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {selectedThread && selectedAgent ? (
          <ChatArea
            agent={selectedAgent}
            agents={agents}
            onSelectAgent={(agentId: string) => {
              if (!selectedThread) return;
              setThreadAgent(selectedThread.id, agentId);
            }}
            messages={messages}
            isTyping={isTyping}
            messagesLoading={messagesLoading}
            onSend={sendMessage}
            onClearMessages={clearMessages}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              onNewChat={async () => {
                const t = await createThread();
                setSelectedThreadId(t.id);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

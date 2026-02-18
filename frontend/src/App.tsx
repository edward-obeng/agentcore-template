import { useState } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatArea } from './components/Chat/ChatArea';
import { EmptyState } from './components/Chat/EmptyState';
import { ThemeToggle } from './components/common/ThemeToggle';
import { useAgents } from './hooks/useAgents';
import { useMessages } from './hooks/useMessages';
import { useTheme } from './hooks/useTheme';
import type { Agent } from './types';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { agents, loading: agentsLoading, createAgent } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const { messages, loading: messagesLoading, isTyping, sendMessage, clearMessages } =
    useMessages(selectedAgent?.id ?? null, selectedAgent);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFC] dark:bg-[#0F1117] font-sans antialiased">
      <Sidebar
        agents={agents}
        selectedAgentId={selectedAgent?.id ?? null}
        onSelectAgent={(agent: Agent) => setSelectedAgent(agent)}
        onCreateAgent={createAgent}
        loading={agentsLoading}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="absolute top-3 right-4 z-10">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {selectedAgent ? (
          <ChatArea
            agent={selectedAgent}
            messages={messages}
            isTyping={isTyping}
            messagesLoading={messagesLoading}
            onSend={sendMessage}
            onClearMessages={clearMessages}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}

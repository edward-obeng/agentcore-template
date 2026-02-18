import { useState } from "react";
import { Plus } from "lucide-react";
import { AgentCard } from "./AgentCard";
import { NewAgentModal } from "./NewAgentModal";
import type { Agent } from "../../types";
import { isSupabaseConfigured } from "../../lib/supabase";

interface SidebarProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: Agent) => void;
  onCreateAgent: (
    agent: Omit<Agent, "id" | "created_at">,
  ) => Promise<Agent | null>;
  loading: boolean;
}

export function Sidebar({
  agents,
  selectedAgentId,
  onSelectAgent,
  onCreateAgent,
  loading,
}: SidebarProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside className="w-72 flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#161820] border-r border-gray-100 dark:border-white/[0.06] shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <span className="sidebar-logo">
                <i className="fas fa-robot" style={{ color: "#FF6600" }} />
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              Presales agent
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-semibold">
            J
          </div>
        </div>

        <div className="px-3 pt-3 pb-1">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Agents
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 scrollbar-thin">
          {loading ? (
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[60px] rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
                onSelect={() => onSelectAgent(agent)}
              />
            ))
          )}
        </div>

        {isSupabaseConfigured && (
          <div className="px-3 pb-4 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-150 group"
            >
              <Plus
                size={15}
                className="transition-transform duration-150 group-hover:rotate-90"
              />
              New Agent
            </button>
          </div>
        )}
      </aside>

      {isSupabaseConfigured && showModal && (
        <NewAgentModal
          onClose={() => setShowModal(false)}
          onCreate={onCreateAgent}
        />
      )}
    </>
  );
}

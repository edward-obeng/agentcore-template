import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Thread } from "../../types";

interface SidebarProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => Promise<void>;
  onDeleteThread: (id: string) => Promise<void>;
  loading: boolean;
}

export function Sidebar({
  threads,
  selectedThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  loading,
}: SidebarProps) {
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const threadToDelete = confirmDeleteId
    ? threads.find((t) => t.id === confirmDeleteId) || null
    : null;

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
              PreSales Agents
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-semibold">
            J
          </div>
        </div>

        <div className="px-3 pt-3 pb-1">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Conversations
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
          ) : threads.length === 0 ? (
            <div className="px-2 pt-4 text-xs text-gray-400 dark:text-gray-500">
              No chats yet. Click “New chat” to start.
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectThread(t.id)}
                className={`group w-full text-left px-3 py-3 rounded-xl transition-all duration-150 border ${
                  t.id === selectedThreadId
                    ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-500/20"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {new Date(t.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDeleteId(t.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-3 pb-4 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
          <button
            disabled={creating}
            onClick={async () => {
              setCreating(true);
              await onCreateThread();
              setCreating(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-150 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus
              size={15}
              className="transition-transform duration-150 group-hover:rotate-90"
            />
            New chat
          </button>
        </div>
      </aside>

      {threadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (deleting) return;
              setConfirmDeleteId(null);
            }}
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#161820] border border-gray-200 dark:border-white/10 shadow-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0">
                <Trash2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Delete chat?
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This will delete “{threadToDelete.title}” and its messages.
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={deleting}
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await onDeleteThread(threadToDelete.id);
                  setDeleting(false);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

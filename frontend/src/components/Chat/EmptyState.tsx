import { Plus } from "lucide-react";

interface EmptyStateProps {
  onNewChat: () => void;
}

export function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-[#161820]/70 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-10 sm:p-12">
            <div className="flex items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                <i className="fas fa-robot text-white text-2xl" />
              </div>
            </div>

            <div className="text-center mt-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                PreSales Agents
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Validate services, ask questions, and keep multiple conversation
                threads.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={onNewChat}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <Plus size={16} />
                New chat
              </button>
              <div className="hidden sm:block text-xs text-gray-400 dark:text-gray-500">
                Tip: Use the tool icon in the header to switch agents.
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Threads
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Keep separate chats for different customer needs.
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Streaming
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Service Validation responses stream in real-time.
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  Fast actions
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Delete chats from the sidebar, clear messages in the header.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

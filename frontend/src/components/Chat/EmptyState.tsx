import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <MessageSquare size={24} className="text-gray-400 dark:text-gray-500" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
          No agent selected
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">
          Choose an agent from the sidebar to start a conversation
        </p>
      </div>
    </div>
  );
}

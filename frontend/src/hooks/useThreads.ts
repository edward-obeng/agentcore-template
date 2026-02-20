import { useCallback, useEffect, useState } from "react";
import type { Thread } from "../types";

const STORAGE_KEY = "mockdb:threads";

function readThreads(): Thread[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Array<Partial<Thread>>).map((t) => {
      const now = new Date().toISOString();
      return {
        id: String(t.id || crypto.randomUUID()),
        title: String(t.title || "New chat"),
        agent_id: String(t.agent_id || "service-validation"),
        session_id: String(t.session_id || crypto.randomUUID()),
        created_at: String(t.created_at || now),
        updated_at: String(t.updated_at || now),
      };
    });
  } catch {
    return [];
  }
}

function writeThreads(threads: Thread[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const existing = readThreads();
    if (existing.length > 0) {
      setThreads(existing);
      setLoading(false);
      return;
    }

    writeThreads([]);
    setThreads([]);
    setLoading(false);
  }, []);

  const createThread = useCallback(async () => {
    const now = new Date().toISOString();
    const next: Thread = {
      id: crypto.randomUUID(),
      title: "New chat",
      agent_id: "service-validation",
      session_id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    setThreads((prev) => {
      const updated = [next, ...prev];
      writeThreads(updated);
      return updated;
    });
    return next;
  }, []);

  const renameThread = useCallback(async (id: string, title: string) => {
    setThreads((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, title, updated_at: new Date().toISOString() } : t,
      );
      writeThreads(updated);
      return updated;
    });
  }, []);

  const setThreadAgent = useCallback(async (id: string, agentId: string) => {
    setThreads((prev) => {
      const updated = prev.map((t) =>
        t.id === id
          ? { ...t, agent_id: agentId, updated_at: new Date().toISOString() }
          : t,
      );
      writeThreads(updated);
      return updated;
    });
  }, []);

  const deleteThread = useCallback(async (id: string) => {
    setThreads((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      writeThreads(updated);
      return updated;
    });
  }, []);

  return {
    threads,
    loading,
    createThread,
    renameThread,
    deleteThread,
    setThreadAgent,
  };
}

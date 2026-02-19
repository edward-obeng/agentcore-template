import { useCallback, useEffect, useState } from "react";
import type { Agent, Message } from "../types";
import { supabase } from "../lib/supabase";
import { streamServiceValidation } from "../lib/serviceValidationWs";

type SupabaseResult<T> = { data: T | null; error: unknown | null };

interface SupabaseQuery<T> {
  select(columns?: string): SupabaseQuery<T>;
  eq(column: string, value: unknown): SupabaseQuery<T>;
  order(
    column: string,
    opts?: { ascending?: boolean },
  ): Promise<SupabaseResult<T>>;
  insert(values: unknown): SupabaseQuery<T>;
  delete(): SupabaseQuery<T>;
  single(): Promise<SupabaseResult<T>>;
  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;
}

interface SupabaseLike {
  from<T>(table: string): SupabaseQuery<T>;
}

const sb = supabase as unknown as SupabaseLike;

function getFallbackReply(agent: Agent): string {
  if (agent.id === "comptency-ai") {
    return "I can help with competency mapping, role requirements, and skills validation. What do you need?";
  }
  return "How can I help you today?";
}

async function getAgentReply(agent: Agent, prompt: string): Promise<string> {
  if (agent.id === "service-validation") {
    return streamServiceValidation(prompt);
  }
  return getFallbackReply(agent);
}

export function useMessages(
  threadId: string | null,
  agent: Agent | null,
  threadSessionId: string | null,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await sb
        .from<Message[]>("messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        if (!error && data) setMessages(data as Message[]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!threadId || !agent) return;

      console.log("[Send Message] thread_id:", threadId, "| session_id:", threadSessionId);

      const optimisticUser: Message = {
        id: crypto.randomUUID(),
        thread_id: threadId,
        agent_id: agent.id,
        content,
        role: "user",
        created_at: new Date().toISOString(),
      };

      const { data: insertedUser } = await sb
        .from<Message>("messages")
        .insert({
          thread_id: threadId,
          agent_id: agent.id,
          content,
          role: "user",
        })
        .select()
        .single();

      setMessages((prev) => [
        ...prev,
        (insertedUser as Message) || optimisticUser,
      ]);

      setIsTyping(true);

      const thinkingId = crypto.randomUUID();
      const thinkingMsg: Message = {
        id: thinkingId,
        thread_id: threadId,
        agent_id: agent.id,
        content: "Thinking...",
        role: "agent",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, thinkingMsg]);

      try {
        const reply =
          agent.id === "service-validation"
            ? await streamServiceValidation(content, {
                sessionId: threadSessionId || undefined,
              })
            : await getAgentReply(agent, content);

        const { data: insertedAgent } = await sb
          .from<Message>("messages")
          .insert({
            thread_id: threadId,
            agent_id: agent.id,
            content: reply,
            role: "agent",
          })
          .select()
          .single();

        const finalMsg: Message =
          (insertedAgent as Message) ||
          ({
            id: crypto.randomUUID(),
            thread_id: threadId,
            agent_id: agent.id,
            content: reply,
            role: "agent",
            created_at: new Date().toISOString(),
          } satisfies Message);

        setMessages((prev) =>
          prev.filter((m) => m.id !== thinkingId).concat(finalMsg),
        );
      } catch (e) {
        const errorText = e instanceof Error ? e.message : String(e);
        const fallback: Message = {
          id: crypto.randomUUID(),
          thread_id: threadId,
          agent_id: agent.id,
          content: `Error: ${errorText}`,
          role: "agent",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) =>
          prev.filter((m) => m.id !== thinkingId).concat(fallback),
        );
      } finally {
        setIsTyping(false);
      }
    },
    [threadId, agent, threadSessionId],
  );

  const clearMessages = useCallback(async () => {
    if (!threadId) return;
    await sb.from<unknown>("messages").delete().eq("thread_id", threadId);
    setMessages([]);
  }, [threadId]);

  return { messages, loading, isTyping, sendMessage, clearMessages };
}

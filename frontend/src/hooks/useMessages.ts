import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Message, Agent } from "../types";

const AGENT_REPLIES: Record<string, string[]> = {
  Research: [
    "I've analyzed that thoroughly. Based on current data, there are three key patterns worth noting here. Would you like me to go deeper on any of them?",
    "Great question. Let me break this down with some structured findings. The evidence points in an interesting direction...",
    "I found several relevant sources on this. The consensus leans toward one interpretation, but there's nuance worth discussing.",
  ],
  Creative: [
    "Oh, I love this direction! Here's an angle you might not have considered — what if we approached it from the reader's emotional journey first?",
    "Let me riff on that idea with you. Three variations come to mind, each with a different tone and intent...",
    "There's something really compelling here. I'd push this further — the contrast between those two elements is where the story lives.",
  ],
  Finance: [
    "Running the numbers on that: the model shows a clear pattern, though there's some variance in Q3 worth flagging. Want the full breakdown?",
    "Financially, the risk-adjusted return on that looks reasonable at current rates. Here's how I'd structure the analysis...",
    "The data suggests a conservative allocation here. Let me walk through the assumptions underlying that recommendation.",
  ],
  Personal: [
    "That's a great way to frame it. Based on what you've shared, I'd suggest starting with the highest-leverage items first thing in the morning.",
    "I hear you — that's a lot to manage. Let's break it into three clear priorities for this week. How does that sound?",
    "Small wins compound. Here's a simple structure that tends to work well for most people in similar situations...",
  ],
  Engineering: [
    "Looking at the architecture here, I see a potential issue with that approach at scale. Here's a cleaner alternative pattern...",
    "The code logic is solid, but there's a subtle edge case in the error handling. Let me show you what I mean.",
    "I'd refactor this in two passes: first for correctness, then for readability. The current structure makes the second part harder than it needs to be.",
  ],
  General: [
    "That's an interesting perspective. Let me think through this carefully and share what I'm seeing...",
    "Good question. Here's how I'd approach it step by step.",
    "I have a few thoughts on this. The most important thing to consider first is...",
  ],
};

function getReply(agent: Agent): string {
  const pool = AGENT_REPLIES[agent.category] || AGENT_REPLIES["General"];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useMessages(agentId: string | null, agent: Agent | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!agentId) {
      setMessages([]);
      return;
    }
    fetchMessages(agentId);
  }, [agentId]);

  async function fetchMessages(id: string) {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("messages")
      .select("*")
      .eq("agent_id", id)
      .order("created_at", { ascending: true });
    if (!error && data) setMessages(data as Message[]);
    setLoading(false);
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!agentId || !agent) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        agent_id: agentId,
        content,
        role: "user",
        created_at: new Date().toISOString(),
      };

      const { data: inserted } = await (supabase as any)
        .from("messages")
        .insert({ agent_id: agentId, content, role: "user" })
        .select()
        .single();

      setMessages((prev) => [...prev, (inserted as Message) || userMsg]);

      setIsTyping(true);
      const delay = 1200 + Math.random() * 1200;
      setTimeout(async () => {
        setIsTyping(false);
        const reply = getReply(agent);
        const { data: agentInserted } = await (supabase as any)
          .from("messages")
          .insert({ agent_id: agentId, content: reply, role: "agent" })
          .select()
          .single();

        const agentMsg: Message = agentInserted || {
          id: crypto.randomUUID(),
          agent_id: agentId,
          content: reply,
          role: "agent",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMsg as Message]);
      }, delay);
    },
    [agentId, agent],
  );

  async function clearMessages() {
    if (!agentId) return;
    await (supabase as any).from("messages").delete().eq("agent_id", agentId);
    setMessages([]);
  }

  return { messages, loading, isTyping, sendMessage, clearMessages };
}

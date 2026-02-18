import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Agent } from "../types";
import { getAgentPingUrl, pingAgent } from "../lib/agentHealth";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const mockAgents: Agent[] = [
    {
      id: "service-validation",
      name: "Service Validation",
      description: "Validates services, requirements, and fit.",
      category: "General",
      accent_color: "#FF6600",
      status: "online",
      avatar_emoji: "fa-shield-alt",
      system_prompt: "",
      created_at: new Date(0).toISOString(),
    },
    {
      id: "comptency-ai",
      name: "Comptency AI",
      description: "Assesses competency and team enablement needs.",
      category: "General",
      accent_color: "#FF6600",
      status: "online",
      avatar_emoji: "fa-users-cog",
      system_prompt: "",
      created_at: new Date(1).toISOString(),
    },
  ];

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    if (agents.length === 0) return;

    let canceled = false;
    const agentIds = agents.map((a) => a.id);

    async function checkAll() {
      const results = await Promise.all(
        agentIds.map(async (id) => {
          const pingUrl = getAgentPingUrl(id);
          if (!pingUrl) return { id, ok: true };
          const ok = await pingAgent(pingUrl);
          return { id, ok };
        }),
      );

      if (canceled) return;

      setAgents((prev) =>
        prev.map((a) => {
          const found = results.find((r) => r.id === a.id);
          if (!found) return a;
          const nextStatus: Agent["status"] = found.ok ? "online" : "offline";
          return a.status === nextStatus ? a : { ...a, status: nextStatus };
        }),
      );
    }

    checkAll();
    const intervalId = window.setInterval(checkAll, 10000);
    return () => {
      canceled = true;
      window.clearInterval(intervalId);
    };
  }, [agents.length, isSupabaseConfigured]);

  async function fetchAgents() {
    setLoading(true);

    if (!isSupabaseConfigured) {
      localStorage.setItem("mockdb:agents", JSON.stringify(mockAgents));
      setAgents(mockAgents);
      setLoading(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("agents")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      const agentsData = data as Agent[];
      setAgents(agentsData);
    }
    setLoading(false);
  }

  async function createAgent(agent: Omit<Agent, "id" | "created_at">) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await (supabase as any)
      .from("agents")
      .insert(agent)
      .select()
      .single();
    if (!error && data) {
      setAgents((prev) => [...prev, data as Agent]);
      return data as Agent;
    }
    return null;
  }

  async function deleteAgent(id: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await (supabase as any)
      .from("agents")
      .delete()
      .eq("id", id);
    if (!error) setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  return { agents, loading, createAgent, deleteAgent, refetch: fetchAgents };
}

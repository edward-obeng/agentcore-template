import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Agent } from "../types";

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

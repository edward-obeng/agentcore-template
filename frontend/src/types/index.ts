export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  accent_color: string;
  status: "online" | "offline" | "busy";
  avatar_emoji: string;
  system_prompt: string;
  created_at: string;
}

export interface Thread {
  id: string;
  title: string;
  agent_id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  agent_id: string;
  content: string;
  role: "user" | "agent";
  created_at: string;
}

export type Theme = "light" | "dark";

function getPingUrlFromInvocationUrl(invocationUrl: string): string {
  try {
    const u = new URL(invocationUrl);
    if (u.pathname.endsWith("/invocations")) {
      u.pathname = u.pathname.replace(/\/invocations\/?$/, "/ping");
      return u.toString();
    }
    u.pathname = u.pathname.replace(/\/?$/, "/ping");
    return u.toString();
  } catch {
    if (invocationUrl.endsWith("/invocations")) {
      return invocationUrl.replace(/\/invocations\/?$/, "/ping");
    }
    return invocationUrl.replace(/\/?$/, "/ping");
  }
}

export function getAgentPingUrl(agentId: string): string | null {
  if (agentId === "service-validation") {
    const inv =
      (import.meta.env.VITE_SERVICE_VALIDATION_URL as string | undefined) ||
      "http://localhost:8082/invocations";
    return getPingUrlFromInvocationUrl(inv);
  }

  if (agentId === "comptency-ai") {
    return null;
  }

  return null;
}

export async function pingAgent(
  pingUrl: string,
  timeoutMs = 2500,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(pingUrl, {
      method: "GET",
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

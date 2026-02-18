export type ServiceValidationWsEvent =
  | { type: "status"; status?: string }
  | { type: "chunk"; content?: string }
  | { type: "complete" }
  | { type: string; [key: string]: unknown };

export interface StreamCallbacks {
  onThinking?: () => void;
  onChunk?: (chunk: string) => void;
}

export async function streamServiceValidation(
  prompt: string,
  callbacks: StreamCallbacks = {},
): Promise<string> {
  const wsUrl =
    (import.meta.env.VITE_SERVICE_VALIDATION_WS_URL as string | undefined) ||
    "ws://localhost:8082/ws";

  return new Promise((resolve, reject) => {
    let settled = false;
    let text = "";

    const ws = new WebSocket(wsUrl);

    const cleanup = () => {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    };

    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify({ prompt }));
      } catch (e) {
        fail(e);
      }
    };

    ws.onerror = () => {
      fail(new Error("Service Validation WebSocket error."));
    };

    ws.onclose = () => {
      if (!settled) {
        fail(new Error("Service Validation WebSocket closed unexpectedly."));
      }
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(String(evt.data)) as ServiceValidationWsEvent;

        if (data.type === "status" && data.status === "processing") {
          callbacks.onThinking?.();
          return;
        }

        if (data.type === "chunk") {
          const chunk = typeof data.content === "string" ? data.content : "";
          if (chunk) {
            text += chunk;
            callbacks.onChunk?.(chunk);
          }
          return;
        }

        if (data.type === "complete") {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(text);
          return;
        }

        // ignore other types, especially raw_event_summary
      } catch {
        // ignore malformed messages
      }
    };
  });
}

export interface InvocationResponse {
  result?: {
    role?: string;
    content?: Array<{ text?: string }>;
  };
}

export async function invokeServiceValidation(prompt: string): Promise<string> {
  const url = (import.meta.env.VITE_SERVICE_VALIDATION_URL as string | undefined) ||
    'http://localhost:8082/invocations';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Service Validation request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as InvocationResponse;
  const chunks = data?.result?.content || [];
  const combined = chunks.map(c => c.text).filter(Boolean).join('\n\n');

  if (combined) return combined;

  throw new Error('Service Validation returned no text content.');
}

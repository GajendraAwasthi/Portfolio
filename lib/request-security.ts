import { NextRequest } from 'next/server';

/** Require browser mutations to originate from this exact origin, including subdomain boundaries. */
export function isSameOriginMutation(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin === req.nextUrl.origin;
    } catch {
      return false;
    }
  }
  return req.headers.get('sec-fetch-site') === 'same-origin';
}

export async function readJsonBody(req: NextRequest, maxBytes: number): Promise<unknown> {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new Error('JSON content type required');
  }
  const reader = req.body?.getReader();
  if (!reader) throw new Error('Request body required');
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error('Request body too large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

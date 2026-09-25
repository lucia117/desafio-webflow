export async function sha256Bytes(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  const subtle: SubtleCrypto =
    globalThis.crypto?.subtle ?? (await import("node:crypto")).webcrypto.subtle;
  const digest = await subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

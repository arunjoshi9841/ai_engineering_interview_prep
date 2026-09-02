type DecodeResult =
  | { ok: true; value: string }
  | { ok: false; code: "malformed" | "output_too_large" };

export function encodeRuns(value: string): string {
  throw new Error("not implemented");
}

export function decodeRuns(encoded: string): DecodeResult {
  throw new Error("not implemented");
}

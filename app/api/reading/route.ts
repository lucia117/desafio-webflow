import { NextResponse } from "next/server";
import { drawReading } from "@/lib/reading";

const MAX_TRACE_LENGTH = 4000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido: se esperaba JSON." },
      { status: 400 }
    );
  }

  const trace = (body as { trace?: unknown } | null)?.trace;

  if (typeof trace !== "string" || trace.trim().length === 0) {
    return NextResponse.json(
      { error: "Falta 'trace': pegá el error o stack trace que querés leer." },
      { status: 400 }
    );
  }

  const normalized = trace.trim();

  if (normalized.length > MAX_TRACE_LENGTH) {
    return NextResponse.json(
      { error: `El trace es muy largo (máx. ${MAX_TRACE_LENGTH} caracteres).` },
      { status: 400 }
    );
  }

  const reading = await drawReading(normalized);

  return NextResponse.json({ reading });
}

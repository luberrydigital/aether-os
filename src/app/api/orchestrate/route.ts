import { Command, INTERRUPT, isInterrupted } from "@langchain/langgraph";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  finalizeOrchestrationCold,
  getOrchestrationGraph,
  toPublicOrchestrationState,
} from "@/lib/agents/orchestration-graph";
import type {
  OrchestrationPublicState,
  TreasuryResume,
} from "@/lib/agents/orchestration-types";
import { getRouteSession } from "@/lib/auth/session";
import {
  dbGetOrchestrationSession,
  dbUpsertOrchestrationSession,
} from "@/lib/db/local-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isTreasuryResume(x: unknown): x is TreasuryResume {
  if (!x || typeof x !== "object") return false;
  return typeof (x as TreasuryResume).approved === "boolean";
}

function readInterruptPayload(out: unknown): unknown {
  if (!out || typeof out !== "object") return undefined;
  const chunks = Reflect.get(out as object, INTERRUPT);
  if (!Array.isArray(chunks) || chunks.length === 0) return undefined;
  const first = chunks[0] as { value?: unknown };
  return first?.value;
}

export async function POST(request: NextRequest) {
  const session = await getRouteSession(request);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const resumeRaw = body.resume;
  const threadIdIn =
    typeof body.threadId === "string" && body.threadId.length > 0
      ? body.threadId
      : null;
  const sentenceIn =
    typeof body.sentence === "string" ? body.sentence.trim() : "";

  const graph = getOrchestrationGraph();

  if (isTreasuryResume(resumeRaw)) {
    const threadId = threadIdIn;
    if (!threadId) {
      return NextResponse.json(
        { error: "threadId is required when sending resume." },
        { status: 400 }
      );
    }

    const config = { configurable: { thread_id: threadId } };
    const resume = resumeRaw as TreasuryResume;

    try {
      const out = await graph.invoke(new Command({ resume }), config);
      if (isInterrupted(out)) {
        const snap = await graph.getState(config);
        const publicState = toPublicOrchestrationState(
          (snap?.values ?? out) as Record<string, unknown>
        );
        const interruptPayload = readInterruptPayload(out);
        await dbUpsertOrchestrationSession({
          thread_id: threadId,
          user_id: userId,
          status: "awaiting_approval",
          state: publicState,
          interrupt: interruptPayload ?? null,
        });
        return NextResponse.json({
          status: "awaiting_human_approval",
          threadId,
          interrupt: interruptPayload,
          state: publicState,
        });
      }

      const done = toPublicOrchestrationState(out as Record<string, unknown>);
      await dbUpsertOrchestrationSession({
        thread_id: threadId,
        user_id: userId,
        status: "complete",
        state: done,
        result: done,
        interrupt: null,
      });

      return NextResponse.json({
        status: "complete",
        threadId,
        state: done,
        resumedVia: "langgraph",
      });
    } catch {
      const row = await dbGetOrchestrationSession({ thread_id: threadId, user_id: userId });
      if (!row || row.status !== "awaiting_approval") {
        return NextResponse.json(
          {
            error:
              "Could not resume this thread in-process or from stored session. Ensure orchestration_sessions exists and the thread is still awaiting approval.",
          },
          { status: 410 }
        );
      }

      const base = row.state as OrchestrationPublicState;
      const merged = finalizeOrchestrationCold(base, resume);
      await dbUpsertOrchestrationSession({
        thread_id: threadId,
        user_id: userId,
        status: "complete",
        state: merged,
        result: merged,
        interrupt: null,
      });

      return NextResponse.json({
        status: "complete",
        threadId,
        state: merged,
        resumedVia: "file_db_fallback",
      });
    }
  }

  if (!sentenceIn) {
    return NextResponse.json(
      { error: "Provide a non-empty sentence to start orchestration." },
      { status: 400 }
    );
  }

  const threadId = threadIdIn ?? crypto.randomUUID();
  const config = { configurable: { thread_id: threadId } };

  const initial = {
    sentence: sentenceIn,
    humanApproval: "pending" as const,
    humanApprovalNotes: null,
    businessDesigner: null,
    marketingSales: null,
    deliveryFulfillment: null,
    financePayment: null,
    monitorProfit: null,
    errors: [],
  };

  const out = await graph.invoke(initial, config);

  if (isInterrupted(out)) {
    const snap = await graph.getState(config);
    const publicState = toPublicOrchestrationState(
      (snap?.values ?? out) as Record<string, unknown>
    );
    const interruptPayload = readInterruptPayload(out);

    await dbUpsertOrchestrationSession({
      thread_id: threadId,
      user_id: userId,
      status: "awaiting_approval",
      state: publicState,
      interrupt: interruptPayload ?? null,
    });

    return NextResponse.json({
      status: "awaiting_human_approval",
      threadId,
      interrupt: interruptPayload,
      state: publicState,
    });
  }

  const complete = toPublicOrchestrationState(out as Record<string, unknown>);
  await dbUpsertOrchestrationSession({
    thread_id: threadId,
    user_id: userId,
    status: "complete",
    state: complete,
    result: complete,
    interrupt: null,
  });

  return NextResponse.json({
    status: "complete",
    threadId,
    state: complete,
  });
}

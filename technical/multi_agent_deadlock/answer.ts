interface TaskState {
  id: string;
  owner: "supervisor" | "agent-a" | "agent-b";
  status: "ready" | "running" | "waiting" | "completed" | "failed";
  waitingFor?: string;
  leaseVersion: number;
}

async function runAgentA(workflowId: string): Promise<void> {
  await state.markWaiting("agent-a", "agent-b:summary");
  const summary = await events.waitFor("agent-b:summary");
  await state.completeOwned("agent-a", summary);
}

async function runAgentB(workflowId: string): Promise<void> {
  await state.markWaiting("agent-b", "agent-a:risk-score");
  const score = await events.waitFor("agent-a:risk-score");
  await state.completeOwned("agent-b", score);
}

await Promise.all([runAgentA(workflowId), runAgentB(workflowId)]);

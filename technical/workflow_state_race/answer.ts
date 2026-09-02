interface WorkflowStore {
  get(id: string): Promise<WorkflowState>;
  compareAndSet(next: WorkflowState, expectedRevision: number): Promise<boolean>;
}

interface StepRun {
  workflowId: string;
  step: string;
  operationId: string;
}

declare const store: WorkflowStore;
declare function runStep(run: StepRun): Promise<void>;

interface Queue {
  ack(messageId: string): Promise<void>;
  retry(messageId: string, options: { delayMs: number }): Promise<void>;
  deadLetter(messageId: string, reason: string): Promise<void>;
}

interface ProvisioningEvent {
  operationId: string;
  userId: string;
  attempt: number;
}

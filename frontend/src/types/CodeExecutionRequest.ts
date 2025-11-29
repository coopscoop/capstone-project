export interface CodeExecutionRequest {
  code: string;
  runLinter?: boolean;
  timeoutMs?: number;
}
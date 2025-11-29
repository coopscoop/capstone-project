export interface CodeExecutionRequest {
  code: string;
  runLinter?: boolean;
  timeoutSeconds?: number;
}
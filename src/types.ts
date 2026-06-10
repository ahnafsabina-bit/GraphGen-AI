export interface DiagramResponse {
  title: string;
  type: string;
  svg: string;
  labels: string[];
  short_explanation: string;
}

export type Category = "Biology" | "Physics" | "Chemistry" | "Math" | "General";

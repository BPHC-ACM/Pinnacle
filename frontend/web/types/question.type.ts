// types/question.type.ts
export type JobQuestion = {
  id: string;
  jobId: string;
  question: string;
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

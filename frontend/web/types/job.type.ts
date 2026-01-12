import { JobQuestion } from './question.type';
export type Job = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string | null;
  type: string;
  salary: string | null;
  status: 'OPEN' | 'CLOSED';
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  questions?: JobQuestion[];
};

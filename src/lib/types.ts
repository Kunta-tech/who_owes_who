export type Participant = string;

export type Payment = {
  id: string;
  description?: string;
  total: number;

  paidBy: Record<Participant, number>;
  sharedAmong: Record<Participant, number>;

  createdAt: number;
};

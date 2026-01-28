import { Payment, Participant } from "../src/lib/types";

export function computeLedger(
  payments: Payment[]
): Record<Participant, number> {
  const ledger: Record<Participant, number> = {};

  for (const p of payments) {
    // paid
    for (const [person, amount] of Object.entries(p.paidBy)) {
      ledger[person] = (ledger[person] ?? 0) + amount;
    }

    // shared
    for (const [person, amount] of Object.entries(p.sharedAmong)) {
      ledger[person] = (ledger[person] ?? 0) - amount;
    }
  }

  return ledger;
}

export type Settlement = {
  from: string;
  to: string;
  amount: number;
};

const EPSILON = 0.01;

export function computeSettlements(ledger: Record<Participant, number>): Settlement[] {
  const debtors: { name: string; amount: number }[] = [];
  const creditors: { name: string; amount: number }[] = [];

  for (const [name, balance] of Object.entries(ledger)) {
    if (balance <= -EPSILON) {
      debtors.push({ name, amount: Math.abs(balance) });
    } else if (balance >= EPSILON) {
      creditors.push({ name, amount: balance });
    }
  }

  // Sort to always pick largest first (Greedy)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount >= EPSILON) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < EPSILON) d++;
    if (creditor.amount < EPSILON) c++;
  }

  return settlements;
}

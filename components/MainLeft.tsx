"use client";

import { useEffect, useState } from "react";
import { Payment, Participant } from "@/src/lib/types";
import { Plus, Trash2, Save } from "lucide-react";

type Props = {
  activePayment: Payment | null;
  onSave: (p: Payment) => void;
};

type Row = {
  name: string;
  amount: number;
};

const emptyPayment = (): Payment => ({
  id: crypto.randomUUID(),
  description: "",
  total: 0,
  paidBy: {},
  sharedAmong: {},
  timestamp: Date.now(),
});

function recordToRows(
  record: Record<Participant, number>
): Row[] {
  return Object.entries(record).map(([name, amount]) => ({
    name,
    amount,
  }));
}

function rowsToRecord(rows: Row[]): Record<string, number> {
  const out: Record<string, number> = {};
  rows.forEach(r => {
    if (r.name) out[r.name] = r.amount;
  });
  return out;
}

export default function MainLeft({
  activePayment,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<Payment>(
    emptyPayment()
  );

  const [paidByRows, setPaidByRows] = useState<Row[]>([]);
  const [sharedRows, setSharedRows] = useState<Row[]>([]);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");

  const totalPaid = paidByRows.reduce((sum, r) => sum + r.amount, 0);
  const totalShared = sharedRows.reduce((sum, r) => sum + r.amount, 0);
  const isBalanced = Math.abs(totalPaid - draft.total) < 0.01 && Math.abs(totalShared - draft.total) < 0.01;

  useEffect(() => {
    if (splitMode !== "equal") return;
    if (sharedRows.length === 0) return;

    const perHead = draft.total / sharedRows.length;

    setSharedRows(rows =>
      rows.map(r => ({
        ...r,
        amount: Number(perHead.toFixed(2)),
      }))
    );
  }, [splitMode, draft.total, sharedRows.length]);


  /* Load when editing */
  useEffect(() => {
    if (activePayment) {
      setDraft(activePayment);
      setPaidByRows(recordToRows(activePayment.paidBy));
      setSharedRows(
        recordToRows(activePayment.sharedAmong)
      );
    } else {
      reset();
    }
  }, [activePayment]);

  function reset() {
    const p = emptyPayment();
    setDraft(p);
    setPaidByRows([]);
    setSharedRows([]);
  }

  function save() {
    if (!isBalanced) {
      alert("Totals don't match the payment total!");
      return;
    }
    onSave({
      ...draft,
      paidBy: rowsToRecord(paidByRows),
      sharedAmong: rowsToRecord(sharedRows),
    });
    reset();
  }

  return (
    <section className="panel inputs">
      <div className="panel-header">
        <h2>{activePayment ? "Edit Payment" : "New Payment"}</h2>
        <button className="primary" onClick={save}>
          {activePayment ? <Save size={16} /> : <Plus size={16} />}
          {activePayment ? "Update" : "Add Payment"}
        </button>
      </div>

      <div className="payment-card">
        <input
          placeholder="What was this for?"
          value={draft.description}
          onChange={e =>
            setDraft(d => ({
              ...d,
              description: e.target.value,
            }))
          }
        />

        <div className="row">
          <label>Total Amount</label>
          <input
            type="number"
            value={draft.total}
            onChange={e =>
              setDraft(d => ({
                ...d,
                total: Number(e.target.value),
              }))
            }
          />
        </div>

        <div className="row-group" style={{ marginTop: '1rem' }}>
          {/* PAID BY */}
          <Section
            title="Who Paid?"
            rows={paidByRows}
            setRows={setPaidByRows}
            showAmount
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span className="muted">Total Paid:</span>
            <span style={{ color: Math.abs(totalPaid - draft.total) < 0.01 ? 'var(--accent)' : 'var(--danger)' }}>
              {totalPaid} / {draft.total}
            </span>
          </div>

          {/* SHARED AMONG */}
          <Section
            title="Split Among"
            rows={sharedRows}
            setRows={setSharedRows}
            showAmount={splitMode !== "equal"}
            amountDisabled={splitMode === "equal"}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span className="muted">Total Shared:</span>
            <span style={{ color: Math.abs(totalShared - draft.total) < 0.01 ? 'var(--accent)' : 'var(--danger)' }}>
              {totalShared} / {draft.total}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            gap: "1rem",
            fontSize: "0.85rem",
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem'
          }}
        >
          <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={splitMode === "equal"}
              onChange={() => setSplitMode("equal")}
            />
            Equal split
          </label>

          <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              checked={splitMode === "custom"}
              onChange={() => setSplitMode("custom")}
            />
            Custom split
          </label>
        </div>
      </div>
    </section>
  );
}


/* ---------- reusable section ---------- */

function Section({
  title,
  rows,
  setRows,
  showAmount,
  amountDisabled = false,
}: {
  title: string;
  rows: Row[];
  setRows: React.Dispatch<
    React.SetStateAction<Row[]>
  >;
  showAmount: boolean;
  amountDisabled?: boolean;
}) {
  return (
    <div className="row">
      <label>{title}</label>

      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <input
            placeholder="Name"
            value={r.name}
            onChange={e => {
              const copy = [...rows];
              copy[i] = {
                ...copy[i],
                name: e.target.value,
              };
              setRows(copy);
            }}
          />

          {showAmount && (
            <input
              type="number"
              placeholder="Amount"
              disabled={amountDisabled}
              value={r.amount}
              onChange={e => {
                const copy = [...rows];
                copy[i] = {
                  ...copy[i],
                  amount: Number(e.target.value),
                };
                setRows(copy);
              }}
            />
          )}

          <button
            className="danger"
            onClick={() =>
              setRows(rows.filter((_, x) => x !== i))
            }
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <button
        onClick={() =>
          setRows(r => [
            ...r,
            { name: "", amount: 0 },
          ])
        }
      >
        <Plus size={14} /> Add Participant
      </button>
    </div>
  );
}

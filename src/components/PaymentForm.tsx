"use client";

import { useEffect, useState } from "react";
import { Payment, Participant } from "@/lib/types";
import { Plus, Trash2, Save } from "lucide-react";

type Props = {
  activePayment: Payment | null;
  onSave: (p: Payment) => void;
};

type Row = {
  name: string;
  amount: string;
};

type DraftPayment = Omit<Payment, "total"> & {
  total: string;
};

const emptyPayment = (): DraftPayment => ({
  id: crypto.randomUUID(),
  description: "",
  total: "",
  paidBy: {},
  sharedAmong: {},
  timestamp: Date.now(),
});

function recordToRows(
  record: Record<Participant, number>
): Row[] {
  return Object.entries(record).map(([name, amount]) => ({
    name,
    amount: String(amount),
  }));
}

function rowsToRecord(rows: Row[]): Record<string, number> {
  const out: Record<string, number> = {};
  rows.forEach(r => {
    const val = parseFloat(r.amount);
    if (r.name && !isNaN(val)) out[r.name] = val;
  });
  return out;
}

export default function PaymentForm({
  activePayment,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<DraftPayment>(
    emptyPayment()
  );

  const [paidByRows, setPaidByRows] = useState<Row[]>([]);
  const [sharedRows, setSharedRows] = useState<Row[]>([]);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");

  // total calculation for display
  function safeEvaluate(expression: string): number {
    // Only allow digits, dot, +, -, *, /, (, ), and whitespace
    if (!/^[\d\.\+\-\*\/\(\)\s]+$/.test(expression)) {
      return NaN;
    }
    try {
      // safe because of the regex check above
      // eslint-disable-next-line no-new-func
      return new Function("return " + expression)();
    } catch {
      return NaN;
    }
  }

  const totalPaid = paidByRows.reduce((sum, r) => sum + (safeEvaluate(r.amount) || 0), 0);
  const totalShared = sharedRows.reduce((sum, r) => sum + (safeEvaluate(r.amount) || 0), 0);

  const draftTotalNum = safeEvaluate(draft.total) || 0;
  const isBalanced = Math.abs(totalPaid - draftTotalNum) < 0.01 && Math.abs(totalShared - draftTotalNum) < 0.01;

  useEffect(() => {
    if (splitMode !== "equal") return;
    if (sharedRows.length === 0) return;

    const total = safeEvaluate(draft.total) || 0;
    const perHead = total / sharedRows.length;

    setSharedRows(rows =>
      rows.map(r => ({
        ...r,
        amount: isNaN(perHead) ? "" : perHead.toFixed(2),
      }))
    );
  }, [splitMode, draft.total, sharedRows.length]);


  /* Load when editing */
  useEffect(() => {
    if (activePayment) {
      setDraft({
        ...activePayment,
        total: String(activePayment.total),
      });
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
    const totalNum = safeEvaluate(draft.total);
    if (isNaN(totalNum)) {
      alert("Please enter a valid total amount (math allowed: +, -, *, /).");
      return;
    }

    // Validate rows
    const invalidRows = [...paidByRows, ...sharedRows].some(r => isNaN(safeEvaluate(r.amount)));
    if (invalidRows) {
      alert("Please ensure all participant amounts are valid numbers or expressions.");
      return;
    }

    if (!isBalanced) {
      alert("Totals don't match the payment total!");
      return;
    }

    // Convert rows to evaluated numbers
    const finalPaidBy: Record<string, number> = {};
    paidByRows.forEach(r => {
      if (r.name) finalPaidBy[r.name] = safeEvaluate(r.amount) || 0;
    });

    const finalSharedAmong: Record<string, number> = {};
    sharedRows.forEach(r => {
      if (r.name) finalSharedAmong[r.name] = safeEvaluate(r.amount) || 0;
    });

    onSave({
      ...draft,
      total: totalNum,
      paidBy: finalPaidBy,
      sharedAmong: finalSharedAmong,
    } as Payment);
    reset();
  }

  return (
    <section className="panel inputs">
      <div className="panel-header">
        <h2>{activePayment ? "Edit Payment" : "New Payment"}</h2>
        <button className="primary" onClick={save}>
          {activePayment ? <Save size={16} /> : <Plus size={16} />}
          <span className="button-text">{activePayment ? "Update" : "Add Payment"}</span>
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
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={draft.total}
            onChange={e =>
              setDraft(d => ({
                ...d,
                total: e.target.value,
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
            onAdd={() => {
              const total = safeEvaluate(draft.total) || 0;
              const paid = paidByRows.reduce((sum, r) => sum + (safeEvaluate(r.amount) || 0), 0);
              const remaining = total - paid;
              setPaidByRows(prev => [
                ...prev,
                { name: "", amount: remaining > 0 ? String(remaining) : "" }
              ]);
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span className="muted">Total Paid:</span>
            <span style={{ color: Math.abs(totalPaid - draftTotalNum) < 0.01 ? 'var(--accent)' : 'var(--danger)' }}>
              {totalPaid.toFixed(2)} / {draftTotalNum.toFixed(2)}
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
            <span style={{ color: Math.abs(totalShared - draftTotalNum) < 0.01 ? 'var(--accent)' : 'var(--danger)' }}>
              {totalShared.toFixed(2)} / {draftTotalNum.toFixed(2)}
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
  onAdd,
}: {
  title: string;
  rows: Row[];
  setRows: React.Dispatch<
    React.SetStateAction<Row[]>
  >;
  showAmount: boolean;
  amountDisabled?: boolean;
  onAdd?: () => void;
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
              type="text"
              inputMode="decimal"
              placeholder="Amount"
              disabled={amountDisabled}
              value={r.amount}
              onChange={e => {
                const copy = [...rows];
                copy[i] = {
                  ...copy[i],
                  amount: e.target.value,
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
        onClick={() => {
          if (onAdd) {
            onAdd();
          } else {
            setRows(r => [
              ...r,
              { name: "", amount: "" },
            ]);
          }
        }}
      >
        <Plus size={14} /> <span className="button-text">Add Participant</span>
      </button>
    </div>
  );
}

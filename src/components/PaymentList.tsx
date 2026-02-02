import { Payment } from "@/lib/types";
import { CURRENCY } from "@/lib/constants";
import { Trash2, Pencil } from "lucide-react";

type Props = {
  payments: Payment[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
};

export default function PaymentList({
  payments,
  onEdit,
  onRemove,
  onClearAll,
}: Props) {

  return (
    <section className="summary">
      <div className="panel-header">
        <h2>Payment History</h2>
        {payments.length > 0 && (
          <button className="danger" onClick={() => {
            if (confirm("Are you sure you want to clear all payments?")) {
              onClearAll();
            }
          }}>
            <Trash2 size={16} /> <span className="button-text">Clear All</span>
          </button>
        )}
      </div>

      {payments.length === 0 ? (
        <p className="muted">No payments added yet. Start by adding one on the left!</p>
      ) : (
        <div className="payment-summary-list">
          {payments.map(p => (
            <div key={p.id} className="payment-summary-item">
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>{p.description || "Untitled payment"}</strong>
                <span className="muted mono" style={{ fontSize: '0.9rem' }}>{CURRENCY}{p.total}</span>
              </div>

              <div className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => onEdit(p.id)}>
                  <Pencil size={14} /> <span className="button-text">Edit</span>
                </button>
                <button
                  className="danger"
                  onClick={() => onRemove(p.id)}
                >
                  <Trash2 size={14} /> <span className="button-text">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { computeLedger, computeSettlements } from "@/components/computeLedger";
import MainBottom from "@/components/MainBottom";
import MainLeft from "@/components/MainLeft";
import MainRight from "@/components/MainRight";
import { Payment } from "@/src/lib/types";
import { useMemo, useState, useEffect } from "react";

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("who_owes_who_payments");
    if (saved) {
      try {
        setPayments(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved payments", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("who_owes_who_payments", JSON.stringify(payments));
  }, [payments]);

  function savePayment(p: Payment) {
    setPayments(prev => {
      const exists = prev.some(x => x.id === p.id);
      return exists
        ? prev.map(x => (x.id === p.id ? p : x))
        : [...prev, p];
    });
    setActiveId(null);
  }

  const ledger = useMemo(() => computeLedger(payments), [payments]);

  const settlements = useMemo(() => computeSettlements(ledger), [ledger]);

  return (
    <>
      <header className="header">
        <button className="primary" onClick={() => setIsGraphOpen(true)}>
          Show Settlements
        </button>
      </header>

      <main className="main">
        <MainLeft
          activePayment={payments.find(p => p.id === activeId) ?? null}
          onSave={savePayment}
        />

        <MainRight
          isOpen={isGraphOpen}
          onClose={() => setIsGraphOpen(false)}
          settlements={settlements}
        />

        <MainBottom
          payments={payments}
          onEdit={id => setActiveId(id)}
          onRemove={id =>
            setPayments(p => p.filter(x => x.id !== id))
          }
          onClearAll={() => setPayments([])}
        />
      </main>
    </>
  );
}


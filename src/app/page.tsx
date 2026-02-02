"use client";

import { computeLedger, computeSettlements } from "@/lib/ledger";
import PaymentList from "@/components/PaymentList";
import PaymentForm from "@/components/PaymentForm";
import SettlementGraph from "@/components/SettlementGraph";
import { CURRENCY } from "@/lib/constants";
import { Payment } from "@/lib/types";
import { Network, Download, Upload, Wallet } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

export default function Home() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);

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

  // Cycle header title
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function savePayment(p: Payment) {
    setPayments(prev => {
      const exists = prev.some(x => x.id === p.id);
      return exists
        ? prev.map(x => (x.id === p.id ? p : x))
        : [...prev, p];
    });
    setActiveId(null);
  }

  function handleSettle(from: string, to: string, amount: number) {
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      description: `Settle: ${from} → ${to}`,
      total: amount,
      paidBy: { [from]: amount },
      sharedAmong: { [to]: amount },
      timestamp: Date.now(),
    };
    savePayment(newPayment);
  }

  const ledger = useMemo(() => computeLedger(payments), [payments]);

  const settlements = useMemo(() => computeSettlements(ledger), [ledger]);

  const handleExport = () => {
    const data = JSON.stringify(payments, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `who-owes-who-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm("This will replace your current payments. Continue?")) {
            setPayments(json);
          }
        } else {
          alert("Invalid file format. Please upload a valid JSON array of payments.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  // Reset index when settlements change
  useEffect(() => {
    setCurrentTitleIndex(0);
  }, [settlements.length]);

  const headerTitle = useMemo(() => {
    const base = "Who Owes Who";
    if (settlements.length === 0) return base;

    const titles = [base, ...settlements.map(s => `${s.from} owes ${s.to} ${CURRENCY}${s.amount}`)];
    return titles[currentTitleIndex % titles.length];
  }, [settlements, currentTitleIndex]);

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 key={headerTitle} className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {headerTitle === "Who Owes Who" && <Wallet size={24} />}
            {headerTitle}
          </h1>
          <span className="tagline">
            Paste payments. Get settlements. No signup.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={handleExport} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            <Download size={14} /> <span className="button-text">Export JSON</span>
          </button>
          <label className="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600 }}>
            <Upload size={14} /> <span className="button-text">Import JSON</span>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button className="primary" onClick={() => setIsGraphOpen(true)}>
            <Network size={16} /> <span className="button-text">Show Settlements</span>
          </button>
        </div>
      </header>

      <main className="main">
        <PaymentList
          payments={payments}
          onEdit={id => setActiveId(id)}
          onRemove={id =>
            setPayments(p => p.filter(x => x.id !== id))
          }
          onClearAll={() => setPayments([])}
        />

        <PaymentForm
          activePayment={payments.find(p => p.id === activeId) ?? null}
          onSave={savePayment}
        />

        <SettlementGraph
          isOpen={isGraphOpen}
          onClose={() => setIsGraphOpen(false)}
          settlements={settlements}
          onSettle={handleSettle}
        />
      </main>
    </>
  );
}


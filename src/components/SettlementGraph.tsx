import { CURRENCY } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, Maximize2, Minimize2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  settlements: { from: string; to: string; amount: number }[];
  onSettle: (from: string, to: string, amount: number) => void;
};

export default function SettlementGraph({ isOpen, onClose, settlements, onSettle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Delay to let CSS transition finish
    const timeout = setTimeout(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;

      const participants = Array.from(
        new Set(settlements.flatMap((s) => [s.from, s.to]))
      );
      const nodes: Record<string, { x: number; y: number }> = {};

      const radius = Math.min(width, height) * 0.35;
      const centerX = width / 2;
      const centerY = height / 2;

      participants.forEach((name, i) => {
        const angle = (i / participants.length) * Math.PI * 2;
        nodes[name] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });

      let animationFrame: number;
      let progress = 0;

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Define fonts based on isEnlarged
        const edgeFont = isEnlarged ? "12px JetBrains Mono" : "10px JetBrains Mono";
        const nodeFont = isEnlarged ? "bold 14px Inter" : "bold 10px Inter";

        // Draw Edges (Arrows)
        settlements.forEach((s) => {
          const start = nodes[s.from];
          const end = nodes[s.to];
          if (!start || !end) return;

          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const nodeRadius = 25;

          // Offset start and end points to edge of circles
          const adjStartX = start.x + nodeRadius * Math.cos(angle);
          const adjStartY = start.y + nodeRadius * Math.sin(angle);
          const adjEndX = end.x - nodeRadius * Math.cos(angle);
          const adjEndY = end.y - nodeRadius * Math.sin(angle);

          // Animate edge drawing
          const currentX = adjStartX + (adjEndX - adjStartX) * Math.min(progress, 1);
          const currentY = adjStartY + (adjEndY - adjStartY) * Math.min(progress, 1);

          ctx.beginPath();
          ctx.moveTo(adjStartX, adjStartY);
          ctx.lineTo(currentX, currentY);
          ctx.strokeStyle = "rgba(99, 102, 241, 0.6)";
          ctx.lineWidth = 2;
          ctx.stroke();

          if (progress >= 1) {
            // Draw arrowhead
            ctx.beginPath();
            ctx.moveTo(adjEndX, adjEndY);
            ctx.lineTo(
              adjEndX - 10 * Math.cos(angle - Math.PI / 6),
              adjEndY - 10 * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(adjEndX, adjEndY);
            ctx.lineTo(
              adjEndX - 10 * Math.cos(angle + Math.PI / 6),
              adjEndY - 10 * Math.sin(angle + Math.PI / 6)
            );
            ctx.strokeStyle = "rgba(129, 140, 248, 1)";
            ctx.stroke();

            // Draw amount text
            ctx.fillStyle = "#9ca3af";
            ctx.font = edgeFont;
            const midX = (adjStartX + adjEndX) / 2;
            const midY = (adjStartY + adjEndY) / 2;
            ctx.textAlign = "center";
            ctx.fillText(`${CURRENCY}${s.amount}`, midX, midY - 8);
          }
        });

        // Draw Nodes
        participants.forEach((name) => {
          const node = nodes[name];

          // Node background
          ctx.beginPath();
          ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);
          ctx.fillStyle = "#1e1b4b";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
          ctx.stroke();

          // Node text
          ctx.fillStyle = "#f3f4f6";
          ctx.font = nodeFont;
          ctx.textAlign = "center";
          ctx.fillText(name, node.x, node.y + 4);
        });

        if (progress < 1) {
          progress += 0.02;
          animationFrame = requestAnimationFrame(render);
        }
      };

      render();
      return () => cancelAnimationFrame(animationFrame);
    }, 350);

    return () => clearTimeout(timeout);
  }, [isOpen, settlements, isEnlarged]);

  return (
    <section className={`panel graph ${isOpen ? "open" : ""}`} style={{ overflowY: 'auto' }}>
      <div className="panel-header">
        <h2>Visual Graph</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="mono"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
            onClick={() => setIsEnlarged(!isEnlarged)}
          >
            {isEnlarged ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="button-text">{isEnlarged ? "Collapse" : "Enlarge"}</span>
          </button>
          <button onClick={onClose}><X size={16} /> <span className="button-text">Close</span></button>
        </div>
      </div>

      <div className={`canvas-container ${isEnlarged ? 'enlarged' : ''}`} style={{ height: isEnlarged ? '65vh' : '350px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="settlements-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <h3>Suggested Payments</h3>
        {settlements.length === 0 ? (
          <span className="muted">No debts to settle!</span>
        ) : (
          settlements.map((s, i) => (
            <div key={i} className="payment-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="mono">{s.from}</span>
                <span className="muted" style={{ fontSize: '0.8rem' }}>→ {CURRENCY}{s.amount} →</span>
                <span className="mono">{s.to}</span>
              </div>
              <button
                className="primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                onClick={() => onSettle(s.from, s.to, s.amount)}
              >
                <CheckCircle2 size={14} /> <span className="button-text">Settle Up</span>
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

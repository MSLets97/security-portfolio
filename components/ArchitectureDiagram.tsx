export type DiagramColor = "perimeter" | "security" | "internal" | "tooling" | "neutral";

export type DiagramBoxSpec = {
  title: string;
  subtitle?: string;
  lines?: string[];
  color: DiagramColor;
  /** Relative width weight within its row. Default 1 (equal width). */
  flex?: number;
};

export type DiagramRow = {
  boxes: DiagramBoxSpec[];
  /** Arrow drawn between this row and the next one. Omit on the last row. */
  arrowAfter?: { label?: string; dashed?: boolean };
};

const COLORS: Record<DiagramColor, { bg: string; border: string; text: string }> = {
  perimeter: { bg: "rgba(255,69,58,0.10)", border: "rgba(255,69,58,0.45)", text: "#ff453a" },
  security:  { bg: "rgba(255,159,10,0.10)", border: "rgba(255,159,10,0.45)", text: "#ff9f0a" },
  internal:  { bg: "rgba(48,209,88,0.10)", border: "rgba(48,209,88,0.45)", text: "#30d158" },
  tooling:   { bg: "rgba(41,151,255,0.10)", border: "rgba(41,151,255,0.45)", text: "#2997ff" },
  neutral:   { bg: "rgba(120,120,128,0.10)", border: "rgba(120,120,128,0.35)", text: "#86868b" },
};

const LEGEND_LABELS: Record<DiagramColor, string> = {
  perimeter: "Perimeter / internet-facing",
  security: "Security & inspection layer",
  internal: "Internal network & workloads",
  tooling: "Logging, SIEM & tooling",
  neutral: "Other",
};

const PAD_X = 16;
const BOX_GAP = 16;
const ROW_GAP = 40;
const LINE_H = 15;

function boxHeight(b: DiagramBoxSpec): number {
  let h = 16 + 20; // top padding + title
  if (b.subtitle) h += 16;
  if (b.lines?.length) h += b.lines.length * LINE_H + 4;
  return h + 14; // bottom padding
}

type LaidBox = DiagramBoxSpec & { x: number; y: number; w: number; h: number; cx: number };

function layout(rows: DiagramRow[], width: number) {
  let y = 10;
  const laidRows: LaidBox[][] = [];
  const gaps: { y1: number; y2: number; label?: string; dashed?: boolean }[] = [];

  rows.forEach((row, ri) => {
    const rh = Math.max(...row.boxes.map(boxHeight));
    const totalFlex = row.boxes.reduce((s, b) => s + (b.flex ?? 1), 0);
    const usableWidth = width - PAD_X * 2 - BOX_GAP * (row.boxes.length - 1);
    let x = PAD_X;
    const laid: LaidBox[] = row.boxes.map((b) => {
      const w = usableWidth * ((b.flex ?? 1) / totalFlex);
      const box: LaidBox = { ...b, x, y, w, h: rh, cx: x + w / 2 };
      x += w + BOX_GAP;
      return box;
    });
    laidRows.push(laid);
    y += rh;

    if (ri < rows.length - 1) {
      const y1 = y;
      y += ROW_GAP;
      gaps.push({ y1, y2: y, label: row.arrowAfter?.label, dashed: row.arrowAfter?.dashed });
    }
  });

  return { laidRows, gaps, totalHeight: y + 10 };
}

export function FlowDiagram({ rows, width = 680 }: { rows: DiagramRow[]; width?: number }) {
  const { laidRows, gaps, totalHeight } = layout(rows, width);

  const usedColors = Array.from(new Set(rows.flatMap((r) => r.boxes.map((b) => b.color))));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${totalHeight}`} width="100%" style={{ maxWidth: width, display: "block" }}>
        <defs>
          <marker id="diagram-arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#86868b" />
          </marker>
        </defs>

        {gaps.map((gap, gi) => {
          const prevBoxes = laidRows[gi];
          const nextBoxes = laidRows[gi + 1];
          const pairs = nextBoxes.map((nb, k) => {
            const fromCx =
              prevBoxes.length === nextBoxes.length
                ? prevBoxes[k].cx
                : prevBoxes.length === 1
                ? prevBoxes[0].cx
                : width / 2;
            return { fromCx, toCx: nb.cx };
          });
          return (
            <g key={`gap-${gi}`}>
              {pairs.map((p, pi) => (
                <line
                  key={pi}
                  x1={p.fromCx} y1={gap.y1 + 2}
                  x2={p.toCx} y2={gap.y2 - 6}
                  stroke="#86868b" strokeWidth={1.5}
                  strokeDasharray={gap.dashed ? "4 4" : undefined}
                  markerEnd="url(#diagram-arrowhead)"
                />
              ))}
              {gap.label && (
                <text
                  x={width / 2} y={(gap.y1 + gap.y2) / 2 + 4}
                  fontSize="10.5" textAnchor="middle"
                  fill="#86868b"
                  style={{ paintOrder: "stroke", stroke: "var(--bg)", strokeWidth: 4 }}
                >
                  {gap.label}
                </text>
              )}
            </g>
          );
        })}

        {laidRows.flat().map((b, bi) => {
          const c = COLORS[b.color];
          let textY = b.y + 16 + 14;
          return (
            <g key={bi}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={14} fill={c.bg} stroke={c.border} strokeWidth={1.5} />
              <text x={b.x + 14} y={textY} fontSize="12.5" fontWeight={700} fill={c.text}>
                {b.title}
              </text>
              {b.subtitle && (
                <text x={b.x + 14} y={(textY += 16)} fontSize="10.5" fontFamily="monospace" fill="#86868b">
                  {b.subtitle}
                </text>
              )}
              {b.lines?.map((l, li) => (
                <text key={li} x={b.x + 14} y={(textY = li === 0 ? textY + 16 : textY + LINE_H)} fontSize="10.5" fill="#6e6e73">
                  {l}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap gap-4 mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
        {usedColors.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[c].text }} />
            <span className="text-xs" style={{ color: "var(--text-3)" }}>{LEGEND_LABELS[c]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

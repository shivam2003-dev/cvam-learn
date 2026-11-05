import type { ReactNode } from "react";

/**
 * Declarative diagrams for courseware lessons. Everything renders as plain
 * HTML or inline SVG on the server, so lessons stay data-like and diagrams
 * match the site theme without a charting dependency.
 */

export type Tone = "plain" | "lime" | "sky" | "amber" | "rose";

const svgTone: Record<Tone, { box: string; text: string; hex: string }> = {
  plain: { box: "fill-raised stroke-[#3a4757]", text: "fill-text", hex: "#a3afbd" },
  lime: { box: "fill-lime/10 stroke-lime/70", text: "fill-lime", hex: "#c6f24e" },
  sky: { box: "fill-sky/10 stroke-sky/70", text: "fill-sky", hex: "#6cc5ff" },
  amber: { box: "fill-amber/10 stroke-amber/70", text: "fill-amber", hex: "#ffc25c" },
  rose: { box: "fill-rose/10 stroke-rose/70", text: "fill-rose", hex: "#ff7d7d" },
};

const htmlTone: Record<Tone, { box: string; title: string; chip: string }> = {
  plain: { box: "border-line bg-raised", title: "text-text", chip: "bg-line text-soft" },
  lime: { box: "border-lime/50 bg-lime/10", title: "text-lime", chip: "bg-lime text-ink" },
  sky: { box: "border-sky/50 bg-sky/10", title: "text-sky", chip: "bg-sky text-ink" },
  amber: { box: "border-amber/50 bg-amber/10", title: "text-amber", chip: "bg-amber text-ink" },
  rose: { box: "border-rose/50 bg-rose/10", title: "text-rose", chip: "bg-rose text-ink" },
};

/** Greedy word wrap by character count. Good enough for fixed-size SVG boxes. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** A framed, captioned container. Wrap every diagram in one. */
export function Figure({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-[#0d131b]">
      <div className="overflow-x-auto p-4 sm:p-5">{children}</div>
      <figcaption className="border-t border-line px-4 py-2 font-mono text-xs leading-relaxed text-faint">
        <span className="text-lime">Figure</span> · {caption}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ Flow */

export type FlowStep = { title: string; note?: string; tone?: Tone };

/** Boxes joined by arrows. Use for pipelines, lifecycles and checklists. */
export function Flow({
  steps,
  direction = "row",
  numbered = false,
}: {
  steps: FlowStep[];
  direction?: "row" | "col";
  numbered?: boolean;
}) {
  const row = direction === "row";
  return (
    <div
      role="list"
      className={`flex flex-col items-stretch gap-1 ${row ? "md:flex-row" : ""}`}
    >
      {steps.map((step, index) => {
        const tone = htmlTone[step.tone ?? "plain"];
        return (
          <div
            key={step.title}
            role="listitem"
            className={`flex items-stretch ${row ? "flex-col md:flex-1 md:flex-row" : "flex-col"}`}
          >
            <div className={`flex-1 rounded-lg border px-3 py-2.5 ${tone.box}`}>
              <p className={`m-0 text-sm leading-snug font-semibold ${tone.title}`}>
                {numbered && (
                  <span
                    className={`mr-2 inline-grid size-5 place-items-center rounded-full font-mono text-[11px] font-bold ${tone.chip}`}
                  >
                    {index + 1}
                  </span>
                )}
                {step.title}
              </p>
              {step.note && (
                <p className="m-0 mt-1 text-[0.8rem] leading-snug text-soft">{step.note}</p>
              )}
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`grid shrink-0 place-items-center font-mono text-faint ${row ? "h-6 md:h-auto md:w-6" : "h-6"}`}
              >
                <span className={row ? "rotate-90 md:rotate-0" : "rotate-90"}>→</span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- Layers */

export type Layer = { title: string; note?: string; tone?: Tone };

/** Horizontal bands stacked top to bottom: architectures, maturity ladders. */
export function Layers({ layers }: { layers: Layer[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {layers.map((layer) => {
        const tone = htmlTone[layer.tone ?? "plain"];
        return (
          <div
            key={layer.title}
            className={`flex flex-col gap-1 rounded-lg border px-4 py-2.5 sm:flex-row sm:items-center sm:gap-4 ${tone.box}`}
          >
            <p className={`m-0 text-sm font-semibold sm:w-48 sm:shrink-0 ${tone.title}`}>
              {layer.title}
            </p>
            {layer.note && <p className="m-0 text-[0.82rem] leading-snug text-soft">{layer.note}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Timeline */

export type Phase = {
  label: string;
  when?: string;
  items?: string[];
  weight?: number;
  tone?: Tone;
};

/** Phases left to right, sized by weight. Use for sprints and rollouts. */
export function Timeline({ phases }: { phases: Phase[] }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row">
      {phases.map((phase) => {
        const tone = htmlTone[phase.tone ?? "plain"];
        return (
          <div
            key={phase.label}
            style={{ flexGrow: phase.weight ?? 1, flexBasis: 0 }}
            className="min-w-0 overflow-hidden rounded-lg border border-line bg-panel"
          >
            <div className={`border-b px-3 py-2 ${tone.box}`}>
              <p className={`m-0 text-sm font-semibold ${tone.title}`}>{phase.label}</p>
              {phase.when && (
                <p className="m-0 font-mono text-[11px] text-faint">{phase.when}</p>
              )}
            </div>
            {phase.items && (
              <div className="space-y-1 px-3 py-2.5">
                {phase.items.map((item) => (
                  <p key={item} className="m-0 text-[0.8rem] leading-snug text-soft">
                    <span aria-hidden="true" className="mr-1.5 text-faint">
                      ·
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Graph */

export type GraphNode = {
  id: string;
  label: string;
  sub?: string;
  col: number;
  row: number;
  tone?: Tone;
  shape?: "box" | "db" | "pill";
  w?: number;
};
export type GraphEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  both?: boolean;
  /** Sideways bend in pixels; positive curves left of the travel direction. */
  bend?: number;
};
export type GraphGroup = {
  label: string;
  c1: number;
  r1: number;
  c2: number;
  r2: number;
  tone?: Tone;
};

type Box = { x: number; y: number; w: number; h: number; node: GraphNode; lines: string[]; subs: string[] };

/**
 * A system diagram on a grid. Give each node a column and row, then connect
 * nodes by id. Groups draw dashed zones such as "Customer network".
 */
export function Graph({
  nodes,
  edges = [],
  groups = [],
  cellW = 200,
  cellH = 112,
  nodeW = 164,
  label,
}: {
  nodes: GraphNode[];
  edges?: GraphEdge[];
  groups?: GraphGroup[];
  cellW?: number;
  cellH?: number;
  nodeW?: number;
  label: string;
}) {
  const pad = 18;
  const cols = Math.ceil(Math.max(...nodes.map((n) => n.col), ...groups.map((g) => g.c2)) + 1);
  const rows = Math.ceil(Math.max(...nodes.map((n) => n.row), ...groups.map((g) => g.r2)) + 1);
  const width = pad * 2 + cols * cellW;
  const height = pad * 2 + rows * cellH;

  const boxes = new Map<string, Box>();
  for (const node of nodes) {
    const w = node.w ?? nodeW;
    const lines = wrap(node.label, Math.floor((w - 18) / 7.4));
    const subs = node.sub ? wrap(node.sub, Math.floor((w - 18) / 6.4)) : [];
    const h = 20 + lines.length * 16 + subs.length * 14 + (node.shape === "db" ? 10 : 0);
    const cx = pad + (node.col + 0.5) * cellW;
    const cy = pad + (node.row + 0.5) * cellH;
    boxes.set(node.id, { x: cx - w / 2, y: cy - h / 2, w, h, node, lines, subs });
  }

  /** Point where a ray from a box's centre toward (tx, ty) leaves the box. */
  function edgePoint(box: Box, tx: number, ty: number, gap = 4) {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const dx = tx - cx;
    const dy = ty - cy;
    const sx = dx === 0 ? Infinity : box.w / 2 / Math.abs(dx);
    const sy = dy === 0 ? Infinity : box.h / 2 / Math.abs(dy);
    const t = Math.min(sx, sy);
    const length = Math.hypot(dx, dy) || 1;
    return { x: cx + dx * t + (dx / length) * gap, y: cy + dy * t + (dy / length) * gap };
  }

  const markerId = `arrow-${label.replace(/[^a-z0-9]/gi, "").slice(0, 20)}`;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", maxWidth: width, height: "auto", display: "block", margin: "0 auto" }}
      fontFamily="var(--font-sans), system-ui, sans-serif"
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#a3afbd" />
        </marker>
      </defs>

      {groups.map((group) => {
        const tone = svgTone[group.tone ?? "plain"];
        const x = pad + group.c1 * cellW + 4;
        const y = pad + group.r1 * cellH + 4;
        const w = (group.c2 - group.c1 + 1) * cellW - 8;
        const h = (group.r2 - group.r1 + 1) * cellH - 8;
        return (
          <g key={group.label}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={14}
              strokeDasharray="6 5"
              className={`${tone.box} fill-transparent`}
              style={{ fillOpacity: 0.04 }}
            />
            <text x={x + 12} y={y + 17} fontSize={11} className={`${tone.text} font-mono`} style={{ letterSpacing: "0.04em" }}>
              {group.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {edges.map((edge) => {
        const a = boxes.get(edge.from);
        const b = boxes.get(edge.to);
        if (!a || !b) return null;
        const acx = a.x + a.w / 2;
        const acy = a.y + a.h / 2;
        const bcx = b.x + b.w / 2;
        const bcy = b.y + b.h / 2;
        const mx = (acx + bcx) / 2;
        const my = (acy + bcy) / 2;
        const dx = bcx - acx;
        const dy = bcy - acy;
        const len = Math.hypot(dx, dy) || 1;
        const bend = edge.bend ?? 0;
        // Control point sits twice the bend away so the curve peaks at `bend`.
        const kx = mx + (-dy / len) * bend * 2;
        const ky = my + (dx / len) * bend * 2;
        const start = edgePoint(a, bend ? kx : bcx, bend ? ky : bcy, edge.both ? 5 : 2);
        const end = edgePoint(b, bend ? kx : acx, bend ? ky : acy, 5);
        const d = bend
          ? `M${start.x},${start.y} Q${kx},${ky} ${end.x},${end.y}`
          : `M${start.x},${start.y} L${end.x},${end.y}`;
        const lx = bend ? 0.25 * start.x + 0.5 * kx + 0.25 * end.x : (start.x + end.x) / 2;
        const ly = bend ? 0.25 * start.y + 0.5 * ky + 0.25 * end.y : (start.y + end.y) / 2;
        const labelWidth = edge.label ? edge.label.length * 6.1 + 12 : 0;
        return (
          <g key={`${edge.from}-${edge.to}-${edge.label ?? ""}`}>
            <path
              d={d}
              fill="none"
              stroke="#8592a1"
              strokeWidth={1.5}
              strokeDasharray={edge.dashed ? "5 4" : undefined}
              markerEnd={`url(#${markerId})`}
              markerStart={edge.both ? `url(#${markerId})` : undefined}
            />
            {edge.label && (
              <g>
                <rect x={lx - labelWidth / 2} y={ly - 9} width={labelWidth} height={18} rx={4} fill="#0d131b" />
                <text x={lx} y={ly + 4} fontSize={11} textAnchor="middle" fill="#a3afbd">
                  {edge.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {[...boxes.values()].map(({ x, y, w, h, node, lines, subs }) => {
        const tone = svgTone[node.tone ?? "plain"];
        const textStart = y + (node.shape === "db" ? 16 : 10) + 13;
        return (
          <g key={node.id}>
            {node.shape === "db" ? (
              <g className={tone.box} strokeWidth={1.4}>
                <path d={`M${x},${y + 8} A${w / 2},8 0 0 1 ${x + w},${y + 8} V${y + h - 8} A${w / 2},8 0 0 1 ${x},${y + h - 8} Z`} />
                <ellipse cx={x + w / 2} cy={y + 8} rx={w / 2} ry={8} />
              </g>
            ) : (
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={node.shape === "pill" ? h / 2 : 10}
                strokeWidth={1.4}
                className={tone.box}
              />
            )}
            {lines.map((line, index) => (
              <text
                key={line + index}
                x={x + w / 2}
                y={textStart + index * 16}
                fontSize={13}
                fontWeight={600}
                textAnchor="middle"
                className="fill-text"
              >
                {line}
              </text>
            ))}
            {subs.map((line, index) => (
              <text
                key={line + index}
                x={x + w / 2}
                y={textStart + lines.length * 16 + index * 14 - 1}
                fontSize={11}
                textAnchor="middle"
                className="fill-soft"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------------------------------------- Sequence */

export type SeqActor = string | { id: string; label: string };
export type SeqMessage =
  | { from: string; to: string; text: string; dashed?: boolean }
  | { note: string; over: string | [string, string]; tone?: Tone };

/** A sequence diagram: who calls whom, in order. */
export function Sequence({
  actors,
  messages,
  gap = 176,
  label,
}: {
  actors: SeqActor[];
  messages: SeqMessage[];
  gap?: number;
  label: string;
}) {
  const parts = actors.map((a) => (typeof a === "string" ? { id: a, label: a } : a));
  const index = new Map(parts.map((a, i) => [a.id, i]));
  const xOf = (id: string) => 16 + gap / 2 + (index.get(id) ?? 0) * gap;
  const width = 32 + parts.length * gap;
  const headerH = 36;
  const markerId = `seq-${label.replace(/[^a-z0-9]/gi, "").slice(0, 20)}`;

  let y = headerH + 20;
  let step = 0;
  const rendered: ReactNode[] = [];

  for (const message of messages) {
    if ("note" in message) {
      const ids = Array.isArray(message.over) ? message.over : [message.over, message.over];
      const x1 = xOf(ids[0]);
      const x2 = xOf(ids[1]);
      const left = Math.min(x1, x2) - 74;
      const w = Math.abs(x2 - x1) + 148;
      const lines = wrap(message.note, Math.floor((w - 16) / 6.3));
      const h = lines.length * 14 + 14;
      const tone = svgTone[message.tone ?? "amber"];
      rendered.push(
        <g key={`note-${y}`}>
          <rect x={left} y={y} width={w} height={h} rx={6} className={tone.box} strokeWidth={1} />
          {lines.map((line, i) => (
            <text key={line + i} x={left + w / 2} y={y + 18 + i * 14} fontSize={11} textAnchor="middle" className="fill-text">
              {line}
            </text>
          ))}
        </g>,
      );
      y += h + 16;
      continue;
    }

    step += 1;
    const x1 = xOf(message.from);
    const x2 = xOf(message.to);
    const self = message.from === message.to;
    const span = self ? gap - 40 : Math.abs(x2 - x1) - 14;
    const lines = wrap(`${step}. ${message.text}`, Math.max(14, Math.floor(span / 6.3)));
    const textH = lines.length * 14;
    const lineY = y + textH + 8;
    const labelX = self ? x1 + 40 : (x1 + x2) / 2;

    if (self) {
      rendered.push(
        <g key={`m-${y}`}>
          <path
            d={`M${x1},${lineY - 10} H${x1 + 30} V${lineY + 12} H${x1 + 4}`}
            fill="none"
            stroke="#8592a1"
            strokeWidth={1.5}
            markerEnd={`url(#${markerId})`}
          />
          {lines.map((line, i) => (
            <text key={line + i} x={labelX} y={y + 8 + i * 14} fontSize={11} className="fill-text">
              {line}
            </text>
          ))}
        </g>,
      );
      y = lineY + 28;
    } else {
      const dir = x2 > x1 ? 1 : -1;
      rendered.push(
        <g key={`m-${y}`}>
          {lines.map((line, i) => (
            <text key={line + i} x={labelX} y={y + 8 + i * 14} fontSize={11} textAnchor="middle" className="fill-text">
              {line}
            </text>
          ))}
          <line
            x1={x1 + dir * 4}
            y1={lineY}
            x2={x2 - dir * 4}
            y2={lineY}
            stroke="#8592a1"
            strokeWidth={1.5}
            strokeDasharray={message.dashed ? "5 4" : undefined}
            markerEnd={`url(#${markerId})`}
          />
        </g>,
      );
      y = lineY + 22;
    }
  }

  const height = y + 10;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", maxWidth: width, height: "auto", display: "block", margin: "0 auto" }}
      fontFamily="var(--font-sans), system-ui, sans-serif"
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#a3afbd" />
        </marker>
      </defs>
      {parts.map((actor) => (
        <g key={actor.id}>
          <line x1={xOf(actor.id)} y1={headerH} x2={xOf(actor.id)} y2={height - 6} stroke="#27313d" strokeWidth={1.5} strokeDasharray="4 5" />
          <rect x={xOf(actor.id) - 66} y={2} width={132} height={headerH - 4} rx={8} className="fill-raised stroke-sky/60" strokeWidth={1.2} />
          <text x={xOf(actor.id)} y={headerH / 2 + 5} fontSize={12} fontWeight={600} textAnchor="middle" className="fill-text">
            {actor.label}
          </text>
        </g>
      ))}
      {rendered}
    </svg>
  );
}

/* --------------------------------------------------------------- Quadrant */

export type QuadrantItem = { label: string; x: number; y: number; tone?: Tone };

/** A 2x2 chart. x and y run from 0 to 1, with (1, 1) at the top right. */
export function Quadrant({
  xLabel,
  yLabel,
  corners,
  items,
  label,
}: {
  xLabel: string;
  yLabel: string;
  /** [top-left, top-right, bottom-left, bottom-right] */
  corners?: [string, string, string, string];
  items: QuadrantItem[];
  label: string;
}) {
  const w = 560;
  const h = 380;
  const left = 46;
  const top = 14;
  const right = w - 14;
  const bottom = h - 40;
  const px = (v: number) => left + v * (right - left);
  const py = (v: number) => bottom - v * (bottom - top);

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: "100%", maxWidth: w, height: "auto", display: "block", margin: "0 auto" }}
      fontFamily="var(--font-sans), system-ui, sans-serif"
    >
      <rect x={left} y={top} width={right - left} height={bottom - top} rx={8} className="fill-transparent stroke-line" strokeWidth={1.4} />
      <line x1={px(0.5)} y1={top} x2={px(0.5)} y2={bottom} stroke="#27313d" strokeDasharray="5 5" />
      <line x1={left} y1={py(0.5)} x2={right} y2={py(0.5)} stroke="#27313d" strokeDasharray="5 5" />
      {corners && (
        <>
          <text x={left + 10} y={top + 18} fontSize={11} className="fill-faint font-mono">{corners[0]}</text>
          <text x={right - 10} y={top + 18} fontSize={11} textAnchor="end" className="fill-faint font-mono">{corners[1]}</text>
          <text x={left + 10} y={bottom - 10} fontSize={11} className="fill-faint font-mono">{corners[2]}</text>
          <text x={right - 10} y={bottom - 10} fontSize={11} textAnchor="end" className="fill-faint font-mono">{corners[3]}</text>
        </>
      )}
      <text x={(left + right) / 2} y={h - 10} fontSize={12} textAnchor="middle" className="fill-soft">{xLabel} →</text>
      <text x={14} y={(top + bottom) / 2} fontSize={12} textAnchor="middle" className="fill-soft" transform={`rotate(-90 14 ${(top + bottom) / 2})`}>{yLabel} →</text>
      {items.map((item) => {
        const tone = svgTone[item.tone ?? "lime"];
        const flip = item.x > 0.72;
        return (
          <g key={item.label}>
            <circle cx={px(item.x)} cy={py(item.y)} r={6} className={tone.box} strokeWidth={1.5} />
            <text
              x={px(item.x) + (flip ? -11 : 11)}
              y={py(item.y) + 4}
              fontSize={12}
              textAnchor={flip ? "end" : "start"}
              className="fill-text"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------------------------------------- Exercise */

/** A prompt to think about, with a model answer hidden until asked for. */
export function Exercise({
  title = "Try it yourself",
  task,
  children,
}: {
  title?: string;
  task: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-sky/40 bg-sky/5">
      <header className="px-5 pt-4">
        <p className="m-0 font-mono text-xs tracking-wider text-sky uppercase">{title}</p>
        <div className="mt-2 text-[1rem] leading-relaxed">{task}</div>
      </header>
      <details className="group px-5 pt-3 pb-4">
        <summary className="inline-block cursor-pointer list-none rounded-md border border-sky/40 px-3 py-1 font-mono text-xs text-sky hover:bg-sky/10">
          <span className="group-open:hidden">Show a model answer</span>
          <span className="hidden group-open:inline">Hide the answer</span>
        </summary>
        <div className="mt-3 border-t border-sky/20 pt-3 text-[1rem] leading-relaxed">{children}</div>
      </details>
    </section>
  );
}

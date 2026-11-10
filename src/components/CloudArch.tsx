"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import {
  providerMeta,
  providers,
  type ArchEdge,
  type ArchGroup,
  type ArchNode,
  type ArchSpecs,
  type GroupKind,
  type Provider,
} from "@/lib/cloud";

/* ------------------------------------------------------- provider choice */

const KEY = "cvam.cloud";
const EVENT = "cvam:cloud";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readProvider(): Provider {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored && (providers as readonly string[]).includes(stored)) return stored as Provider;
  } catch {
    // Storage can be blocked; fall through to the default.
  }
  return "aws";
}

/** One provider choice shared by every diagram, table and note on the site. */
export function useCloud(): [Provider, (next: Provider) => void] {
  const provider = useSyncExternalStore(subscribe, readProvider, () => "aws" as Provider);
  const setProvider = useCallback((next: Provider) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      // Ignore: the event below still updates this tab.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [provider, setProvider];
}

/** The four-way provider toggle. `floating` pins it to the bottom of the screen. */
export function CloudSwitch({ floating = false }: { floating?: boolean }) {
  const [provider, setProvider] = useCloud();
  const buttons = (
    <div role="radiogroup" aria-label="Cloud provider" className="inline-flex gap-1 rounded-xl border border-line bg-panel p-1">
      {providers.map((id) => {
        const active = id === provider;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            title={providerMeta[id].name}
            onClick={() => setProvider(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold transition ${
              active ? "bg-raised text-text" : "text-faint hover:text-text"
            }`}
            style={active ? { boxShadow: `inset 0 -2px 0 ${providerMeta[id].accent}` } : undefined}
          >
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: providerMeta[id].accent }} />
            {providerMeta[id].short}
          </button>
        );
      })}
    </div>
  );
  if (!floating) return buttons;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center print:hidden">
      <div className="pointer-events-auto rounded-xl shadow-[0_8px_30px_rgb(0_0_0/0.55)]">{buttons}</div>
    </div>
  );
}

/** Shows only the block written for the selected provider. */
export function ForCloud(props: Record<Provider, ReactNode>) {
  const [provider] = useCloud();
  const meta = providerMeta[provider];
  return (
    <div className="rounded-r-lg border-l-3 bg-panel px-4 py-3" style={{ borderColor: meta.accent }}>
      <p className="font-mono text-xs tracking-wider uppercase" style={{ color: meta.accent }}>
        {meta.name}
      </p>
      <div className="lesson-copy mt-1.5 text-[0.98rem]">{props[provider]}</div>
    </div>
  );
}

/** An inline word that changes with the provider, for example VPC / VNet / VCN. */
export function Term(props: Record<Provider, string>) {
  const [provider] = useCloud();
  return <strong>{props[provider]}</strong>;
}

export type ServiceRow = { role: string } & Record<Provider, string>;

/** Same building block, four names. The selected provider's column is lit. */
export function ServiceMap({ rows }: { rows: ServiceRow[] }) {
  const [provider, setProvider] = useCloud();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Building block</th>
            {providers.map((id) => (
              <th key={id} scope="col" className={id === provider ? "bg-lime/10" : undefined}>
                <button type="button" onClick={() => setProvider(id)} className="font-semibold hover:text-lime">
                  {providerMeta[id].short}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.role}>
              <td>
                <strong>{row.role}</strong>
              </td>
              {providers.map((id) => (
                <td key={id} className={id === provider ? "bg-lime/10 text-text" : undefined}>
                  {row[id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------------------------------------- diagram */

type GroupStyle = { stroke: string; fill: string; dash?: string };

/** Group colours follow each provider's own diagram conventions. */
const palette: Record<Provider, Record<GroupKind, GroupStyle>> = {
  aws: {
    region: { stroke: "#00A4A6", fill: "none", dash: "3 3" },
    network: { stroke: "#8C4FFF", fill: "none" },
    zone: { stroke: "#147EBA", fill: "none", dash: "7 4" },
    public: { stroke: "#7AA116", fill: "#F2F6E8" },
    private: { stroke: "#00A4A6", fill: "#E6F6F7" },
    scaling: { stroke: "#ED7100", fill: "none", dash: "6 4" },
  },
  azure: {
    region: { stroke: "#605E5C", fill: "none", dash: "3 3" },
    network: { stroke: "#0078D4", fill: "none" },
    zone: { stroke: "#8A8886", fill: "none", dash: "7 4" },
    public: { stroke: "#0078D4", fill: "#EFF6FC" },
    private: { stroke: "#107C10", fill: "#F1F8F1" },
    scaling: { stroke: "#D83B01", fill: "none", dash: "6 4" },
  },
  gcp: {
    region: { stroke: "#5F6368", fill: "none", dash: "3 3" },
    network: { stroke: "#4285F4", fill: "none" },
    zone: { stroke: "#E37400", fill: "none", dash: "7 4" },
    public: { stroke: "#34A853", fill: "#E6F4EA" },
    private: { stroke: "#4285F4", fill: "#E8F0FE" },
    scaling: { stroke: "#EA4335", fill: "none", dash: "6 4" },
  },
  oci: {
    region: { stroke: "#312D2A", fill: "none", dash: "3 3" },
    network: { stroke: "#C74634", fill: "none" },
    zone: { stroke: "#6F8B5A", fill: "none", dash: "7 4" },
    public: { stroke: "#AE562C", fill: "#FBF3EE" },
    private: { stroke: "#2C5967", fill: "#EDF4F6" },
    scaling: { stroke: "#C74634", fill: "none", dash: "6 4" },
  },
};

const groupOrder: GroupKind[] = ["region", "network", "public", "private", "zone", "scaling"];
const INK = "#232F3E";
const MUTED = "#5A6B7B";
const ICON = 48;
const LINE = 13;

function wrap(text: string, max: number) {
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

function labelHeight(node: ArchNode) {
  return wrap(node.label, 17).length * LINE + (node.sub ? wrap(node.sub, 20).length * 12 : 0);
}

/** Where a line leaves (or reaches) a node when heading toward a point. */
function anchor(node: ArchNode, toward: [number, number], shift = 0): [number, number] {
  const dx = toward[0] - node.x;
  const dy = toward[1] - node.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return [node.x + Math.sign(dx) * (ICON / 2 + 5), node.y + shift];
  }
  if (dy < 0) return [node.x + shift, node.y - ICON / 2 - 5];
  return [node.x + shift, node.y + ICON / 2 + labelHeight(node) + 9];
}

function route(edge: ArchEdge, nodes: Map<string, ArchNode>) {
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  if (!from || !to) return null;
  const via = edge.via ?? [];
  const start = anchor(from, via[0] ?? [to.x + (edge.toShift ?? 0), to.y], edge.fromShift);
  const end = anchor(to, via[via.length - 1] ?? [from.x + (edge.fromShift ?? 0), from.y], edge.toShift);
  const points = [start, ...via, end];
  // Labels and step badges sit on the longest straight run.
  let best = 0;
  let bestLength = -1;
  for (let i = 0; i < points.length - 1; i += 1) {
    const length = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    if (length > bestLength) {
      best = i;
      bestLength = length;
    }
  }
  const a = points[best];
  const b = points[best + 1];
  return {
    d: points.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" "),
    mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number],
    vertical: Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]),
  };
}

function Group({ group, style, fresh }: { group: ArchGroup; style: GroupStyle; fresh: boolean }) {
  const centred = group.kind === "scaling";
  const textX = centred ? group.x + group.w / 2 : group.x + (group.icon ? 30 : 10);
  return (
    <g className="arch-in">
      <rect
        x={group.x}
        y={group.y}
        width={group.w}
        height={group.h}
        rx={group.kind === "scaling" ? 8 : 2}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={fresh ? 2.6 : 1.3}
        strokeDasharray={style.dash}
      />
      {group.icon && <image href={group.icon} x={group.x} y={group.y} width={24} height={24} />}
      <text x={textX} y={group.y + 16} fontSize={11.5} fontWeight={600} fill={style.stroke} textAnchor={centred ? "middle" : "start"}>
        {group.label}
      </text>
      {group.sub && (
        <text x={textX} y={group.y + 30} fontSize={10.5} fill={MUTED} textAnchor={centred ? "middle" : "start"} fontFamily="var(--font-mono), monospace">
          {group.sub}
        </text>
      )}
    </g>
  );
}

function Node({ node, fresh, accent }: { node: ArchNode; fresh: boolean; accent: string }) {
  const lines = wrap(node.label, 17);
  const subs = node.sub ? wrap(node.sub, 20) : [];
  const textTop = node.y + ICON / 2 + 13;
  const height = ICON + labelHeight(node) + 16;
  return (
    <g className="arch-in">
      {fresh && (
        <rect x={node.x - 46} y={node.y - ICON / 2 - 6} width={92} height={height} rx={10} fill={accent} fillOpacity={0.16} stroke={accent} strokeWidth={1.5} />
      )}
      {/* White plate so icons that sit on a border stay readable. */}
      <rect x={node.x - ICON / 2} y={node.y - ICON / 2} width={ICON} height={ICON} fill="#fff" />
      <image href={node.icon} x={node.x - ICON / 2} y={node.y - ICON / 2} width={ICON} height={ICON} />
      {lines.map((line, i) => (
        <text key={line + i} x={node.x} y={textTop + i * LINE} fontSize={11.5} fontWeight={500} textAnchor="middle" fill={INK} stroke="#fff" strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
      {subs.map((line, i) => (
        <text key={line + i} x={node.x} y={textTop + lines.length * LINE + i * 12} fontSize={10} textAnchor="middle" fill={MUTED} stroke="#fff" strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
    </g>
  );
}

/**
 * A build-it-yourself architecture diagram. The reader picks a provider and
 * steps forward; each step adds one layer (network, subnets, gateways, ...)
 * and explains it. The last step numbers the request path.
 */
export function ArchDiagram({ specs, title }: { specs: ArchSpecs; title: string }) {
  const [provider] = useCloud();
  const [step, setStep] = useState(0);
  const figureRef = useRef<HTMLElement>(null);
  const [full, setFull] = useState(false);
  const canFull = useSyncExternalStore(
    () => () => {},
    () => document.fullscreenEnabled === true,
    () => false,
  );

  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === figureRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function toggleFull() {
    // Browsers reject this without a real user gesture; ignore that quietly.
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else figureRef.current?.requestFullscreen().catch(() => {});
  }
  const spec = specs[provider];
  const meta = providerMeta[provider];
  const last = spec.steps.length - 1;
  const current = Math.min(step, last);
  const info = spec.steps[current];
  const at = current + 1; // specs number their steps from 1
  const showFlow = current === last;
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));
  const markerId = `arch-arrow-${provider}`;

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") setStep(Math.min(last, current + 1));
    else if (event.key === "ArrowLeft") setStep(Math.max(0, current - 1));
    else return;
    event.preventDefault();
  }

  const groups = [...spec.groups]
    .filter((group) => group.step <= at)
    .sort((a, b) => groupOrder.indexOf(a.kind) - groupOrder.indexOf(b.kind));

  return (
    <figure
      ref={figureRef}
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={`${title} on ${meta.name}. Use the left and right arrow keys to move between build steps.`}
      className={`overflow-hidden border border-line bg-panel ${full ? "flex h-screen flex-col rounded-none" : "rounded-xl"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="m-0 text-sm font-semibold text-text">{title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <CloudSwitch />
          {canFull && (
            <button
              type="button"
              onClick={toggleFull}
              aria-pressed={full}
              className="rounded-lg border border-line px-3 py-1.5 font-mono text-xs font-semibold text-soft hover:text-text"
            >
              {full ? "✕ Exit full screen" : "⛶ Full screen"}
            </button>
          )}
        </div>
      </div>

      <div className={`bg-white ${full ? "min-h-0 flex-1 overflow-auto" : "overflow-x-auto"}`}>
        <svg
          key={provider}
          role="img"
          aria-label={`${title}, ${meta.short}, step ${current + 1} of ${last + 1}: ${info.title}`}
          viewBox={`0 0 ${spec.width} ${spec.height}`}
          style={full ? { width: "100%", height: "100%", display: "block" } : { width: "100%", minWidth: 780, height: "auto", display: "block" }}
          fontFamily="var(--font-sans), system-ui, sans-serif"
        >
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,1 L10,5 L0,9 z" fill={INK} />
            </marker>
          </defs>

          {groups.map((group) => (
            <Group key={group.id} group={group} style={palette[provider][group.kind]} fresh={group.step === at} />
          ))}

          {spec.edges
            .filter((edge) => edge.step <= at)
            .map((edge) => {
              const path = route(edge, nodes);
              if (!path) return null;
              const strong = edge.step === at || (showFlow && edge.num !== undefined);
              const [mx, my] = path.mid;
              const labelWidth = edge.label ? edge.label.length * 5.7 + 10 : 0;
              return (
                <g key={`${edge.from}-${edge.to}`} className="arch-in">
                  <path
                    d={path.d}
                    fill="none"
                    stroke={INK}
                    strokeWidth={strong ? 2 : 1.2}
                    strokeDasharray={edge.dashed ? "5 4" : undefined}
                    markerEnd={`url(#${markerId})`}
                    markerStart={edge.both ? `url(#${markerId})` : undefined}
                  />
                  {edge.label && (
                    <g>
                      <rect x={path.vertical ? mx + 6 : mx - labelWidth / 2} y={path.vertical ? my + 12 : my - 22} width={labelWidth} height={15} rx={3} fill="#fff" fillOpacity={0.9} />
                      <text x={path.vertical ? mx + 11 : mx} y={path.vertical ? my + 23 : my - 11} fontSize={10} fill={MUTED} textAnchor={path.vertical ? "start" : "middle"}>
                        {edge.label}
                      </text>
                    </g>
                  )}
                  {showFlow && edge.num !== undefined && (
                    <g className="arch-in">
                      <circle cx={mx} cy={my} r={10} fill="#000" stroke="#fff" strokeWidth={2} />
                      <text x={mx} y={my + 3.8} fontSize={11} fontWeight={700} textAnchor="middle" fill="#fff">
                        {edge.num}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {spec.nodes
            .filter((node) => node.step <= at)
            .map((node) => (
              <Node key={node.id} node={node} fresh={node.step === at} accent={meta.accent} />
            ))}
        </svg>
      </div>

      <div className={`border-t border-line px-4 py-4 sm:px-5 ${full ? "max-h-[38vh] shrink-0 overflow-y-auto" : ""}`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Build steps">
            {spec.steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={`Step ${index + 1}: ${item.title}`}
                title={item.title}
                onClick={() => setStep(index)}
                className={`grid size-7 place-items-center rounded-full border font-mono text-xs font-bold transition ${
                  index === current
                    ? "border-lime bg-lime text-ink"
                    : index < current
                      ? "border-lime/50 text-lime"
                      : "border-line text-faint hover:text-text"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, current - 1))}
              disabled={current === 0}
              className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-soft hover:text-text disabled:opacity-40"
            >
              ← Back
            </button>
            {current < last ? (
              <button type="button" onClick={() => setStep(current + 1)} className="rounded-lg bg-lime px-4 py-1.5 text-sm font-bold text-ink hover:bg-lime-deep">
                Next: {spec.steps[current + 1].title} →
              </button>
            ) : (
              <button type="button" onClick={() => setStep(0)} className="rounded-lg bg-lime px-4 py-1.5 text-sm font-bold text-ink hover:bg-lime-deep">
                ↺ Build it again
              </button>
            )}
          </div>
        </div>

        <div key={`${provider}-${current}`} className="arch-in mt-4" aria-live="polite">
          <p className="m-0 font-mono text-xs tracking-wider uppercase" style={{ color: meta.accent }}>
            {meta.short} · step {current + 1} of {last + 1}
          </p>
          <p className="m-0 mt-1 font-display text-xl font-bold text-text">{info.title}</p>
          <p className="m-0 mt-2 text-[0.98rem] leading-relaxed text-soft">{info.body}</p>
          <div className="mt-3 space-y-1.5">
            {info.points.map((point) => (
              <p key={point} className="m-0 flex gap-2.5 text-[0.93rem] leading-snug">
                <span aria-hidden="true" style={{ color: meta.accent }}>▸</span>
                <span>{point}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[11px] text-faint">
          <span>Tip: switch provider at any step to compare the same layer across clouds. Arrow keys step, Esc leaves full screen.</span>
          {current < last && (
            <button type="button" onClick={() => setStep(last)} className="text-sky underline underline-offset-4">
              Skip to the full diagram
            </button>
          )}
        </div>
      </div>
    </figure>
  );
}

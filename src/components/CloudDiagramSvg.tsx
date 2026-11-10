import type { Ref } from "react";
import {
  providerMeta,
  type ArchEdge,
  type ArchGroup,
  type ArchNode,
  type ArchSpec,
  type GroupKind,
  type Provider,
} from "@/lib/cloud";


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
      <text x={textX} y={centred ? group.y + group.h - 8 : group.y + 16} fontSize={11.5} fontWeight={600} fill={style.stroke} textAnchor={centred ? "middle" : "start"}>
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
 * The drawing itself: groups, arrows and icons for one provider at one build
 * step. Pure markup with no state, so it renders on the server for printable
 * study sheets as well as inside the interactive and compare views.
 */
export function DiagramSvg({
  spec,
  provider,
  at,
  label,
  idPrefix = "d",
  svgRef,
  style,
}: {
  spec: ArchSpec;
  provider: Provider;
  /** 1-based build step to draw. Steps past the last one draw everything. */
  at: number;
  label: string;
  idPrefix?: string;
  svgRef?: Ref<SVGSVGElement>;
  style?: React.CSSProperties;
}) {
  const meta = providerMeta[provider];
  const showFlow = at >= spec.steps.length;
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));
  const markerId = `${idPrefix}-arrow-${provider}`;
  const groups = [...spec.groups]
    .filter((group) => group.step <= at)
    .sort((x, y) => groupOrder.indexOf(x.kind) - groupOrder.indexOf(y.kind));

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={label}
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      style={style ?? { width: "100%", height: "auto", display: "block" }}
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
  );
}

/**
 * Shared types for the multi-cloud architecture diagrams. A diagram is plain
 * data so lesson files (server) can hand it to the interactive renderer
 * (client). Every element carries the build step at which it first appears.
 */

export const providers = ["aws", "azure", "gcp", "oci"] as const;
export type Provider = (typeof providers)[number];

export const providerMeta: Record<Provider, { name: string; short: string; accent: string }> = {
  aws: { name: "Amazon Web Services", short: "AWS", accent: "#FF9900" },
  azure: { name: "Microsoft Azure", short: "Azure", accent: "#0078D4" },
  gcp: { name: "Google Cloud", short: "GCP", accent: "#4285F4" },
  oci: { name: "Oracle Cloud Infrastructure", short: "OCI", accent: "#C74634" },
};

export type GroupKind = "region" | "network" | "zone" | "public" | "private" | "scaling";

export type ArchGroup = {
  id: string;
  kind: GroupKind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** Second, fainter label line. Used for CIDR ranges. */
  sub?: string;
  /** Icon path drawn in the top-left corner, as the official diagrams do. */
  icon?: string;
  step: number;
};

export type ArchNode = {
  id: string;
  /** Centre of the icon. */
  x: number;
  y: number;
  icon: string;
  label: string;
  sub?: string;
  step: number;
};

export type ArchEdge = {
  from: string;
  to: string;
  step: number;
  /** Corner points between the two nodes, for right-angled routes. */
  via?: [number, number][];
  label?: string;
  dashed?: boolean;
  both?: boolean;
  /** Request-flow number, shown as a black badge on the final step. */
  num?: number;
  /** Sideways shift of the start / end point, to separate parallel lines. */
  fromShift?: number;
  toShift?: number;
};

export type ArchStep = {
  title: string;
  body: string;
  points: string[];
};

export type ArchSpec = {
  width: number;
  height: number;
  groups: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  steps: ArchStep[];
};

export type ArchSpecs = Record<Provider, ArchSpec>;

/** What a printable study sheet needs from a lesson. */
export type Sheet = { diagramTitle: string; specs: ArchSpecs; takeaways: string[] };

export function sheetOf(lesson: unknown): Sheet | undefined {
  const sheet = (lesson as { sheet?: Sheet } | undefined)?.sheet;
  return sheet && sheet.specs ? sheet : undefined;
}

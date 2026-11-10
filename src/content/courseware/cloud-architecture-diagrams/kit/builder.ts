import type { ArchEdge, ArchGroup, ArchNode, ArchSpecs, ArchStep, GroupKind, Provider } from "@/lib/cloud";
import { providers } from "@/lib/cloud";
import { svcIcon, svcName, type Svc } from "./catalog";

/** A string that may differ per provider. */
export type Per<T = string> = T | Record<Provider, T>;

export const NET: Record<Provider, string> = { aws: "VPC", azure: "Virtual network", gcp: "VPC network", oci: "VCN" };
export const ACCOUNT: Record<Provider, string> = { aws: "AWS account", azure: "Azure subscription", gcp: "Google Cloud project", oci: "OCI compartment" };
export const REGION: Record<Provider, string> = { aws: "Region us-east-1", azure: "Region East US", gcp: "Region us-central1", oci: "Region us-ashburn-1" };
export const ZONE: Record<Provider, string> = { aws: "Availability Zone", azure: "Availability zone", gcp: "Zone", oci: "Availability domain" };

type G = { id: string; kind: GroupKind; x: number; y: number; w: number; h: number; label: Per; sub?: Per; icon?: Svc; step: number };
type N = { id: string; svc: Svc; x: number; y: number; step: number; label?: Per; sub?: Per; skip?: Provider[] };
type E = {
  from: string;
  to: string;
  step: number;
  label?: string;
  dashed?: boolean;
  both?: boolean;
  num?: number;
  /** "hv": leave sideways, arrive vertically. "vh": the reverse. */
  elbow?: "hv" | "vh";
  via?: [number, number][];
  fromShift?: number;
  toShift?: number;
};
type S = {
  title: string;
  body: string;
  /** Bullets that apply on every cloud. */
  points?: string[];
  /** One bullet per cloud, naming that cloud's service or default. */
  per: Record<Provider, string>;
};

export type Arch = { width: number; height: number; groups: G[]; nodes: N[]; edges: E[]; steps: S[] };

const pick = <T,>(value: Per<T>, provider: Provider): T =>
  typeof value === "object" && value !== null && provider in (value as object) ? (value as Record<Provider, T>)[provider] : (value as T);

/** Expand one provider-neutral description into the four per-cloud specs. */
export function defineArch(arch: Arch): ArchSpecs {
  const out = {} as ArchSpecs;
  for (const provider of providers) {
    const nodes: ArchNode[] = arch.nodes
      .filter((n) => !n.skip?.includes(provider))
      .map((n) => ({
        id: n.id,
        x: n.x,
        y: n.y,
        step: n.step,
        icon: svcIcon(n.svc, provider),
        label: n.label ? pick(n.label, provider) : svcName(n.svc, provider),
        sub: n.sub ? pick(n.sub, provider) : undefined,
      }));
    const ids = new Map(nodes.map((n) => [n.id, n]));
    const groups: ArchGroup[] = arch.groups.map((g) => ({
      id: g.id,
      kind: g.kind,
      x: g.x,
      y: g.y,
      w: g.w,
      h: g.h,
      label: pick(g.label, provider),
      sub: g.sub ? pick(g.sub, provider) : undefined,
      icon: g.icon ? svcIcon(g.icon, provider) : undefined,
      step: g.step,
    }));
    const edges: ArchEdge[] = arch.edges
      .filter((e) => ids.has(e.from) && ids.has(e.to))
      .map((e) => {
        const a = ids.get(e.from)!;
        const b = ids.get(e.to)!;
        let via = e.via;
        if (!via && e.elbow === "hv") via = [[b.x, a.y]];
        if (!via && e.elbow === "vh") via = [[a.x, b.y]];
        return { from: e.from, to: e.to, step: e.step, label: e.label, dashed: e.dashed, both: e.both, num: e.num, via, fromShift: e.fromShift, toShift: e.toShift };
      });
    const steps: ArchStep[] = arch.steps.map((s) => ({ title: s.title, body: s.body, points: [...(s.points ?? []), s.per[provider]] }));
    out[provider] = { width: arch.width, height: arch.height, groups, nodes, edges, steps };
  }
  return out;
}

/** The distinct building blocks used in a diagram, for the "four vocabularies" table. */
export function usedSvcs(arch: Arch): Svc[] {
  const seen = new Set<Svc>();
  for (const n of arch.nodes) seen.add(n.svc);
  return [...seen].filter((s) => !["users", "device", "mobile", "server", "client"].includes(s));
}

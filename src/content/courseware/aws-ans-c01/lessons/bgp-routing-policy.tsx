import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Hard",
  objectives: [
    "Explain the BGP path-selection attributes AWS honours and in what order",
    "Influence inbound and outbound traffic with local preference communities, AS_PATH prepending, MED and prefix length",
    "Design active/passive and active/active (load sharing) hybrid routing",
    "Know the AWS-side route priority between Direct Connect, VPN and static routes",
    "Summarize routes and respect prefix limits",
  ],
  tasks: [
    {
      id: "basics",
      title: "How BGP chooses a path",
      body: (
        <>
          <p>
            BGP picks one best path per prefix. The standard order (simplified) is: highest{" "}
            <strong>local preference</strong>, shortest <strong>AS_PATH</strong>, lowest origin type,
            lowest <strong>MED</strong> (between paths from the same neighbouring AS), eBGP over iBGP,
            lowest IGP metric. Before any BGP attribute is used, the router applies{" "}
            <strong>longest prefix match</strong>: a more specific route always wins.
          </p>
          <Figure caption="Traffic engineering levers, strongest first. Prefix length beats all attributes; local preference is the main outbound control.">
            <Flow
              numbered
              steps={[
                { title: "Longest prefix", note: "/25 beats /24 regardless of attributes", tone: "rose" },
                { title: "Local preference", note: "Highest wins; local to your AS", tone: "amber" },
                { title: "AS_PATH length", note: "Shortest wins; prepend to de-prefer", tone: "lime" },
                { title: "MED", note: "Lowest wins; hints to a neighbour", tone: "sky" },
                { title: "Other tie-breakers", note: "eBGP over iBGP, router ID", tone: "plain" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "aws-levers",
      title: "The levers AWS gives you",
      body: (
        <>
          <p>There are two directions to control, and different tools for each:</p>
          <Table
            head={["Direction", "How to influence", "Detail"]}
            rows={[
              ["AWS → on-premises (outbound from AWS)", "Advertise more specific prefixes; AS_PATH prepending of your advertisements; local preference communities on private/transit VIFs", "AWS honours your prefix length, then local preference communities, then AS_PATH. Communities 7224:7100 (low), 7224:7200 (medium), 7224:7300 (high)"],
              ["On-premises → AWS (outbound from you)", "Your own router's local preference and MED/AS_PATH logic on routes received from AWS", "You choose which VIF or tunnel to send into; AWS advertises the same prefixes on all of them"],
              ["Public VIF scope", "BGP community tags on routes you advertise and receive", "Scope: 7224:9100 local Region, 7224:9200 continent, 7224:9300 global. AWS tags what it advertises 7224:8100 (same Region), 7224:8200 (same continent), no tag (global)"],
            ]}
          />
          <p>
            For VGW and DXGW traffic from AWS back to you, the priority AWS applies is:{" "}
            <strong>longest prefix → local preference communities → AS_PATH → MED/other</strong>.
            For two Direct Connect paths advertising the same prefix, set <code>7224:7300</code> on
            the primary and <code>7224:7100</code> on the standby to make the primary preferred
            (active/passive). Use the same community on both and the same AS_PATH for equal-cost{" "}
            <strong>active/active</strong> load sharing (AWS can ECMP over equal paths on the same
            VIF type).
          </p>
          <Figure caption="Active/passive over two Direct Connect locations using local preference communities. Traffic from AWS prefers DX-1; DX-2 takes over if the primary BGP session drops.">
            <Graph
              label="Two Direct Connect connections with local preference communities selecting DX-1 as primary"
              cellW={200}
              cellH={100}
              nodeW={170}
              nodes={[
                { id: "aws", label: "AWS (VGW / DXGW)", col: 0, row: 0.5, tone: "lime" },
                { id: "d1", label: "DX-1 primary", sub: "7224:7300 high", col: 1, row: 0, tone: "amber" },
                { id: "d2", label: "DX-2 standby", sub: "7224:7100 low", col: 1, row: 1, tone: "plain" },
                { id: "onp", label: "On-premises", sub: "10.0.0.0/8", col: 2, row: 0.5, tone: "sky" },
              ]}
              edges={[
                { from: "aws", to: "d1", label: "preferred" },
                { from: "aws", to: "d2", dashed: true, label: "backup" },
                { from: "d1", to: "onp" },
                { from: "d2", to: "onp", dashed: true },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "priority",
      title: "Route priority inside AWS route tables",
      body: (
        <>
          <p>When the same destination appears from several sources, AWS resolves in order:</p>
          <Table
            head={["Where", "Order of preference"]}
            rows={[
              ["VPC route table", "Local route; then longest prefix; if equal, static route over propagated; among propagated: Direct Connect BGP, then VPN static, then VPN BGP"],
              ["Transit Gateway route table", "Longest prefix; then static route; then propagated routes in the order VPC, Direct Connect gateway, Transit Gateway Connect, VPN; within VPN: BGP attributes (shortest AS_PATH, then MED, etc.)"],
            ]}
          />
          <Callout tone="tip" title="Failing over from Direct Connect to VPN">
            To make Direct Connect primary and VPN backup with the <em>same</em> prefix on a VGW,
            nothing special is needed: Direct Connect BGP routes already beat VPN routes. If you want
            VPN to carry some prefixes, advertise a longer prefix over the VPN. To keep VPN as backup
            on a Transit Gateway, the DXGW attachment is preferred over VPN automatically.
          </Callout>
        </>
      ),
    },
    {
      id: "limits",
      title: "Summarization and limits",
      body: (
        <>
          <ul>
            <li><strong>Prefix limits:</strong> up to 100 prefixes from you per Direct Connect private or transit VIF, and a fixed number of routes a VPN, VGW or Transit Gateway route table will accept (see the quotas lesson). Summarize to stay under limits and to shrink route tables.</li>
            <li><strong>Overlapping CIDRs:</strong> if the on-premises prefix overlaps a VPC CIDR, the VPC local route wins for that range, so on-premises hosts in the overlap are unreachable.</li>
            <li><strong>Route propagation:</strong> enable it on the VPC route tables for VGW routes; Transit Gateway uses route-table association and propagation.</li>
            <li><strong>Asymmetric routing:</strong> stateful firewalls on-premises drop return traffic that arrives on a different path than the request. Use consistent preference in both directions and keep paths symmetric through stateful devices.</li>
          </ul>
          <Exercise
            title="Make DX-1 primary"
            task={<p>You have two private VIFs advertising the same on-premises prefix 10.50.0.0/16 over DX-1 and DX-2. You want AWS to send return traffic over DX-1 and fall back to DX-2. You also want your data center to send AWS-bound traffic out DX-1. What do you configure?</p>}
          >
            <p>
              For AWS → on-premises: tag the 10.50.0.0/16 advertisement on DX-1 with local preference
              community <code>7224:7300</code> (high) and on DX-2 with <code>7224:7100</code> (low), or
              prepend your AS on DX-2. For on-premises → AWS: set a higher BGP local preference on routes
              learned from DX-1 than DX-2 on your router. Keep the same preference in both directions
              so stateful devices see symmetric flows.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Longest prefix always wins before any BGP attribute; then local preference, AS_PATH, MED.",
    "AWS honours Direct Connect local-preference communities 7224:7100/7200/7300 and public-VIF scope communities 7224:9100/9200/9300.",
    "Direct Connect BGP beats VPN on a VGW; on a Transit Gateway static wins, then VPC, DXGW, Connect, VPN.",
    "Keep paths symmetric for stateful firewalls and summarize prefixes to respect limits.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which BGP community makes a Direct Connect path the most preferred for traffic from AWS?",
      options: ["7224:7300", "7224:7100", "7224:9100", "7224:8100"],
      answer: 0,
      explain: "7224:7300 is the high local preference community; 7224:7100 is low.",
    },
    {
      kind: "mcq",
      q: "A /24 route is received over VPN and a /16 over Direct Connect covering the same address. Where does traffic go?",
      options: ["VPN, because it is more specific", "Direct Connect, because it is preferred", "Load balanced equally", "Dropped"],
      answer: 0,
      explain: "Longest prefix match precedes any path preference.",
    },
    {
      kind: "mcq",
      q: "Which tool shifts traffic from AWS toward a different Direct Connect connection without changing prefixes?",
      options: [
        "Local preference communities or AS_PATH prepending on your advertisements",
        "Changing the VPC CIDR",
        "Adding a NAT gateway",
        "Increasing the TTL",
      ],
      answer: 0,
      explain: "AWS evaluates local preference communities and AS_PATH for tied prefixes.",
    },
    {
      kind: "mcq",
      q: "On a virtual private gateway with the same prefix from Direct Connect and VPN, which is chosen?",
      options: ["Direct Connect BGP route", "VPN BGP route", "Whichever is newer", "Neither; the route is removed"],
      answer: 0,
      explain: "Direct Connect routes take priority over VPN routes for identical prefixes on a VGW.",
    },
    {
      kind: "text",
      q: "Which BGP attribute is tested first (after longest prefix) when choosing the best path: local preference or MED?",
      format: "***** **********",
      accept: ["local preference", "local pref", "localpref"],
      explain: "Local preference is evaluated before AS_PATH length and MED.",
    },
  ],
};

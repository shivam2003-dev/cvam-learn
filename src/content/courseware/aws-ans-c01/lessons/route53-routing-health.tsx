import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Select among the Route 53 routing policies for a stated requirement",
    "Configure health checks, including checks of private resources through CloudWatch alarms",
    "Build active/passive and active/active DNS failover",
    "Combine policies with traffic flow and understand the limits of DNS-based traffic management",
  ],
  tasks: [
    {
      id: "policies",
      title: "The routing policies",
      body: (
        <>
          <Table
            head={["Policy", "Decision made on", "Typical use"]}
            rows={[
              ["Simple", "None: returns all values", "One resource"],
              ["Weighted", "Relative weights you assign", "Canary 5/95, blue/green, A/B"],
              ["Latency", "Lowest network latency from the user's Region to your Region", "Performance across Regions"],
              ["Failover", "Health of the primary", "Active/passive DR"],
              ["Geolocation", "Where the user is (continent, country, state)", "Content localisation, compliance, license limits"],
              ["Geoproximity", "Distance between user and resource, with adjustable bias", "Shift load toward or away from a location"],
              ["IP-based", "The client's source CIDR (CIDR collections)", "Route specific ISPs or networks to chosen endpoints"],
              ["Multivalue answer", "Up to eight healthy records returned", "Simple DNS load distribution with health checks"],
            ]}
          />
          <p>
            Two distinctions appear constantly. <strong>Latency</strong> is about measured network
            speed, not distance; <strong>geolocation</strong> is about the user&apos;s location and is
            deterministic, so it needs a <em>default</em> record for locations you did not map.{" "}
            <strong>Geoproximity</strong> uses distance with a bias you tune, which is how you drain or
            attract traffic gradually.
          </p>
          <Figure caption="Choosing between the policies by what you need to control. Position is approximate.">
            <Quadrant
              xLabel="User location awareness"
              yLabel="Control over traffic share"
              corners={["Weighted", "Geoproximity", "Simple", "Latency / Geolocation"]}
              items={[
                { label: "Simple", x: 0.1, y: 0.1, tone: "plain" },
                { label: "Multivalue", x: 0.15, y: 0.35, tone: "plain" },
                { label: "Weighted", x: 0.18, y: 0.85, tone: "lime" },
                { label: "Failover", x: 0.3, y: 0.55, tone: "amber" },
                { label: "Latency", x: 0.65, y: 0.3, tone: "sky" },
                { label: "Geolocation", x: 0.82, y: 0.2, tone: "sky" },
                { label: "Geoproximity", x: 0.9, y: 0.8, tone: "lime" },
              ]}
              label="Route 53 routing policies plotted by location awareness and control over traffic share"
            />
          </Figure>
        </>
      ),
    },
    {
      id: "health",
      title: "Health checks",
      body: (
        <>
          <p>
            Route 53 health checks come in three kinds: <strong>endpoint</strong> (HTTP, HTTPS or TCP,
            with optional string matching), <strong>calculated</strong> (combine other checks with
            AND, OR or a threshold) and <strong>CloudWatch alarm</strong> checks. The health checkers
            are public, so they can only probe endpoints reachable from the internet. To monitor a{" "}
            <em>private</em> resource, publish a CloudWatch metric for it, create an alarm and
            attach a health check that tracks the alarm state.
          </p>
          <ul>
            <li>Health checkers run from multiple Regions and a record is healthy when more than 18% of checkers report healthy, by default.</li>
            <li>Allow the Route 53 health checker IP ranges in firewalls and security groups, or the check fails.</li>
            <li>Alias records can use <strong>Evaluate target health</strong> on supported targets without creating a separate health check.</li>
            <li>Health check status metrics are published in CloudWatch in us-east-1.</li>
          </ul>
          <Figure caption="Active/passive failover. Route 53 returns the primary while it is healthy; when it fails, the secondary record is returned.">
            <Graph
              label="Route 53 failover: client queries Route 53, health check controls whether primary or secondary record is returned"
              cellW={200}
              cellH={100}
              nodeW={165}
              nodes={[
                { id: "c", label: "Client", col: 0, row: 0, tone: "sky", shape: "pill" },
                { id: "r", label: "Route 53", sub: "failover records", col: 1, row: 0, tone: "lime" },
                { id: "h", label: "Health check", sub: "primary endpoint", col: 1, row: 1, tone: "amber" },
                { id: "p", label: "Primary Region", col: 2, row: 0, tone: "plain" },
                { id: "s", label: "Secondary Region", col: 2, row: 1, tone: "plain" },
              ]}
              edges={[
                { from: "c", to: "r" },
                { from: "h", to: "r", dashed: true, label: "status" },
                { from: "r", to: "p", label: "healthy" },
                { from: "r", to: "s", label: "failed", dashed: true },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="DNS failover is only as fast as caches allow">
            Recovery time is roughly health-check detection time plus record TTL (plus client and
            resolver caching that ignores TTL). For aggressive targets use short TTLs (for example 60
            seconds), fast health checks and, when you need IP-level failover, consider Global
            Accelerator.
          </Callout>
        </>
      ),
    },
    {
      id: "flow",
      title: "Combining policies and traffic flow",
      body: (
        <>
          <p>
            Policies can be nested using alias records to build a decision tree: for example a
            geolocation record per continent, each pointing to a latency record set across Regions,
            each member with a failover pair. The <strong>Traffic Flow</strong> visual editor builds
            and versions these trees as <em>traffic policies</em> and applies them to a hosted zone
            as <em>policy records</em>.
          </p>
          <Exercise
            title="Design a DNS plan"
            task={<p>A video site must (1) keep EU users on EU endpoints for data residency, (2) send everyone else to the lowest-latency Region, and (3) fail over inside a Region. Which records?</p>}
          >
            <p>
              A <strong>geolocation</strong> record for Europe that points to a nested set; a{" "}
              <strong>default</strong> geolocation record pointing to a <strong>latency</strong> set
              across the other Regions. Within each Region, use a <strong>failover</strong> pair (or
              alias targets with Evaluate Target Health) so unhealthy endpoints are removed. Without
              the default geolocation record, users in unmapped locations would get no answer.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "limits",
      title: "Limits of DNS-based management",
      body: (
        <>
          <ul>
            <li>DNS decisions are made for the <em>resolver</em>, not the end user, unless the resolver supports EDNS client subnet; a distant public resolver can mislead latency or geolocation answers.</li>
            <li>Weighted shifts are statistical; with long TTLs and few clients you may not see the exact split.</li>
            <li>Health checks cost per check and add optional features (fast interval, string matching, latency graphs) at extra price.</li>
            <li>Alias records pointing at private or non-supported targets are not possible; use records with explicit values.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Match policy to requirement: weighted for splits, latency for speed, geolocation for residency (with a default), geoproximity for biased distance, failover for DR, IP-based for client network mapping.",
    "Health checkers are internet-based; monitor private resources through CloudWatch alarm health checks.",
    "DNS failover time is detection plus TTL plus caching, so choose short TTLs for fast recovery.",
    "Nest policies with alias records or Traffic Flow for multi-dimensional routing.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You need to send 5% of traffic to a new version. Which policy?",
      options: ["Weighted", "Latency", "Geolocation", "Multivalue"],
      answer: 0,
      explain: "Weighted records split traffic by relative weight, ideal for canary releases.",
    },
    {
      kind: "mcq",
      q: "Which health check type can monitor a resource in a private subnet that has no internet access?",
      options: [
        "A health check based on a CloudWatch alarm",
        "An HTTP endpoint health check",
        "A TCP endpoint health check",
        "A calculated health check of nothing",
      ],
      answer: 0,
      explain: "Route 53 checkers are on the internet, so use a metric and CloudWatch alarm for private resources.",
    },
    {
      kind: "mcq",
      q: "Which policy needs a default record to answer every user?",
      options: ["Geolocation", "Latency", "Weighted", "Failover"],
      answer: 0,
      explain: "Geolocation answers only for mapped locations; unmapped locations need a default record.",
    },
    {
      kind: "mcq",
      q: "Which feature lets you shift traffic toward a Region by adjusting a bias value?",
      options: ["Geoproximity routing", "Simple routing", "Multivalue answer", "Failover routing"],
      answer: 0,
      explain: "Geoproximity routes by distance and a bias can expand or shrink the area served.",
    },
    {
      kind: "text",
      q: "Which AWS Region hosts Route 53 health check metrics in CloudWatch?",
      format: "*********",
      accept: ["us-east-1", "us east 1", "n. virginia", "n virginia"],
      explain: "Route 53 metrics, including health check status, are published in US East (N. Virginia).",
    },
  ],
};

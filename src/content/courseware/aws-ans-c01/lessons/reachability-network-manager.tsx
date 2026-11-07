import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Use VPC Reachability Analyzer to verify and troubleshoot paths without sending traffic",
    "Understand what Reachability Analyzer can and cannot prove",
    "Use Transit Gateway Route Analyzer and Network Manager to see topology and route state",
    "Use Network Access Analyzer to find unintended access",
    "Automate verification of connectivity intent after network changes",
  ],
  tasks: [
    {
      id: "ra",
      title: "VPC Reachability Analyzer",
      body: (
        <>
          <p>
            <strong>Reachability Analyzer</strong> is a configuration analysis tool. You define a{" "}
            <em>source</em> and <em>destination</em> (instances, ENIs, internet gateways, VPN
            gateways, Transit Gateways, VPC endpoints, peering connections, load balancers, and more),
            optionally a protocol and port, and it models the path through route tables, security
            groups, NACLs, gateways and attachments. It sends <strong>no packets</strong>. The result
            is either <em>reachable</em> with a hop-by-hop path or <em>not reachable</em> with the
            exact component that blocks it (for example a missing route or a security group rule).
          </p>
          <Figure caption="Analysis workflow. Create a path, run an analysis, read the explanation, fix the component, rerun.">
            <Flow
              numbered
              steps={[
                { title: "Define path", note: "Source, destination, protocol, port", tone: "sky" },
                { title: "Run analysis", note: "Control-plane model, no traffic", tone: "lime" },
                { title: "Read result", note: "Hops or blocking component", tone: "amber" },
                { title: "Fix + rerun", note: "Route, SG, NACL, attachment", tone: "lime" },
              ]}
            />
          </Figure>
          <Table
            head={["Strength", "Limit"]}
            rows={[
              ["Finds missing routes, SG/NACL blocks, wrong target, blackhole routes", "Does not test OS firewalls, application listeners or on-premises devices"],
              ["Works across peering, TGW, VPN gateway, endpoints in the same or peered accounts (with permissions)", "Cannot see across a path that depends on external devices beyond AWS"],
              ["Safe to run in production, scriptable via API/CloudFormation", "Reachable does not guarantee low latency or no MTU issue"],
            ]}
          />
          <Callout tone="tip" title="Use it as a regression test">
            Save critical paths (for example <em>app subnet → database on 5432</em> and{" "}
            <em>spoke → on-premises</em>) as Network Insights paths. Trigger analyses from a CI/CD
            pipeline or an EventBridge rule on route table and security group changes, and alarm when
            an intended path becomes unreachable (or an unintended one becomes reachable). This is
            &ldquo;automating the verification of connectivity intent&rdquo; from the exam guide.
          </Callout>
        </>
      ),
    },
    {
      id: "nm",
      title: "Transit Gateway Network Manager and Route Analyzer",
      body: (
        <>
          <ul>
            <li><strong>Network Manager</strong> creates a <em>global network</em> in which you register Transit Gateways (in any Region) and on-premises devices, sites and links. It draws a <strong>topology</strong> map, shows attachments and routes, and publishes CloudWatch metrics and EventBridge events for topology and routing changes such as attachment state, BGP session state and route changes.</li>
            <li><strong>SD-WAN integration:</strong> supported vendors push site and link telemetry into Network Manager for one global view.</li>
            <li><strong>Route Analyzer</strong> examines TGW route tables: given a source attachment/route table and destination CIDR, it reports whether a route exists and which attachment it uses, and flags blackholes. It checks the TGW route table only; it does not check VPC route tables or security groups, so pair it with Reachability Analyzer.</li>
            <li><strong>Transit Gateway flow logs</strong> and metrics (BytesIn/Out, PacketDropCountNoRoute, PacketDropCountBlackhole) complement this.</li>
          </ul>
          <Table
            head={["Tool", "Question it answers"]}
            rows={[
              ["Reachability Analyzer", "Is there a configured path from A to B, and what blocks it?"],
              ["TGW Route Analyzer", "Does this TGW route table have a route to that CIDR, and where does it go?"],
              ["Network Manager", "What does my global network look like and is anything changing or down?"],
              ["Network Access Analyzer", "Does any path exist that violates my policy (for example internet to database)?"],
              ["VPC Flow Logs", "What traffic actually flowed and was it accepted?"],
            ]}
          />
        </>
      ),
    },
    {
      id: "naa",
      title: "Network Access Analyzer",
      body: (
        <>
          <p>
            <strong>Network Access Analyzer</strong> flips the question: instead of checking one
            path, it finds <em>all</em> paths that match a scope you define as unwanted (for example
            &ldquo;any internet gateway to any resource tagged <code>tier=db</code>&rdquo;) and reports
            findings. Use it for compliance checks, to prove network segmentation, and to audit
            changes before release.
          </p>
          <Exercise
            title="Which tool?"
            task={<p>After a change window, an application in a spoke VPC cannot reach a database in a shared VPC through the Transit Gateway. Route tables look right to the engineer. How would you find the cause quickly and prevent a repeat?</p>}
          >
            <p>
              Run <strong>Reachability Analyzer</strong> from the app ENI to the database ENI on port
              5432. It will name the blocking component, for example a missing TGW route table
              propagation, a VPC route table entry, or the database security group. Confirm TGW
              routing with <strong>Route Analyzer</strong>. To prevent a repeat, save the path as a
              Network Insights path and run it automatically from the pipeline or an EventBridge
              rule on network changes, alerting on failure.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Reachability Analyzer models configuration without sending packets; it names the blocking component but cannot see OS firewalls or on-premises devices.",
    "Route Analyzer checks only the TGW route table; Network Manager gives a global topology with metrics and events.",
    "Network Access Analyzer finds unintended paths against a policy scope.",
    "Automate Reachability Analyzer runs to continuously verify intended connectivity.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Does Reachability Analyzer send test packets?",
      options: ["No, it analyzes configuration", "Yes, ICMP only", "Yes, TCP SYN packets", "Only for VPN paths"],
      answer: 0,
      explain: "It performs a static analysis of route tables, SGs, NACLs and attachments.",
    },
    {
      kind: "mcq",
      q: "Which tool shows whether a TGW route table has a route to a CIDR?",
      options: ["Transit Gateway Route Analyzer", "Trusted Advisor", "Cost Explorer", "AWS Config"],
      answer: 0,
      explain: "Route Analyzer inspects TGW route tables for a destination CIDR.",
    },
    {
      kind: "mcq",
      q: "Which tool would find every path from the internet to resources tagged as databases?",
      options: ["Network Access Analyzer", "Reachability Analyzer for each instance", "VPC Flow Logs", "Route 53 Resolver"],
      answer: 0,
      explain: "Network Access Analyzer evaluates scopes for unintended network access across the account.",
    },
    {
      kind: "mcq",
      q: "Reachability Analyzer says a path is reachable but the application times out. What is a likely cause?",
      options: ["An OS firewall or application listener issue", "A missing route", "A missing NACL rule", "A missing TGW association"],
      answer: 0,
      explain: "It does not check software on the instances; a host firewall or stopped service can still block traffic.",
    },
    {
      kind: "text",
      q: "Which AWS service registers Transit Gateways and sites into a global topology view?",
      format: "******* *******",
      accept: ["network manager", "transit gateway network manager", "aws network manager"],
      explain: "Network Manager provides the global network topology, metrics and events.",
    },
  ],
};

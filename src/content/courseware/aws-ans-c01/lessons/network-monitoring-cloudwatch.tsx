import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Define logging and monitoring requirements for AWS and hybrid networks",
    "Select the key CloudWatch metrics for each networking service",
    "Build alarms, dashboards and composite alarms for network health",
    "Capture a performance baseline and detect deviations",
    "Use Logs Insights, the CloudWatch agent and custom metrics for network data",
  ],
  tasks: [
    {
      id: "req",
      title: "From requirements to signals",
      body: (
        <>
          <p>
            Task 1.4 asks you to <em>define</em> monitoring needs before you build. Ask: who needs to
            know (operations, security, audit), how fast (seconds, minutes, daily), what is the
            question (is it up, is it fast, is it attacked, who talked to whom), and how long to keep
            the data. Then map to signals.
          </p>
          <Figure caption="Monitoring design loop. Requirements decide which metrics, logs and alarms you need, and the baseline gives the alarms meaning.">
            <Flow
              numbered
              steps={[
                { title: "Requirements", note: "Availability, latency, security, audit", tone: "sky" },
                { title: "Metrics + logs", note: "Pick sources per service", tone: "lime" },
                { title: "Baseline", note: "Normal load and latency", tone: "amber" },
                { title: "Alarms", note: "Thresholds, anomaly detection, composite", tone: "lime" },
                { title: "Respond", note: "SNS, EventBridge, runbook, automation", tone: "rose" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "metrics",
      title: "Metrics worth knowing",
      body: (
        <>
          <Table
            head={["Service", "Key metrics", "What they tell you"]}
            rows={[
              ["Site-to-Site VPN", "TunnelState, TunnelDataIn/Out", "Tunnel up (1) or down (0) and throughput"],
              ["Direct Connect", "ConnectionState, ConnectionBpsEgress/Ingress, ConnectionLightLevelTx/Rx, ConnectionErrorCount, ConnectionCRCErrorCount", "Physical link health, utilization, optics"],
              ["Transit Gateway", "BytesIn/Out, PacketDropCountBlackhole, PacketDropCountNoRoute", "Traffic and routing drops"],
              ["NAT gateway", "ErrorPortAllocation, PacketsDropCount, BytesOutToDestination, ActiveConnectionCount", "Port exhaustion, drops, utilization"],
              ["ALB", "TargetResponseTime, HTTPCode_ELB_5XX_Count, HTTPCode_Target_5XX_Count, UnHealthyHostCount, RejectedConnectionCount, ActiveConnectionCount", "Latency, errors, capacity"],
              ["NLB", "UnHealthyHostCount, TCP_Target_Reset_Count, ActiveFlowCount, ProcessedBytes", "Health and flow behaviour"],
              ["CloudFront", "Requests, 4xxErrorRate, 5xxErrorRate, plus optional CacheHitRate and OriginLatency", "Edge health and cache efficiency"],
              ["Route 53", "HealthCheckStatus, DNSQueries (public zones)", "Endpoint health, query volume"],
              ["EC2 / ENA", "NetworkIn/Out, NetworkPacketsIn/Out, and ethtool counters such as bw_in_allowance_exceeded, pps_allowance_exceeded, conntrack_allowance_exceeded, linklocal_allowance_exceeded", "Instance limits being hit"],
            ]}
          />
          <Callout tone="tip" title="ENA allowance counters">
            When an instance silently drops packets because it exceeded its bandwidth, packets per
            second, connection tracking or link-local (DNS, metadata) allowance, the symptoms look
            like random network loss. Read the ethtool counters (or publish them with the CloudWatch
            agent) to prove it.
          </Callout>
        </>
      ),
    },
    {
      id: "alarms",
      title: "Alarms, dashboards and insights",
      body: (
        <>
          <ul>
            <li><strong>Alarms:</strong> static thresholds, anomaly detection bands, and <strong>composite alarms</strong> that combine alarm states (for example alert only if both VPN tunnels are down). Actions: SNS, Auto Scaling, EC2 actions, Systems Manager, or an EventBridge rule to trigger Lambda remediation.</li>
            <li><strong>Missing data treatment:</strong> set to <em>breaching</em> for TunnelState-style metrics where silence means failure.</li>
            <li><strong>Dashboards:</strong> cross-account and cross-Region dashboards give one view of the network; use metric math for rates and percentages.</li>
            <li><strong>Logs Insights:</strong> query flow logs, DNS logs and ALB logs delivered to CloudWatch Logs; metric filters convert log patterns into metrics and alarms.</li>
            <li><strong>CloudWatch agent:</strong> collects OS network metrics (netstat, ethtool) from instances, including hybrid servers.</li>
            <li><strong>Internet Monitor:</strong> shows internet-path performance and availability affecting your application's users and the network paths they use.</li>
          </ul>
          <Exercise
            title="Alarm design"
            task={<p>A branch office reaches AWS over two VPN tunnels. Operations wants a page only when connectivity is truly lost, but a one-line warning if a single tunnel drops. How do you design the alarms?</p>}
          >
            <p>
              Create one alarm per tunnel on <code>TunnelState</code> (below 1 for 2 of 2 minutes,
              missing data = breaching) wired to a low-priority SNS topic (the warning). Create a
              <strong> composite alarm</strong> with <code>ALARM(tunnel1) AND ALARM(tunnel2)</code>{" "}
              wired to the paging topic. Add a <code>TunnelDataIn</code> anomaly-detection alarm to
              catch a tunnel that is up but passing no traffic.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "baseline",
      title: "Baselines",
      body: (
        <>
          <p>
            An alarm threshold without a baseline is a guess. Capture normal behaviour for at least
            a few weeks including peaks: typical throughput per link, p50/p95 latency, packet error
            rate, DNS query rate, and connection counts. Use CloudWatch metrics, VPC Flow Logs
            aggregates and synthetic probes (CloudWatch Synthetics canaries or Network Synthetic
            Monitor-style probes) to measure round-trip time between your Regions, VPCs and sites over
            time. Store baselines with the runbook so deviations after a change are obvious.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Start from requirements (who, how fast, what question, retention) and pick metrics and logs accordingly.",
    "Know the signature metrics per service: VPN TunnelState, DX ConnectionState and light levels, NAT ErrorPortAllocation, ALB 5XX and target response time.",
    "Composite alarms and anomaly detection reduce noise; missing data should be breaching for heartbeat-like metrics.",
    "Capture baselines and read ENA allowance counters when drops have no other explanation.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which metric shows whether a Site-to-Site VPN tunnel is up?",
      options: ["TunnelState", "TunnelDataIn", "BytesOut", "PacketsDropCount"],
      answer: 0,
      explain: "TunnelState is 1 when the tunnel is up and 0 when down.",
    },
    {
      kind: "mcq",
      q: "You want a page only when both tunnels are down. Which feature?",
      options: ["Composite alarm", "Metric filter", "Anomaly detector", "Dashboard widget"],
      answer: 0,
      explain: "Composite alarms evaluate boolean combinations of other alarms.",
    },
    {
      kind: "mcq",
      q: "Instances intermittently drop packets but CPU and security groups look fine. Which data points to an instance-level limit?",
      options: ["ENA allowance exceeded counters", "Route table propagation", "ACM expiry", "Route 53 health check"],
      answer: 0,
      explain: "Counters like pps_allowance_exceeded and conntrack_allowance_exceeded reveal throttling by the instance network stack.",
    },
    {
      kind: "mcq",
      q: "Which metric indicates NAT gateway source port exhaustion?",
      options: ["ErrorPortAllocation", "BytesInFromSource", "ActiveConnectionCount", "PacketsInFromDestination"],
      answer: 0,
      explain: "ErrorPortAllocation counts times the NAT gateway could not allocate a source port.",
    },
    {
      kind: "text",
      q: "What missing-data setting should a heartbeat metric like TunnelState use so silence triggers the alarm?",
      format: "*********",
      accept: ["breaching", "treat as breaching", "treat missing data as breaching"],
      explain: "Treating missing data as breaching causes silence to raise the alarm.",
    },
  ],
};

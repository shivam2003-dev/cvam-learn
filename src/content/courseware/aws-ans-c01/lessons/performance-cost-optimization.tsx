import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Choose the right network interface: ENI, ENA, ENA Express, EFA",
    "Optimize throughput with placement groups, jumbo frames and instance sizing",
    "Reduce data transfer cost using endpoints, locality and caching",
    "Implement multicast and plan subnets and secondary CIDRs for scale",
    "Select the most cost-effective hybrid and inter-VPC connectivity",
  ],
  tasks: [
    {
      id: "nic",
      title: "Network interfaces and throughput",
      body: (
        <>
          <Table
            head={["Interface", "What it is", "Use"]}
            rows={[
              ["ENI (elastic network interface)", "Virtual NIC with IPs, MAC, security groups; attach, detach and move between instances in an AZ", "Management networks, license-bound MAC, failover IP, appliances with multiple subnets"],
              ["ENA (Elastic Network Adapter)", "Enhanced networking driver on Nitro; high bandwidth (up to 100-200 Gbps on large instances), low latency, high PPS", "Default for modern instances"],
              ["ENA Express", "Uses AWS Scalable Reliable Datagram (SRD) to raise single-flow bandwidth to 25 Gbps and cut tail latency inside an AZ", "Single large flows, tail-latency-sensitive apps in the same AZ"],
              ["EFA (Elastic Fabric Adapter)", "ENA plus OS-bypass SRD transport for MPI and NCCL; traffic stays within a subnet and AZ and is not routable", "HPC and distributed ML training"],
              ["Intel 82599 VF (legacy)", "SR-IOV 10 Gbps enhanced networking", "Older instance types"],
            ]}
          />
          <ul>
            <li>A single TCP/UDP flow is limited to about <strong>5 Gbps</strong> outside a cluster placement group and about <strong>10 Gbps</strong> inside one (25 Gbps with ENA Express); use multiple flows to use full instance bandwidth.</li>
            <li><strong>Cluster placement groups</strong> pack instances for low latency and high throughput; <strong>spread</strong> and <strong>partition</strong> favour fault isolation.</li>
            <li>Instance bandwidth has a baseline and a burst; sustained transfers larger than burst throttle to baseline. Pick a larger size or family for sustained throughput.</li>
            <li>Traffic leaving to the internet or over a VPN/IGW is capped lower than intra-VPC bandwidth.</li>
          </ul>
        </>
      ),
    },
    {
      id: "jumbo",
      title: "Jumbo frames and multicast",
      body: (
        <>
          <p>
            Jumbo frames (MTU 9001) reduce per-packet overhead and raise throughput for large
            transfers between instances in a VPC, across peered VPCs, over Transit Gateway (8500) and
            Direct Connect private (9001) or transit (8500) VIFs. Configure the instance interface MTU
            and verify the <em>whole</em> path, because one 1500-byte hop negates it (and, with ICMP
            blocked, causes stalls).
          </p>
          <p>
            <strong>Multicast</strong> delivers one stream to many receivers and so saves bandwidth
            compared with unicast replication. In a VPC it needs a Transit Gateway with multicast
            enabled, a <em>multicast domain</em> associated with subnets, sources and group members
            (static or IGMPv2 dynamic) on Nitro instances. Multicast between a VPC and on-premises
            can be bridged with a GRE/VPN overlay or by an application that re-originates the stream.
          </p>
          <Figure caption="Ways to cut bandwidth and latency, from the application outward.">
            <Layers
              layers={[
                { title: "Application", note: "Compression, protocol efficiency, batching, HTTP/2 and keep-alive", tone: "lime" },
                { title: "Edge", note: "CloudFront caching, Global Accelerator for better paths", tone: "lime" },
                { title: "Placement", note: "Same AZ for chatty tiers, cluster placement groups, ENA Express", tone: "sky" },
                { title: "Frames", note: "Jumbo frames end to end, tuned MSS", tone: "sky" },
                { title: "Replication", note: "Multicast for one-to-many instead of repeated unicast", tone: "amber" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "cost",
      title: "Data transfer and connectivity cost",
      body: (
        <>
          <Table
            head={["Pattern", "Cost driver", "Cheaper alternative"]}
            rows={[
              ["Private subnets to S3/DynamoDB through NAT", "NAT processing per GB", "Gateway endpoints (free)"],
              ["Chatty traffic across AZs", "Inter-AZ transfer both directions", "AZ-local routing, zonal affinity, topology-aware routing"],
              ["Many VPCs through Transit Gateway", "Per-GB processing plus attachment-hours", "Peering for high-volume pairs"],
              ["Large data to on-premises over internet", "Internet egress rates", "Direct Connect (lower per-GB), compress, replicate deltas"],
              ["Static content from origin", "Origin egress", "CloudFront (cheaper egress, caches)"],
              ["Interface endpoints in many VPCs", "Endpoint-hours per AZ per VPC", "Central endpoints in a shared VPC, with shared private DNS"],
              ["Idle NAT gateways, EIPs, endpoints", "Hourly charges", "Automated cleanup, scheduled shutdown for non-prod"],
            ]}
          />
          <Callout tone="note" title="Cost-effective hybrid links">
            For small or bursty data, a Site-to-Site VPN is cheapest. For steady multi-Gbps flows,
            Direct Connect lowers the per-GB rate and gives predictable performance. Hosted
            connections suit smaller capacities. Use Cost Explorer (group by usage type) and
            VPC Flow Logs to find the heavy flows before redesigning.
          </Callout>
        </>
      ),
    },
    {
      id: "subnets",
      title: "Subnet optimization for scale",
      body: (
        <>
          <ul>
            <li>Size subnets for the maximum Auto Scaling capacity plus rolling-update overlap, plus load balancer and endpoint ENIs.</li>
            <li>Spread Auto Scaling groups across at least two AZs and give each AZ subnets of similar size.</li>
            <li>When a subnet is nearly full, add a <strong>secondary CIDR</strong> and new subnets, then update the Auto Scaling group to use them (you cannot resize an existing subnet).</li>
            <li>Use Route 53 <strong>private zonal records</strong> or weighted/latency records so clients prefer endpoints in their own AZ and avoid cross-AZ traffic.</li>
          </ul>
          <Exercise
            title="Reduce the bill and the latency"
            task={<p>A batch cluster moves 80 TB per month between EC2 workers in three AZs and S3 through a NAT gateway, and workers exchange large shuffle data across AZs. Network cost and job time are too high. What do you change?</p>}
          >
            <p>
              Add an S3 <strong>gateway endpoint</strong> so S3 traffic bypasses the NAT gateway
              (removes per-GB NAT processing). Run the cluster in <strong>one AZ in a cluster
              placement group</strong> with ENA Express, if availability allows, to remove inter-AZ
              charges and raise single-flow bandwidth, and use <strong>jumbo frames</strong> inside the
              placement group. Keep a restart plan for AZ failure (checkpoint to S3).
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "ENA is the default fast NIC; ENA Express lifts single flows to 25 Gbps in an AZ; EFA gives OS-bypass transport for HPC/ML inside a subnet.",
    "Single flows are limited (about 5 Gbps, 10 Gbps in a cluster placement group), so parallelize.",
    "Jumbo frames need the whole path; multicast needs Transit Gateway multicast domains and Nitro instances.",
    "Gateway endpoints, AZ locality, CloudFront and peering cut data-transfer costs; secondary CIDRs fix subnet exhaustion.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which interface is designed for MPI and NCCL workloads with OS-bypass networking?",
      options: ["Elastic Fabric Adapter", "Elastic network interface only", "Intel 82599 VF", "NAT gateway"],
      answer: 0,
      explain: "EFA provides OS-bypass SRD transport for HPC and distributed ML.",
    },
    {
      kind: "mcq",
      q: "Private instances send 50 TB per month to S3 through a NAT gateway. What is the cheapest improvement?",
      options: ["S3 gateway endpoint", "Bigger NAT gateway", "CloudFront", "Direct Connect public VIF"],
      answer: 0,
      explain: "Gateway endpoints are free and avoid NAT data processing fees.",
    },
    {
      kind: "mcq",
      q: "What does a cluster placement group optimize?",
      options: ["Low latency and high throughput between instances", "Fault isolation across racks only", "Cross-Region replication", "IP address count"],
      answer: 0,
      explain: "Cluster placement groups pack instances closely in one AZ.",
    },
    {
      kind: "mcq",
      q: "Which AWS component is required for multicast in a VPC?",
      options: ["Transit Gateway with a multicast domain", "VPC peering", "Internet gateway", "NAT gateway"],
      answer: 0,
      explain: "Multicast uses TGW multicast domains and Nitro-based instances.",
    },
    {
      kind: "text",
      q: "What single-flow bandwidth does ENA Express raise a flow to within an AZ (in Gbps)?",
      format: "**",
      accept: ["25", "25 gbps"],
      explain: "ENA Express can increase single-flow bandwidth from 5 to 25 Gbps.",
    },
  ],
};

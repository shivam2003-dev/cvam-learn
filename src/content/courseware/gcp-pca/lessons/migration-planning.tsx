import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 28,
  difficulty: "Medium",
  objectives: [
    "Run a migration lifecycle: assess, plan, migrate, optimize",
    "Choose a migration strategy per workload: rehost, replatform, refactor, repurchase, retire, retain",
    "Select tools: Migration Center, Migrate to Virtual Machines, Database Migration Service, Storage Transfer, Transfer Appliance, VMware Engine",
    "Plan dependencies, network, testing, cutover and rollback",
    "Evaluate licence implications and financial impact",
  ],
  tasks: [
    {
      id: "phases",
      title: "The migration lifecycle",
      body: (
        <>
          <Figure caption="Migration phases. Assessment decides strategy; the plan sets waves; each wave is migrated, validated and optimised.">
            <Flow
              numbered
              steps={[
                { title: "Assess", note: "Inventory, dependencies, TCO with Migration Center", tone: "sky" },
                { title: "Plan", note: "Strategy per workload, waves, landing zone, network", tone: "lime" },
                { title: "Deploy / migrate", note: "Replicate, test, cut over", tone: "amber" },
                { title: "Optimize", note: "Right-size, modernise, operate", tone: "lime" },
              ]}
            />
          </Figure>
          <p>
            The exam guide expects a migration <em>plan</em> with documents and architecture
            diagrams: integration with existing systems, assessment of systems and data, methodology,
            workload testing, network planning, dependency planning, and software licence and
            financial impact.
          </p>
        </>
      ),
    },
    {
      id: "strategies",
      title: "Strategies per workload",
      body: (
        <>
          <Table
            head={["Strategy", "What happens", "Effort / benefit", "Use when"]}
            rows={[
              ["Rehost (lift and shift)", "Move VMs as they are", "Low effort, low cloud-native benefit", "Deadline (data center exit), minimal change; VMware Engine for VMware"],
              ["Replatform (lift and optimise)", "Small changes: managed database, containers", "Medium", "Quick wins such as Cloud SQL instead of self-managed MySQL"],
              ["Refactor (re-architect)", "Rewrite to cloud-native", "High effort, highest long-term benefit", "Strategic apps needing scale and agility"],
              ["Repurchase", "Replace with SaaS", "Variable", "Commodity capability (CRM, HR)"],
              ["Retire", "Switch it off", "Saves cost", "Unused or redundant systems"],
              ["Retain", "Leave on-premises for now", "None", "Compliance, hardware, or not ready"],
            ]}
          />
        </>
      ),
    },
    {
      id: "tools",
      title: "Tools for each asset",
      body: (
        <>
          <Table
            head={["Asset", "Tool", "Notes"]}
            rows={[
              ["Discovery and assessment", "Google Cloud Migration Center", "Discovers servers, collects utilisation, estimates TCO and right-sized Google Cloud targets, plans migration"],
              ["VMs", "Migrate to Virtual Machines", "Continuous replication, test clones, cutover with minimal downtime from VMware, AWS, Azure"],
              ["VMware workloads", "Google Cloud VMware Engine (HCX)", "Keep VMware tooling and IPs; fastest data center exit"],
              ["Containers/VMs to containers", "Migrate to Containers", "Convert supported VMs into container workloads on GKE"],
              ["Databases", "Database Migration Service (homogeneous, and heterogeneous Oracle→PostgreSQL), Datastream", "Continuous replication with minimal downtime; schema conversion"],
              ["Files and objects (network)", "Storage Transfer Service, gcloud storage, Cloud Storage connectors", "Scheduled online transfer from S3, Azure, on-premises; agent for on-prem file systems"],
              ["Large offline data", "Transfer Appliance", "Ship physical storage when bandwidth or time is limited"],
              ["Data warehouse", "BigQuery Migration Service, BigQuery Data Transfer Service", "SQL translation and scheduled loads from Teradata, Redshift, etc."],
            ]}
          />
          <Callout tone="tip" title="Bandwidth arithmetic">
            Moving 100 TB over a dedicated 1 Gbps link at about 80 percent efficiency takes roughly
            12 days; Transfer Appliance takes about the shipping time plus ingest. Always compute the
            transfer time and compare with the deadline and the cost of the link.
          </Callout>
        </>
      ),
    },
    {
      id: "plan",
      title: "Dependencies, testing, licences and cost",
      body: (
        <>
          <ul>
            <li><strong>Dependencies:</strong> map application, data and network dependencies (Migration Center, flow logs, service maps) and move dependent groups together in waves.</li>
            <li><strong>Network planning:</strong> landing zone, IP ranges without overlap, hybrid connectivity during coexistence, DNS strategy, latency between split tiers.</li>
            <li><strong>Testing:</strong> functional, performance and failover tests on test clones; data validation; rollback plan and cutover window; communicate with stakeholders.</li>
            <li><strong>Licensing:</strong> check vendor terms for cloud use; bring-your-own-licence may need sole-tenant nodes; Windows and SQL Server licences can be included in price; some per-core Oracle licensing favours Bare Metal Solution.</li>
            <li><strong>Financial impact:</strong> TCO comparison, one-time migration costs, double-running period, committed use discounts, egress charges, and expected savings from retiring hardware.</li>
          </ul>
          <Exercise
            title="Plan a migration"
            task={<p>A company must exit its data center in 6 months. It has 400 VMs (many on VMware), a 30 TB Oracle database, 80 TB of file archives and a 100 Mbps internet link. How do you approach it?</p>}
          >
            <p>
              Run <strong>Migration Center</strong> to inventory and group dependencies. Because of
              the deadline and VMware use, <strong>rehost the VMware estate to VMware Engine</strong>{" "}
              (or Migrate to Virtual Machines for others). Replatform the Oracle database where
              possible (Database Migration Service to AlloyDB/PostgreSQL if feasible) or retain it on
              Bare Metal Solution for licensing. Order <strong>Partner/Dedicated Interconnect</strong>{" "}
              for coexistence and move the 80 TB with <strong>Transfer Appliance</strong> (100 Mbps
              would take months). Migrate in dependency-based waves with test clones and rollback.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Assess, plan, migrate, optimise; use dependencies to define waves.",
    "Pick rehost, replatform, refactor, repurchase, retire or retain per workload.",
    "Know the tools: Migration Center, Migrate to VMs, VMware Engine, Database Migration Service, Storage Transfer Service, Transfer Appliance.",
    "Compute transfer time, plan network, licences and TCO; always include testing and rollback.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which tool discovers on-premises servers and estimates Google Cloud TCO?",
      options: ["Migration Center", "Transfer Appliance", "Cloud Build", "Cloud Armor"],
      answer: 0,
      explain: "Migration Center discovers assets, assesses fit and estimates cost.",
    },
    {
      kind: "mcq",
      q: "80 TB of archives must reach Google Cloud within a month over a 100 Mbps link. Best option?",
      options: ["Transfer Appliance", "Upload over the internet", "Cloud VPN only", "gsutil from a laptop"],
      answer: 0,
      explain: "At 100 Mbps, 80 TB takes many months; offline transfer is faster.",
    },
    {
      kind: "mcq",
      q: "The fastest way to move VMware workloads with the same IP addresses and tools?",
      options: ["Google Cloud VMware Engine", "Refactor to Cloud Run", "Cloud Functions", "Bare Metal Solution"],
      answer: 0,
      explain: "VMware Engine runs VMware natively with minimal change.",
    },
    {
      kind: "mcq",
      q: "Which migration strategy gives the most long-term cloud-native benefit at the highest effort?",
      options: ["Refactor", "Rehost", "Retain", "Retire"],
      answer: 0,
      explain: "Refactoring re-architects the application for cloud-native capabilities.",
    },
    {
      kind: "text",
      q: "Which service migrates databases with continuous replication and minimal downtime?",
      format: "******** ********* *******",
      accept: ["database migration service", "dms"],
      explain: "Database Migration Service supports continuous replication and cutover.",
    },
  ],
};

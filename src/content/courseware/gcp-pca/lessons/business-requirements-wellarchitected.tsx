import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Medium",
  objectives: [
    "Translate business goals into functional and non-functional requirements",
    "Apply workload disposition strategies: build, buy, modify or deprecate",
    "Use KPIs, ROI and trade-offs to justify a design",
    "Describe the Google Cloud Well-Architected Framework pillars and apply them to decisions",
    "Plan for evolution: cloud-first design and future improvements",
  ],
  tasks: [
    {
      id: "req",
      title: "From business goals to requirements",
      body: (
        <>
          <p>
            Section 1.1 starts with the business. A good architect asks <em>why</em> before{" "}
            <em>what</em>: which product strategy or outcome is the system serving, and how will
            success be measured? Then requirements are separated into:
          </p>
          <Table
            head={["Type", "Questions", "Examples"]}
            rows={[
              ["Functional", "What must the system do?", "Process orders, stream video, score claims, expose an API"],
              ["Non-functional", "How well must it do it?", "Availability 99.95%, p95 latency under 300 ms, RPO 5 min, RTO 1 hour, throughput 10k rps"],
              ["Constraints", "What limits the solution?", "Budget, deadlines, skills, existing contracts, data residency, licensing"],
              ["Compliance and security", "What rules apply?", "HIPAA, PCI DSS, GDPR, encryption keys under customer control"],
              ["Integration", "What must it connect to?", "ERP, on-premises databases, partner APIs, identity providers"],
            ]}
          />
          <CloudDiagram course="gcp-pca" id="business-requirements-wellarchitected-diagram-1" />
        </>
      ),
    },
    {
      id: "disposition",
      title: "Workload disposition and trade-offs",
      body: (
        <>
          <p>
            For each existing application decide its disposition: <strong>build</strong> a new cloud
            native one, <strong>buy</strong> SaaS or a marketplace product,{" "}
            <strong>modify</strong> (rehost, replatform or refactor an existing one), or{" "}
            <strong>deprecate</strong> it. Retiring unused systems is often the highest-ROI step.
          </p>
          <ul>
            <li><strong>Success measurements:</strong> KPIs tied to the goal (conversion rate, claims per hour), ROI and payback period, TCO versus current cost, and technical metrics such as SLO attainment and cost per transaction.</li>
            <li><strong>Trade-offs:</strong> cost versus availability (multi-region doubles spend), consistency versus latency, managed service versus control, speed of delivery versus long-term maintainability. State the trade-off and why the choice fits <em>this</em> business.</li>
            <li><strong>Business continuity:</strong> define RTO and RPO per workload and size the design to them, no more.</li>
            <li><strong>Observability, security and compliance</strong> are requirements from day one, not add-ons.</li>
            <li><strong>Integration and data movement:</strong> pick patterns (APIs, events through Pub/Sub, batch transfer, CDC with Datastream) to connect external systems and move data.</li>
          </ul>
        </>
      ),
    },
    {
      id: "waf",
      title: "The Well-Architected Framework",
      body: (
        <>
          <p>
            The Google Cloud Well-Architected Framework provides guidance for designing, building and
            operating reliable, secure, efficient and cost-optimized workloads. The exam guide lists
            its pillars, which are woven through the exam objectives:
          </p>
          <CloudDiagram course="gcp-pca" id="business-requirements-wellarchitected-diagram-2" />
          <Callout tone="tip" title="Using the pillars on the exam">
            When two options both work, ask which pillar the question emphasises (words like
            &ldquo;most cost-effective&rdquo;, &ldquo;most reliable&rdquo;, &ldquo;least operational
            overhead&rdquo;, &ldquo;most secure&rdquo;) and choose the option that serves it without
            breaking a stated requirement. Managed and serverless services usually win on
            operational excellence.
          </Callout>
        </>
      ),
    },
    {
      id: "future",
      title: "Future improvements and cloud-first design",
      body: (
        <>
          <ul>
            <li><strong>Cloud-first:</strong> prefer managed, scalable, serverless-where-possible services; design for horizontal scale, statelessness and automation.</li>
            <li><strong>Plan for change:</strong> loosely coupled components, APIs and event streams so parts can evolve; avoid lock-in where it costs more than it saves; use open standards (Kubernetes, Apache Beam, PostgreSQL compatibility) where portability matters.</li>
            <li><strong>Technology improvements:</strong> new instance families, newer database editions and generative AI features. Schedule periodic architecture reviews and use Recommender and Gemini Cloud Assist insights.</li>
            <li><strong>Business evolution:</strong> new regions, acquisitions, regulations. Keep landing zone, IAM and network designs extensible.</li>
          </ul>
          <Exercise
            title="Justify a decision"
            task={<p>A retailer must support a 10x Black Friday spike. The team is small. Compare running the storefront on self-managed VMs versus Cloud Run in terms of the framework pillars.</p>}
          >
            <p>
              <strong>Operational excellence:</strong> Cloud Run removes patching and capacity
              management; VMs require MIG, images, patching. <strong>Reliability and
              performance:</strong> Cloud Run autoscales quickly, with min instances to avoid cold
              starts; VMs need autoscaler tuning and pre-warming. <strong>Cost:</strong> Cloud Run
              scales to zero and bills per use; VMs cost less per unit at steady high load (with
              committed use discounts) but waste at low load. <strong>Security:</strong> both can be
              secured; Cloud Run reduces the attack surface to patch. Recommend Cloud Run unless the
              workload needs unsupported runtimes, long-lived local state or specialised hardware.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Convert business goals into measurable functional and non-functional requirements, with explicit constraints.",
    "Disposition each workload: build, buy, modify or deprecate; justify with KPIs, ROI and TCO.",
    "The framework pillars: operational excellence, security, reliability, cost optimization, performance optimization, sustainability.",
    "Always state the trade-off; prefer managed, cloud-first designs unless a requirement says otherwise.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which is a non-functional requirement?",
      options: ["p95 latency under 300 ms", "Users can reset their password", "The system sends invoices", "Orders can be cancelled"],
      answer: 0,
      explain: "Latency targets describe how well the system performs, not what it does.",
    },
    {
      kind: "mcq",
      q: "A legacy application is rarely used and duplicates a SaaS capability. Which disposition fits?",
      options: ["Deprecate (or buy SaaS)", "Refactor to microservices", "Rehost to a larger VM", "Build a new custom version"],
      answer: 0,
      explain: "Retiring or replacing low-value systems is often the highest ROI action.",
    },
    {
      kind: "mcq",
      q: "Which pillar addresses defence in depth, least privilege and compliance?",
      options: ["Security, privacy and compliance", "Cost optimization", "Performance optimization", "Sustainability"],
      answer: 0,
      explain: "The security pillar covers protecting data, identity and meeting regulation.",
    },
    {
      kind: "mcq",
      q: "A question says 'least operational overhead'. Which option usually fits?",
      options: ["A managed or serverless service", "Self-managed VMs with custom scripts", "Bare metal servers", "A custom Kubernetes distribution"],
      answer: 0,
      explain: "Managed services reduce operational effort, which is the operational excellence goal.",
    },
    {
      kind: "text",
      q: "Which disposition means replacing a system with a commercial product?",
      format: "***",
      accept: ["buy", "buy it"],
      explain: "Build, buy, modify or deprecate: buy means adopt SaaS or a purchased product.",
    },
  ],
};

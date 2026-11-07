import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Manage stakeholders, influence decisions and facilitate trade-off discussions",
    "Plan change management and assess team skills readiness",
    "Explain CapEx versus OpEx and build a TCO and ROI case",
    "Apply FinOps practices and Google Cloud cost tools and discounts",
    "Link customer success and business continuity to architecture",
  ],
  tasks: [
    {
      id: "people",
      title: "Stakeholders, change and skills",
      body: (
        <>
          <p>
            Section 4.2 tests the soft side of architecture. A design succeeds only if the
            organization adopts it.
          </p>
          <Table
            head={["Topic", "What good looks like"]}
            rows={[
              ["Stakeholder management", "Identify sponsors, decision makers, operators, security, finance and users; understand each one's goal and fear; use influence and facilitation (workshops, demos, written options with trade-offs) rather than authority"],
              ["Decision-making", "State options, criteria and weights; record decisions (architecture decision records); escalate unresolved trade-offs with data"],
              ["Change management", "Communicate early; pilot with a friendly team; train; provide support channels; plan cutovers and rollbacks; measure adoption"],
              ["Team skills readiness", "Assess skills against the target platform (Kubernetes, Terraform, SRE); close gaps with training, certification, pairing and partners; choose managed services when skills are thin"],
              ["Customer success", "Define success metrics with the customer, track outcomes after launch, run regular reviews, feed learnings back"],
              ["Business continuity", "Tie architecture to continuity plans: critical processes, RTO/RPO, communication, roles, tested runbooks"],
            ]}
          />
          <Callout tone="tip" title="Frame the answer to the audience">
            Executives want outcomes, risk and cost; engineers want constraints and interfaces;
            security wants controls and evidence; operations wants runbooks and SLOs. Exam questions
            that ask what to do <em>first</em> with a sceptical stakeholder usually reward listening,
            clarifying requirements and showing evidence through a small proof of concept.
          </Callout>
        </>
      ),
    },
    {
      id: "money",
      title: "CapEx, OpEx and building the business case",
      body: (
        <>
          <ul>
            <li><strong>CapEx</strong> is up-front investment in assets (hardware, data centers) depreciated over time; <strong>OpEx</strong> is ongoing consumption-based spending. Cloud shifts spend toward OpEx, improves elasticity and reduces over-provisioning, but needs discipline to avoid waste.</li>
            <li><strong>TCO</strong> compares all costs: hardware, facilities, power, licences, staff, support, downtime risk, versus cloud consumption, migration and training. Use Migration Center and the pricing calculator.</li>
            <li><strong>ROI</strong> compares benefits (revenue, speed to market, avoided cost, risk reduction) to investment; include payback period and sensitivity.</li>
            <li><strong>Hidden costs:</strong> egress, inter-region traffic, support plans, double-running during migration, retraining.</li>
          </ul>
        </>
      ),
    },
    {
      id: "finops",
      title: "FinOps on Google Cloud",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="business-processes-finops-diagram-1" />
          <Exercise
            title="Cut the bill"
            task={<p>Monthly cloud spend rose 40 percent. Dev and test projects run 24/7, a large BigQuery table is queried with SELECT *, and steady production VMs run on-demand. Propose actions.</p>}
          >
            <p>
              Visibility first: billing export and labels to attribute cost. Schedule dev/test
              shutdowns (or Spot VMs and autoscaling to zero). Fix BigQuery with partitioning,
              clustering, required partition filters and column selection, and consider capacity
              pricing if usage is steady. Cover baseline production with <strong>committed use
              discounts</strong> after right-sizing with Recommender. Set budgets, alerts and a
              monthly FinOps review.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Architects influence through listening, options with trade-offs, evidence and facilitation.",
    "Plan change management and skills readiness; choose managed services where skills are thin.",
    "Build a TCO and ROI case that includes hidden and migration costs; understand CapEx versus OpEx.",
    "FinOps: visibility, waste removal, right-sizing, discounts and governance.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A sceptical executive questions a cloud migration. What is the best first step?",
      options: ["Clarify their concerns and present TCO/risk evidence, maybe with a pilot", "Insist on the plan", "Skip the stakeholder", "Increase scope"],
      answer: 0,
      explain: "Understanding concerns and showing evidence builds trust and informs decisions.",
    },
    {
      kind: "mcq",
      q: "Which discount fits steady baseline VM usage?",
      options: ["Committed use discounts", "Spot VMs", "Free tier", "Sole tenancy"],
      answer: 0,
      explain: "Commitments reduce the price of predictable usage.",
    },
    {
      kind: "mcq",
      q: "How do you attribute costs to teams?",
      options: ["Projects, folders and labels with billing export to BigQuery", "A single project for all", "Manual spreadsheets only", "Cloud Armor"],
      answer: 0,
      explain: "Structure and labels plus billing export enable allocation and showback.",
    },
    {
      kind: "mcq",
      q: "Cloud migration usually moves spending toward:",
      options: ["OpEx", "CapEx", "No cost", "Fixed cost only"],
      answer: 0,
      explain: "Pay-as-you-go consumption is an operating expense model.",
    },
    {
      kind: "text",
      q: "What does TCO stand for?",
      format: "***** **** ** ***********",
      accept: ["total cost of ownership"],
      explain: "Total cost of ownership.",
    },
  ],
};

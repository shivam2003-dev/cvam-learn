import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Break a human-run disruption process into steps and decide which need judgment",
    "Separate deterministic work (code) from fuzzy work (models) from approvals (people)",
    "Identify candidate agent roles and justify each one",
    "List the data, tools and permissions the system needs",
    "Define success in operational terms: time to resolution, cost and service level",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <Callout tone="note" title="Customer request">
            &ldquo;We are a freight forwarder moving about 4,000 shipments a day across ocean, air and
            road. When something goes wrong (a port closure, a missed connection, a customs hold), a
            planner spends an hour checking carrier systems, finding options, working out the cost
            and emailing customers. We have 15 planners and cannot hire more. We want an AI agent
            that handles disruptions. Nobody wants it rebooking cargo on its own on day
            one.&rdquo;
          </Callout>
          <p>
            Compared with the document assistant, this problem has <strong>actions</strong>. The
            system must not only read and answer; it must find options, estimate their consequences
            and eventually change bookings. That raises the stakes on safety, approvals and
            reliability, and makes it a natural candidate for a multi-agent design, if and only if
            decomposition shows that several agents are justified.
          </p>
        </>
      ),
    },
    {
      id: "process",
      title: "Map the human process first",
      body: (
        <>
          <p>
            Shadow two planners through a disruption. Write down the real steps, the data touched,
            and the time spent. A typical result:
          </p>
          <DiagramReference lesson="shipment-decompose" panel={1} />
          <Table
            head={["Step", "Kind of work", "Best implemented as"]}
            rows={[
              ["Detect and enrich", "Deterministic: event in, record lookup", "Code (event handler)"],
              ["Assess impact", "Rules: deadlines, penalties, service levels", "Code with business rules; model only to read free-text notes"],
              ["Find alternatives", "Open-ended: which carriers, modes and routes might work", "Agent(s) with carrier tools; this is where a model adds value"],
              ["Cost and time estimate", "Arithmetic on known rates", "Code; never let the model compute prices"],
              ["Rank and explain", "Judgment and language", "Model, constrained by rules and with reasons"],
              ["Approve", "Accountability for money and customer promises", "Human"],
              ["Execute and notify", "Irreversible; side effects", "Code behind approval, then a drafted message a human can edit"],
            ]}
          />
        </>
      ),
    },
    {
      id: "roles",
      title: "Do we need several agents?",
      body: (
        <>
          <p>
            Apply the test from the orchestration lesson. Only the middle of the process is open-ended;
            the rest is rules or approvals. A candidate decomposition:
          </p>
          <DiagramReference lesson="shipment-decompose" panel={2} />
          <p>Justification for two agents rather than one:</p>
          <ul>
            <li>
              <strong>Different permissions.</strong> The search agent only reads carrier and
              schedule data. The ranking agent reads internal contracts and cost data. Neither can
              execute bookings. Splitting limits what a mistake or an injected instruction can do.
            </li>
            <li>
              <strong>Context isolation.</strong> Carrier responses are large and noisy. The search
              agent condenses them into a short structured list before the ranking agent sees them.
            </li>
            <li>
              <strong>Parallelism.</strong> Searching three carriers can happen at once.
            </li>
          </ul>
          <p>
            Without these reasons, a single agent with a few tools would be simpler. Being able to say
            this in an interview is exactly the point.
          </p>
        </>
      ),
    },
    {
      id: "requirements",
      title: "Data, tools, permissions and success",
      body: (
        <>
          <Table
            head={["Need", "Detail", "Notes"]}
            rows={[
              ["Data", "Shipment records, contracts and penalty terms, customer priority, carrier schedules, rate cards", "Quality of rate and schedule data limits everything"],
              ["Read tools", "get_shipment, search_routes(carrier), get_rate, get_contract_terms", "Read-only; log every call"],
              ["Write tools", "create_booking, cancel_booking, send_customer_notice", "Behind approval; idempotent; amount and scope limits"],
              ["Permissions", "Search agent: read carriers. Ranking agent: read contracts and costs. Only the executor writes", "Least privilege per role"],
              ["Constraints", "Dangerous goods, temperature control, customs rules, capacity", "Hard constraints in code, not in prompts"],
            ]}
          />
          <Table
            head={["Metric", "Baseline", "Pilot target"]}
            rows={[
              ["Time from alert to approved plan", "~55 min", "Under 15 min"],
              ["Cost of chosen option versus best known afterwards", "Not measured", "Within 5% on average"],
              ["Share of plans accepted unchanged by planners", "n/a", "Above 60% after four weeks"],
              ["Contract penalties from disruptions", "Current monthly total", "Reduced by 15%"],
              ["Unsafe or infeasible plans reaching approval", "n/a", "Zero (hard-constraint checks)"],
            ]}
          />
          <Exercise
            title="Challenge the decomposition"
            task={
              <p>
                A teammate suggests one &ldquo;super agent&rdquo; with all tools, including booking,
                which would be simpler to build. Give two risks of that design and one condition under
                which you would accept it.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Blast radius:</strong> an agent with read, cost and write tools can be misled
                by a malicious or erroneous carrier response into booking something harmful. Splitting
                permissions contains the damage.
              </li>
              <li>
                <strong>Context overload and reliability:</strong> raw carrier outputs would crowd the
                single agent&apos;s context, and a long chain of tool calls compounds errors.
              </li>
            </ol>
            <p>
              <strong>Accept it if:</strong> the pilot is read-only with no write tools (it only
              drafts options), volumes are small, and the team agrees to split the design when write
              actions are added.
            </p>
          </Exercise>
          <DiagramReference lesson="shipment-decompose" panel={3} />
        </>
      ),
    },
  ],
  takeaways: [
    "Map the human process first, then classify each step as rules, open-ended reasoning or approval.",
    "Use code for rules and arithmetic, models for open-ended search and judgment, and people for accountable decisions.",
    "Justify multiple agents by permissions, context isolation and parallelism, not by metaphor.",
    "Define tools, read and write permissions, hard constraints and operational success metrics.",
    "Roll out in stages: advise, recommend, then act on low-risk lanes.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which part of the disruption process is best done by plain code rather than an agent?",
      options: [
        "Cost calculation from rate cards",
        "Exploring unknown alternative routes",
        "Explaining trade-offs in language",
        "Reading free-text notes",
      ],
      answer: 0,
      explain: "Arithmetic on known rates should be exact and deterministic, not left to a model.",
    },
    {
      kind: "mcq",
      q: "What is a strong reason to separate the search agent from the ranking agent?",
      options: [
        "Different permissions and context isolation of large carrier outputs",
        "It makes the diagram look larger",
        "Agents cannot use more than one tool",
        "Models require pairs",
      ],
      answer: 0,
      explain: "Least privilege and condensed handoffs are concrete design benefits.",
    },
    {
      kind: "mcq",
      q: "Why should hard constraints such as dangerous-goods rules live in code?",
      options: [
        "Prompts can be ignored or bypassed; code enforces them reliably",
        "Code runs faster than prompts only",
        "Models cannot read rules",
        "Constraints are optional",
      ],
      answer: 0,
      explain: "Safety-critical limits must be enforced, not requested.",
    },
    {
      kind: "mcq",
      q: "What is a sensible first pilot stage for a system that could rebook cargo?",
      options: [
        "Advise only: draft options for planners with no write access",
        "Full autonomous rebooking on all lanes",
        "Rebooking without logs",
        "Customer-facing emails only",
      ],
      answer: 0,
      explain: "Start read-only to build evidence before any write actions are allowed.",
    },
    {
      kind: "text",
      q: "Baseline alert-to-plan time is 55 minutes and the target is 15. By how many minutes is it reduced?",
      format: "**",
      accept: ["40", "40 minutes", "40 min"],
      explain: "55 - 15 = 40 minutes.",
    },
  ],
};

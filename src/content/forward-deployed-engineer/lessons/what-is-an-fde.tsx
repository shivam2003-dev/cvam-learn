import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Define what a Forward Deployed Engineer does and where the role came from",
    "Separate the FDE role from software engineer, solutions engineer and consultant",
    "List the core responsibilities across an engagement",
    "Recognise the traits that make FDEs effective",
  ],
  tasks: [
    {
      id: "definition",
      title: "What an FDE is",
      body: (
        <>
          <p>
            A <strong>Forward Deployed Engineer</strong> (FDE) is a software engineer who works
            directly with customers, often inside their organisation, to turn a general product
            into a working solution for a specific, messy problem. The word <em>forward</em> means
            close to the front line: where the customer's data, people and systems actually live.
          </p>
          <p>
            The role was popularised by Palantir, whose engineers sat with governments and
            enterprises to wire the platform into real operations. It has since spread to AI
            companies, because deploying models into a customer's business has the same shape:
            the technology is ready, but the last stretch of fit, integration and trust is hard.
          </p>
          <Callout tone="note">
            An FDE is judged on customer outcomes, not lines of code. A small script that unblocks
            a hospital's intake process beats an elegant system nobody adopts.
          </Callout>
        </>
      ),
    },
    {
      id: "compare",
      title: "How it differs from nearby roles",
      body: (
        <>
          <Table
            head={["Role", "Main output", "Customer contact", "Code ownership"]}
            rows={[
              ["Software engineer", "Product features for many customers", "Low, through product", "Core product"],
              ["Solutions engineer", "Demos, proofs of concept, technical sales", "High, before the sale", "Throwaway or light"],
              ["Consultant", "Advice, designs, reports", "High", "Often none"],
              ["Forward deployed engineer", "Working software in the customer's environment", "Very high, before and after the sale", "Real, production code"],
            ]}
          />
          <p>
            The FDE sits in the middle: hands-on like an engineer, customer-facing like a
            consultant, and accountable for results after go-live like an operator. Many teams
            describe the loop as <em>build for one customer, learn, then feed the pattern back
            into the product</em>.
          </p>
        </>
      ),
    },
    {
      id: "responsibilities",
      title: "Responsibilities across an engagement",
      body: (
        <>
          <ul>
            <li>
              <strong>Discover.</strong> Interview users, map the workflow, find what actually
              hurts. Covered in the discovery module.
            </li>
            <li>
              <strong>Scope.</strong> Turn a vague wish into a first slice that can ship in weeks.
            </li>
            <li>
              <strong>Build and integrate.</strong> Write code, connect to existing systems, move
              data, configure the product.
            </li>
            <li>
              <strong>Deploy and operate.</strong> Get it running in the customer's cloud or
              on-premise setup, secure it, monitor it.
            </li>
            <li>
              <strong>Prove value.</strong> Measure the result and report it in terms the
              customer's leaders care about.
            </li>
            <li>
              <strong>Feed back.</strong> Tell the product team what you built twice, so it
              becomes a feature.
            </li>
          </ul>
          <Callout tone="tip">
            Keep a running "what I built that should be product" list. It is the most valuable
            thing an FDE hands back to the company.
          </Callout>
        </>
      ),
    },
    {
      id: "traits",
      title: "Traits that matter",
      body: (
        <>
          <ul>
            <li>
              <strong>Range over depth.</strong> You will touch frontend, SQL, auth, cloud and
              prompts in one week. Depth in one area helps, but you must be able to learn the rest
              fast.
            </li>
            <li>
              <strong>Ownership.</strong> When something is broken at the customer, it is yours
              until it works, even if the cause is another team's system.
            </li>
            <li>
              <strong>Clear communication.</strong> You translate between engineers and
              executives, and you write things down.
            </li>
            <li>
              <strong>Comfort with ambiguity.</strong> Requirements arrive half-formed. You ask
              good questions instead of waiting for a spec.
            </li>
            <li>
              <strong>Judgment about scope.</strong> Saying "not in this phase" kindly is a skill.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "An FDE ships working software inside the customer's environment and owns the outcome.",
    "It sits between software engineering, solutions engineering and consulting.",
    "The loop is discover, scope, build, deploy, prove value, feed back to product.",
    "Range, ownership, communication and scoping judgment matter as much as raw coding.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What most clearly separates an FDE from a solutions engineer?",
      options: [
        "FDEs never talk to customers",
        "FDEs write and own production code in the customer's environment",
        "FDEs only build demos",
        "FDEs only write documentation",
      ],
      answer: 1,
      explain: "Solutions engineers often build throwaway demos before a sale. FDEs build real, owned software and stay accountable after go-live.",
    },
    {
      kind: "mcq",
      q: "An FDE has built the same data-cleaning step for three customers. What should they do?",
      options: [
        "Keep it private so they stay indispensable",
        "Tell the product team so it can become a feature",
        "Delete it after each project",
        "Charge extra for it each time",
      ],
      answer: 1,
      explain: "Repeated custom work is a product signal. Feeding it back is a core part of the role.",
    },
    {
      kind: "mcq",
      q: "Which company popularised the forward deployed engineer role?",
      options: ["Palantir", "Oracle", "Slack", "Stripe"],
      answer: 0,
      explain: "Palantir embedded engineers with customers to fit its platform to real operations, and the model spread from there.",
    },
  ],
};

import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Understand what applied AI roles at a safety-focused AI company are likely to involve",
    "Prepare themes that such roles stress: reliability, evaluation, responsible deployment and clear communication",
    "Practise discussing safety trade-offs concretely and without hype",
    "Build and present work that shows careful measurement",
    "Verify the current process from official sources",
  ],
  tasks: [
    {
      id: "context",
      title: "The role in context",
      body: (
        <>
          <Callout tone="warn" title="Verify before you rely on this">
            This guide uses public themes of applied AI roles and general advice only. It does not
            describe any private interview content. Read the current job description, the
            company&apos;s published research and engineering posts, and its documentation before
            preparing.
          </Callout>
          <p>
            At a lab that builds and serves language models, applied AI roles generally sit between
            customers and the product and research teams: helping organisations adopt the models in
            production, shaping reference architectures, writing guidance, building evaluations and
            demonstrations, and relaying what customers need back to the company. Public material
            from such companies often emphasises careful, honest measurement, agentic and tool-use
            patterns, and responsible deployment.
          </p>
        </>
      ),
    },
    {
      id: "themes",
      title: "Themes to prepare",
      body: (
        <>
          <Figure caption="Themes worth preparing for applied roles at a safety-conscious AI company. The upper layers are less about code and more about judgment.">
            <Layers
              layers={[
                { title: "Honest communication", note: "Calibrated claims, clear about limits and uncertainty, no hype; able to say what a system cannot do.", tone: "amber" },
                { title: "Responsible deployment", note: "Misuse and failure analysis, guardrails, human oversight, privacy and data handling, escalation paths.", tone: "amber" },
                { title: "Evaluation rigour", note: "Datasets, graders, sample sizes, error analysis, avoiding overfitting to your tests.", tone: "lime" },
                { title: "Agents and tool use", note: "Designing harnesses, tools, context and permissions; debugging long-running tasks.", tone: "lime" },
                { title: "Production engineering", note: "Reliability, latency, cost, observability, deployment in customer environments.", tone: "sky" },
                { title: "Teaching and enablement", note: "Writing clear guides and examples that help other engineers succeed.", tone: "sky" },
              ]}
            />
          </Figure>
          <Table
            head={["Theme", "Preparation activity"]}
            rows={[
              ["Evaluation rigour", "Build an eval for a task; report confidence, failure categories and what you would not conclude from it"],
              ["Agents and tool use", "Build a small agent with two or three tools, step limits, a trace and a failure analysis"],
              ["Context engineering", "Practise diagnosing failed runs by reading the exact context; fix with context changes, not only prompt wording"],
              ["Safety thinking", "For each system you build, write a short misuse and failure analysis with mitigations"],
              ["Writing", "Publish a clear technical write-up of a project, as if teaching a new engineer"],
              ["Customer empathy", "Practise explaining model limits to a sceptical executive without jargon"],
            ]}
          />
        </>
      ),
    },
    {
      id: "map",
      title: "How the pieces connect in an applied role",
      body: (
        <>
          <Figure caption="An applied AI engineer's position. Value comes from moving information in both directions: customer needs inward, validated patterns outward.">
            <Graph
              label="Applied AI engineer between customers, product and research teams, and documentation and examples that help the wider community of developers"
              cellW={210}
              cellH={104}
              nodeW={172}
              nodes={[
                { id: "cust", label: "Customers", sub: "Problems, constraints, data", col: 0, row: 1, tone: "amber", shape: "pill" },
                { id: "me", label: "Applied AI engineer", sub: "Build, evaluate, advise", col: 1.5, row: 1, tone: "lime", w: 180 },
                { id: "prod", label: "Product and research", sub: "Models, features, safety", col: 3, row: 0, tone: "sky" },
                { id: "docs", label: "Docs, guides, examples", sub: "Reusable patterns", col: 3, row: 2, tone: "sky" },
              ]}
              edges={[
                { from: "cust", to: "me", label: "needs" },
                { from: "me", to: "cust", dashed: true, bend: 30, label: "solutions" },
                { from: "me", to: "prod", label: "feedback" },
                { from: "me", to: "docs", label: "patterns" },
                { from: "prod", to: "me", dashed: true, bend: 24 },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "practice",
      title: "Practice prompts",
      body: (
        <>
          <Exercise
            title="Safety-minded design"
            task={
              <p>
                A customer wants an agent that can read employees&apos; email and calendar and book
                meetings, send replies and file expense reports. Describe the main risks and your
                design response in five minutes.
              </p>
            }
          >
            <p>
              <strong>Risks:</strong> prompt injection from incoming email leading to data
              exfiltration or unwanted actions; over-broad permissions; mistakes with real-world
              consequences (declined meetings, wrong expense amounts); privacy of sensitive mail.
            </p>
            <p>
              <strong>Design:</strong> least-privilege scopes per tool; separate reading of untrusted
              content from tools that act; approval for anything outbound or financial; draft-first
              behaviour; allow-listed recipients; step limits and an audit trail; evaluation with
              adversarial emails; a rollout that begins with read-only summaries and expands
              capabilities as measured reliability allows; clear user-facing explanations of what the
              agent will and will not do.
            </p>
            <p>
              <strong>Tone:</strong> measured and concrete. Name residual risk honestly rather than
              claiming it is eliminated.
            </p>
          </Exercise>
          <Exercise
            title="Calibrated claims"
            task={
              <p>
                You ran an evaluation: 87 of 100 test cases passed. A customer asks, &ldquo;So it is
                87% accurate?&rdquo; How do you answer?
              </p>
            }
          >
            <p>
              &ldquo;On these 100 cases, 87 passed. With a sample that size the true rate could
              plausibly be anywhere from the high seventies to the low nineties, so I would treat it as
              roughly 80 to 90 percent, not exactly 87. The cases were also written by us, so real
              traffic may differ. I would like to run it on a larger sample of your actual requests,
              look at the 13 failures to see which are fixable, and report results by category, since
              the average hides where it is weak.&rdquo;
            </p>
            <p>
              The answer shows statistical humility, awareness of test-set limitations, and a concrete
              plan, which is the posture applied roles tend to value.
            </p>
          </Exercise>
          <Callout tone="tip" title="Questions you might ask">
            &ldquo;How does the team decide when a customer use case needs additional safeguards?&rdquo;
            &ldquo;How are customer evaluation findings fed back to model and product teams?&rdquo;
            &ldquo;What does good written guidance for developers look like here?&rdquo;
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Applied AI roles sit between customers and product or research teams, with emphasis on evaluation, agents, deployment and enablement.",
    "Prepare evaluation rigour, agent and tool design, context engineering, safety analysis, writing and customer empathy.",
    "Discuss risk concretely and honestly: name residual risks, give calibrated claims, avoid hype.",
    "Build projects that show how you measured quality and what you would not conclude from the results.",
    "Verify current process details from official, recent sources.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "87 of 100 cases passed. Which response is most calibrated?",
      options: [
        "Roughly 80 to 90 percent on this sample; test on a larger, real sample and analyse the failures",
        "Exactly 87% in production",
        "100% accurate",
        "Accuracy cannot be discussed",
      ],
      answer: 0,
      explain: "Small samples have wide uncertainty, and test-set limits should be acknowledged.",
    },
    {
      kind: "mcq",
      q: "Which mitigation best limits risk from prompt injection in an email agent?",
      options: [
        "Separate untrusted reading from acting tools and require approval for outbound actions",
        "A stern system prompt only",
        "Giving the agent every permission",
        "Hiding the emails",
      ],
      answer: 0,
      explain: "Capability separation and approvals do not rely on the model resisting manipulation.",
    },
    {
      kind: "mcq",
      q: "What does 'calibrated claims' mean?",
      options: [
        "Stating confidence that matches the evidence, including limits and uncertainty",
        "Claiming the highest number possible",
        "Avoiding numbers entirely",
        "Repeating marketing language",
      ],
      answer: 0,
      explain: "Calibrated communication builds trust with customers and colleagues.",
    },
    {
      kind: "text",
      q: "What word describes limiting an agent to only the permissions it needs? (two words, 'least ...')",
      format: "***** *********",
      accept: ["least privilege", "least-privilege"],
      explain: "Least privilege reduces the damage possible from errors or attacks.",
    },
  ],
};

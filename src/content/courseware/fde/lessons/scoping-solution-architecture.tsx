import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Break a problem into thin vertical slices and choose the first one",
    "Prioritise work by value, effort, risk and dependency",
    "Draw a solution architecture with trust boundaries the customer can review",
    "Decide what to build, what to configure, and what to buy or reuse",
    "Record decisions and risks so scope changes can be handled calmly",
  ],
  tasks: [
    {
      id: "slicing",
      title: "Scope by slices, not layers",
      body: (
        <>
          <p>
            Once discovery is confirmed, you have a problem and a goal. Scoping answers a different
            question: <em>what is the smallest thing we can build that proves the idea on real data?</em>
          </p>
          <p>
            The classic mistake is to plan by layers: first the data pipeline, then the model, then the
            interface. It feels orderly, but nothing is usable until every layer is finished, and
            integration problems appear at the very end, when there is no time left to fix them.
          </p>
          <p>
            Plan by <strong>vertical slices</strong> instead. A slice goes through every layer for one
            narrow case: one document type, one team, one workflow. A slice is useful on its own and
            teaches you about every layer immediately.
          </p>

          <Figure caption="Layers versus slices for the same project. Slice 1 touches every layer for a narrow case and is demonstrable in the first sprint.">
            <Graph
              label="Comparison of layer-by-layer planning with vertical slice planning"
              cellW={172}
              cellH={92}
              nodeW={142}
              nodes={[
                { id: "l1", label: "Data pipeline", col: 0, row: 0, tone: "rose" },
                { id: "l2", label: "Model", col: 0, row: 1, tone: "rose" },
                { id: "l3", label: "Interface", col: 0, row: 2, tone: "rose" },
                { id: "s1d", label: "Data: 1 source", col: 1, row: 0, tone: "lime" },
                { id: "s1m", label: "Model: 1 task", col: 2, row: 0, tone: "lime" },
                { id: "s1i", label: "UI: 1 screen", col: 3, row: 0, tone: "lime" },
                { id: "s2d", label: "Data: 3 sources", col: 1, row: 1, tone: "sky" },
                { id: "s2m", label: "Model: tuned", col: 2, row: 1, tone: "sky" },
                { id: "s2i", label: "UI: review queue", col: 3, row: 1, tone: "sky" },
                { id: "s3d", label: "Data: all feeds", col: 1, row: 2, tone: "plain" },
                { id: "s3m", label: "Model: at scale", col: 2, row: 2, tone: "plain" },
                { id: "s3i", label: "UI: rollout", col: 3, row: 2, tone: "plain" },
              ]}
              groups={[
                { label: "By layers (risky)", c1: 0, r1: 0, c2: 0, r2: 2, tone: "rose" },
                { label: "Slice 1: works in sprint 1", c1: 1, r1: 0, c2: 3, r2: 0, tone: "lime" },
                { label: "Slice 2: grows it", c1: 1, r1: 1, c2: 3, r2: 1, tone: "sky" },
                { label: "Slice 3: scale out", c1: 1, r1: 2, c2: 3, r2: 2, tone: "plain" },
              ]}
              edges={[
                { from: "l1", to: "l2" },
                { from: "l2", to: "l3" },
                { from: "s1d", to: "s1m" },
                { from: "s1m", to: "s1i" },
                { from: "s2d", to: "s2m" },
                { from: "s2m", to: "s2i" },
                { from: "s3d", to: "s3m" },
                { from: "s3m", to: "s3i" },
              ]}
            />
          </Figure>

          <p>Good slices share a few properties:</p>
          <ul>
            <li>They run on <strong>real</strong> data and real systems, not mock data.</li>
            <li>A real user can try them and give feedback.</li>
            <li>They are small enough to finish in one to two weeks.</li>
            <li>They test the riskiest assumption first.</li>
          </ul>
        </>
      ),
    },
    {
      id: "prioritise",
      title: "Choose what comes first",
      body: (
        <>
          <p>
            You will have many candidate pieces of work. Rank them on four things: how much value they
            deliver, how much effort they take, how risky they are, and what depends on them.
          </p>

          <Figure caption="Value against effort for candidate work items. Start in the top left (high value, low effort); start risky items early even if they sit elsewhere.">
            <Quadrant
              label="Candidate work items plotted by effort and value"
              xLabel="Effort"
              yLabel="Value"
              corners={["Do first", "Plan carefully", "Quick extras", "Avoid for now"]}
              items={[
                { label: "Search one policy set", x: 0.2, y: 0.86, tone: "lime" },
                { label: "Show source citations", x: 0.28, y: 0.7, tone: "lime" },
                { label: "SSO login", x: 0.42, y: 0.45, tone: "amber" },
                { label: "Roll out to all agents", x: 0.7, y: 0.9, tone: "sky" },
                { label: "Auto-draft replies", x: 0.88, y: 0.62, tone: "sky" },
                { label: "Analytics dashboard", x: 0.55, y: 0.18, tone: "plain" },
                { label: "Custom theme", x: 0.12, y: 0.12, tone: "plain" },
              ]}
            />
          </Figure>

          <p>Then adjust the order for two things the chart does not show:</p>
          <ul>
            <li>
              <strong>Risk.</strong> If an item could make the whole project infeasible (can we even
              read the PDFs? will security allow the connection?), do it early, even if the value is
              modest. Discovering a fatal problem in week six is far worse than in week one.
            </li>
            <li>
              <strong>Dependency and lead time.</strong> Anything that other work waits for, or that
              takes calendar time (access, approvals), starts immediately.
            </li>
          </ul>

          <p>A simple label set keeps scope conversations short:</p>
          <Table
            head={["Label", "Meaning", "Example"]}
            rows={[
              ["Must", "Without it the pilot has no value", "Search with citations on one policy set"],
              ["Should", "Important, but the pilot works without it", "SSO login"],
              ["Could", "Nice if time allows", "Usage analytics"],
              ["Won't (this phase)", "Agreed not now; written down", "Auto-replies to customers"],
            ]}
          />
        </>
      ),
    },
    {
      id: "architecture",
      title: "Sketch the solution architecture",
      body: (
        <>
          <p>
            An architecture sketch is not a final design. It is a shared picture the customer&apos;s
            engineers and security reviewers can react to. Three things make a sketch useful: it shows
            the systems involved, it shows how data moves, and it shows trust boundaries, the lines
            that data or credentials must not cross freely.
          </p>

          <Figure caption="Context diagram for the policy assistant. The dashed zone is the customer's network; every arrow crossing it is something security will want to review.">
            <Graph
              label="Context diagram: agents use a search service which reads from policy storage and calls a language model across a trust boundary"
              cellW={205}
              cellH={112}
              nodes={[
                { id: "agent", label: "Support agents", sub: "Ticketing tool plugin", col: 0, row: 1, tone: "amber", shape: "pill" },
                { id: "api", label: "Assistant API", sub: "Auth, logging, rate limits", col: 1.5, row: 1, tone: "lime" },
                { id: "index", label: "Search index", sub: "Chunks + embeddings", col: 1.5, row: 0, tone: "lime", shape: "db" },
                { id: "sp", label: "SharePoint", sub: "Policy PDFs (read only)", col: 3, row: 0, tone: "sky", shape: "db" },
                { id: "sso", label: "Company SSO", sub: "Identity provider", col: 0, row: 2, tone: "sky" },
                { id: "llm", label: "Model API", sub: "Region-locked, no retention", col: 3, row: 2, tone: "plain" },
              ]}
              groups={[
                { label: "Customer network", c1: 0, r1: 0, c2: 2, r2: 2, tone: "sky" },
              ]}
              edges={[
                { from: "agent", to: "api", label: "HTTPS" },
                { from: "api", to: "index", label: "query" },
                { from: "sp", to: "index", label: "nightly sync", dashed: true },
                { from: "agent", to: "sso", label: "login", dashed: true },
                { from: "api", to: "llm", label: "prompt + chunks" },
              ]}
            />
          </Figure>

          <p>
            In that picture the interesting security question is the arrow from the Assistant API to the
            Model API: it carries content out of the customer&apos;s network. A good architecture note
            answers that arrow before anyone asks: what data is sent, how it is protected, whether the
            provider retains it, and what the alternative is if the customer refuses.
          </p>

          <p>For each major component, state also the non-functional expectations:</p>
          <Table
            head={["Concern", "Question to answer", "Example target"]}
            rows={[
              ["Latency", "How fast must an answer be?", "95% of answers in under 5 seconds"],
              ["Availability", "What happens when it is down?", "Business hours; fall back to manual search"],
              ["Scale", "How many users and documents?", "40 users, 600 documents, growing 10% a quarter"],
              ["Security", "Who can see what?", "Per-user document permissions respected"],
              ["Cost", "What is the run cost?", "Under $2,000 per month at pilot volume"],
              ["Observability", "How do we know it works?", "Every answer logged with sources and feedback"],
            ]}
          />
        </>
      ),
    },
    {
      id: "build-buy",
      title: "Build, configure, or reuse",
      body: (
        <>
          <p>
            An FDE&apos;s instinct is to write code. Often the best answer is to write less. For each
            capability decide how to obtain it:
          </p>

          <Figure caption="A decision path for each capability. Favour the cheapest option that meets the requirement, and build only where you add real value.">
            <Flow
              direction="col"
              steps={[
                { title: "Does the product already do it?", note: "Use it, configure it, and stop.", tone: "lime" },
                { title: "Does a managed service or open-source library do it?", note: "Integrate it behind a thin interface.", tone: "sky" },
                { title: "Does the customer already own a tool for it?", note: "Plug into it rather than adding another system.", tone: "sky" },
                { title: "Is it core to the value and not available elsewhere?", note: "Build it, and plan to hand it over.", tone: "amber" },
              ]}
            />
          </Figure>

          <p>
            Every line of custom code is a line that someone must maintain after you leave. Before
            building, ask who will own it in a year. If the honest answer is &ldquo;nobody&rdquo;, find
            another way, or budget for handover and documentation as part of the scope.
          </p>
        </>
      ),
    },
    {
      id: "decisions",
      title: "Record decisions and risks",
      body: (
        <>
          <p>
            Scope that lives only in people&apos;s heads drifts. Keep two lightweight records from the
            start: a decision log and a risk register. They let you answer &ldquo;why did we do it that
            way?&rdquo; and &ldquo;what could derail us?&rdquo; with facts.
          </p>
          <pre>
            <code>{`DECISION 007  2026-03-12
Context:   Customer security forbids sending policy text to external APIs by default.
Options:   (A) Self-host a model in their VPC  (B) Use a region-locked provider with
           zero retention  (C) Keyword search only
Decision:  (B) for the pilot, with (A) evaluated in parallel
Why:       Fastest path to value; security approved zero-retention terms
Consequences: Provider contract review needed (owner: Legal, due 2026-03-20)
Revisit:   After pilot, if volume or sensitivity grows`}</code>
          </pre>
          <Table
            head={["Risk", "Likelihood", "Impact", "Mitigation", "Owner"]}
            rows={[
              ["Policy PDFs are scans with poor text", "Medium", "High", "OCR test in week one; fallback to manual list", "FDE"],
              ["Security review slips", "High", "High", "File request on day one; escalate via sponsor", "Champion"],
              ["Outdated policies in the index", "Medium", "Medium", "Show last-updated date; weekly resync", "Policy owner"],
              ["Users distrust answers", "Medium", "High", "Always cite sources; easy feedback button", "FDE"],
            ]}
          />

          <Callout tone="tip" title="Use the log when scope changes">
            When the customer asks for something new, point to the scope list and offer a trade: it
            can go in, and either the date moves or another item moves out. Having it written down
            turns a confrontation into a choice.
          </Callout>

          <Exercise
            title="Slice this project"
            task={
              <p>
                A retailer wants &ldquo;AI to answer every customer email in all eight languages across
                all product lines.&rdquo; Propose a first vertical slice that could be demonstrated in
                two weeks, and name the riskiest assumption it tests.
              </p>
            }
          >
            <p>
              <strong>First slice:</strong> one language (the highest volume one), one product line,
              reading real emails and <em>drafting</em> replies for an agent to approve inside the
              existing mail tool. No automatic sending.
            </p>
            <p>
              <strong>Riskiest assumption it tests:</strong> that drafted replies are good enough that
              agents edit rather than rewrite them. You measure the edit distance or acceptance rate on
              real emails. Extra languages, product lines and automation are later slices; each is only
              worth building if the first proves that quality is acceptable.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Scope by thin vertical slices on real data, not by horizontal layers.",
    "Prioritise by value and effort, then adjust for risk and lead time: de-risk the scariest assumption first.",
    "A solution architecture sketch should show systems, data flow and trust boundaries, plus non-functional targets.",
    "Prefer configuring or reusing over building; custom code needs an owner after you leave.",
    "Keep a decision log and a risk register; they turn scope changes into explicit trade-offs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why are vertical slices preferred to building layer by layer?",
      options: [
        "They expose integration problems and deliver usable value early",
        "They need fewer engineers",
        "They avoid customer contact",
        "They are cheaper to document",
      ],
      answer: 0,
      explain: "A slice crosses every layer for a narrow case, so problems appear in week one rather than at the end.",
    },
    {
      kind: "mcq",
      q: "An item is only moderately valuable, but if it fails the whole project is infeasible. What should you do?",
      options: [
        "Do it early to de-risk the project",
        "Leave it to the end",
        "Remove it from scope silently",
        "Ask the customer to do it",
      ],
      answer: 0,
      explain: "Discovering a fatal problem early is far cheaper than discovering it late.",
    },
    {
      kind: "mcq",
      q: "In the architecture sketch, why highlight arrows that cross the trust boundary?",
      options: [
        "They show data or credentials leaving a protected zone, which security must review",
        "They are the fastest connections",
        "They show who pays for what",
        "They are optional decoration",
      ],
      answer: 0,
      explain: "Anything crossing the boundary is where risk and review concentrate.",
    },
    {
      kind: "mcq",
      q: "What should you do first when you need a capability the product might already offer?",
      options: [
        "Check whether it exists and can be configured before writing any code",
        "Build a custom version",
        "Buy a competing tool",
        "Skip the capability",
      ],
      answer: 0,
      explain: "The cheapest correct answer is to use what exists; custom code must be maintained after you leave.",
    },
    {
      kind: "text",
      q: "What do you call the written record that explains why a design choice was made and what alternatives were rejected?",
      format: "******** ***",
      accept: ["decision log", "a decision log", "the decision log", "adr", "decision record", "architecture decision record"],
      explain: "A decision log (or ADR) preserves context so you can explain and revisit choices later.",
    },
  ],
};

import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Prepare your own code so it can be extended quickly under observation",
    "Run a live extension in a structured way: clarify, plan, change, test, explain",
    "Practise typical extension requests: a new field, a new rule, a new data source, a new failure mode",
    "Handle the case where you run out of time or hit an unexpected problem",
  ],
  tasks: [
    {
      id: "what",
      title: "What a live extension is",
      body: (
        <>
          <p>
            In some processes, after your presentation, an interviewer asks you to extend your own
            solution in the session: &ldquo;Add support for a second currency&rdquo;, &ldquo;Flag
            invoices over $10,000 for manager approval&rdquo;, &ldquo;Pull in a new data source&rdquo;.
            It tests how well you know your code, how well it is structured, and how you work under
            observation.
          </p>
          <p>
            The best preparation is the code itself. A solution with clear boundaries makes any
            reasonable extension a small, local change. A tangled one makes every request painful.
          </p>
          <DiagramReference lesson="delivery-live-extension" panel={1} />
        </>
      ),
    },
    {
      id: "method",
      title: "A method for live changes",
      body: (
        <>
          <DiagramReference lesson="delivery-live-extension" panel={2} />
          <Table
            head={["Request", "Where it goes", "Test"]}
            rows={[
              ["Flag invoices over $10,000 for manager approval", "The rules module: add a threshold constant and a rule producing status 'needs_approval'", "Boundary cases at 9,999.99, 10,000 and 10,000.01"],
              ["Support a second currency", "Schema gets a currency field (probably exists); matching compares currency; conversion kept out unless required", "Mismatched currency is flagged, not silently compared"],
              ["Add a CSV source in addition to PDFs", "A new reader returning the same entity type; no change to rules", "A sample CSV flows through the whole pipeline"],
              ["Retry the model on invalid output", "The model seam: wrap the call with one validated retry", "A fake model that fails once, then succeeds"],
              ["Log which rule flagged each invoice", "Result object gets a reason field set by each rule", "Reasons appear in output for known cases"],
            ]}
          />
        </>
      ),
    },
    {
      id: "trouble",
      title: "When things go wrong",
      body: (
        <>
          <ul>
            <li><strong>You hit an unexpected error:</strong> read the message aloud, form a hypothesis and test it. Interviewers value method over speed.</li>
            <li><strong>You are running out of time:</strong> say so, finish a minimal working version, and describe the rest. A half-finished refactor is worse than a small correct change.</li>
            <li><strong>The environment misbehaves</strong> (a dependency breaks, the model key fails): switch to demo mode, or explain what you would do and write the code anyway.</li>
            <li><strong>The request exposes a weakness in your design:</strong> say so honestly, make the pragmatic change, and describe the refactor you would do with time.</li>
          </ul>
          <Callout tone="tip" title="Rehearse on your own code">
            Before the session, ask a friend to give you three unseen extension requests and time
            yourself. You will find where your code is awkward, and you can fix it beforehand or at
            least know your answer.
          </Callout>
          <Exercise
            title="Extension drill"
            task={
              <p>
                Your solution matches invoices to purchase orders. The interviewer asks: &ldquo;Allow a
                2% tolerance on amounts, so small differences are accepted automatically.&rdquo; Walk
                through your approach.
              </p>
            }
          >
            <ol>
              <li><strong>Clarify:</strong> is the tolerance relative to the PO amount, and is it symmetrical (over and under)? Should accepted-with-tolerance be marked differently for the clerk? I will assume relative to the PO amount, symmetrical, and shown as &ldquo;matched within tolerance&rdquo;.</li>
              <li><strong>Locate:</strong> the matching rule in <code>match.py</code>; add <code>AMOUNT_TOLERANCE = 0.02</code> as a named constant.</li>
              <li><strong>Plan:</strong> change the amount comparison, add a status detail, add tests.</li>
              <li><strong>Change:</strong> <code>abs(invoice.total - po.amount) &lt;= AMOUNT_TOLERANCE * po.amount</code>, returning status &ldquo;matched&rdquo; with reason &ldquo;within tolerance&rdquo;.</li>
              <li><strong>Test:</strong> exact match; 1.9% over; 2.0% over (boundary); 2.1% over; 1.9% under; zero-amount PO (avoid division issues; handle explicitly).</li>
              <li><strong>Reflect:</strong> tolerance may need to differ by supplier or amount band; I would move it to config and evaluate false-accept rate on historical data before enabling it by default.</li>
            </ol>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Prepare for live extensions by building in extension points: rules in one place, schemas, adapters, a model seam and tests.",
    "Use a six-step method aloud: clarify, locate, plan, change, test, reflect.",
    "Prefer the smallest working change and prove it with a test, including boundary cases.",
    "When stuck or short on time, be transparent, finish a minimal version and describe the rest.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What best prepares you for live extension requests?",
      options: [
        "Structuring code with clear boundaries, named rules and tests",
        "Memorising the code",
        "Writing one huge file",
        "Avoiding tests",
      ],
      answer: 0,
      explain: "Good structure makes likely extensions small, local and testable.",
    },
    {
      kind: "mcq",
      q: "You are running short of time during a live change. What should you do?",
      options: [
        "Finish a minimal working version and describe the rest",
        "Start a big refactor",
        "Stop talking",
        "Delete the tests",
      ],
      answer: 0,
      explain: "A small correct change plus a clear plan beats a half-finished large one.",
    },
    {
      kind: "mcq",
      q: "Which boundary values should you test for a 2% tolerance?",
      options: [
        "Just under, exactly at and just over 2%",
        "Only 50%",
        "Only zero",
        "No tests are needed",
      ],
      answer: 0,
      explain: "Boundary cases reveal off-by-one and comparison errors.",
    },
    {
      kind: "text",
      q: "In the six steps, what comes first? (one word)",
      format: "*******",
      accept: ["clarify"],
      explain: "Clarify the request and edge cases before changing code.",
    },
  ],
};

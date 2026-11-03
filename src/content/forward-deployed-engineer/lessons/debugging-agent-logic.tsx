import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Hard",
  objectives: [
    "Instrument an agent so every step can be replayed",
    "Classify an agent failure by where in the loop it happened",
    "Apply a systematic fix and prevent the failure from returning",
  ],
  tasks: [
    {
      id: "trace",
      title: "You cannot fix what you cannot read",
      body: (
        <>
          <p>
            An agent failure is rarely one wrong line of code. It is a chain: a retrieval miss, a
            vague tool description, a wrong argument, an error the model misread. You need the full
            story of each run.
          </p>
          <p>Record, for every run, with one run ID:</p>
          <ul>
            <li>The exact prompt sent, including system prompt and retrieved context.</li>
            <li>Each model response, tool call, arguments, result and error.</li>
            <li>Model name and version, parameters, prompt version.</li>
            <li>Tokens, latency and cost per step.</li>
            <li>The final output and any user feedback.</li>
          </ul>
          <Callout tone="tip">
            Tracing tools (Langfuse, LangSmith, Arize, OpenTelemetry) show runs as a tree of spans.
            Even structured JSON logs with a run ID are enough to start.
          </Callout>
        </>
      ),
    },
    {
      id: "classify",
      title: "Locate the failing step",
      body: (
        <>
          <Table
            head={["Symptom", "Likely cause", "Fix"]}
            rows={[
              ["Answers with no grounding", "Retrieval missed the document", "Check chunks, query rewriting, filters"],
              ["Calls wrong tool", "Overlapping or vague tool descriptions", "Rewrite descriptions, reduce tools"],
              ["Right tool, bad arguments", "Unclear schema or no examples", "Add enums, descriptions, validation"],
              ["Loops repeating the same call", "Error message not actionable; no stop rule", "Return clear errors, cap steps"],
              ["Ignores instructions late in the run", "Context bloated or contradictory", "Compact history, restate goal"],
              ["Works in tests, fails in production", "Real inputs differ", "Add real cases to evals"],
              ["Does something unsafe", "Injected text in tool output", "Isolate untrusted data, require approval"],
            ]}
          />
        </>
      ),
    },
    {
      id: "method",
      title: "A repeatable debugging loop",
      body: (
        <>
          <ol>
            <li>
              <strong>Reproduce.</strong> Replay the stored run. Lower temperature or fix a seed if
              you can.
            </li>
            <li>
              <strong>Find the first wrong step.</strong> Read the trace from the start, not the
              end. The final answer is a symptom.
            </li>
            <li>
              <strong>Form one hypothesis</strong> and change one thing: a tool description, a
              prompt line, a retrieval parameter.
            </li>
            <li>
              <strong>Re-run the case and the full eval suite.</strong> Make sure the fix does not
              break others.
            </li>
            <li>
              <strong>Add the case to the dataset</strong> and, if possible, add a guard in code
              (schema check, step cap, validation).
            </li>
          </ol>
          <pre>
            <code>{`# guard rails that turn mystery failures into clear errors
MAX_STEPS = 12
for step in range(MAX_STEPS):
    reply = model.call(messages, tools=TOOLS)
    if not reply.tool_calls:
        break
    for call in reply.tool_calls:
        args = validate(call.name, call.arguments)   # raises with a clear message
        result = run_tool(call.name, args)
        log.info("step=%s tool=%s ok=%s", step, call.name, result.ok)
else:
    raise RuntimeError("agent exceeded step limit")`}</code>
          </pre>
          <Callout tone="note">
            Prefer fixing the tool or the data over adding more prompt text. A better error message
            from a tool often cures a loop that three prompt edits could not.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Log full runs under a run ID: prompts, tool calls, results, versions and costs.",
    "Find the first wrong step, then map the symptom to retrieval, tools, arguments, context or safety.",
    "Change one thing at a time, re-run evals, and add the case plus a code guard.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where should you start reading a failed agent trace?",
      options: [
        "At the final answer only",
        "From the beginning to find the first wrong step",
        "At random",
        "You should never read traces",
      ],
      answer: 1,
      explain: "Early mistakes propagate; the final answer is only the visible symptom.",
    },
    {
      kind: "mcq",
      q: "An agent repeatedly calls the same tool with the same bad arguments. What helps most?",
      options: [
        "An actionable error message from the tool and a step cap",
        "A longer system prompt about being careful",
        "Switching off logging",
        "Removing all tools",
      ],
      answer: 0,
      explain: "If the error does not say what to change, the model cannot adapt; a cap stops runaway loops.",
    },
    {
      kind: "mcq",
      q: "After fixing a failure, what should you add?",
      options: [
        "The case to your eval dataset",
        "Nothing",
        "A new unrelated feature",
        "A louder alert only",
      ],
      answer: 0,
      explain: "A permanent test stops the same failure from coming back unnoticed.",
    },
  ],
};

import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers, Sequence } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Describe the anatomy of a production LLM feature, from request to validated result",
    "Write prompts with role, task, context, constraints and output format",
    "Get structured output and validate it before using it",
    "Add retrieval for grounding and citations, and know where it fails",
    "Control cost, latency and quality with caching, routing and evaluation",
  ],
  tasks: [
    {
      id: "anatomy",
      title: "Anatomy of an LLM feature",
      body: (
        <>
          <p>
            A demo calls a model and prints the reply. A production feature wraps that call in a
            pipeline that prepares input, protects against bad output, and records what happened. The
            model call is perhaps a fifth of the code.
          </p>

          <Figure caption="The stages of a production LLM feature. Each stage exists to handle a specific failure of the raw model call.">
            <Flow
              numbered
              steps={[
                { title: "Receive and check input", note: "Size limits, language, PII handling", tone: "sky" },
                { title: "Gather context", note: "Retrieval, user data, history", tone: "sky" },
                { title: "Build the prompt", note: "Instructions, context, format", tone: "lime" },
                { title: "Call the model", note: "Timeouts, retries, fallback", tone: "lime" },
                { title: "Parse and validate", note: "Schema, rules, citations", tone: "amber" },
                { title: "Act or escalate", note: "Return, review queue or refuse", tone: "amber" },
                { title: "Log and measure", note: "Trace, cost, feedback", tone: "plain" },
              ]}
            />
          </Figure>

          <Figure caption="One request through the pipeline, showing where each component sits.">
            <Sequence
              label="Sequence of one LLM feature request through app, retriever, model and validator"
              actors={[
                { id: "app", label: "Application" },
                { id: "ret", label: "Retriever" },
                { id: "llm", label: "Model API" },
                { id: "val", label: "Validator" },
              ]}
              messages={[
                { from: "app", to: "ret", text: "Query for relevant context" },
                { from: "ret", to: "app", text: "Top passages with sources", dashed: true },
                { from: "app", to: "app", text: "Assemble prompt within token budget" },
                { from: "app", to: "llm", text: "Prompt + structured output schema" },
                { from: "llm", to: "app", text: "Draft JSON answer", dashed: true },
                { from: "app", to: "val", text: "Validate schema, citations, policy" },
                { note: "If validation fails: retry once with the error, then route to a person.", over: ["app", "val"] },
                { from: "val", to: "app", text: "Approved result or failure reason", dashed: true },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "prompt",
      title: "Writing a prompt that holds up",
      body: (
        <>
          <p>
            A prompt is an interface specification for a probabilistic component. The more precisely
            you specify, the less variance you get. A reliable structure:
          </p>
          <Table
            head={["Part", "Purpose", "Example"]}
            rows={[
              ["Role and goal", "Frame the task and audience", "You help support agents answer using company policy."],
              ["Instructions", "What to do, step by step if needed", "Read the passages, then answer the question. Quote the policy ID."],
              ["Constraints", "What not to do and what to do when unsure", "If the passages do not contain the answer, say so. Do not guess."],
              ["Context", "Data the model must use, clearly delimited", "<passages>...</passages>"],
              ["Output format", "The exact shape you will parse", "Return JSON with answer, policy_ids, confidence."],
              ["Examples", "One or two good input/output pairs", "Input ... Output { ... }"],
            ]}
          />
          <pre>
            <code>{`SYSTEM:
You help support agents answer questions using ONLY the policy passages provided.
If the passages do not contain the answer, set "answerable" to false. Never guess.

Return JSON: {"answerable": bool, "answer": str, "policy_ids": [str], "confidence": "low"|"medium"|"high"}

USER:
<passages>
[P-114] Refunds over $500 require manager approval...
[P-207] Refund requests must be made within 30 days...
</passages>
<question>Can I refund $620 for an order from 12 days ago?</question>`}</code>
          </pre>
          <ul>
            <li>
              <strong>Delimit untrusted data</strong> (tags or fenced blocks) and tell the model to
              treat it as data, not instructions.
            </li>
            <li>
              <strong>Give the model an exit.</strong> &ldquo;answerable: false&rdquo; is better than
              a forced guess.
            </li>
            <li>
              <strong>Keep prompts in version control</strong> and test changes against your
              evaluation set before release.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "structure",
      title: "Structured output and validation",
      body: (
        <>
          <p>
            Downstream code needs data, not prose. Ask for JSON that matches a schema, and always
            validate it. Many provider APIs support constrained or schema-bound output, which
            greatly reduces malformed responses, but validation is still required for meaning
            (is the policy ID real? is the amount plausible?).
          </p>
          <pre>
            <code>{`from pydantic import BaseModel, Field, ValidationError
from typing import Literal

class Answer(BaseModel):
    answerable: bool
    answer: str = Field(max_length=1200)
    policy_ids: list[str]
    confidence: Literal["low", "medium", "high"]

def get_answer(question, passages, known_ids, call_model):
    prompt = build_prompt(question, passages)
    for attempt in range(2):                      # one retry with feedback
        raw = call_model(prompt)
        try:
            result = Answer.model_validate_json(raw)
        except ValidationError as err:
            prompt += f"\\nYour last reply was invalid: {err}. Return valid JSON only."
            continue
        if result.answerable and not set(result.policy_ids) <= known_ids:
            prompt += "\\nYou cited a policy ID that was not provided. Cite only provided IDs."
            continue
        return result
    return Answer(answerable=False, answer="", policy_ids=[], confidence="low")  # safe fallback`}</code>
          </pre>
          <Callout tone="tip" title="Validate meaning, not just shape">
            A response can be perfectly valid JSON and still wrong. Check against ground truth you
            control: cited IDs exist, numbers fall in range, dates are plausible, and quoted text
            actually appears in the source.
          </Callout>
        </>
      ),
    },
    {
      id: "retrieval",
      title: "Grounding with retrieval",
      body: (
        <>
          <p>
            Models do not know your data and can invent plausible answers. <strong>Retrieval</strong>{" "}
            reduces that by putting the relevant source text in the prompt and asking the model to
            answer from it. Quality is limited by retrieval: if the right passage is not fetched, no
            prompt can fix the answer.
          </p>

          <Figure caption="Where a retrieval-backed answer can go wrong. Most failures are upstream of the model.">
            <Layers
              layers={[
                { title: "Generation", note: "Model ignores or misreads the passages; invents a detail.", tone: "rose" },
                { title: "Prompt assembly", note: "Too much text; the key passage is buried or truncated.", tone: "amber" },
                { title: "Ranking", note: "The right passage is retrieved but ranked below the cut-off.", tone: "amber" },
                { title: "Retrieval", note: "Query and document wording differ; the passage is never found.", tone: "sky" },
                { title: "Chunking and ingestion", note: "Tables, headings or scans were parsed badly; the passage does not exist in the index.", tone: "sky" },
              ]}
            />
          </Figure>

          <p>Practical ways to raise retrieval quality:</p>
          <ul>
            <li>Chunk on natural boundaries (headings, sections) and keep titles with each chunk.</li>
            <li>Combine keyword search with vector search (hybrid) and re-rank the top results.</li>
            <li>Filter by metadata such as document type, date and the user&apos;s permissions.</li>
            <li>Measure retrieval separately: does the right passage appear in the top five?</li>
          </ul>
        </>
      ),
    },
    {
      id: "ops",
      title: "Cost, latency and quality in production",
      body: (
        <>
          <p>
            An LLM feature has three levers that pull against each other: quality, cost and speed.
            Know the standard moves:
          </p>
          <Table
            head={["Lever", "Technique", "Trade-off"]}
            rows={[
              ["Cost", "Route easy requests to a small model; cache repeated prefixes and answers; shorten context", "More moving parts; small models may fail on hard cases"],
              ["Latency", "Stream tokens; parallelise independent calls; reduce output length; prompt caching", "Streaming complicates validation"],
              ["Quality", "Better retrieval; clearer prompts; examples; a stronger model; a verification step", "Higher cost and latency"],
              ["Reliability", "Timeouts, retries with backoff, fallback model, circuit breaker", "Needs monitoring of fallback rate"],
            ]}
          />
          <p>
            Under all of them sits <strong>evaluation</strong>. Keep a test set of real inputs with
            expected outcomes, run it on every prompt, model or retrieval change, and track accuracy,
            cost and latency together. Without it, every change is a guess.
          </p>

          <Exercise
            title="Debug the answer"
            task={
              <p>
                Users report that the assistant sometimes says &ldquo;I don&apos;t have that
                information&rdquo; even though the policy exists. List the first three places you
                would look, in order.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Retrieved passages for the failing queries.</strong> Is the policy in the
                top results at all? If not, it is a retrieval or ingestion problem.
              </li>
              <li>
                <strong>Ingestion of that document.</strong> Was it parsed correctly (a scan or table
                that produced empty text)? Is it in the index?
              </li>
              <li>
                <strong>The prompt and the exit rule.</strong> If the passage is retrieved but the
                model still declines, the &ldquo;answerable&rdquo; instruction may be too strict, or
                the passage is buried in a long context.
              </li>
            </ol>
            <p>
              Notice that the model is the last suspect, not the first. Fix upstream problems before
              tuning prompts.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "A production LLM feature is a pipeline: check input, gather context, build prompt, call, validate, act, log.",
    "Prompts need role, instructions, constraints, delimited context, output format and an exit for uncertainty.",
    "Ask for structured output and validate both shape and meaning, with a safe fallback.",
    "Retrieval quality caps answer quality; debug retrieval and ingestion before touching the prompt.",
    "Balance cost, latency and quality with routing, caching and streaming, and anchor everything in evaluation.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why validate model output beyond checking it is valid JSON?",
      options: [
        "Valid JSON can still contain wrong or unsupported values",
        "JSON is always correct",
        "Validation makes the model faster",
        "Validation removes cost",
      ],
      answer: 0,
      explain: "Meaning checks, such as real citations and plausible ranges, catch errors that schema checks cannot.",
    },
    {
      kind: "mcq",
      q: "A RAG assistant gives wrong answers. What should you inspect first?",
      options: [
        "The passages retrieved for the question",
        "The model's temperature only",
        "The font size",
        "The server colour",
      ],
      answer: 0,
      explain: "If the right passage is not retrieved, the model cannot answer correctly, whatever the prompt says.",
    },
    {
      kind: "mcq",
      q: "Why give the model an explicit 'answerable: false' option?",
      options: [
        "It reduces forced guessing and invented answers",
        "It makes outputs longer",
        "It speeds up training",
        "It hides errors",
      ],
      answer: 0,
      explain: "An allowed way to say 'I don't know' prevents the model from fabricating to fill the schema.",
    },
    {
      kind: "mcq",
      q: "Which technique most directly lowers cost for easy requests?",
      options: [
        "Routing them to a smaller model",
        "Making prompts longer",
        "Disabling caching",
        "Always using the largest model",
      ],
      answer: 0,
      explain: "A small model is cheaper and often adequate for simple cases; reserve the large one for hard cases.",
    },
    {
      kind: "text",
      q: "What search approach combines keyword and vector search? (one word)",
      format: "******",
      accept: ["hybrid", "hybrid search"],
      explain: "Hybrid search blends lexical (keyword) and semantic (vector) retrieval, often followed by re-ranking.",
    },
  ],
};

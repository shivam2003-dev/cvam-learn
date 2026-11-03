import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Describe how an LLM generates text and why tokens and context limits matter",
    "Write a prompt with role, task, constraints, format and examples",
    "Decide what belongs in the context window for a customer task",
  ],
  tasks: [
    {
      id: "llm",
      title: "What an LLM does",
      body: (
        <>
          <p>
            A large language model predicts the next <strong>token</strong> (a piece of a word)
            given everything before it, over and over. It does not look facts up; it produces text
            that fits patterns it learned. That is why it is fluent, fast to apply, and sometimes
            confidently wrong.
          </p>
          <ul>
            <li>
              <strong>Context window.</strong> The maximum tokens the model can read at once:
              instructions, documents, history and the answer.
            </li>
            <li>
              <strong>Cost and latency</strong> scale with tokens in and out.
            </li>
            <li>
              <strong>Temperature</strong> controls randomness. Use low values for extraction and
              classification, higher for brainstorming.
            </li>
            <li>
              <strong>Hallucination.</strong> Plausible but unsupported output. Reduce it by
              supplying source text and asking for citations.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "prompt",
      title: "A prompt that works",
      body: (
        <>
          <Table
            head={["Part", "Purpose"]}
            rows={[
              ["Role", "Sets perspective: you are a claims analyst reviewing invoices"],
              ["Task", "One clear job, stated plainly"],
              ["Context", "The documents or data it needs"],
              ["Constraints", "What to avoid; what to do when unsure"],
              ["Output format", "Exact schema so code can parse it"],
              ["Examples", "One to three good input/output pairs"],
            ]}
          />
          <pre>
            <code>{`You extract fields from supplier invoices.

Return JSON with keys: vendor, invoice_number, total, currency, due_date (ISO 8601).
If a field is not present, use null. Do not guess.

<invoice>
{{invoice_text}}
</invoice>`}</code>
          </pre>
          <Callout tone="tip">
            Tell the model what to do when it does not know. "Use null, do not guess" prevents most
            invented values in extraction work.
          </Callout>
        </>
      ),
    },
    {
      id: "context",
      title: "Context engineering",
      body: (
        <>
          <p>
            <strong>Context engineering</strong> is choosing what goes into the window for each
            call. The prompt is only one part; the rest is retrieved documents, tool results,
            conversation history and memory.
          </p>
          <ul>
            <li>Include only what the task needs; extra text dilutes attention and raises cost.</li>
            <li>Put stable instructions first so prompt caching can reuse them.</li>
            <li>Summarise or trim old turns in long sessions.</li>
            <li>Separate trusted instructions from untrusted data such as emails and web pages, and treat the data as content, not commands.</li>
            <li>Order matters: models often use the start and end of long context best.</li>
          </ul>
          <Callout tone="warn">
            If text from a customer document can say "ignore your instructions" and the model
            obeys, you have a prompt injection hole. Never let untrusted text trigger privileged
            actions without a check.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "LLMs predict tokens; they are fluent but can be wrong, so ground them in source text.",
    "A good prompt has role, task, context, constraints, format and examples.",
    "Tell the model what to do when unsure, such as returning null.",
    "Context engineering decides what enters the window and keeps untrusted data separate.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "For extracting invoice fields, which temperature is most appropriate?",
      options: ["Very high", "Low", "It makes no difference", "Negative"],
      answer: 1,
      explain: "Extraction needs consistency, so low randomness is better.",
    },
    {
      kind: "mcq",
      q: "What is the best way to cut invented values in an extraction prompt?",
      options: [
        "Ask the model to be creative",
        "Say 'use null if absent, do not guess' and provide the source text",
        "Use a longer prompt with no rules",
        "Hide the source",
      ],
      answer: 1,
      explain: "Explicit instructions and grounding text give the model a safe fallback.",
    },
    {
      kind: "mcq",
      q: "What does the context window limit?",
      options: [
        "How many users you can have",
        "The total tokens the model can consider in one call",
        "Your internet speed",
        "The database size",
      ],
      answer: 1,
      explain: "Instructions, documents, history and output must all fit inside the window.",
    },
  ],
};

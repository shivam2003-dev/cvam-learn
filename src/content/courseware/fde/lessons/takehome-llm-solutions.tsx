import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Decide where an LLM belongs in a take-home and where plain code is better",
    "Write prompts with structured output and validation that a reviewer can read and trust",
    "Control cost and latency in a small project with caching, batching and limits",
    "Make the solution runnable without a key using fixtures or a mock",
    "Document model choices, prompts and known failure modes",
  ],
  tasks: [
    {
      id: "where",
      title: "Use the model where it earns its place",
      body: (
        <>
          <p>
            Reviewers notice when an LLM is used for something a regular expression would do, and when
            it is used for something no one can check. The strongest submissions use deterministic
            code for rules and arithmetic, and a model for the fuzzy parts, with a check on its output.
          </p>
          <Table
            head={["Task in the brief", "Use", "Reason"]}
            rows={[
              ["Parse a date in a known format", "Code", "Exact, free and instant"],
              ["Compute totals, match IDs, apply thresholds", "Code", "Deterministic and testable"],
              ["Extract fields from messy, varied free text", "LLM with schema + validation", "Variation defeats rules"],
              ["Classify intent or sentiment", "LLM (or a small classifier) with a labelled test set", "Language understanding"],
              ["Draft a reply or summary", "LLM, with grounding and a human review step", "Generation"],
              ["Decide whether an invoice is paid", "Code, using the model only to read it", "Business decisions need determinism"],
            ]}
          />
          <DiagramReference lesson="takehome-llm-solutions" panel={1} />
        </>
      ),
    },
    {
      id: "prompt",
      title: "A readable prompt and a schema",
      body: (
        <>
          <pre>
            <code>{`# llm.py: one thin place that calls the model; everything else is testable without it
import json, os, hashlib, pathlib
from pydantic import BaseModel, Field, ValidationError
from typing import Literal

class Extraction(BaseModel):
    supplier: str | None
    invoice_number: str | None
    total: float | None = Field(None, ge=0)
    currency: Literal["USD", "EUR", "GBP"] | None
    evidence: dict[str, str]          # for each field, the exact text it came from

SYSTEM = (
    "Extract invoice fields from the text. Use null when a field is not present; never guess. "
    "For every non-null field, copy the exact supporting text into 'evidence'. Return JSON only."
)

CACHE = pathlib.Path(".cache"); CACHE.mkdir(exist_ok=True)

def extract(text: str, call_model) -> Extraction:
    key = CACHE / (hashlib.sha256(text.encode()).hexdigest() + ".json")
    if key.exists():                                            # cache: cheaper, faster, repeatable
        return Extraction.model_validate_json(key.read_text())
    prompt = f"<invoice>\\n{text[:8000]}\\n</invoice>"              # cap input size
    last_error = ""
    for _ in range(2):                                          # one retry with the validation error
        raw = call_model(SYSTEM, prompt + last_error)
        try:
            result = Extraction.model_validate_json(raw)
        except ValidationError as e:
            last_error = f"\\nYour previous reply was invalid: {e}. Return valid JSON only."
            continue
        # grounding check: evidence must literally appear in the source text
        if all(snippet in text for snippet in result.evidence.values()):
            key.write_text(result.model_dump_json())
            return result
        last_error = "\\nSome evidence text was not found in the invoice. Quote exactly."
    return Extraction(supplier=None, invoice_number=None, total=None, currency=None, evidence={})`}</code>
          </pre>
          <ul>
            <li><strong>Evidence checking</strong> catches invented values cheaply: if the quoted text is not in the document, the field is suspect.</li>
            <li><strong>A safe fallback</strong> returns nulls rather than crashing or guessing.</li>
            <li><strong>Caching on content hash</strong> makes reruns instant, cheap and repeatable, which also helps reviewers.</li>
            <li><strong>The model is injected as a function</strong> (<code>call_model</code>), so tests and a demo mode can supply a fake.</li>
          </ul>
        </>
      ),
    },
    {
      id: "cost",
      title: "Cost, latency and a no-key mode",
      body: (
        <>
          <DiagramReference lesson="takehome-llm-solutions" panel={2} />
          <Callout tone="warn" title="Spend limits protect you too">
            Add a hard cap on the number of model calls per run (for example 200) and an environment
            variable to raise it. A loop bug that makes 5,000 paid calls during a take-home is both
            costly and embarrassing.
          </Callout>
          <Table
            head={["Item", "What to report in the README"]}
            rows={[
              ["Model and version", "Name and date used, since behaviour changes over time"],
              ["Cost of an evaluation run", "Approximate tokens and dollars, e.g. 40 invoices about $0.40"],
              ["Latency", "Median seconds per item"],
              ["Determinism", "Temperature setting; cache behaviour"],
              ["Data handling", "What data is sent to the API and what is not"],
            ]}
          />
          <Exercise
            title="Choose where the model goes"
            task={
              <p>
                Brief: classify 500 support emails by urgency and extract any order number mentioned,
                then route urgent ones to a queue. Say where you use the model and where code, and name
                one guard on the model output.
              </p>
            }
          >
            <ul>
              <li><strong>Code:</strong> order number extraction by regular expression first (cheap, exact), with the model only as a fallback for unusual formats; routing by the urgency label and rules; queue handling.</li>
              <li><strong>Model:</strong> urgency classification into a fixed set (urgent, normal, low) with a short reason, because tone and context matter.</li>
              <li><strong>Guards:</strong> constrain output to the allowed labels (reject anything else), include the reason text for reviewers, send low-confidence or invalid cases to a human review queue, and cap calls per run.</li>
              <li><strong>Evidence:</strong> hand-label 50 emails and report agreement, including how often an urgent email was marked normal (the costly error).</li>
            </ul>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Use code for rules and arithmetic and a model only for fuzzy language tasks, with validation between them.",
    "Write a readable prompt with a schema, an evidence field and a safe fallback, and check that evidence appears in the source.",
    "Cache by content hash, inject the model call, and provide a recorded or mock mode so the project runs without a key.",
    "Cap calls and spend, choose a right-sized model, and report cost, latency, model version and data handling in the README.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which task is best left to plain code?",
      options: [
        "Computing invoice totals and applying thresholds",
        "Reading messy free-text complaints",
        "Summarising a long email thread",
        "Classifying tone",
      ],
      answer: 0,
      explain: "Arithmetic and rules are exact, cheap and testable in code.",
    },
    {
      kind: "mcq",
      q: "Why require an 'evidence' field in extraction output?",
      options: [
        "It lets code check that each value is supported by text actually in the document",
        "It makes outputs longer",
        "Models require it",
        "It replaces validation",
      ],
      answer: 0,
      explain: "Grounding checks catch invented values cheaply.",
    },
    {
      kind: "mcq",
      q: "Why inject the model call as a function?",
      options: [
        "So tests and demo mode can substitute a fake without a key",
        "To make code shorter",
        "To avoid error handling",
        "Because models need functions",
      ],
      answer: 0,
      explain: "Dependency injection makes the solution testable and keyless-runnable.",
    },
    {
      kind: "mcq",
      q: "A loop bug could make thousands of paid calls. What protects you?",
      options: [
        "A hard cap on calls per run",
        "A longer prompt",
        "A larger model",
        "Nothing is needed",
      ],
      answer: 0,
      explain: "Call caps limit cost and make bugs less costly.",
    },
    {
      kind: "text",
      q: "What do you hash to cache a model result reliably? (one word)",
      format: "*****",
      accept: ["input", "the input", "content", "text", "prompt"],
      explain: "Hashing the input content gives a stable cache key.",
    },
  ],
};

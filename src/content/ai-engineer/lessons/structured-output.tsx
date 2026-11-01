import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why free text is a poor interface between a model and your code",
    "Compare prompt-only, JSON mode and schema-constrained output",
    "Validate model output with a schema and retry on failure",
    "Calculate how retries change the odds of getting valid output",
  ],
  tasks: [
    {
      id: "problem",
      title: "Code needs data, not prose",
      body: (
        <>
          <p>
            A model's natural output is prose. Your program wants fields: a category, a number, a
            list of items. If you ask for a summary and then try to pull the urgency out with a
            regular expression, you are writing a brittle parser for text that changes every time.
          </p>
          <p>
            The fix is to ask for <strong>structured output</strong>, most often JSON that matches a
            schema you define. Then your code can parse it like any other API response. Think of it
            as agreeing on a form for the model to fill in, instead of letting it write a letter.
          </p>
          <p>
            One rule frames everything in this lesson: <strong>model output is untrusted input</strong>.
            Even a well-behaved model sometimes returns a missing field, a wrong type or an extra
            sentence. Parse and validate it exactly as you would data from a stranger.
          </p>
        </>
      ),
    },
    {
      id: "levels",
      title: "Three ways to get JSON",
      body: (
        <>
          <Table
            head={["Approach", "How it works", "Weakness"]}
            rows={[
              [
                "Prompt only",
                "Describe the format and show an example",
                "Model may add commentary or break the format",
              ],
              [
                "JSON mode",
                "Provider setting that makes the reply valid JSON",
                "Valid JSON, but not necessarily your schema",
              ],
              [
                "Schema-constrained output",
                "You pass a JSON Schema; decoding is restricted to match it",
                "Provider support varies; schemas can be limited",
              ],
            ]}
          />
          <p>
            Many providers offer the second and third options, under different names, and some
            expose them through tool calling: you define a function whose arguments are your schema,
            and the model fills them in. Check what your provider supports. Prefer schema-constrained
            output when you have it, because it removes whole classes of format errors.
          </p>
          <p>
            Even then, still validate. Constraining the shape does not guarantee the content is
            correct. A field typed as an integer can hold a wrong integer.
          </p>
          <p>If you must use a prompt alone, make the instruction strict and show the shape:</p>
          <pre>
            <code>{`Extract the fields below from the support message.
Reply with a single JSON object and nothing else. No markdown fences.

Fields:
- category: one of "billing", "bug", "other"
- urgency: integer from 1 (low) to 5 (high)
- summary: one sentence, under 20 words

Message: """My invoice shows two charges and I need it fixed today."""`}</code>
          </pre>
          <Callout tone="tip">
            Order matters for quality. If the model must explain something, give it a field for the
            reasoning and put that field before the final answer field. Writing the reasoning first
            gives it room to think, as in the previous lesson.
          </Callout>
        </>
      ),
    },
    {
      id: "validate",
      title: "Validate with a schema",
      body: (
        <>
          <p>
            Define the shape once in code and use it both to describe the task and to check the
            reply. In Python, Pydantic is a common choice.
          </p>
          <pre>
            <code>{`from typing import Literal
from pydantic import BaseModel, Field, ValidationError

class Ticket(BaseModel):
    category: Literal["billing", "bug", "other"]
    urgency: int = Field(ge=1, le=5)
    summary: str = Field(max_length=200)

def parse_ticket(raw: str) -> Ticket:
    # Raises ValidationError if the JSON is invalid or does not match.
    return Ticket.model_validate_json(raw)

good = '{"category": "billing", "urgency": 4, "summary": "Charged twice."}'
bad  = '{"category": "refunds", "urgency": 9, "summary": "Charged twice."}'

print(parse_ticket(good))      # category='billing' urgency=4 summary='Charged twice.'
try:
    parse_ticket(bad)
except ValidationError as err:
    print(err.error_count())   # 2 problems: unknown category, urgency above 5`}</code>
          </pre>
          <p>
            Two details are worth noticing. The <code>Literal</code> type rejects a category you did
            not allow, and the range check rejects an urgency of 9. A schema catches the mistakes a
            human would spot at a glance but a parser would not.
          </p>
          <p>
            In TypeScript, Zod plays the same role: define the schema once, call{" "}
            <code>safeParse</code> on the reply, and branch on success.
          </p>
        </>
      ),
    },
    {
      id: "retry",
      title: "Retry, repair, fall back",
      body: (
        <>
          <p>
            When validation fails, do not crash and do not silently accept bad data. A common
            pattern is to retry a small number of times and give the model the error message, so it
            can fix its own mistake.
          </p>
          <pre>
            <code>{`# Illustrative: call_model is a placeholder for your provider call.
def extract_ticket(message: str, max_attempts: int = 3) -> Ticket | None:
    prompt = build_prompt(message)
    for attempt in range(max_attempts):
        raw = call_model(prompt)
        try:
            return parse_ticket(raw)
        except ValidationError as err:
            prompt = (
                build_prompt(message)
                + "\\n\\nYour previous reply was invalid:\\n" + str(err)
                + "\\nReturn corrected JSON only."
            )
    return None   # caller decides: queue for a human, use a default, or fail`}</code>
          </pre>
          <p>Why this works, and how much it helps, comes down to simple probability.</p>
          <Formula>P(all attempts fail) = P(one attempt fails) ^ attempts</Formula>
          <p>
            Say 3 percent of first attempts are invalid (an illustrative number; measure your own).
            With up to three attempts, if the failures were independent:
          </p>
          <pre>
            <code>{`P(all 3 fail)      = 0.03 × 0.03 × 0.03 = 0.000027   (0.0027 percent)
expected attempts  = 1 + 0.03 + 0.03² = 1.0309`}</code>
          </pre>
          <p>
            Failure drops from 3 percent to about 0.003 percent while the average request costs only
            about 3 percent more. The catch: failures are not truly independent. If a particular
            input confuses the model, it may fail the same way each time. That is why you need the{" "}
            <code>None</code> path and a plan for it.
          </p>
          <Callout tone="warn">
            Replies cut off by an output length limit often produce broken JSON. Check the finish
            reason from the API, and set the output limit high enough for your largest expected
            object.
          </Callout>
        </>
      ),
    },
    {
      id: "design",
      title: "Designing schemas models can fill",
      body: (
        <>
          <ul>
            <li>
              <strong>Keep them small.</strong> Ask for the fields you use. Every extra field is
              another chance to be wrong.
            </li>
            <li>
              <strong>Use enums for categories.</strong> A closed list is easier to get right and to
              check than free text.
            </li>
            <li>
              <strong>Allow &quot;unknown&quot;.</strong> If a field may be absent from the input,
              make it optional or give an explicit unknown value. Otherwise the model may invent one
              to fit the form.
            </li>
            <li>
              <strong>Name fields clearly.</strong> Field names and descriptions are part of the
              prompt. <code>due_date_iso</code> is clearer than <code>date</code>.
            </li>
            <li>
              <strong>Keep nesting shallow.</strong> Deep structures fail more often and cost more
              tokens.
            </li>
          </ul>
          <p>
            Finally, log failures. A rise in validation errors is an early warning that a prompt
            edit or a model change broke something.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Treat model output as untrusted input: parse it, validate it, and handle failure.",
    "Prefer schema-constrained output or tool calling where supported; JSON mode only promises valid JSON.",
    "Define the schema once in code (Pydantic, Zod) and use it to check every reply.",
    "Retry a few times with the error message, and have a fallback for when retries run out.",
    "Keep schemas small, use enums, allow unknown, and log validation failures.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A provider's JSON mode returns text that parses as JSON. What does that guarantee?",
      options: [
        "Every field matches your schema",
        "The content is factually correct",
        "The text is valid JSON, but it may not match your schema",
        "No retries are ever needed",
      ],
      answer: 2,
      explain: "JSON mode promises syntax, not your field names, types or values. Validate against a schema.",
    },
    {
      kind: "mcq",
      q: "Validation fails. What is a sensible first step?",
      options: [
        "Use the data anyway",
        "Retry with the validation error included in the prompt",
        "Delete the schema",
        "Raise the temperature to the maximum",
      ],
      answer: 1,
      explain: "Feeding back the error often lets the model fix its own output. Cap the attempts.",
    },
    {
      kind: "text",
      q: "If 10 percent of attempts are invalid and failures are independent, what is the chance that both of two attempts fail, as a percentage?",
      format: "*",
      accept: ["1", "1%", "1 percent", "0.01"],
      explain: "0.1 × 0.1 = 0.01, which is 1 percent.",
    },
    {
      kind: "text",
      q: "Which Python library, named in this lesson, defines a schema and validates JSON against it?",
      format: "********",
      accept: ["pydantic"],
      explain: "Pydantic models validate types, enums and ranges, and raise ValidationError on mismatch.",
    },
  ],
};

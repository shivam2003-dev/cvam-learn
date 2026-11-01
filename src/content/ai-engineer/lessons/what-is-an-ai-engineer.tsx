import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Describe what an AI engineer builds and how the work differs from classic software work",
    "List the layers of an LLM-powered product and where an AI engineer spends time",
    "Explain why non-deterministic output changes how you test and ship",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem the role solves",
      body: (
        <>
          <p>
            For many years, adding intelligence to a product meant collecting data, training a model
            for one narrow job, and running it yourself. A spam filter, a recommender and a
            sentiment classifier each needed their own data, their own training run and their own
            specialists. Most product teams simply did not have the time or people to do that.
          </p>
          <p>
            Large language models (LLMs) changed the starting point. A single pre-trained model can
            summarise text, extract fields, answer questions, write code and follow instructions it
            has never seen before. You reach it with an API call. The hard part is no longer
            training a model. The hard part is turning a general model into a reliable feature that
            real users can depend on.
          </p>
          <p>
            That gap is the <strong>AI engineer</strong>'s job. An AI engineer builds products and
            systems on top of existing models. They decide what the model sees, how it is asked,
            what it is allowed to do, and how anyone can tell whether it is working.
          </p>
          <Callout tone="note">
            Think of a web developer and a browser engine. The web developer does not write the
            rendering engine. They use it well, work around its quirks and ship something useful.
            An AI engineer has the same relationship with models.
          </Callout>
        </>
      ),
    },
    {
      id: "daily-work",
      title: "What the daily work looks like",
      body: (
        <>
          <p>
            The job is mostly software engineering with a new, unpredictable component in the
            middle. A typical week mixes the following activities.
          </p>
          <Table
            head={["Activity", "What it means in practice"]}
            rows={[
              ["Prompting", "Write and refine the instructions that steer the model"],
              ["Context design", "Decide which documents, history and tool results go into each call"],
              ["Retrieval", "Find the right data from your own sources and hand it to the model"],
              ["Tool use", "Let the model call functions, such as search or a database lookup"],
              ["Model choice", "Balance quality, speed and cost across available models"],
              ["Evaluation", "Build test sets and metrics to measure whether changes help"],
              ["Safety and cost", "Guard against misuse, leaks and runaway token bills"],
              ["Observability", "Log and trace every call so failures can be debugged later"],
            ]}
          />
          <p>
            You will notice that very little of this is model training. Most of it is ordinary
            engineering: APIs, data pipelines, testing, monitoring and product thinking. What is new
            is that one component, the model, is probabilistic and can be wrong in ways that look
            confident.
          </p>
        </>
      ),
    },
    {
      id: "first-call",
      title: "What a first model call looks like",
      body: (
        <>
          <p>
            Here is the smallest useful example. It is illustrative: SDK names, method names and
            model names change often, so always check your provider's current documentation. Notice
            two habits. The key comes from an environment variable, never from the source code. The
            model name is a setting, so you can change it without editing logic.
          </p>
          <pre>
            <code>{`import os
from some_llm_sdk import Client  # illustrative: use your provider's real SDK

client = Client(api_key=os.environ["LLM_API_KEY"])
MODEL = os.environ.get("LLM_MODEL", "a-current-model")

def summarise(ticket_text: str) -> str:
    response = client.messages.create(
        model=MODEL,
        max_tokens=200,
        system="You summarise support tickets in two sentences. Be factual.",
        messages=[{"role": "user", "content": ticket_text}],
    )
    return response.text`}</code>
          </pre>
          <p>
            The <strong>system prompt</strong> sets the role and rules. The user message carries the
            data. <code>max_tokens</code> caps the length of the answer, which also caps your cost.
            Everything else in this course builds on this shape: better instructions, better
            context, more tools, and measurement around the call.
          </p>
        </>
      ),
    },
    {
      id: "nondeterminism",
      title: "Why this is different from normal software",
      body: (
        <>
          <p>
            A normal function returns the same output for the same input. An LLM does not
            guarantee that. Two runs of the same prompt can produce different wording, and a small
            change to the prompt can shift behaviour in surprising ways. The system is{" "}
            <strong>non-deterministic</strong>.
          </p>
          <p>This changes three habits.</p>
          <ul>
            <li>
              <strong>Testing.</strong> You cannot only check exact strings. You check properties
              (valid JSON, correct fields, no banned content) and you score quality over many
              examples.
            </li>
            <li>
              <strong>Releasing.</strong> A prompt edit is a code change. It needs a before and
              after comparison on a fixed test set, not a quick manual try.
            </li>
            <li>
              <strong>Trust.</strong> The model can state something false with total confidence.
              Design so that an occasional wrong answer is caught or harmless.
            </li>
          </ul>
          <Callout tone="warn">
            A demo that works on five examples proves very little. Many AI projects look finished
            in a demo and fall apart on real traffic. Build a small evaluation set early, even ten
            to twenty realistic cases, and grow it from real failures.
          </Callout>
        </>
      ),
    },
    {
      id: "cost-sense",
      title: "Cost is part of the design",
      body: (
        <>
          <p>
            Every call is billed by the amount of text processed. You will learn the details in the
            lesson on tokens, but the shape is simple:
          </p>
          <Formula>cost per call = input tokens × input price + output tokens × output price</Formula>
          <p>
            Suppose, purely as an illustration, a feature sends 2,000 input tokens and gets 300
            tokens back, at 2 dollars per million input tokens and 10 dollars per million output
            tokens. That is 2,000 × 2 ÷ 1,000,000 = 0.004 dollars in, plus 300 × 10 ÷ 1,000,000 =
            0.003 dollars out, so 0.007 dollars per call. At 50,000 calls a day that is 350 dollars
            a day. A prompt that is twice as long doubles the input part immediately. Real prices
            differ by provider and change over time, so always look them up.
          </p>
          <p>
            An AI engineer therefore treats prompt length, model size and call count as design
            decisions, not afterthoughts.
          </p>
        </>
      ),
    },
    {
      id: "path",
      title: "The path through this course",
      body: (
        <>
          <p>
            The course follows the order in which most products grow. You start with how models
            behave, then prompting and context, then picking and calling models. Next come
            embeddings, vector databases and retrieval so the model can use your data. After that
            come agents and tool protocols, then safety, observability and evaluation, which keep
            the whole thing honest.
          </p>
          <Callout tone="tip">
            Resist the urge to reach for agents and frameworks first. A single well-written prompt
            with the right context solves a surprising number of real problems. Add machinery only
            when a measured failure demands it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An AI engineer builds reliable products on top of existing models rather than training new ones.",
    "The work is mostly engineering around the model: prompts, context, retrieval, tools, evals, safety and cost.",
    "Model output is non-deterministic, so test properties and quality over many examples, not exact strings.",
    "Cost scales with tokens, so prompt length and call volume are design decisions.",
    "Start simple: a good prompt with the right context before agents or frameworks.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main focus of an AI engineer?",
      options: [
        "Pre-training new foundation models from scratch",
        "Designing GPU hardware",
        "Building reliable products on top of existing models",
        "Labelling training data by hand",
      ],
      answer: 2,
      explain:
        "AI engineers use models through APIs or hosting and build the prompts, context, tools and checks around them.",
    },
    {
      kind: "mcq",
      q: "Why is checking only exact output strings a weak test for an LLM feature?",
      options: [
        "Models never produce text",
        "Wording can vary between runs even when the answer is fine",
        "Strings cannot be compared in Python",
        "Tests are not needed for LLMs",
      ],
      answer: 1,
      explain:
        "Output is non-deterministic, so test properties such as valid structure and score quality across many examples.",
    },
    {
      kind: "text",
      q: "What is the usual name for the text that sets a model's role and rules before the user's message? Two words.",
      format: "****** ******",
      accept: ["system prompt", "system message", "system instruction"],
      explain: "The system prompt carries the role, tone and constraints for the whole conversation.",
    },
    {
      kind: "text",
      q: "A call uses 1,000 input tokens at 2 dollars per million and 100 output tokens at 10 dollars per million. What is the cost in dollars?",
      format: "*****",
      accept: ["0.003", ".003", "$0.003", "0.003 dollars"],
      explain: "Input: 1,000 × 2 ÷ 1,000,000 = 0.002. Output: 100 × 10 ÷ 1,000,000 = 0.001. Total 0.003.",
    },
  ],
};

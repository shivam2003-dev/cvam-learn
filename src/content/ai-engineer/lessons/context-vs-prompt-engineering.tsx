import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Explain the difference between prompt engineering and context engineering",
    "List everything that competes for space in the context window",
    "Work out a token budget for a single request",
    "Show how conversation history makes input cost grow faster than it looks",
  ],
  tasks: [
    {
      id: "problem",
      title: "The prompt is the smallest part",
      body: (
        <>
          <p>
            Early work with language models was mostly about wording. People found that small changes
            to an instruction, such as adding &quot;think step by step&quot;, changed the results,
            and <strong>prompt engineering</strong> became the name for that craft: writing the
            instruction well.
          </p>
          <p>
            Real products quickly outgrew it. A support assistant does not only receive an
            instruction. On each call it also needs the customer's account, the relevant policy
            pages, the tools it may use, a summary of what was said earlier and the customer's new
            message. None of that is the instruction, yet all of it decides whether the answer is
            right.
          </p>
          <p>
            <strong>Context engineering</strong> is the practice of deciding what goes into the
            model's window on every call, how it is arranged, and what stays out. Prompt engineering
            is one part of it.
          </p>
        </>
      ),
    },
    {
      id: "analogy",
      title: "An analogy: the open-book exam",
      body: (
        <>
          <p>
            Picture an exam where the student may bring a desk of notes, but the desk is small. The
            student is smart, yet cannot know anything that is not in their head or on the desk. A
            good teacher does not just write clearer questions. They choose which notes go on the
            desk.
          </p>
          <ul>
            <li>Too few notes, and the student guesses.</li>
            <li>Too many, and the useful page gets buried under the rest.</li>
            <li>Out-of-date or wrong notes, and the student confidently writes a wrong answer.</li>
            <li>Notes in a confusing order, and the student misses the key line.</li>
          </ul>
          <p>
            The context window is the desk. The model is the student. Your job, as the engineer, is
            to set the desk before every question.
          </p>
          <Table
            head={["", "Prompt engineering", "Context engineering"]}
            rows={[
              ["Question it answers", "How should I word the instruction?", "What should the model see right now?"],
              ["Scope", "One piece of text", "The whole window, every call"],
              ["Changes", "When you edit the prompt", "On every request, by code"],
              ["Typical tools", "Examples, roles, formats", "Retrieval, memory, tool selection, trimming"],
              ["Main risk", "Ambiguous wording", "Missing, stale, noisy or conflicting content"],
            ]}
          />
        </>
      ),
    },
    {
      id: "contents",
      title: "What competes for the window",
      body: (
        <>
          <p>
            Everything the model reads in one call must fit in the <strong>context window</strong>,
            which is the model's limit on tokens per request. Input and the reply it writes share
            that limit. These are the usual occupants:
          </p>
          <ul>
            <li>
              <strong>System instructions:</strong> role, rules, output format.
            </li>
            <li>
              <strong>Tool definitions:</strong> names, descriptions and argument schemas of tools
              the model may call.
            </li>
            <li>
              <strong>Retrieved knowledge:</strong> documents or database rows fetched for this
              question.
            </li>
            <li>
              <strong>Memory:</strong> facts saved from earlier sessions.
            </li>
            <li>
              <strong>Conversation history:</strong> earlier turns and tool results.
            </li>
            <li>
              <strong>The new user message.</strong>
            </li>
            <li>
              <strong>Room for the reply:</strong> tokens you must leave free for output.
            </li>
          </ul>
          <p>
            It helps to treat this like a budget, because a window is finite and each item has a
            price in tokens.
          </p>
          <Formula>input budget = window size − reply reserve − fixed parts</Formula>
        </>
      ),
    },
    {
      id: "budget",
      title: "A worked token budget",
      body: (
        <>
          <p>
            Take an illustrative window of 100,000 tokens (real sizes vary by model, so look up the
            one you use). A support assistant plans its call like this:
          </p>
          <Table
            head={["Part", "Tokens"]}
            rows={[
              ["System instructions", "1,500"],
              ["Tool definitions", "3,000"],
              ["Retrieved policy text", "6,000"],
              ["Conversation history", "8,000"],
              ["New user message", "200"],
              ["Reserve for the reply", "2,000"],
              ["Total planned", "20,700"],
            ]}
          />
          <pre>
            <code>{`1,500 + 3,000 + 6,000 + 8,000 + 200 + 2,000 = 20,700
100,000 − 20,700 = 79,300 tokens spare`}</code>
          </pre>
          <p>
            That looks roomy. But spare space is not a target to fill. More text means more cost,
            more delay and, often, a model that pays less attention to the line that matters. A
            smaller, cleaner context frequently beats a bigger, noisier one. The question to ask for
            each piece is not &quot;does it fit?&quot; but &quot;does it help this answer?&quot;
          </p>
          <Callout tone="tip">
            Make the budget visible. Log the token count of each part on every call. When a bill
            jumps or answers get worse, you can see which part grew.
          </Callout>
        </>
      ),
    },
    {
      id: "history",
      title: "History makes input grow faster than you think",
      body: (
        <>
          <p>
            The model has no memory between calls, so a chat app resends the full conversation on
            every turn. Suppose each turn (a user message plus a reply) adds about 500 tokens.
          </p>
          <pre>
            <code>{`turn 1 sends  500 tokens
turn 2 sends 1,000 tokens
turn 3 sends 1,500 tokens
...
turn 10 sends 5,000 tokens

total input over 10 turns = 500 × (1 + 2 + ... + 10) = 500 × 55 = 27,500 tokens`}</code>
          </pre>
          <p>
            The conversation itself is only 5,000 tokens long, but you pay for 27,500 tokens of
            input across the ten calls, more than five times as much. Total cost grows roughly with
            the square of the number of turns. This is the reason long chats get slow and costly,
            and the reason later lessons cover memory, compaction and caching.
          </p>
          <Callout tone="warn">
            A bigger window does not remove this problem. It lets you postpone it, while the cost
            and the risk of distracting the model keep rising.
          </Callout>
        </>
      ),
    },
    {
      id: "habits",
      title: "How to think like a context engineer",
      body: (
        <>
          <ul>
            <li>
              <strong>Ask what the model needs to know to answer this one question,</strong> then
              fetch exactly that. Do not paste everything you have.
            </li>
            <li>
              <strong>Put the source of truth in the context,</strong> not in the model's memory.
              Models can be out of date or confidently wrong about your private data.
            </li>
            <li>
              <strong>Treat each piece as untrusted until proven otherwise.</strong> Retrieved text
              and tool results can contain mistakes or hostile instructions.
            </li>
            <li>
              <strong>Measure.</strong> Change what goes in, then compare answers on saved examples,
              as with prompts.
            </li>
          </ul>
          <p>
            In short: the prompt tells the model what to do, and the context decides whether it
            can.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Prompt engineering is wording the instruction; context engineering is choosing everything the model sees on each call.",
    "The window holds instructions, tools, retrieved data, memory, history, the new message and room for the reply.",
    "Plan a token budget and log each part, since spare room is not a reason to fill it.",
    "History is resent every turn, so total input cost grows roughly with the square of the turn count.",
    "Fetch what the model needs for this question, and treat every piece of context as untrusted until checked.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which statement best describes context engineering?",
      options: [
        "Writing the cleverest possible instruction",
        "Fine-tuning the model weights",
        "Choosing and arranging everything the model sees in the window on each call",
        "Increasing the temperature",
      ],
      answer: 2,
      explain: "It covers instructions, retrieval, tools, memory and history, not just the wording of one prompt.",
    },
    {
      kind: "mcq",
      q: "Why can a larger context window make answers worse if you fill it?",
      options: [
        "Extra, noisy text can bury the useful part and adds cost and latency",
        "The model refuses to read over half the window",
        "Tokens in the window are deleted after use",
        "Larger windows disable tool calling",
      ],
      answer: 0,
      explain: "More text is not more help. Irrelevant content distracts the model and costs money.",
    },
    {
      kind: "text",
      q: "A 16,000-token window holds 1,000 system, 2,500 tools, 5,000 retrieved, 4,500 history and a 2,000 reply reserve. How many tokens are left?",
      format: "*,***",
      accept: ["1000", "1,000", "1000 tokens", "1,000 tokens"],
      explain: "1,000 + 2,500 + 5,000 + 4,500 + 2,000 = 15,000. So 16,000 − 15,000 = 1,000.",
    },
    {
      kind: "text",
      q: "Each turn adds 500 tokens and the full history is resent each turn. What is the total input over 4 turns?",
      format: "*,***",
      accept: ["5000", "5,000", "5000 tokens", "5,000 tokens"],
      explain: "500 × (1 + 2 + 3 + 4) = 500 × 10 = 5,000 tokens.",
    },
  ],
};

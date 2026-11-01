import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain what a context window is and why a bigger window does not remove the need to manage it",
    "Calculate how much input a multi-turn chat really sends over its life",
    "Choose between trimming, summarising, retrieving and offloading",
    "Write a simple compaction routine that keeps what matters",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: the model only sees what you send",
      body: (
        <>
          <p>
            A language model has no memory between API calls. Each call, you send the text it should
            read, and it answers from that text alone. The maximum amount it can read and write in
            one call is its <strong>context window</strong>, measured in tokens. A token is a chunk
            of text, roughly four characters of English on average.
          </p>
          <p>
            The window is shared. Your input and the model's output both count against it. If a
            model has a window of 100,000 tokens (an illustrative number; check your provider's docs
            for real ones) and you want to leave room for a 4,000-token answer, you have 96,000
            tokens for input.
          </p>
          <Formula>input budget = window size − reserved output tokens</Formula>
          <p>
            A chat app, a coding agent or a document analyser all hit the same wall. History grows,
            tool results pile up, files get pasted in. Sooner or later the next call will not fit,
            or it will fit but cost a lot and answer worse. Managing this is a daily part of AI
            engineering.
          </p>
          <p>
            An analogy: the window is a desk. A bigger desk lets you spread out more paper. It does
            not make you better at finding the one page you need in a pile of five hundred.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "Why history gets expensive: the resend problem",
      body: (
        <>
          <p>
            Because the model is stateless, a chat app resends the whole history on every turn. That
            makes total input grow with the square of the number of turns, not linearly.
          </p>
          <p>
            Suppose every turn (a question plus an answer) adds 500 tokens to the history, and each
            request carries the full history including the newest turn. Turn 1 sends 500 tokens.
            Turn 2 sends 1,000. Turn n sends 500 × n.
          </p>
          <Formula>total input over n turns = 500 × (1 + 2 + ... + n) = 500 × n(n+1)/2</Formula>
          <pre>
            <code>{`n = 20 turns
total input = 500 × 20 × 21 / 2 = 500 × 210 = 105,000 tokens
history after 20 turns = 500 × 20 = 10,000 tokens`}</code>
          </pre>
          <p>
            You only ever created 10,000 tokens of conversation, but you paid to send 105,000. At
            40 turns it is 500 × 820 = 410,000. Doubling the length quadruples the bill, roughly.
          </p>
          <Callout tone="tip">
            Prompt caching (a later lesson) makes the repeated part much cheaper, but it does not
            shrink the window. You still need a plan for when history gets too big.
          </Callout>
        </>
      ),
    },
    {
      id: "rot",
      title: "Bigger windows still degrade",
      body: (
        <>
          <p>
            It is tempting to say: windows are huge now, so just paste everything in. Three things
            push back.
          </p>
          <ul>
            <li>
              <strong>Cost and latency.</strong> You pay for every input token, and the model must
              process all of them before it starts answering.
            </li>
            <li>
              <strong>Uneven attention.</strong> Models tend to use information at the start and end
              of a long input more reliably than information buried in the middle. The exact effect
              differs by model, so test yours instead of assuming.
            </li>
            <li>
              <strong>Noise.</strong> Irrelevant text competes with the relevant text. More context
              is not the same as better context.
            </li>
          </ul>
          <p>
            A practical rule: put instructions and the question where the model will not miss them
            (the start, and often repeated at the end), and put only the material that is needed for
            this step in the middle.
          </p>
        </>
      ),
    },
    {
      id: "strategies",
      title: "Four ways to cope",
      body: (
        <>
          <Table
            head={["Strategy", "How it works", "Good for", "Risk"]}
            rows={[
              ["Trim", "Drop the oldest messages (a sliding window)", "Casual chat, short tasks", "Forgets early facts"],
              ["Summarise", "Replace old turns with a short summary", "Long chats, agents", "Summary can lose details"],
              ["Retrieve", "Keep data outside; fetch only relevant pieces", "Large documents, knowledge bases", "Retrieval can miss"],
              ["Offload", "Write notes or files; read them back when needed", "Long agent tasks", "Needs good note discipline"],
            ]}
          />
          <p>
            Most real systems combine them. Keep the system prompt and task goal fixed. Keep the
            last few turns word for word. Summarise the middle. Retrieve reference material on
            demand.
          </p>
          <p>
            Another cheap win is clearing stale tool output. If an agent ran a command last hour and
            got 8,000 tokens of logs, the useful part is usually one line. Replace the old result
            with a note like &quot;test run: 2 failures in auth.py&quot; once it has been used.
          </p>
        </>
      ),
    },
    {
      id: "compaction",
      title: "Compaction in code",
      body: (
        <>
          <p>
            <strong>Compaction</strong> means shrinking the history when it nears the limit,
            usually by summarising the older part. The routine below triggers at 75% of the window,
            keeps the last 10 messages verbatim and summarises the rest. It is illustrative: the
            token counter is a rough estimate, and <code>summarize</code> stands for a call to your
            model of choice.
          </p>
          <pre>
            <code>{`CONTEXT_LIMIT = 100_000   # illustrative; use your model's real limit
COMPACT_AT = 0.75         # compact when 75% full
KEEP_RECENT = 10          # newest messages stay word for word

def rough_tokens(text: str) -> int:
    return len(text) // 4          # ~4 characters per token for English

def total_tokens(messages: list[dict]) -> int:
    return sum(rough_tokens(m["content"]) for m in messages)

SUMMARY_PROMPT = """Summarise the conversation below for your own later use.
Keep: decisions made, user preferences, file names, IDs and numbers
exactly as written, and any open questions. Drop pleasantries."""

def compact(messages, summarize):
    if total_tokens(messages) < CONTEXT_LIMIT * COMPACT_AT:
        return None, messages                      # nothing to do yet
    old, recent = messages[:-KEEP_RECENT], messages[-KEEP_RECENT:]
    summary = summarize(SUMMARY_PROMPT, old)       # one extra model call
    return summary, recent

# Caller puts the summary in the system prompt, then sends 'recent':
# system = BASE_SYSTEM + "\\n\\nEarlier conversation:\\n" + summary`}</code>
          </pre>
          <p>Here is the arithmetic for a typical run:</p>
          <pre>
            <code>{`trigger point        = 100,000 × 0.75 = 75,000 tokens
after compaction:
  system + tools     =  5,000
  summary            =  1,500
  10 recent turns    = 10 × 500 = 5,000
  total              = 11,500 tokens   (about 15% of the trigger point)`}</code>
          </pre>
          <Callout tone="warn">
            Summaries are lossy, and loss compounds. If you summarise a summary five times, small
            errors become confident facts. Keep exact identifiers, numbers and the user's stated
            goals verbatim, and consider storing the raw history somewhere you can look it up
            again.
          </Callout>
          <p>
            Also remember that changing the start of your prompt can invalidate a cache. Compact in
            big, infrequent steps, not every turn.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "The context window is shared between input and output, so reserve room for the answer.",
    "Chat apps resend history every turn, so total input grows roughly with the square of the turn count.",
    "A bigger window does not mean better answers: cost, latency and noise all rise with length.",
    "Combine strategies: fixed instructions, recent turns verbatim, summaries for the middle, retrieval for reference.",
    "Summaries are lossy, so keep exact identifiers and goals, and compact in infrequent steps.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where should you place your most important instructions in a long prompt?",
      options: [
        "Buried in the middle so the model has to work for them",
        "Only in a footnote",
        "At the start, and often repeated at the end",
        "Anywhere; position never matters",
      ],
      answer: 2,
      explain: "Models tend to use the start and end of long inputs more reliably than the middle.",
    },
    {
      kind: "mcq",
      q: "Which strategy replaces old turns with a short version of them?",
      options: ["Trimming", "Summarising", "Retrieving", "Streaming"],
      answer: 1,
      explain: "Summarising (compaction) swaps old messages for a condensed note. Trimming just drops them.",
    },
    {
      kind: "text",
      q: "A chat adds 200 tokens per turn and resends the full history, including the newest turn, each time. How many input tokens are sent in total over 10 turns?",
      format: "*****",
      accept: ["11000", "11,000"],
      explain: "200 × (1 + 2 + ... + 10) = 200 × 55 = 11,000.",
    },
    {
      kind: "text",
      q: "A window is 100,000 tokens and you reserve 4,000 for the output. How many tokens can the input use?",
      format: "******",
      accept: ["96000", "96,000"],
      explain: "Input budget = 100,000 − 4,000 = 96,000.",
    },
  ],
};

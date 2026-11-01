import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Name the main sources that feed a model's context",
    "Explain who controls each source and how far to trust it",
    "Assemble a context from several sources under a token budget",
    "Calculate the recurring cost of tool definitions",
  ],
  tasks: [
    {
      id: "problem",
      title: "Context does not assemble itself",
      body: (
        <>
          <p>
            In the last lesson we said context engineering means choosing what the model sees. That
            raises a practical question: where does all of that text come from, and who puts it
            there? In a real application the answer is a piece of code that gathers material from
            many places, filters it and builds the final request. This code is the{" "}
            <strong>context layer</strong>.
          </p>
          <p>
            Think of it as a kitchen pass in a restaurant. Orders arrive from the front. Ingredients
            come from the fridge, the pantry and the prep station. The cook does not wander around
            collecting things; the pass delivers a plate ready to cook. The context layer prepares
            the plate for the model. Getting this layer right matters more than any single prompt.
          </p>
        </>
      ),
    },
    {
      id: "sources",
      title: "The main sources",
      body: (
        <>
          <Table
            head={["Source", "Where it comes from", "Changes", "Trust"]}
            rows={[
              ["Instructions", "Your code and config", "Per release", "High: you wrote it"],
              ["Tool definitions", "Your tool registry or MCP servers", "Per release or per user", "High if yours, lower if third party"],
              ["Retrieved knowledge", "Search, vector store, database", "Per question", "Medium: can be stale or wrong"],
              ["Memory", "A store of saved facts", "Per session", "Medium: may be outdated"],
              ["Conversation history", "Earlier turns", "Every turn", "Mixed: includes user and tool text"],
              ["User input", "The person typing", "Every turn", "Low: treat as untrusted"],
              ["Tool results", "APIs, web pages, files", "Every call", "Low to medium: external data"],
            ]}
          />
          <p>Each source needs its own thinking.</p>
          <ul>
            <li>
              <strong>Instructions</strong> are stable and cacheable. Keep them first and keep them
              short enough that the rules are not lost among filler.
            </li>
            <li>
              <strong>Tool definitions</strong> tell the model what it may do. Each definition is
              text the model reads on every call, so a long tool list costs tokens even when no tool
              is used.
            </li>
            <li>
              <strong>Retrieved knowledge</strong> is how you give the model facts it was never
              trained on. The retrieval lessons later in the course cover how to find the right
              chunks.
            </li>
            <li>
              <strong>Memory</strong> holds facts that outlive one conversation, such as a user's
              preferred language. The next lesson covers it.
            </li>
            <li>
              <strong>History</strong> keeps the conversation coherent, but it grows without bound
              unless you manage it.
            </li>
            <li>
              <strong>User input and tool results</strong> come from outside your control. They may
              be wrong, huge or hostile.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "tool-cost",
      title: "Tool definitions are a standing cost",
      body: (
        <>
          <p>
            Teams often connect many tools and forget that every definition rides along on every
            request. Take an illustrative assistant with 12 tools, each described in about 250
            tokens (a name, a description and an argument schema).
          </p>
          <Formula>tool overhead per call = number of tools × tokens per definition</Formula>
          <pre>
            <code>{`per call : 12 × 250 = 3,000 tokens
per day  : 50,000 calls × 3,000 = 150,000,000 tokens (150 million)
cost     : 150 million × 3 dollars per million = 450 dollars per day (illustrative price)`}</code>
          </pre>
          <p>
            That is the cost of tools the model may never touch on most calls. Options: show only the
            tools relevant to the current task, shorten descriptions, or cache the fixed prefix.
            Fewer tools also helps accuracy, because the model has fewer similar options to confuse.
          </p>
          <Callout tone="note">
            Prices change and caching discounts differ by provider. The point is the shape of the
            arithmetic: tool count, times definition size, times calls.
          </Callout>
        </>
      ),
    },
    {
      id: "assemble",
      title: "Assembling a context in code",
      body: (
        <>
          <p>
            A context builder takes the sources, decides what fits and returns messages. Here is a
            small version with a token budget. It uses a rough rule of thumb of about four
            characters per token for English text; use your provider's token counter in real code.
          </p>
          <pre>
            <code>{`# Illustrative sketch; replace count_tokens with a real tokenizer.
def count_tokens(text: str) -> int:
    return max(1, len(text) // 4)      # rough English estimate only

def build_context(system, memory_facts, retrieved_docs, history, user_msg,
                  budget=8000, reply_reserve=1000):
    room = budget - reply_reserve
    room -= count_tokens(system) + count_tokens(user_msg)   # always included

    parts = []
    # 1. Memory: short, high value, add first.
    if memory_facts:
        mem = "Known about this user:\\n" + "\\n".join("- " + f for f in memory_facts)
        if count_tokens(mem) <= room:
            parts.append(mem)
            room -= count_tokens(mem)

    # 2. Retrieved docs: best first, stop when out of room.
    for doc in retrieved_docs:                 # already ranked by relevance
        cost = count_tokens(doc)
        if cost > room // 2:                   # leave space for history
            break
        parts.append("<doc>\\n" + doc + "\\n</doc>")
        room -= cost

    # 3. History: newest turns first, until room runs out.
    kept = []
    for msg in reversed(history):
        cost = count_tokens(msg["content"])
        if cost > room:
            break
        kept.append(msg)
        room -= cost
    kept.reverse()

    system_full = system + "\\n\\n" + "\\n\\n".join(parts)
    return [{"role": "system", "content": system_full}, *kept,
            {"role": "user", "content": user_msg}]`}</code>
          </pre>
          <p>Notice the decisions baked into it:</p>
          <ul>
            <li>System text and the user message are non-negotiable, so they are subtracted first.</li>
            <li>Sources are added in priority order, so the least valuable are the ones that get cut.</li>
            <li>Documents are wrapped in tags so the model can tell data from instructions.</li>
            <li>History keeps the newest turns, since they are usually the most relevant.</li>
          </ul>
        </>
      ),
    },
    {
      id: "rules",
      title: "Rules of thumb for each source",
      body: (
        <>
          <ul>
            <li>
              <strong>Just in time, not just in case.</strong> Fetch retrieved data and tool results
              when the question needs them. Do not preload everything.
            </li>
            <li>
              <strong>Label provenance.</strong> Tell the model where each piece came from, such as
              a document title or a tool name. It helps the model weigh sources, and helps you
              debug a wrong answer.
            </li>
            <li>
              <strong>Order for stability.</strong> Put stable parts first and changing parts last.
              That suits prompt caching and keeps the key instruction in a predictable spot.
            </li>
            <li>
              <strong>Cap everything.</strong> Limit the size of tool results and retrieved chunks. A
              single oversized web page can push out all the rest.
            </li>
            <li>
              <strong>Keep untrusted text away from instructions.</strong> Never paste user or
              retrieved text into the system prompt without clear delimiters, and do not give it
              authority it does not have.
            </li>
          </ul>
          <Callout tone="warn">
            Conflicting sources are a quiet failure. If memory says the user prefers metric units
            and a retrieved document says imperial, the model may pick either. Decide which source
            wins and say so in the instructions.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The context layer is the code that gathers, filters and orders everything the model sees.",
    "Main sources: instructions, tool definitions, retrieved knowledge, memory, history, user input and tool results.",
    "Sources differ in how often they change and how far you can trust them; user input and tool results are least trusted.",
    "Tool definitions are sent on every call, so tool count times definition size is a standing cost.",
    "Add sources in priority order under a token budget, label where each came from, and cap their size.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which source should be treated as least trusted?",
      options: [
        "Your own system instructions",
        "Your own tool schema",
        "A fixed config value",
        "Text returned by an external web page or file tool",
      ],
      answer: 3,
      explain: "External content can be wrong, oversized or contain hostile instructions.",
    },
    {
      kind: "mcq",
      q: "Why does a long list of tools raise cost even when none are called?",
      options: [
        "Tools are billed per definition per month",
        "Definitions are text the model reads on every request",
        "The model must restart for each tool",
        "Tool calls always cost double",
      ],
      answer: 1,
      explain: "Names, descriptions and schemas are input tokens on every call.",
    },
    {
      kind: "mcq",
      q: "When trimming history to fit a budget, which turns are usually kept first?",
      options: [
        "The oldest",
        "A random sample",
        "The newest",
        "None; history is dropped entirely",
      ],
      answer: 2,
      explain: "Recent turns are usually the most relevant, so keep those and drop the oldest first.",
    },
    {
      kind: "text",
      q: "An assistant has 12 tools at 250 tokens each. How many tokens of tool definitions go with every call?",
      format: "*,***",
      accept: ["3000", "3,000", "3000 tokens", "3,000 tokens"],
      explain: "12 × 250 = 3,000 tokens per call.",
    },
  ],
};

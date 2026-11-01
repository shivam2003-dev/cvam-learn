import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Name the four common ways a long context goes wrong: poisoning, distraction, confusion and clash",
    "Recognise the symptom of each failure in a real system",
    "Apply a prevention technique to each failure",
    "Measure how much of your context is actually relevant",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: more context can make answers worse",
      body: (
        <>
          <p>
            You built a context layer: instructions, retrieved documents, tool results, memory and
            history. It works in a demo. After a week of real use, the agent starts repeating
            itself, ignoring instructions, calling the wrong tool, or insisting on something false.
            The model did not get worse. The context did.
          </p>
          <p>
            It helps to have names for the failures, because each has a different cure. The four
            below are a useful working vocabulary. They are not formal standards, and real incidents
            often mix them.
          </p>
          <Table
            head={["Failure", "What goes wrong", "Typical symptom"]}
            rows={[
              ["Poisoning", "A wrong or malicious statement enters the context and is treated as true", "The agent keeps building on one false fact"],
              ["Distraction", "The context is so long that the model leans on it and neglects its training or the task", "Repeats past actions; ignores the goal"],
              ["Confusion", "Irrelevant material or too many options sway the answer", "Wrong tool picked; off-topic details in the output"],
              ["Clash", "Parts of the context contradict each other", "Flip-flopping answers; one piece of advice, then the opposite"],
            ]}
          />
        </>
      ),
    },
    {
      id: "poisoning",
      title: "Poisoning: one bad fact that sticks",
      body: (
        <>
          <p>
            <strong>Context poisoning</strong> happens when something false gets into the context
            and then keeps being reused. A common path: the model hallucinates a detail, writes it
            into a notes file or long-term memory, and from then on every call reads it back as
            trusted fact. The error feeds itself.
          </p>
          <p>
            Imagine a travel agent that wrongly records &quot;user is vegetarian&quot; after a
            misread message. Ten turns later every restaurant suggestion is vegetarian, and the user
            has stopped trusting the tool.
          </p>
          <p>Ways to prevent it:</p>
          <ul>
            <li>Do not write model guesses straight into long-term memory. Validate or ask the user first.</li>
            <li>Store the source and a timestamp with every remembered fact, so you can trace and expire it.</li>
            <li>Keep scratch work separate from confirmed state. Reasoning notes are not facts.</li>
            <li>Offer a way to inspect and delete memory. Quarantine suspicious entries instead of silently using them.</li>
          </ul>
          <pre>
            <code>{`def remember(store, key, value, source, confirmed=False):
    store[key] = {
        "value": value,
        "source": source,            # e.g. "user_message_14" or "web_page"
        "confirmed": confirmed,      # guessed facts start as False
    }

def trusted_facts(store):
    return {k: v["value"] for k, v in store.items() if v["confirmed"]}`}</code>
          </pre>
          <Callout tone="warn">
            Poisoning is also a security issue when the bad text comes from an attacker, for
            example a web page the agent read. The next lesson covers that side.
          </Callout>
        </>
      ),
    },
    {
      id: "distraction",
      title: "Distraction: drowning in history",
      body: (
        <>
          <p>
            As a context grows, the model may over-focus on what is already there. In a long agent
            run it may copy earlier actions instead of planning a new one, or follow patterns in its
            own past outputs rather than your instructions. The task gets lost in the pile.
          </p>
          <p>A simple health check is the fraction of the context that matters for the current step:</p>
          <Formula>relevance = relevant tokens ÷ total tokens</Formula>
          <pre>
            <code>{`context = 40,000 tokens
relevant to this step = 2,000 tokens
relevance = 2,000 / 40,000 = 0.05  (5%)`}</code>
          </pre>
          <p>
            At 5%, the model reads 19 tokens of noise for every 1 token of signal. Fixes: compact
            the history, clear old tool outputs, restart with a fresh context plus a short handoff
            note, and restate the goal near the end of the prompt.
          </p>
        </>
      ),
    },
    {
      id: "confusion",
      title: "Confusion: too many choices, too much noise",
      body: (
        <>
          <p>
            <strong>Context confusion</strong> is when superfluous material changes the answer. The
            classic case is tools. Give a model 40 tool definitions and it must read all of them to
            choose one, and similar-looking tools get mixed up.
          </p>
          <pre>
            <code>{`40 tools × 300 tokens each = 12,000 tokens of definitions on every call
Only the 5 most relevant tools: 5 × 300 = 1,500 tokens`}</code>
          </pre>
          <p>
            That is an 87.5% cut (10,500 of 12,000 tokens saved), and usually a better choice rate
            too. The same idea applies to documents: five well-chosen passages beat fifty loosely
            related ones.
          </p>
          <ul>
            <li><strong>Load tools on demand.</strong> Pick a small set per task, by routing or by searching tool descriptions.</li>
            <li><strong>Retrieve less, rank better.</strong> Return the top few chunks, not everything above a low score.</li>
            <li><strong>Write distinct tool names and descriptions</strong> so two tools are never near-duplicates.</li>
            <li><strong>Split the job.</strong> Give a sub-task to a focused call that sees only what it needs.</li>
          </ul>
        </>
      ),
    },
    {
      id: "clash",
      title: "Clash: the context argues with itself",
      body: (
        <>
          <p>
            <strong>Context clash</strong> is a contradiction inside the context. Early in the chat
            the user says their budget is 500; later they say 800. A retrieved policy says refunds
            take 14 days, an older page says 30. The model has no way to know which is right, so it
            may pick one, mix them, or waver.
          </p>
          <p>Clash often appears when information arrives in pieces over many turns, or when old and new document versions are both indexed.</p>
          <ul>
            <li>Keep one current value per fact. When a new value arrives, overwrite or mark the old one as superseded.</li>
            <li>Attach dates and versions to retrieved material, and prefer the newest.</li>
            <li>Remove stale chunks from the index, not just from the prompt.</li>
            <li>Tell the model the rule: &quot;If sources conflict, prefer the most recent and say so.&quot;</li>
          </ul>
          <pre>
            <code>{`def update_fact(store, key, new_value, turn):
    old = store.get(key)
    if old and old["value"] != new_value:
        old["superseded_at_turn"] = turn     # keep history, but flag it
        store[key + "_history"] = store.get(key + "_history", []) + [old]
    store[key] = {"value": new_value, "turn": turn}`}</code>
          </pre>
          <Callout tone="tip">
            When behaviour looks strange, print the exact context the model received for that call.
            Most of these failures are visible within a minute of reading it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Poisoning, distraction, confusion and clash are four useful names for how a context goes wrong.",
    "Poisoning: a false fact gets saved and reused. Validate before storing, and record sources.",
    "Distraction: history swamps the task. Compact, clear old outputs, and restate the goal.",
    "Confusion: too many tools or loose documents. Load fewer, better-chosen items.",
    "Clash: contradictory sources. Keep one current value per fact and prefer the newest version.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "An agent stores a hallucinated detail in memory and keeps using it as fact. Which failure is this?",
      options: ["Clash", "Confusion", "Distraction", "Poisoning"],
      answer: 3,
      explain: "A wrong statement entered the context and was treated as true, so it keeps being reused.",
    },
    {
      kind: "mcq",
      q: "Two retrieved pages give different refund windows. Which fix addresses the cause best?",
      options: [
        "Retrieve even more pages",
        "Version and date the sources, and remove stale ones from the index",
        "Raise the temperature",
        "Shorten the system prompt",
      ],
      answer: 1,
      explain: "This is clash. Removing outdated material and preferring the newest version resolves the contradiction.",
    },
    {
      kind: "text",
      q: "An agent has 30 tool definitions of 400 tokens each. How many tokens do they use on every call?",
      format: "*****",
      accept: ["12000", "12,000"],
      explain: "30 × 400 = 12,000 tokens.",
    },
    {
      kind: "text",
      q: "What one-word name is given to a wrong fact entering the context and being reused as truth?",
      format: "*********",
      accept: ["poisoning"],
      explain: "Context poisoning: the bad fact spreads because later steps trust it.",
    },
  ],
};

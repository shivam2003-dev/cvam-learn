import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Distinguish short-term history, working state and long-term memory",
    "Keep a conversation within budget using a rolling window and a summary",
    "Decide what is worth saving to long-term memory",
    "Handle staleness, privacy and deletion for stored memories",
  ],
  tasks: [
    {
      id: "problem",
      title: "A model that forgets everything",
      body: (
        <>
          <p>
            A language model is <strong>stateless</strong>. Each call starts from zero. If a user
            says their name is Priya in turn one and asks &quot;what's my name?&quot; in turn five, the
            model only knows if you put turn one back into the request. Anything that feels like
            memory in a chat product is your code doing that.
          </p>
          <p>
            Compare a goldfish-brained assistant with a good one that keeps a notebook. Each time you
            speak to it, it first reads its notes, then answers, then writes anything worth keeping.
            Memory systems are the notebook, and the craft is in deciding what to write down and
            what to read back.
          </p>
        </>
      ),
    },
    {
      id: "kinds",
      title: "Three kinds of memory and state",
      body: (
        <>
          <Table
            head={["Kind", "Lives for", "Where it is kept", "Example"]}
            rows={[
              ["Short-term (history)", "One conversation", "The message list you resend", "The last ten turns"],
              ["Working state", "One task or run", "Variables in your app or a state object", "Items in a cart, current step of a plan"],
              ["Long-term memory", "Across sessions", "A database or vector store", "User prefers short answers; works in Python"],
            ]}
          />
          <p>
            Keep these separate in your design. <strong>History</strong> is raw text, resent each
            turn. <strong>Working state</strong> is structured data your program owns; the model reads
            it and may ask to change it through tools, but your code holds the truth.{" "}
            <strong>Long-term memory</strong> is a store you search and load selectively.
          </p>
          <Callout tone="tip">
            Prefer storing state in your own data structures over asking the model to remember it.
            A shopping cart in a database never forgets or hallucinates an item. A cart described only
            in chat text eventually will.
          </Callout>
        </>
      ),
    },
    {
      id: "short-term",
      title: "Short-term memory: window plus summary",
      body: (
        <>
          <p>
            Resending the full history gets expensive and eventually overflows the window. The usual
            fix has two parts: keep the most recent messages word for word, and replace older ones
            with a short <strong>summary</strong>.
          </p>
          <Formula>tokens per call = summary tokens + (recent messages × tokens each)</Formula>
          <p>
            Take an illustrative 40-turn chat, so 80 messages at about 150 tokens each. Compare
            sending everything with a 6-message window plus a 300-token summary.
          </p>
          <pre>
            <code>{`full history : 80 × 150 = 12,000 tokens per call
window+sum   : 300 + (6 × 150) = 300 + 900 = 1,200 tokens per call
ratio        : 12,000 ÷ 1,200 = 10 times fewer input tokens`}</code>
          </pre>
          <p>
            The saving is real, and so is the risk: a summary can drop a detail that turns out to
            matter. Here is a simple version.
          </p>
          <pre>
            <code>{`# Illustrative: summarise() is a model call you write; count_tokens as before.
KEEP_LAST = 6

class Conversation:
    def __init__(self):
        self.summary = ""          # compressed older turns
        self.recent = []           # last few messages, verbatim

    def add(self, role, content):
        self.recent.append({"role": role, "content": content})
        if len(self.recent) > KEEP_LAST:
            old = self.recent[:-KEEP_LAST]
            self.recent = self.recent[-KEEP_LAST:]
            self.summary = summarise(self.summary, old)   # fold old into summary

    def messages(self, system):
        sys_text = system
        if self.summary:
            sys_text += "\\n\\nSummary of the earlier conversation:\\n" + self.summary
        return [{"role": "system", "content": sys_text}, *self.recent]`}</code>
          </pre>
          <p>
            Ask the summariser to keep names, numbers, decisions and open questions, and to drop
            pleasantries. Test it: replay a long chat, then check that it still knows the facts that
            matter.
          </p>
        </>
      ),
    },
    {
      id: "long-term",
      title: "Long-term memory: what to save",
      body: (
        <>
          <p>
            Long-term memory lets an assistant recall things from last week. The hard question is not
            storage, which is cheap. It is <em>what is worth saving</em> and <em>what to load back</em>.
          </p>
          <p>A useful memory is durable, specific and likely to matter again.</p>
          <ul>
            <li>
              <strong>Save:</strong> stable preferences, ongoing projects, decisions with reasons,
              corrections the user made, facts the user stated about themselves.
            </li>
            <li>
              <strong>Do not save:</strong> small talk, one-off questions, guesses the model made, and
              anything sensitive without a clear reason and consent.
            </li>
          </ul>
          <p>Write each memory as a small, self-contained fact with metadata:</p>
          <pre>
            <code>{`{
  "id": "mem_0192",
  "user_id": "u_42",
  "text": "Prefers answers in British English and metric units.",
  "created": "2025-04-02",
  "source": "stated by user",
  "last_used": "2025-06-11"
}`}</code>
          </pre>
          <p>There are two common read paths.</p>
          <ul>
            <li>
              <strong>Load all.</strong> For a handful of facts per user, put them all in the system
              prompt. Simple and reliable.
            </li>
            <li>
              <strong>Search.</strong> For many memories, embed each one and retrieve the few closest
              to the current question, the same method used for document retrieval. The embeddings
              lessons later in the course explain how.
            </li>
          </ul>
          <p>
            For writing, you can have the model propose memories at the end of a conversation, or
            let it call a <code>save_memory</code> tool. In both cases, filter proposals with rules
            or a review step. Left unchecked, models save too much and sometimes save wrong things.
          </p>
        </>
      ),
    },
    {
      id: "hygiene",
      title: "Staleness, privacy and trust",
      body: (
        <>
          <p>A memory store is a database of facts about people, and it needs the same care.</p>
          <ul>
            <li>
              <strong>Staleness.</strong> People change jobs, cities and preferences. Store a date,
              let new facts replace old ones on the same topic and expire things that rot quickly.
            </li>
            <li>
              <strong>Conflicts.</strong> When a new fact contradicts an old one, update the old
              record instead of keeping both. Two contradicting memories confuse the model.
            </li>
            <li>
              <strong>Privacy.</strong> Store the minimum. Never store secrets such as passwords or
              API keys. Tell users what is kept, and give them a way to view and delete it.
            </li>
            <li>
              <strong>Isolation.</strong> Scope every read and write by user ID. One user's memory
              appearing in another's context is a serious data leak.
            </li>
            <li>
              <strong>Trust.</strong> A memory is only as good as the text it was built from. If an
              attacker can get hostile text saved as a memory, it comes back on every future call.
              Treat saved memories as untrusted input when you load them.
            </li>
          </ul>
          <Callout tone="warn">
            Memory that is wrong is worse than no memory, because the model states it with
            confidence. Let users correct it, and prefer to say &quot;you mentioned&quot; so they can
            catch errors.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Models are stateless, so all memory is your code putting text back into the request.",
    "Separate history (resent text), working state (your data structures) and long-term memory (a searchable store).",
    "A rolling window plus a summary keeps cost flat: 12,000 tokens can shrink to 1,200 in the example.",
    "Save durable, specific facts only; skip small talk and sensitive data, and store dates for staleness.",
    "Scope memory by user, allow viewing and deletion, and treat loaded memories as untrusted input.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does an assistant seem to remember turn one at turn five?",
      options: [
        "The model stores each chat in its weights",
        "Your application resends earlier messages in the request",
        "The GPU caches the chat permanently",
        "The model reads your browser history",
      ],
      answer: 1,
      explain: "Models are stateless. Apparent memory is text your code includes in each request.",
    },
    {
      kind: "mcq",
      q: "A cart must never forget an item. Where should it live?",
      options: [
        "Only in the chat text",
        "Only in a summary the model writes",
        "In the model's weights",
        "In a data structure or database your code controls",
      ],
      answer: 3,
      explain: "Working state belongs in structured storage you own, not in text the model must recall.",
    },
    {
      kind: "mcq",
      q: "Which is the best candidate for long-term memory?",
      options: [
        "The user prefers metric units and short answers",
        "A joke the user made once",
        "The user's password",
        "A guess the model made about their mood",
      ],
      answer: 0,
      explain: "Durable, specific preferences are useful again. Secrets and guesses should not be stored.",
    },
    {
      kind: "text",
      q: "A summary of 300 tokens plus 6 recent messages at 150 tokens each is sent. How many tokens per call?",
      format: "*,***",
      accept: ["1200", "1,200", "1200 tokens", "1,200 tokens"],
      explain: "6 × 150 = 900, and 900 + 300 = 1,200 tokens.",
    },
    {
      kind: "text",
      q: "Which word describes a model that keeps nothing between separate calls?",
      format: "*********",
      accept: ["stateless"],
      explain: "Stateless means no information is retained between calls unless you send it again.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Define the context window and what counts toward it",
    "Explain why chat history must be resent and how that makes cost grow",
    "Describe what happens at the limit and the main ways to stay under it",
    "Recognise that a bigger window does not guarantee better use of its contents",
  ],
  tasks: [
    {
      id: "what",
      title: "What the model can see at once",
      body: (
        <>
          <p>
            A model has no hidden notebook. When it writes a reply, the only information it can use
            is the text it was given in that call, plus whatever it absorbed during training. The
            amount of text it can look at in a single call is the{" "}
            <strong>context window</strong>, measured in tokens.
          </p>
          <p>
            Picture a desk of fixed size. You can spread out notes, a few documents and your
            question, but only what fits on the desk is in front of the model. Anything left in the
            drawer might as well not exist for this call.
          </p>
          <p>
            Everything shares that one desk. The window covers your system prompt, the conversation
            so far, any documents or search results you added, tool definitions, and the reply the
            model is about to write.
          </p>
          <Formula>input tokens + output tokens ≤ context window</Formula>
          <p>
            Window sizes vary by model and keep changing, so look up the current figure in your
            provider's documentation instead of memorising one. Some providers also set a separate
            cap on output length that is smaller than the full window.
          </p>
        </>
      ),
    },
    {
      id: "stateless",
      title: "Models are stateless, so you resend history",
      body: (
        <>
          <p>
            A chat feels like a continuous conversation, but the model API is{" "}
            <strong>stateless</strong>: each call stands alone and nothing carries over. The
            illusion of memory is built by your code, which sends the earlier messages again with
            every new turn.
          </p>
          <pre>
            <code>{`history = [
    {"role": "user", "content": "My name is Asha."},
    {"role": "assistant", "content": "Nice to meet you, Asha."},
]

# Next turn: append the new question, then send EVERYTHING again.
history.append({"role": "user", "content": "What is my name?"})
reply = call_model(system=SYSTEM_PROMPT, messages=history)
history.append({"role": "assistant", "content": reply})`}</code>
          </pre>
          <p>
            If you left out the first two messages, the model would have no idea who Asha is. That
            is also why a long chat gets slower and costlier: the input grows with every turn.
          </p>
        </>
      ),
    },
    {
      id: "growth",
      title: "How fast does history grow?",
      body: (
        <>
          <p>
            Work through an illustrative chat. The system prompt is 500 tokens. Each user message
            is 100 tokens and each reply is 300 tokens, so every full turn adds 400 tokens to the
            history.
          </p>
          <Formula>input at turn n = 500 + (n − 1) × 400 + 100</Formula>
          <Table
            head={["Turn", "Input tokens sent", "How"]}
            rows={[
              ["1", "600", "500 + 0 + 100"],
              ["3", "1,400", "500 + 800 + 100"],
              ["5", "2,200", "500 + 1,600 + 100"],
              ["10", "4,200", "500 + 3,600 + 100"],
            ]}
          />
          <p>
            The size of each call grows steadily, but the total you pay for grows faster, because
            you pay again for the old messages each time. Over 10 turns the input tokens add up to
            600 + 1,000 + 1,400 + ... + 4,200. That is 10 terms with an average of (600 + 4,200)
            ÷ 2 = 2,400, so the total is 10 × 2,400 = 24,000 input tokens. The conversation itself
            only contains 500 + 10 × 400 = 4,500 tokens of text. You paid for more than five times
            that, because history is resent.
          </p>
          <Callout tone="tip">
            Some providers offer prompt caching, which lowers the cost of repeating the same
            prefix. It is covered in the context engineering lessons. The principle is still
            worth knowing: a long unchanging prefix is repeated work.
          </Callout>
        </>
      ),
    },
    {
      id: "limit",
      title: "What happens at the limit",
      body: (
        <>
          <p>
            If your input plus the space you reserve for the reply exceeds the window, one of two
            things happens, depending on the provider and settings. The API may reject the request
            with an error. Or text may be dropped, usually from the oldest end, so the model
            silently loses instructions or facts. The second case is worse because nothing
            visibly breaks.
          </p>
          <p>
            Never wait to find out. Count tokens before you send and decide what to cut. Here is a
            simple trimming strategy, shown with a placeholder token counter:
          </p>
          <pre>
            <code>{`def trim_history(messages, budget, count_tokens):
    """Keep the newest messages that fit within budget tokens."""
    kept, used = [], 0
    for msg in reversed(messages):          # newest first
        cost = count_tokens(msg["content"])
        if used + cost > budget:
            break
        kept.append(msg)
        used += cost
    return list(reversed(kept))             # restore order

# Reserve room for the system prompt and the reply first.
WINDOW = 8000            # hypothetical small window, for illustration
RESERVED_REPLY = 1000
SYSTEM_TOKENS = 500
budget = WINDOW - RESERVED_REPLY - SYSTEM_TOKENS   # 6500`}</code>
          </pre>
          <p>
            With those illustrative numbers, 8,000 − 1,000 − 500 leaves 6,500 tokens for history
            and new input.
          </p>
        </>
      ),
    },
    {
      id: "strategies",
      title: "Staying under the limit",
      body: (
        <>
          <Table
            head={["Strategy", "How it works", "Trade-off"]}
            rows={[
              ["Truncate", "Drop the oldest messages", "Simple, but forgets early facts"],
              ["Summarise", "Replace old turns with a short summary", "Keeps gist, loses detail, costs a call"],
              ["Retrieve", "Store notes or documents and fetch only relevant pieces", "Needs a search step"],
              ["Pin", "Always keep key instructions and facts", "Uses budget on every call"],
              ["Smaller inputs", "Send excerpts, not whole files", "Needs good selection"],
            ]}
          />
          <p>
            Most real systems combine several: pin the instructions, summarise the older
            conversation, retrieve documents on demand and keep the last few turns verbatim.
          </p>
        </>
      ),
    },
    {
      id: "bigger",
      title: "A bigger window is not a free pass",
      body: (
        <>
          <p>
            Large windows are useful, but fitting text in is not the same as the model using it
            well. Studies and practical experience show that models can be better at using
            information near the start and end of a long input than details buried in the middle,
            and that adding irrelevant text can distract them. Results vary by model, so test with
            your own data.
          </p>
          <p>
            Long inputs also cost more and take longer. Sending a whole document when two
            paragraphs would do wastes money and may lower accuracy.
          </p>
          <Callout tone="warn">
            Keep the window for what is relevant. A focused 2,000-token context often beats a
            noisy 50,000-token one. Choosing what goes in is the core idea behind context
            engineering, which later lessons cover in depth.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The context window is the total tokens a model can handle in one call, input and output together.",
    "Model APIs are stateless: your code resends history each turn.",
    "Because history is resent, total cost across a chat grows faster than the chat itself.",
    "Count tokens before sending, reserve room for the reply and decide what to cut.",
    "Bigger windows help, but relevance matters more than volume.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which of these counts toward the context window?",
      options: [
        "Only the user's latest message",
        "Only the model's reply",
        "System prompt, history, added documents and the reply",
        "Nothing, the window is only a billing term",
      ],
      answer: 2,
      explain: "Everything in the call shares the window, including the output the model is about to write.",
    },
    {
      kind: "mcq",
      q: "Why does a long chat get costlier with each turn?",
      options: [
        "The model forgets and relearns",
        "The earlier messages are sent again with every call",
        "Output tokens are free after turn one",
        "Providers raise prices mid-chat",
      ],
      answer: 1,
      explain: "The API is stateless, so the growing history is part of the input every time.",
    },
    {
      kind: "text",
      q: "Models keep no memory between API calls. What one-word term describes this?",
      format: "*********",
      accept: ["stateless"],
      explain: "A stateless API treats each call independently, so your code must resend context.",
    },
    {
      kind: "text",
      q: "Using the lesson's numbers (500-token system prompt, 100-token user messages, 300-token replies), how many input tokens are sent on turn 3?",
      format: "****",
      accept: ["1400", "1,400"],
      explain: "500 + 2 × 400 + 100 = 1,400 tokens.",
    },
  ],
};

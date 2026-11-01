import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain who actually runs a tool: the model or your code",
    "Write a tool definition with a name, description and JSON schema",
    "Implement the request, execute, return loop and handle tool errors",
    "Estimate how tool round trips grow input token usage",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a model that can only talk",
      body: (
        <>
          <p>
            A language model reads text and writes text. It cannot check today's weather, look up an
            order in your database, or send an email. Its knowledge stops at its training cutoff, and
            it has no hands.
          </p>
          <p>
            <strong>Tool calling</strong> (also called <strong>function calling</strong>) fixes this.
            You describe a set of functions to the model. When a question needs one, the model
            replies with a structured request such as "call <code>get_order_status</code> with
            order_id A-1001". Your code runs the function and sends the result back. The model then
            writes the final answer using that result.
          </p>
          <Callout tone="note" title="The key idea">
            The model never runs anything. It only <em>asks</em>. Your program is the one that
            executes the function, so your program decides whether to allow it.
          </Callout>
          <p>
            Think of a manager who cannot touch the warehouse system. They write a note saying "check
            order A-1001", an assistant does it and writes the answer on the note, and the manager
            replies to the customer. The model is the manager. Your code is the assistant.
          </p>
        </>
      ),
    },
    {
      id: "definition",
      title: "Describing a tool",
      body: (
        <>
          <p>A tool definition has three parts, and the model reads all three:</p>
          <Table
            head={["Part", "Purpose", "Tip"]}
            rows={[
              ["Name", "The identifier the model uses to call it", "Short, verb first: search_docs, get_order_status"],
              ["Description", "Tells the model when and why to use it", "The most important part. Say what it does, when to use it, and what it does not do"],
              ["Parameter schema", "A JSON Schema listing the inputs", "Mark required fields, describe each one, use enums for fixed choices"],
            ]}
          />
          <p>
            The model has no other way to learn what a tool is for. A vague description such as "gets
            data" produces wrong or missing calls. A clear one is prompt engineering aimed at your
            tools.
          </p>
          <Callout tone="tip">
            Write the description as if for a new colleague who cannot ask questions. Include an
            example of a valid input, such as an order ID format. Most "the model picked the wrong
            tool" bugs are description bugs.
          </Callout>
        </>
      ),
    },
    {
      id: "loop",
      title: "The loop in code",
      body: (
        <>
          <p>
            The flow has four steps: send the question with the tool list, receive a tool request,
            run it, send the result back. You repeat until the model answers in plain text. This
            example is illustrative. Field names differ between providers, and SDKs change, so
            check your provider's docs.
          </p>
          <pre>
            <code>{`import json
import os
import anthropic

client = anthropic.Anthropic()          # reads the API key from the environment
MODEL = os.environ["MODEL_NAME"]        # set this to a current model

tools = [{
    "name": "get_order_status",
    "description": "Look up the shipping status of one order. "
                   "Use when the user asks where their order is. "
                   "Needs an order ID such as A-1001.",
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "description": "For example A-1001"}
        },
        "required": ["order_id"],
    },
}]

def get_order_status(order_id: str) -> dict:
    return {"order_id": order_id, "status": "shipped", "eta_days": 2}

REGISTRY = {"get_order_status": get_order_status}

messages = [{"role": "user", "content": "Where is order A-1001?"}]

for _ in range(6):                      # hard cap on round trips
    resp = client.messages.create(
        model=MODEL, max_tokens=1024, tools=tools, messages=messages
    )
    messages.append({"role": "assistant", "content": resp.content})
    if resp.stop_reason != "tool_use":
        break
    results = []
    for block in resp.content:
        if block.type == "tool_use":
            try:
                out = REGISTRY[block.name](**block.input)
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": json.dumps(out)})
            except Exception as exc:
                results.append({"type": "tool_result", "tool_use_id": block.id,
                                "content": str(exc), "is_error": True})
    messages.append({"role": "user", "content": results})

print(resp.content[-1].text)`}</code>
          </pre>
          <p>Points worth noticing:</p>
          <ul>
            <li>
              Each tool request has an <strong>id</strong>. Your result must quote that id so the
              model can match answer to request.
            </li>
            <li>
              The model may ask for several tools in one turn. Run them all and return all results
              together.
            </li>
            <li>
              Errors go back to the model as results too. It can often fix a bad argument and try
              again.
            </li>
            <li>
              The <code>for</code> loop has a cap. Without one, a confused model can loop until your
              budget is gone.
            </li>
          </ul>
          <p>
            Other providers use similar ideas under different names. OpenAI-style APIs return a list
            of tool calls and expect results in messages with a tool role. Gemini calls them
            function declarations. The shape of the loop is the same everywhere.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "What the loop costs",
      body: (
        <>
          <p>
            Every round trip re-sends the whole conversation, including the tool definitions. So
            input tokens grow with each tool call. With <code>n</code> tool rounds you make{" "}
            <code>n + 1</code> model calls:
          </p>
          <Formula>total input = (n + 1) × base + step × n × (n + 1) ÷ 2</Formula>
          <p>
            Take illustrative numbers: the system prompt, tool definitions and question add up to 850
            tokens. Each tool request plus its result adds 150 tokens. The model uses 3 tool rounds.
          </p>
          <pre>
            <code>{`call 1: 850
call 2: 850 + 150 = 1,000
call 3: 850 + 300 = 1,150
call 4: 850 + 450 = 1,300
total input = 4,300 tokens

formula: 4 × 850 + 150 × 3 × 4 ÷ 2 = 3,400 + 900 = 4,300`}</code>
          </pre>
          <p>
            Cost is tokens times price per token, so twice the rounds costs more than twice as much.
            Keep tool results short. Return the three fields the model needs, not a 5,000-token
            database row.
          </p>
        </>
      ),
    },
    {
      id: "pitfalls",
      title: "Design rules and pitfalls",
      body: (
        <>
          <ul>
            <li>
              <strong>Few, sharp tools.</strong> Ten clear tools beat forty overlapping ones. Each
              definition costs tokens on every request and gives the model more chances to choose
              wrong.
            </li>
            <li>
              <strong>Validate arguments.</strong> The model's JSON is a suggestion, not trusted
              input. Check types and ranges before touching a database.
            </li>
            <li>
              <strong>Separate read from write.</strong> Reading an order is low risk. Issuing a
              refund is not. Ask a human to confirm risky actions.
            </li>
            <li>
              <strong>Make writes safe to repeat.</strong> Retries happen. Use idempotency keys so a
              repeated call does not charge a customer twice.
            </li>
            <li>
              <strong>Control the choice.</strong> Most APIs let you force a specific tool, require
              that some tool is used, or turn tools off for a turn.
            </li>
          </ul>
          <Callout tone="warn">
            Tool results are text the model reads, which means they can carry hostile instructions.
            Treat anything fetched from the web or a user document as untrusted. The prompt
            injection lesson covers this in depth.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The model only requests a tool call. Your code runs it and returns the result.",
    "The description is the main way the model decides when to use a tool, so write it carefully.",
    "The loop is: send tools, receive a request, execute, return the result by id, repeat until text.",
    "Every round trip re-sends the history, so input tokens grow quickly with each tool call.",
    "Validate arguments, cap the loop, and gate risky actions behind approval.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In function calling, who executes the function?",
      options: [
        "The language model, inside its network",
        "The provider's servers, automatically",
        "Your application code",
        "The user's browser",
      ],
      answer: 2,
      explain: "The model only outputs a structured request. Your code decides whether and how to run it.",
    },
    {
      kind: "mcq",
      q: "A model keeps choosing the wrong tool. What should you check first?",
      options: [
        "The tool descriptions and names",
        "The size of the GPU",
        "The temperature of the database",
        "The font used in your logs",
      ],
      answer: 0,
      explain: "The model picks tools from their names and descriptions. Unclear text is the usual cause.",
    },
    {
      kind: "mcq",
      q: "Why should a tool loop have a maximum number of iterations?",
      options: [
        "The API refuses more than two calls",
        "It stops runaway loops from burning tokens and money",
        "It makes the model smarter",
        "Tool results expire after one use",
      ],
      answer: 1,
      explain: "A confused model can call tools forever. A cap bounds cost and latency.",
    },
    {
      kind: "text",
      q: "Illustrative numbers: the base prompt is 500 tokens and each tool round adds 100 tokens. The model uses 2 tool rounds, so it makes 3 calls. How many input tokens in total?",
      format: "****",
      accept: ["1800", "1,800"],
      explain: "500 + 600 + 700 = 1,800. Call 1 sends 500, call 2 sends 600, call 3 sends 700.",
    },
  ],
};

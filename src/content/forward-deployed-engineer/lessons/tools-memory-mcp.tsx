import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Define a tool with a clear schema so a model can call it reliably",
    "Separate short-term state from long-term memory",
    "Explain what the Model Context Protocol (MCP) standardises and when to use it",
  ],
  tasks: [
    {
      id: "tools",
      title: "Tools and function calling",
      body: (
        <>
          <p>
            A <strong>tool</strong> is a function the model may ask your code to run. You describe
            it with a name, a description and a JSON schema for parameters. The model replies with
            the tool name and arguments; your code runs it and returns the result.
          </p>
          <pre>
            <code>{`{
  "name": "get_invoice_status",
  "description": "Look up the payment status of an invoice by its number. Use when the user asks if an invoice is paid.",
  "input_schema": {
    "type": "object",
    "properties": {
      "invoice_number": { "type": "string", "description": "e.g. INV-2041" }
    },
    "required": ["invoice_number"]
  }
}`}</code>
          </pre>
          <ul>
            <li>Write descriptions for the model: when to use the tool and what it returns.</li>
            <li>Keep the tool set small and non-overlapping; ten clear tools beat fifty vague ones.</li>
            <li>Validate arguments in code; never trust them blindly.</li>
            <li>Return errors as readable messages so the model can recover.</li>
            <li>Return concise results; do not dump a whole table into the context.</li>
          </ul>
        </>
      ),
    },
    {
      id: "memory",
      title: "Memory and state",
      body: (
        <>
          <Table
            head={["Kind", "What it holds", "Where it lives"]}
            rows={[
              ["Working context", "The current conversation and tool results", "The prompt"],
              ["Session state", "Task progress, collected fields, approvals", "Your database, keyed by session"],
              ["Long-term memory", "Preferences, past decisions, learned facts", "A store you search or load on demand"],
              ["Knowledge", "Company documents", "RAG index"],
            ]}
          />
          <p>
            Do not rely on the window as storage. Persist state in your own system so a crashed or
            resumed run can continue. For long conversations, summarise old turns and keep key
            facts in structured form.
          </p>
          <Callout tone="warn">
            Memory can store wrong or sensitive information. Let users view and delete what is
            remembered, scope memory per user or tenant, and avoid saving secrets.
          </Callout>
        </>
      ),
    },
    {
      id: "mcp",
      title: "Model Context Protocol",
      body: (
        <>
          <p>
            <strong>MCP</strong> is an open standard for connecting AI applications to tools and
            data. Instead of writing a custom integration for every app and every system, a system
            exposes an <strong>MCP server</strong> once, and any MCP-capable <strong>client</strong>{" "}
            (inside a <strong>host</strong> app) can use it.
          </p>
          <Table
            head={["Piece", "Role"]}
            rows={[
              ["Host", "The AI app the user sees"],
              ["Client", "Connection inside the host to one server"],
              ["Server", "Exposes tools, resources and prompts"],
              ["Transport", "Local stdio, or HTTP for remote servers"],
            ]}
          />
          <p>
            For an FDE, MCP is a fast way to give an agent safe, structured access to a customer's
            internal systems: wrap the CRM, ticketing tool or database in a server with a few
            well-described tools and read-only defaults.
          </p>
          <Callout tone="tip">
            Use MCP when several agents or apps need the same system. For a single in-app tool, a
            plain function is simpler. Either way, add authentication and log every call.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Tools need clear names, descriptions, schemas, validation and concise results.",
    "Keep session state in your own store; summarise history and scope long-term memory carefully.",
    "MCP lets one server be reused by many AI clients; add auth, least privilege and logging.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Who actually executes a tool call the model requests?",
      options: ["The model itself", "Your application code", "The user's browser only", "The GPU"],
      answer: 1,
      explain: "The model only emits the call; your code runs it and returns the result.",
    },
    {
      kind: "mcq",
      q: "Where should an agent's task progress be stored so a crashed run can resume?",
      options: [
        "Only in the prompt",
        "In your own database keyed by session",
        "In the model weights",
        "Nowhere",
      ],
      answer: 1,
      explain: "Durable state belongs in your system, not in an ephemeral context window.",
    },
    {
      kind: "mcq",
      q: "What problem does MCP mainly solve?",
      options: [
        "Training bigger models",
        "A standard way to connect AI apps to tools and data without custom glue for each pair",
        "Making models cheaper",
        "Styling web pages",
      ],
      answer: 1,
      explain: "A server written once can be used by any MCP-capable client.",
    },
  ],
};

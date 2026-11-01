import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Explain the integration problem that the Model Context Protocol solves",
    "Name the three things a server can offer: tools, resources and prompts",
    "Tell MCP apart from function calling",
    "Count integrations with and without a shared protocol",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: every connection is custom",
      body: (
        <>
          <p>
            Say you build an AI assistant and want it to read files, query a database and search a
            ticket system. You write three integrations, each with its own tool definitions, auth
            and error handling. Now a second AI app wants the same three. It writes them again,
            slightly differently. Each new app and each new data source multiplies the work.
          </p>
          <p>
            The <strong>Model Context Protocol (MCP)</strong> is an open standard that fixes this.
            It defines one common way for an AI application to talk to an outside capability. A
            tool owner writes an <strong>MCP server</strong> once. Any app that speaks MCP can use
            it.
          </p>
          <p>
            The comparison people reach for is a USB port. Before USB, each device had its own plug
            and driver. After it, any device works with any computer. MCP aims to do that for AI
            apps and the things they connect to. It is also similar in spirit to the Language
            Server Protocol, which lets one language tool work across many code editors.
          </p>
        </>
      ),
    },
    {
      id: "math",
      title: "The arithmetic: N times M becomes N plus M",
      body: (
        <>
          <p>
            Without a shared protocol, every app needs its own connector to every tool:
          </p>
          <Formula>custom integrations = apps × tools</Formula>
          <p>With a shared protocol, each app implements the client side once and each tool implements the server side once:</p>
          <Formula>protocol integrations = apps + tools</Formula>
          <p>Take 5 AI apps and 8 tools:</p>
          <pre>
            <code>{`without MCP: 5 × 8 = 40 connectors to build and maintain
with MCP:    5 + 8 = 13 pieces (5 clients, 8 servers)`}</code>
          </pre>
          <p>
            The gap widens as the numbers grow: 10 apps and 20 tools is 200 against 30. Fewer
            pieces also means fewer places for bugs, and a fix to one server helps every app that
            uses it.
          </p>
        </>
      ),
    },
    {
      id: "ideas",
      title: "What a server can offer",
      body: (
        <>
          <p>An MCP server exposes three kinds of things. They differ in who decides to use them.</p>
          <Table
            head={["Primitive", "What it is", "Who controls it", "Example"]}
            rows={[
              ["Tools", "Functions the model can call to do something", "The model", "search_tickets, create_issue"],
              ["Resources", "Read-only data the app can load as context", "The application", "A file, a database schema, a document"],
              ["Prompts", "Reusable prompt templates with arguments", "The user", "A review-this-diff template chosen from a menu"],
            ]}
          />
          <p>
            Most servers you meet are mostly tools. Resources and prompts matter when you want the
            host app to decide what context to attach, or to offer users ready-made workflows.
          </p>
          <p>
            Clients can also offer things back to servers, such as letting a server ask the host
            model to generate text (called sampling) or ask the user for input. The architecture
            lesson covers these.
          </p>
        </>
      ),
    },
    {
      id: "vs-function-calling",
      title: "MCP is not a replacement for function calling",
      body: (
        <>
          <p>
            These two sit at different layers, and they work together:
          </p>
          <Table
            head={["", "Function calling", "MCP"]}
            rows={[
              ["What it is", "A model API feature: the model asks for a tool call", "A protocol between an app and tool servers"],
              ["Answers", "How does the model say which tool it wants?", "How does the app find and run tools from outside sources?"],
              ["Who writes the tool", "You, inside your own app", "Anyone, as a reusable server"],
            ]}
          />
          <p>
            Here is the flow. The app connects to an MCP server and asks for its tool list. It passes
            those tool definitions to the model as ordinary function-calling tools. When the model
            asks for one, the app forwards the call to the server and returns the result. MCP is how
            the tools got there. Function calling is how the model used them.
          </p>
          <Callout tone="note">
            MCP also does not make tools safe. A server is code that runs with real permissions, and
            its tool descriptions are text the model reads. Only connect servers you trust, and
            keep a person in the loop for risky actions.
          </Callout>
        </>
      ),
    },
    {
      id: "when",
      title: "When MCP is worth it",
      body: (
        <>
          <ul>
            <li>
              <strong>Use it</strong> when several apps, such as a chat assistant, an IDE and an
              internal bot, need the same tools, or when you want to use servers other people have
              already published.
            </li>
            <li>
              <strong>Skip it</strong> when you have one app and two private functions. Plain
              function calling in your own code is simpler and has fewer moving parts.
            </li>
          </ul>
          <Callout tone="tip">
            A good test is reuse. If the same capability will be wanted by a second app or team,
            wrap it as an MCP server. If not, keep it as a local function.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "MCP is an open standard that connects AI apps to tools and data in one common way.",
    "It turns apps times tools custom connectors into apps plus tools shared pieces.",
    "Servers offer tools (model-controlled), resources (app-controlled) and prompts (user-controlled).",
    "Function calling is how a model asks for a tool. MCP is how the app discovers and runs tools from servers.",
    "Servers run with real permissions, so connect only ones you trust.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which best describes MCP?",
      options: [
        "A model architecture for faster inference",
        "A vector database format",
        "A GPU scheduling tool",
        "An open protocol connecting AI apps to tools and data",
      ],
      answer: 3,
      explain: "MCP standardises how AI applications talk to outside capabilities such as tools and data sources.",
    },
    {
      kind: "mcq",
      q: "A read-only file that the host app chooses to load as context is best modelled as which MCP primitive?",
      options: ["A resource", "A tool", "A prompt", "A transport"],
      answer: 0,
      explain: "Resources are data the application can attach as context. Tools are actions the model chooses to run.",
    },
    {
      kind: "mcq",
      q: "How do MCP and function calling relate?",
      options: [
        "MCP replaces function calling entirely",
        "They are unrelated features",
        "MCP supplies tools from servers, and function calling lets the model request them",
        "Function calling only works inside MCP servers",
      ],
      answer: 2,
      explain: "The app discovers tools through MCP and hands them to the model, which requests them through function calling.",
    },
    {
      kind: "text",
      q: "You have 6 AI apps and 7 tools. With a shared protocol, how many pieces do you build in total (clients plus servers)?",
      format: "**",
      accept: ["13"],
      explain: "6 + 7 = 13. Without a protocol it would be 6 × 7 = 42 custom connectors.",
    },
  ],
};

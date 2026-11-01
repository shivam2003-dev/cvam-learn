import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Distinguish hosts, clients and servers and how they connect",
    "Describe the two layers: the data layer and the transport layer",
    "Read a JSON-RPC request, response and notification",
    "Choose between the stdio and Streamable HTTP transports",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: who talks to whom?",
      body: (
        <>
          <p>
            Saying "an app connects to a tool server" hides several questions. Which part owns the
            model? Which part holds the connection? What happens if the app uses five servers? MCP
            answers with three roles and two layers.
          </p>
          <Table
            head={["Role", "What it is", "Example"]}
            rows={[
              ["Host", "The AI application the user interacts with. It owns the model and the UI", "A desktop chat app, an IDE assistant, your own agent"],
              ["Client", "A component inside the host that keeps one connection to one server", "One client object per configured server"],
              ["Server", "A program that exposes tools, resources and prompts", "A files server, a database server, a ticket server"],
            ]}
          />
          <p>
            The rule to remember: <strong>one client per server</strong>. A host using five servers
            creates five clients. Each client has its own connection and its own state, so a problem
            with one server does not tangle the others.
          </p>
          <Callout tone="note">
            "Client" is easy to confuse. The host is the app. The client is a connector inside it.
            The model never talks to a server directly. The host sits in the middle and decides what
            reaches the model.
          </Callout>
        </>
      ),
    },
    {
      id: "layers",
      title: "Two layers",
      body: (
        <>
          <p>
            MCP separates <em>what is said</em> from <em>how it travels</em>:
          </p>
          <ul>
            <li>
              <strong>Data layer:</strong> the messages themselves. It uses JSON-RPC 2.0, a simple
              standard for calling named methods with JSON. It defines the connection lifecycle,
              the server features (tools, resources, prompts), the client features, and
              notifications.
            </li>
            <li>
              <strong>Transport layer:</strong> the channel carrying those messages, plus
              connection setup and authorisation.
            </li>
          </ul>
          <p>
            Because the layers are separate, the same messages work over any transport. A server
            written for local use can later be served over the network without rewriting its tools.
          </p>
        </>
      ),
    },
    {
      id: "messages",
      title: "Reading the messages",
      body: (
        <>
          <p>
            JSON-RPC has three kinds of message. A <strong>request</strong> has an <code>id</code>{" "}
            and expects a reply. A <strong>response</strong> carries the same id and either a result
            or an error. A <strong>notification</strong> has no id and expects no reply.
          </p>
          <p>Every connection starts with a handshake. The client introduces itself and states what it supports:</p>
          <pre>
            <code>{`// client to server (request)
{"jsonrpc": "2.0", "id": 1, "method": "initialize",
 "params": {"protocolVersion": "<date-based version>",
            "capabilities": {},
            "clientInfo": {"name": "my-host", "version": "1.0.0"}}}

// server to client (response): says which features it offers
{"jsonrpc": "2.0", "id": 1,
 "result": {"protocolVersion": "<version it chose>",
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "order-helper", "version": "0.1.0"}}}

// client to server (notification, no id): handshake finished
{"jsonrpc": "2.0", "method": "notifications/initialized"}`}</code>
          </pre>
          <p>
            This is <strong>capability negotiation</strong>. The server says "I offer tools", so the
            client knows it can ask for them. If a server did not list resources, a well-behaved
            client does not ask for any. Both sides can also agree on a protocol version here.
          </p>
          <p>After that, the client can discover and call tools:</p>
          <pre>
            <code>{`// discover
{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}

// call one
{"jsonrpc": "2.0", "id": 3, "method": "tools/call",
 "params": {"name": "get_order_status",
            "arguments": {"order_id": "A-1001"}}}

// result
{"jsonrpc": "2.0", "id": 3,
 "result": {"content": [{"type": "text", "text": "shipped, eta 2 days"}],
            "isError": false}}`}</code>
          </pre>
          <p>
            The list result includes each tool's name, description and input schema, exactly the
            pieces a function-calling API needs. Matching methods exist for resources (
            <code>resources/list</code>, <code>resources/read</code>) and prompts (
            <code>prompts/list</code>, <code>prompts/get</code>). Servers can also send
            notifications, for example to say that the tool list has changed.
          </p>
          <p>
            Count the setup cost for one server that only offers tools. The client sends{" "}
            <code>initialize</code>, <code>notifications/initialized</code> and{" "}
            <code>tools/list</code> (3 messages). The server sends 2 responses. That is 5 messages
            per server, so a host with 4 such servers exchanges 20 messages before the user has
            typed anything.
          </p>
        </>
      ),
    },
    {
      id: "client-features",
      title: "Features that flow the other way",
      body: (
        <>
          <p>
            Servers are not purely passive. Clients can offer features that a server may use:
          </p>
          <Table
            head={["Client feature", "What it lets a server do"]}
            rows={[
              ["Sampling", "Ask the host's model to generate text, so the server needs no model key of its own"],
              ["Elicitation", "Ask the user for missing information through the host"],
              ["Roots", "Learn which folders or locations it is meant to work inside"],
            ]}
          />
          <p>
            The host stays in control. It should show the user what a server is asking for and let
            them decline. Servers declare which of these they use during the handshake.
          </p>
        </>
      ),
    },
    {
      id: "transports",
      title: "Transports: stdio and Streamable HTTP",
      body: (
        <>
          <Table
            head={["", "stdio", "Streamable HTTP"]}
            rows={[
              ["How it works", "Host starts the server as a child process. Messages go over its stdin and stdout", "The server is a web service. The client sends HTTP requests, replies can stream back"],
              ["Where it runs", "Same machine as the host", "Anywhere: your laptop, a container, the cloud"],
              ["Many users", "No. One process per host", "Yes. One server can serve many clients"],
              ["Auth", "Inherits the user's local permissions", "Needs real authorisation, typically token-based such as OAuth"],
              ["Best for", "Local tools: files, git, a local database", "Shared, remote, team or company services"],
            ]}
          />
          <Callout tone="warn" title="stdio rule">
            With stdio, stdout is the protocol channel. If your server prints a debug line to
            stdout, it corrupts the message stream and the connection fails in confusing ways. Write
            logs to stderr or a file.
          </Callout>
          <Callout tone="tip">
            Older material describes an HTTP transport based on separate Server-Sent Events
            connections. The current design is Streamable HTTP. When you read tutorials, check which
            one they mean, and check the current spec before building.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A host owns the model and UI, and runs one client per server. Each client keeps one connection.",
    "The data layer is JSON-RPC 2.0 messages. The transport layer carries them.",
    "Connections begin with initialize, a response, and an initialized notification, which negotiates capabilities.",
    "Clients discover with tools/list and run with tools/call. Resources and prompts have matching methods.",
    "Use stdio for local servers and Streamable HTTP for remote ones. Never print to stdout on stdio.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A host app uses 3 MCP servers. How many clients does it create?",
      options: ["1", "2", "3", "6"],
      answer: 2,
      explain: "Each client holds a connection to exactly one server, so 3 servers need 3 clients.",
    },
    {
      kind: "mcq",
      q: "What distinguishes a JSON-RPC notification from a request?",
      options: [
        "It has no id and expects no reply",
        "It must travel over HTTP",
        "It can only be sent by a server",
        "It always contains an error",
      ],
      answer: 0,
      explain: "Notifications are fire-and-forget. Requests carry an id and get a matching response.",
    },
    {
      kind: "mcq",
      q: "Your stdio MCP server randomly breaks after you add a print statement for debugging. Why?",
      options: [
        "Python cannot print inside servers",
        "The print wrote to stdout, which carries protocol messages",
        "The host blocks all text",
        "Print statements use too much memory",
      ],
      answer: 1,
      explain: "On stdio, stdout is the message channel. Stray output corrupts it. Log to stderr instead.",
    },
    {
      kind: "text",
      q: "Which transport does a host use to run a server as a local child process?",
      format: "*****",
      accept: ["stdio"],
      explain: "stdio starts the server as a subprocess and exchanges messages over standard input and output.",
    },
    {
      kind: "text",
      q: "A client wants to discover a server's tools. Which JSON-RPC method name does it send?",
      format: "*****/****",
      accept: ["tools/list"],
      explain: "tools/list returns each tool's name, description and input schema.",
    },
  ],
};

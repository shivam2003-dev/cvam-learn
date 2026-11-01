import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Write a small MCP server that exposes a tool, a resource and a prompt",
    "Connect to it from a client over stdio and call a tool",
    "Test a server with the MCP Inspector before wiring it into a host",
    "Apply design and security rules for servers you share",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: from idea to a working server",
      body: (
        <>
          <p>
            You understand what MCP is. Now you want your own function, such as an order lookup, to
            be usable from any MCP-capable app. That takes a server that speaks the protocol, and
            a way to check that it works before you trust a model with it.
          </p>
          <p>
            Official SDKs handle the JSON-RPC, handshake and schemas for you. You write ordinary
            functions and mark them. The examples below use the Python SDK and its high-level{" "}
            <code>FastMCP</code> helper. They are illustrative, so check the SDK docs for current
            import paths and options. TypeScript and other languages have equivalent SDKs.
          </p>
        </>
      ),
    },
    {
      id: "server",
      title: "A server in about twenty lines",
      body: (
        <>
          <pre>
            <code>{`# server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("order-helper")

ORDERS = {"A-1001": "shipped, eta 2 days", "A-1002": "processing"}

@mcp.tool()
def get_order_status(order_id: str) -> str:
    """Look up the shipping status of one order.
    Use when the user asks where an order is. Order IDs look like A-1001."""
    return ORDERS.get(order_id, "order not found")

@mcp.resource("policy://returns")
def returns_policy() -> str:
    """The text of the returns policy."""
    return "Items can be returned within 30 days if unused."

@mcp.prompt()
def summarize_order(order_id: str) -> str:
    """A reusable prompt the user can pick from a menu."""
    return f"Look up order {order_id} and summarise it in one sentence."

if __name__ == "__main__":
    mcp.run(transport="stdio")`}</code>
          </pre>
          <p>The SDK does a lot from small hints:</p>
          <ul>
            <li>The <strong>function name</strong> becomes the tool name.</li>
            <li>
              The <strong>type hints</strong> become the JSON Schema for the inputs, so{" "}
              <code>order_id: str</code> is a required string.
            </li>
            <li>
              The <strong>docstring</strong> becomes the description the model reads. It is the
              same prompt-writing job as in the function calling lesson.
            </li>
            <li>
              The decorator picks the primitive: <code>tool</code> for actions,{" "}
              <code>resource</code> for readable data, <code>prompt</code> for templates.
            </li>
          </ul>
          <Callout tone="warn">
            This server uses stdio, so never use <code>print()</code> for debugging. Stdout carries
            protocol messages. Use the logging module with stderr, or a file.
          </Callout>
        </>
      ),
    },
    {
      id: "inspector",
      title: "Test with the Inspector first",
      body: (
        <>
          <p>
            Before connecting a model, check the server by itself. The MCP Inspector is a developer
            tool that connects to your server, lists what it offers and lets you call tools by hand:
          </p>
          <pre>
            <code>{`npx @modelcontextprotocol/inspector python server.py`}</code>
          </pre>
          <p>
            Try a valid ID, a missing ID and a wrong type. This tests the server on its own, with no
            model in the way, so any failure is clearly yours. Only once the Inspector looks right
            should you move on to a real host. Add normal unit tests for the underlying functions
            too: a tool is just a function.
          </p>
        </>
      ),
    },
    {
      id: "client",
      title: "Writing a client",
      body: (
        <>
          <p>
            Hosts like desktop chat apps and IDEs act as clients for you. You usually register a
            server in their settings with the command that starts it. The exact settings format
            varies by host, so read its docs. A typical entry names the server and gives a command
            and arguments, using an absolute path to your script.
          </p>
          <p>
            You can also build a client yourself, which is how your own agent would use MCP servers:
          </p>
          <pre>
            <code>{`import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

params = StdioServerParameters(command="python", args=["server.py"])

async def main():
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()                  # the handshake

            listing = await session.list_tools()
            for tool in listing.tools:
                print(tool.name, "-", tool.description)

            result = await session.call_tool(
                "get_order_status", {"order_id": "A-1001"}
            )
            print(result.content[0].text)

asyncio.run(main())`}</code>
          </pre>
          <p>
            To put this behind a model, convert each listed tool into your provider's tool format
            (name, description, input schema), run the usual tool loop, and in the execute step call{" "}
            <code>session.call_tool</code> instead of a local function.
          </p>
        </>
      ),
    },
    {
      id: "remote",
      title: "Going remote",
      body: (
        <>
          <p>
            For a server that a team or many users share, switch the transport to Streamable HTTP.
            With the Python SDK this is a change to the run call. The tools stay the same. What
            changes is everything around them:
          </p>
          <Table
            head={["Concern", "What to do"]}
            rows={[
              ["Authentication", "Require tokens. Never expose an unauthenticated server that can touch real data"],
              ["Transport security", "Serve over HTTPS, and follow the spec's guidance on validating request origins"],
              ["Per-user access", "Check the caller's rights inside each tool, not only at the door"],
              ["Limits", "Rate limit calls and cap result sizes"],
              ["Observability", "Log which tool ran, for whom and how long it took"],
            ]}
          />
        </>
      ),
    },
    {
      id: "design",
      title: "Design rules and costs",
      body: (
        <>
          <ul>
            <li>
              <strong>Name tools by task, not by API endpoint.</strong> A tool called{" "}
              <code>find_customer_orders</code> beats a thin wrapper over six endpoints.
            </li>
            <li>
              <strong>Return little, and useful.</strong> Large results waste the model's context.
              Support filters and limits.
            </li>
            <li>
              <strong>Return errors as readable text</strong> so the model can adjust and retry.
            </li>
            <li>
              <strong>Mark risky tools clearly</strong>, and let the host ask a person before they
              run.
            </li>
          </ul>
          <p>
            Tool definitions are sent to the model, so they cost tokens on every request. Illustrative
            maths: 20 tools at about 150 tokens each is 3,000 tokens per request.
          </p>
          <Formula>daily overhead = tools × tokens per tool × requests per day</Formula>
          <pre>
            <code>{`20 × 150 = 3,000 tokens per request
3,000 × 1,000 requests = 3,000,000 tokens per day
at an illustrative $3 per million = $9 per day, before any real work`}</code>
          </pre>
          <p>
            Expose only the tools a task needs, and keep descriptions tight but clear.
          </p>
          <Callout tone="warn" title="Trust the server">
            A third-party server's tool descriptions and results are text your model will read. A
            malicious or compromised server can use them to push instructions. Review servers
            before installing them, grant least privilege, and see the prompt injection lesson.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "SDKs turn plain functions into tools: names, type hints and docstrings become the schema and description.",
    "A server can offer tools, resources and prompts through simple decorators.",
    "Test with the MCP Inspector and normal unit tests before involving a model.",
    "A client runs the handshake, lists tools, and calls them. Your agent loop forwards model requests to it.",
    "Remote servers need authentication, HTTPS, per-user checks and limits. Treat third-party servers as untrusted.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In a FastMCP-style server, what becomes the tool's description that the model reads?",
      options: [
        "The file name",
        "The import statements",
        "The return value",
        "The function's docstring",
      ],
      answer: 3,
      explain: "The docstring is exposed as the description, so it should say what the tool does and when to use it.",
    },
    {
      kind: "mcq",
      q: "What is the best first step after writing a new MCP server?",
      options: [
        "Test it alone with the Inspector and unit tests",
        "Give it to production users immediately",
        "Connect it to five different hosts at once",
        "Remove all descriptions to save tokens",
      ],
      answer: 0,
      explain: "Testing the server without a model isolates your bugs from model behaviour.",
    },
    {
      kind: "mcq",
      q: "What must a client do right after opening a connection, before listing tools?",
      options: [
        "Download the model",
        "Call tools/call",
        "Complete the initialize handshake",
        "Restart the server",
      ],
      answer: 2,
      explain: "The initialize handshake negotiates versions and capabilities before any other requests.",
    },
    {
      kind: "text",
      q: "Illustrative: 12 tools, each with a definition of about 200 tokens, are sent with every request. How many tokens of tool definitions per request?",
      format: "****",
      accept: ["2400", "2,400"],
      explain: "12 × 200 = 2,400 tokens, paid on every request.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Trace where user data travels in an LLM app and where it can leak",
    "Apply least privilege to model tools and keep authorization outside the model",
    "Handle secrets and personal data safely in prompts, logs and code",
    "Name the compliance questions to ask before sending data to a provider",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: your app talks to a stranger",
      body: (
        <>
          <p>
            A normal web app has a clear shape. Requests come in, your code runs, a database
            answers. An LLM app adds a new party in the middle: a model, usually hosted by someone
            else, that reads your text and decides what to do with it. Anything you put in the
            prompt leaves your servers. Anything the model can call can be called on behalf of
            whoever convinced it to.
          </p>
          <p>
            Think of a new employee who is helpful, fast, and willing to believe anything written
            in a document you hand them. You would not give that person the master key on day one.
            You would give them a badge that opens only the doors their job needs, and you would
            not let them photocopy the customer list without a record. Security for LLM apps is
            mostly that: badges, records and not handing over more than needed.
          </p>
          <p>
            The lesson on prompt injection covers hijacked instructions. This lesson covers the
            wider ground around it: what data leaves, who can do what, where secrets live, and
            what the law may expect of you.
          </p>
        </>
      ),
    },
    {
      id: "data-flow",
      title: "Map where your data goes",
      body: (
        <>
          <p>
            Start by drawing the path of one request. Most leaks happen at a place nobody wrote
            down. Walk through these stops and ask what is stored at each.
          </p>
          <Table
            head={["Stop", "What lands there", "Typical risk"]}
            rows={[
              ["Prompt sent to provider", "User text, retrieved documents, system prompt", "Sensitive data leaves your boundary"],
              ["Provider retention", "Requests and responses, for some period", "Depends on the provider's terms"],
              ["Your application logs", "Full prompts and outputs", "Personal data kept far longer than intended"],
              ["Vector store", "Chunks of private documents plus embeddings", "Wrong user retrieves another user's chunk"],
              ["Caches and analytics", "Repeated prompts, copied into third-party tools", "Forgotten copies nobody can delete"],
              ["Model output", "Text a user can paste anywhere", "Leaks anything that was in the context"],
            ]}
          />
          <p>
            Two rules cover most of this table. First, <strong>data minimisation</strong>: send the
            model only what it needs for this task. If the question is about an order, include the
            order, not the whole customer profile. Second, <strong>treat the context window as
            readable by the user</strong>. If a system prompt or a retrieved document contains
            something the user must never see, a model can be coaxed into repeating it. Do not put
            it there.
          </p>
          <p>
            Check each provider's data terms yourself. Whether requests are kept, for how long,
            and whether they may be used to improve models differs between providers and between
            plans, and it changes. Read the current policy and the data processing terms before you
            send real customer data, and write down what you found.
          </p>
        </>
      ),
    },
    {
      id: "worked-example",
      title: "Worked example: how much personal data are you logging?",
      body: (
        <>
          <p>
            Logging every prompt feels harmless until you count. All figures below are
            illustrative.
          </p>
          <Formula>records at risk = requests per day × retention days × share containing personal data</Formula>
          <pre>
            <code>{`50,000 requests/day × 30 days of retention = 1,500,000 stored prompts
1,500,000 × 2% contain personal data      = 30,000 records

Cut retention to 7 days:
50,000 × 7 = 350,000 prompts
350,000 × 2% = 7,000 records`}</code>
          </pre>
          <p>
            Shortening retention from 30 to 7 days cut the exposed records from 30,000 to 7,000,
            with no code change beyond a setting. Redacting personal data before it is logged
            shrinks the number further. Every record you never store is a record that cannot leak,
            be subpoenaed, or need a deletion request.
          </p>
          <p>Here is a small redaction step to run before logging. It is deliberately simple.</p>
          <pre>
            <code>{`import re

EMAIL = re.compile(r"[\\w.+-]+@[\\w-]+\\.[\\w.-]+")
PHONE = re.compile(r"\\+?\\d[\\d\\s().-]{8,}\\d")

def redact(text: str) -> str:
    text = EMAIL.sub("[EMAIL]", text)
    text = PHONE.sub("[PHONE]", text)
    return text

print(redact("Mail jo@example.com or call +1 415 555 0100"))
# Mail [EMAIL] or call [PHONE]`}</code>
          </pre>
          <Callout tone="warn">
            Regex redaction misses names, addresses and free-form identifiers. Treat it as a
            first layer. For regulated data, use a dedicated detection service or model and test
            it on your own data.
          </Callout>
        </>
      ),
    },
    {
      id: "permissions",
      title: "Permissions: least privilege, enforced outside the model",
      body: (
        <>
          <p>
            When you give a model tools, such as a database query, an email sender or a file
            reader, you are delegating authority. The safest design assumes the model will
            sometimes be tricked or simply wrong, and makes sure that does limited damage.
          </p>
          <ul>
            <li>
              <strong>Least privilege:</strong> each tool gets the narrowest access that works. A
              support bot that reads orders gets a read-only connection scoped to orders, not an
              admin database login.
            </li>
            <li>
              <strong>Act as the user, not as the service:</strong> run tool calls with the
              requesting user's identity so the existing access checks apply. Do not let the app's
              own powerful credential answer on a user's behalf.
            </li>
            <li>
              <strong>Check authorization in code:</strong> the model proposes an action, your
              code decides if this user may do it. Never rely on the prompt saying please only
              show the user their own data.
            </li>
            <li>
              <strong>Confirm destructive actions:</strong> sending, paying, deleting and
              publishing should need a human click or a second check.
            </li>
          </ul>
          <pre>
            <code>{`def get_order(user, order_id: str) -> dict:
    # Authorization lives here, not in the prompt.
    order = db.orders.find_one(order_id)
    if order is None or order["owner_id"] != user.id:
        raise PermissionError("not your order")
    return order

TOOLS = {"get_order": get_order}   # read-only; no delete or refund tool exposed`}</code>
          </pre>
          <p>
            The same idea applies to retrieval. If documents have owners, filter the vector search
            by the caller's permissions at query time. Retrieving first and hoping the model hides
            the rest is how one customer's contract ends up in another customer's answer.
          </p>
        </>
      ),
    },
    {
      id: "secrets-compliance",
      title: "Secrets and compliance basics",
      body: (
        <>
          <p>
            <strong>Secrets.</strong> API keys and database passwords belong in environment
            variables or a secrets manager, never in source code, prompts, or client-side
            JavaScript. Never put a key in a prompt: the model can repeat it, and logs will keep
            it. If a key leaks, rotate it immediately, since deleting the commit does not undo
            exposure. Give each environment its own key and set spending limits where the
            provider allows.
          </p>
          <pre>
            <code>{`import os

api_key = os.environ["LLM_API_KEY"]   # fails loudly if missing; never hard-code`}</code>
          </pre>
          <p>
            <strong>Compliance.</strong> This is not legal advice, and rules differ by country and
            sector. But a few questions come up almost everywhere:
          </p>
          <Table
            head={["Question", "Why it matters"]}
            rows={[
              ["What personal data do we send, and do we need all of it?", "Data minimisation is a core principle in laws such as GDPR"],
              ["Is there a signed data processing agreement with the provider?", "Many regimes require one when a vendor handles personal data"],
              ["Where is data processed and stored?", "Some rules limit transfers across borders"],
              ["Is health or payment data involved?", "Sector rules such as HIPAA or PCI DSS may apply"],
              ["Can we delete one person's data on request?", "Needs a record of where their data went, including logs and indexes"],
              ["Do users know an AI is processing their data?", "Transparency duties are common"],
            ]}
          />
          <Callout tone="tip">
            Keep a one-page data map: every place user text is stored, who can read it, and how
            long it lives. Auditors, customers and your own incident response will all ask for it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Anything in the prompt leaves your servers, so send only the data the task needs.",
    "Logs, caches and vector stores are copies too: redact, limit retention and know where they are.",
    "Give tools least privilege and enforce authorization in code, as the requesting user.",
    "Keep secrets in environment variables or a secrets manager, never in prompts or source.",
    "Read provider data terms, sign the needed agreements, and keep a data map for compliance.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A retrieval-augmented chatbot must only show each user their own documents. Where should that rule be enforced?",
      options: [
        "In the system prompt, by telling the model to be careful",
        "In a footer disclaimer shown to the user",
        "In the search filter and tool code, using the caller's identity",
        "By lowering the model's temperature",
      ],
      answer: 2,
      explain: "Authorization must be enforced in code the model cannot talk its way around. Prompts are requests, not access controls.",
    },
    {
      kind: "mcq",
      q: "Which is the safest way to handle an API key in an LLM app?",
      options: [
        "Put it in the system prompt so the model can use it",
        "Hard-code it in the front-end for convenience",
        "Commit it to a private repository",
        "Read it from an environment variable or secrets manager on the server",
      ],
      answer: 3,
      explain: "Keys belong server-side in configuration the code reads at runtime. Prompts, front-end code and repositories all risk exposure.",
    },
    {
      kind: "text",
      q: "A service handles 20,000 requests a day, keeps prompts for 10 days, and 3% of prompts contain personal data. How many stored records contain personal data?",
      format: "****",
      accept: ["6000", "6,000"],
      explain: "20,000 × 10 = 200,000 stored prompts. 200,000 × 0.03 = 6,000.",
    },
    {
      kind: "text",
      q: "Giving a tool only the narrowest access it needs is called the principle of what? Two words.",
      format: "***** *********",
      accept: ["least privilege", "least-privilege"],
      explain: "Least privilege limits the damage if a tool is misused or the model is tricked.",
    },
  ],
};

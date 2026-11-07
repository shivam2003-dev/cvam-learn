import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 26,
  difficulty: "Hard",
  objectives: [
    "Design a customer-facing agent with scoped tools, policy retrieval and server-side authorisation",
    "Enforce identity, refund limits and escalation in code rather than in the prompt",
    "Defend against prompt injection, social engineering and data leakage",
    "Design the handover to human agents and the learning loop",
    "Build the evaluation, monitoring and rollout plan",
  ],
  tasks: [
    {
      id: "arch",
      title: "Architecture",
      body: (
        <>
          <DiagramReference lesson="cs-agent-design" panel={1} />
        </>
      ),
    },
    {
      id: "tools",
      title: "Tools: scoped, limited and server-authorised",
      body: (
        <>
          <p>
            The most important design rule: <strong>the model never decides who the customer is or
            what they are allowed to do.</strong> The gateway authenticates the customer and passes a
            verified customer ID to the tool layer. Tools take that ID from the session, not from the
            model&apos;s arguments.
          </p>
          <pre>
            <code>{`# The model can only supply an order reference. The customer is bound by the session.
def get_order_status(session, order_ref: str) -> dict:
    order = orders.find(order_ref)
    if order is None or order.customer_id != session.customer_id:
        return {"error": "No order found with that reference on your account."}   # same message for both
    return {"status": order.status, "eta": order.eta, "tracking_url": order.tracking_url}

def create_return(session, order_ref: str, reason: str, items: list[str]) -> dict:
    order = orders.find(order_ref)
    if order is None or order.customer_id != session.customer_id:
        return {"error": "No order found with that reference on your account."}
    check = returns_policy.evaluate(order, items, reason)     # deterministic policy code
    if not check.eligible:
        return {"error": f"Not eligible: {check.reason}"}
    return {"return_label_url": returns.create(order, items, reason, key=f"{order.id}:{items}")}

def propose_refund(session, order_ref: str, amount: float, reason: str) -> dict:
    # Never executes: creates an approval task for a human.
    return approvals.create(session.customer_id, order_ref, amount, reason)`}</code>
          </pre>
          <Table
            head={["Tool", "Access", "Limit"]}
            rows={[
              ["get_order_status", "Read, own orders", "Rate limited per session"],
              ["search_policies", "Read, public content", "None sensitive"],
              ["create_return", "Write, reversible", "Policy engine decides eligibility; idempotent"],
              ["update_address", "Write, fraud-sensitive", "Only if not shipped; requires step-up verification (for example a code sent to the registered email)"],
              ["propose_refund", "Creates approval task", "Never pays; humans approve; auto-approve only below a small limit set by finance"],
              ["escalate_to_human", "Handover", "Always available; attaches summary"],
            ]}
          />
        </>
      ),
    },
    {
      id: "defences",
      title: "Defending a public-facing agent",
      body: (
        <>
          <DiagramReference lesson="cs-agent-design" panel={2} />
          <DiagramReference lesson="cs-agent-design" panel={3} />
          <Callout tone="warn" title="Do not leak through error messages">
            Return the same message whether an order does not exist or belongs to someone else.
            Different messages let an attacker discover which order numbers are valid.
          </Callout>
        </>
      ),
    },
    {
      id: "handover",
      title: "Escalation and the learning loop",
      body: (
        <>
          <ul>
            <li><strong>Escalate early and gracefully.</strong> On request, strong negative sentiment, sensitive topics, repeated failure, low confidence or policy ambiguity. Say what happens next and the expected wait.</li>
            <li><strong>Hand over a summary:</strong> who the customer is, what they want, what the agent already tried, relevant order data and the policy cited. The customer never repeats themselves.</li>
            <li><strong>Human decisions become data:</strong> approvals, edits to proposed refunds and reasons for escalation are logged and reviewed for patterns.</li>
            <li><strong>Close the loop on knowledge:</strong> when the agent could not answer, create a knowledge gap ticket for the policy owners.</li>
          </ul>
          <Exercise
            title="Add a new capability"
            task={
              <p>
                The business wants the agent to offer a goodwill voucher of up to $20 to upset
                customers. How do you add it safely?
              </p>
            }
          >
            <ol>
              <li><strong>Make it a tool with a limit in code:</strong> <code>offer_voucher(session, amount)</code> capped at $20 per customer per 90 days, enforced server-side.</li>
              <li><strong>Define eligibility with the business:</strong> only after a verified service failure on the customer&apos;s own order, decided by a deterministic rule the agent can query, not by the model&apos;s sense of sympathy.</li>
              <li><strong>Add abuse controls:</strong> track voucher frequency, alert on unusual rates by account or device.</li>
              <li><strong>Evaluate:</strong> add test conversations (including attempts to talk the agent into vouchers), and monitor redemption and cost.</li>
              <li><strong>Roll out gradually:</strong> start with human approval, then auto-issue within limits once abuse rates are known.</li>
            </ol>
          </Exercise>
        </>
      ),
    },
    {
      id: "eval",
      title: "Evaluation, monitoring and rollout",
      body: (
        <>
          <Table
            head={["Layer", "What it tests", "How"]}
            rows={[
              ["Scripted scenarios", "Core intents, edge cases, policy rules", "300 conversations with expected tool calls and final outcomes, run on every change"],
              ["Red team set", "Injection, social engineering, data fishing, abuse, offensive input", "Adversarial conversations; zero tolerance for leaks and unauthorised actions"],
              ["Policy conformance", "Answers match current policy", "Compare against a labelled policy Q and A set; check citations"],
              ["Tone and brand", "Language is appropriate", "Rubric scoring by reviewers; automated checks for banned phrases"],
              ["Live sampling", "Real traffic quality", "Review 100 conversations a week, plus all low-rated and escalated ones"],
              ["Online metrics", "Resolution, escalation, satisfaction, cost", "Dashboards and alerts; compare with human baseline"],
            ]}
          />
          <DiagramReference lesson="cs-agent-design" panel={4} />
        </>
      ),
    },
  ],
  takeaways: [
    "The model never decides identity or permissions: the gateway authenticates and tools bind actions to the verified customer.",
    "Enforce refund limits, eligibility and step-up verification in code; refunds above limits become human approvals.",
    "Layer output guards, input handling, session hygiene, abuse controls and transparency; do not leak through error messages.",
    "Escalate early with a useful summary and feed human decisions back as data.",
    "Evaluate with scripted, red-team, policy, tone, live-sampling and online metrics, and roll out in widening rings.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why do tools take the customer ID from the session instead of from the model's arguments?",
      options: [
        "The model can be manipulated, so identity must be bound by trusted code",
        "It is shorter",
        "Models cannot send IDs",
        "It avoids authentication",
      ],
      answer: 0,
      explain: "If the model chooses the customer ID, a crafted message could access another account.",
    },
    {
      kind: "mcq",
      q: "Why return the same error for missing orders and orders belonging to others?",
      options: [
        "To prevent attackers from discovering valid order numbers",
        "To save code",
        "Because they are identical cases",
        "To confuse customers",
      ],
      answer: 0,
      explain: "Different messages reveal which references exist.",
    },
    {
      kind: "mcq",
      q: "A voucher feature is requested. Where should the $20 cap live?",
      options: [
        "In the tool, enforced server-side",
        "In the system prompt only",
        "In the customer's chat",
        "Nowhere",
      ],
      answer: 0,
      explain: "Limits in code are reliable; prompt-only limits can be talked around.",
    },
    {
      kind: "mcq",
      q: "What does ring-based rollout provide?",
      options: [
        "Gradual exposure with exit criteria and rollback at each stage",
        "Instant full launch",
        "No monitoring",
        "Higher cost",
      ],
      answer: 0,
      explain: "Widening rings limit the blast radius while evidence builds.",
    },
    {
      kind: "text",
      q: "What extra check protects sensitive changes like address updates, such as a code sent to the registered email? (two words, hyphenated first)",
      format: "****-** ************",
      accept: ["step-up verification", "step up verification", "step-up authentication", "step up authentication", "step-up auth"],
      explain: "Step-up verification adds proof of identity before risky actions.",
    },
  ],
};

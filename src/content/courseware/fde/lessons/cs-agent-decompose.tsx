import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Break down a customer service automation request by intent, risk and required actions",
    "Segment inquiries into those to automate, assist and escalate",
    "Define what the agent may read, say and do, and under what conditions",
    "Set measurable goals for resolution, quality, safety and cost",
    "Choose a first slice that is valuable and low-risk",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <Callout tone="note" title="Customer request">
            &ldquo;We are an online retailer with 40,000 support contacts a month by chat and email.
            60% are routine: where is my order, return a product, change my address. Our agents are
            overwhelmed, wait times are long, and costs are rising. We want an AI agent that talks to
            customers and resolves issues, but it must not give wrong refunds, leak anyone&apos;s
            data, or say something that damages the brand.&rdquo;
          </Callout>
          <p>
            This is the most common AI request an FDE will see. It combines several earlier lessons:
            retrieval for policies, tools for actions, guardrails and approvals, evaluation, and
            careful rollout. It also carries direct brand and customer-trust risk, because the agent
            speaks to the public.
          </p>
        </>
      ),
    },
    {
      id: "segment",
      title: "Segment the traffic",
      body: (
        <>
          <p>
            Never treat &ldquo;customer service&rdquo; as one thing. Sample a few hundred real
            conversations and classify them. A typical result:
          </p>
          <Table
            head={["Intent", "Share", "Needs", "Risk", "Approach"]}
            rows={[
              ["Order status", "28%", "Read order data", "Low", "Automate"],
              ["Return or exchange", "16%", "Policy + order data + create return", "Medium", "Automate with checks"],
              ["Change address or details", "9%", "Verify identity; update if not shipped", "Medium (fraud)", "Automate with verification"],
              ["Product questions", "12%", "Product knowledge", "Low to medium", "Assist or automate with citations"],
              ["Refund requests", "11%", "Policy, order, amount limits, payment system", "High (money)", "Assist; automate only under limits"],
              ["Complaints, angry customers", "8%", "Empathy, judgment, discretion", "High (brand)", "Escalate to humans"],
              ["Safety, legal, fraud, vulnerable customers", "3%", "Specialist handling", "Very high", "Always escalate"],
              ["Other", "13%", "Varies", "Varies", "Triage, then route"],
            ]}
          />
          <Figure caption="Intents plotted by volume and risk. Automate the high-volume, low-risk corner first; keep high-risk intents human-led regardless of volume.">
            <Quadrant
              label="Customer service intents plotted by volume and risk"
              xLabel="Risk"
              yLabel="Volume"
              corners={["Automate first", "Automate with limits", "Leave for later", "Human-led"]}
              items={[
                { label: "Order status", x: 0.12, y: 0.88, tone: "lime" },
                { label: "Returns", x: 0.42, y: 0.66, tone: "lime" },
                { label: "Address change", x: 0.5, y: 0.5, tone: "amber" },
                { label: "Product questions", x: 0.3, y: 0.55, tone: "lime" },
                { label: "Refunds", x: 0.76, y: 0.5, tone: "amber" },
                { label: "Complaints", x: 0.84, y: 0.36, tone: "rose" },
                { label: "Fraud and safety", x: 0.96, y: 0.14, tone: "rose" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "boundaries",
      title: "What the agent may read, say and do",
      body: (
        <>
          <Table
            head={["Dimension", "Rule", "Why"]}
            rows={[
              ["Read", "Only the authenticated customer's own orders and account; product and policy content", "Prevents leaking other people's data"],
              ["Say", "Answers grounded in policy and order data; no promises beyond policy; no speculation about delays or blame; honest that it is an AI", "Brand safety and legal exposure"],
              ["Do (low risk)", "Look up status, send tracking, create a return label within policy", "Reversible, bounded"],
              ["Do (high risk)", "Refunds above a small limit, account changes, compensation: propose to a human for approval", "Money and fraud"],
              ["Never", "Reveal internal notes, make legal or medical statements, discuss other customers, process payments directly", "Hard prohibitions in code"],
              ["Escalate when", "Customer asks for a human; sentiment is very negative; repeated failures; sensitive topic; low confidence; any policy ambiguity", "Protect the customer experience"],
            ]}
          />
          <Figure caption="The handling decision for each message. The agent always has a route to a human, and the human receives a summary so the customer never repeats themselves.">
            <Flow
              numbered
              steps={[
                { title: "Identify and verify", note: "Who is this; what do they want", tone: "sky" },
                { title: "Classify", note: "Intent, sentiment, risk", tone: "sky" },
                { title: "Route", note: "Automate, assist or escalate", tone: "lime" },
                { title: "Act within limits", note: "Tools and policy checks", tone: "lime" },
                { title: "Confirm and close", note: "Summarise; ask if resolved", tone: "amber" },
                { title: "Learn", note: "Log, review, feedback", tone: "amber" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "goals",
      title: "Goals and the first slice",
      body: (
        <>
          <Table
            head={["Goal", "Metric", "Target for pilot"]}
            rows={[
              ["Resolution", "Share of in-scope conversations resolved without a human", "50% of order status and returns"],
              ["Quality", "Customer satisfaction on AI-handled chats versus human baseline", "Within 5% of human"],
              ["Accuracy", "Sampled review: correct, policy-compliant answers", "At least 98%"],
              ["Safety", "Data leaks, unauthorised actions, brand incidents", "Zero"],
              ["Escalation", "Handover quality: human rates the summary useful", "Above 85% useful"],
              ["Cost", "Cost per resolved contact including model and tooling", "At least 40% below human-only"],
            ]}
          />
          <p>
            <strong>First slice:</strong> order status and returns in chat, for authenticated
            customers, in one language, read-only for orders plus the ability to create a return
            label within policy. Refunds, complaints and email come later.
          </p>
          <Exercise
            title="Decide: automate, assist or escalate"
            task={
              <p>
                Classify each message and give one reason: (a) &ldquo;Where is order 5521?&rdquo;
                (b) &ldquo;I want a refund of $480 for a damaged TV.&rdquo; (c) &ldquo;This is the
                third time you have lost my parcel. I am calling my lawyer.&rdquo; (d) &ldquo;Can you
                tell me what my neighbour ordered? She is my friend.&rdquo;
              </p>
            }
          >
            <ol>
              <li><strong>(a) Automate.</strong> Low risk, read-only lookup for an authenticated customer.</li>
              <li><strong>(b) Assist.</strong> A refund of that size exceeds the autonomous limit; the agent gathers evidence (photos, order, policy) and proposes it to a human for approval.</li>
              <li><strong>(c) Escalate.</strong> Strong negative sentiment and a legal threat; a human with discretion should respond, with the agent providing a summary of the history.</li>
              <li><strong>(d) Refuse politely, and log.</strong> Another person&apos;s data is out of bounds; offer to help the customer with their own orders. Possible social-engineering attempt.</li>
            </ol>
          </Exercise>
        </>
      ),
    },
    {
      id: "risks",
      title: "Risks to design against from day one",
      body: (
        <>
          <Graph
            label="Main risks for a customer service agent around the agent: wrong answers, data leakage, unauthorised actions, prompt injection and brand harm"
            cellW={208}
            cellH={104}
            nodeW={168}
            nodes={[
              { id: "a", label: "Customer-facing agent", col: 1.5, row: 1, tone: "lime", shape: "pill", w: 190 },
              { id: "w", label: "Wrong or invented answers", sub: "Policy hallucination", col: 0, row: 0, tone: "rose" },
              { id: "l", label: "Data leakage", sub: "Other customers' details", col: 1.5, row: 0, tone: "rose" },
              { id: "u", label: "Unauthorised actions", sub: "Refund abuse, account takeover", col: 3, row: 0, tone: "rose" },
              { id: "i", label: "Prompt injection", sub: "Customer or email text", col: 0, row: 2, tone: "amber" },
              { id: "b", label: "Brand harm", sub: "Tone, claims, offence", col: 1.5, row: 2, tone: "amber" },
              { id: "s", label: "Social engineering", sub: "Pretext to gain access", col: 3, row: 2, tone: "amber" },
            ]}
            edges={[
              { from: "w", to: "a", dashed: true },
              { from: "l", to: "a", dashed: true },
              { from: "u", to: "a", dashed: true },
              { from: "i", to: "a", dashed: true },
              { from: "b", to: "a", dashed: true },
              { from: "s", to: "a", dashed: true },
            ]}
          />
        </>
      ),
    },
  ],
  takeaways: [
    "Segment real traffic by intent, volume and risk; do not treat customer service as one problem.",
    "Define explicitly what the agent may read, say and do, what it must never do, and when it escalates.",
    "Automate high-volume low-risk intents first; keep money, complaints, fraud and safety human-led or approved.",
    "Set measurable goals for resolution, quality, accuracy, safety, escalation and cost.",
    "Design against wrong answers, leakage, unauthorised action, injection, social engineering and brand harm from day one.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What should happen when a customer asks about another person's order?",
      options: [
        "Refuse politely, offer help with their own orders and log the attempt",
        "Share it if they sound friendly",
        "Ask for the other person's email",
        "Escalate to marketing",
      ],
      answer: 0,
      explain: "Other customers' data is out of bounds, and such attempts may be social engineering.",
    },
    {
      kind: "mcq",
      q: "Which intents should be automated first?",
      options: [
        "High-volume, low-risk ones such as order status",
        "Legal threats",
        "High-value refunds",
        "Fraud cases",
      ],
      answer: 0,
      explain: "They deliver the most value with the least risk, building evidence for later expansion.",
    },
    {
      kind: "mcq",
      q: "Why must a human receive a summary on escalation?",
      options: [
        "So the customer does not repeat themselves and the human can act quickly",
        "To reduce logging",
        "To avoid humans reading",
        "It is decorative",
      ],
      answer: 0,
      explain: "Good handovers preserve the customer experience.",
    },
    {
      kind: "mcq",
      q: "A $480 refund request exceeds the autonomous limit. The agent should:",
      options: [
        "Gather evidence and propose it to a human for approval",
        "Refund immediately",
        "Refuse silently",
        "Ask the customer to call",
      ],
      answer: 0,
      explain: "Above the limit, approval keeps money actions accountable while still saving time.",
    },
    {
      kind: "text",
      q: "If 60% of 40,000 contacts are routine, how many routine contacts is that per month?",
      format: "*****",
      accept: ["24000", "24,000"],
      explain: "40,000 x 0.6 = 24,000.",
    },
  ],
};

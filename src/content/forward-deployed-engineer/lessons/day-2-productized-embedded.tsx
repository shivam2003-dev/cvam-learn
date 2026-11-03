import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Medium",
  objectives: [
    "Explain what Day 2 operations covers and why it is part of the job",
    "Describe productized consulting and when to turn custom work into a product",
    "Work effectively when embedded on site with a customer team",
  ],
  tasks: [
    {
      id: "day2",
      title: "Day 2 operations",
      body: (
        <>
          <p>
            <strong>Day 1</strong> is getting the system live. <strong>Day 2</strong> is
            everything after: keeping it healthy, handling change, and making sure the value
            keeps arriving. Many deployments fail here, not at launch.
          </p>
          <ul>
            <li>
              <strong>Monitoring and alerts</strong> for uptime, data freshness and (for AI)
              answer quality.
            </li>
            <li>
              <strong>Change management.</strong> Upstream systems change their schema, a model
              version is retired, a policy shifts.
            </li>
            <li>
              <strong>Runbooks</strong> so the customer's team can fix common issues without you.
            </li>
            <li>
              <strong>Support paths</strong> with named owners and response times.
            </li>
            <li>
              <strong>Regular reviews</strong> of usage and outcomes, so value is visible.
            </li>
          </ul>
          <Callout tone="tip">
            Design for handover from the start. If only you can run it, you have built a
            dependency, not a solution.
          </Callout>
        </>
      ),
    },
    {
      id: "productized",
      title: "Productized consulting",
      body: (
        <>
          <p>
            Custom work does not scale. <strong>Productized consulting</strong> means turning
            repeated custom engagements into a defined, repeatable offer: fixed scope, known
            steps, standard tooling, predictable price.
          </p>
          <Table
            head={["Signal that it is time", "What to do"]}
            rows={[
              ["You built the same connector three times", "Package it as a reusable integration"],
              ["Every kickoff asks the same questions", "Create a standard discovery template"],
              ["Customers want the same dashboard", "Ship it as a built-in feature"],
              ["Delivery depends on one expert", "Document and automate the steps"],
            ]}
          />
          <p>
            Do not productize too early. Wait until you have seen the pattern in a few real
            customers, then extract what is common and leave what is truly custom as configuration.
          </p>
        </>
      ),
    },
    {
      id: "embedded",
      title: "Embedded engineering",
      body: (
        <>
          <p>
            Sometimes you sit with the customer's team for weeks, on site or in their chat and
            stand-ups. This is <strong>embedded engineering</strong>. The access is valuable: you
            see the real process, hear the complaints, and spot problems no interview reveals.
          </p>
          <ul>
            <li>
              <strong>Learn the language.</strong> Use their terms for things, not yours.
            </li>
            <li>
              <strong>Watch before you build.</strong> Sit with an operator for a shift.
            </li>
            <li>
              <strong>Be a good guest.</strong> Follow their security and change rules even when
              slow.
            </li>
            <li>
              <strong>Keep a link home.</strong> Report back to your own team weekly so you do not
              drift into being their contractor.
            </li>
            <li>
              <strong>Build relationships widely.</strong> The sponsor, the end users and the
              gatekeepers (security, IT) all matter.
            </li>
          </ul>
          <Callout tone="warn">
            Being embedded can blur your scope. A friendly request to "just fix this other thing"
            is how a four-week project becomes a year. Route it through the agreed plan.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Day 2 is monitoring, change management, runbooks and support; design for handover.",
    "Productize after you see the same custom work repeat, not before.",
    "Embedded work gives access and context, but needs scope discipline and a link back to your team.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main goal of a runbook in Day 2 operations?",
      options: [
        "Let the customer's team fix common issues without you",
        "Track your hours",
        "Hide how the system works",
        "Replace monitoring",
      ],
      answer: 0,
      explain: "Runbooks transfer operational knowledge so the solution does not depend on one person.",
    },
    {
      kind: "mcq",
      q: "You have built the same custom integration for three customers. Best next step?",
      options: [
        "Keep building it from scratch each time",
        "Extract the common parts into a reusable package or product feature",
        "Stop taking those customers",
        "Raise prices only",
      ],
      answer: 1,
      explain: "Repetition is the signal to productize, leaving only the truly customer-specific parts as configuration.",
    },
    {
      kind: "mcq",
      q: "A customer's manager asks you to fix an unrelated system during your embed. What is the safest response?",
      options: [
        "Do it silently",
        "Refuse rudely",
        "Route it through the agreed scope and plan, and add it to the backlog",
        "Ignore the request",
      ],
      answer: 2,
      explain: "Taking it on informally causes scope creep. Acknowledge it and handle it through the plan.",
    },
  ],
};

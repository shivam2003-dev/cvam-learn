import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers, Sequence, Timeline } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Explain why handoff is part of the project from day one, not a final-week task",
    "Build a handoff package: architecture, runbooks, access, ownership and known issues",
    "Run a staged transfer from FDE-operated to customer-operated",
    "Train the receiving team and verify they can operate the system without you",
    "Define what ongoing support looks like and when your role ends",
  ],
  tasks: [
    {
      id: "why",
      title: "Handoff is the product",
      body: (
        <>
          <p>
            A solution that only its builder can run is not finished. It is a liability waiting for the
            builder to take a holiday, change teams or leave. Handoff is the transfer of ownership
            from you to the customer&apos;s team, so that the value continues after your involvement
            ends.
          </p>
          <p>
            Most failed handoffs share a cause: they were planned in the last week. By then the
            knowledge lives in your head, the runbook does not exist, the customer&apos;s team has
            not seen the system run, and everyone is under deadline pressure. Good FDEs treat the
            handoff as a thread that runs through the whole project.
          </p>

          <Figure caption="The handoff thread. Preparation starts in the pilot, and ownership shifts gradually, so there is no cliff edge at the end.">
            <Timeline
              phases={[
                { label: "From day one", when: "Design for handover", tone: "sky", items: ["Prefer tools the customer's team knows", "Keep config separate from code", "Write decisions down as you go"] },
                { label: "During the pilot", when: "Shadow", tone: "lime", items: ["Customer engineer shadows you", "Runbook drafted from real incidents", "Access set up for their team"] },
                { label: "Before go-live", when: "Reverse shadow", tone: "amber", items: ["They operate, you watch", "Fix gaps in docs", "Practise a failure drill"] },
                { label: "After go-live", when: "Support window", tone: "plain", items: ["Agreed hypercare period", "Escalation path", "Planned exit date"] },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "package",
      title: "The handoff package",
      body: (
        <>
          <p>
            A good package answers the questions an engineer who has never seen the system will ask on
            their first bad day. It does not need to be long. It needs to be accurate, findable and
            current.
          </p>

          <Figure caption="What goes into a handoff package, from understanding down to the practical details of keeping the system alive.">
            <Layers
              layers={[
                { title: "Overview and purpose", note: "What the system does, who uses it, what outcome it serves, and a one-page architecture diagram.", tone: "sky" },
                { title: "Design decisions", note: "The decision log: why key choices were made, and what was rejected.", tone: "sky" },
                { title: "Operations runbook", note: "How to deploy, monitor, scale, back up and roll back; the top failure modes with exact commands.", tone: "lime" },
                { title: "Access and secrets", note: "Who has access to what, how credentials are rotated, where secrets live, and how to revoke people.", tone: "lime" },
                { title: "Data and quality", note: "Schemas, data sources, test sets, how quality is measured and what triggers a review.", tone: "amber" },
                { title: "Known issues and backlog", note: "Open bugs, shortcuts taken, planned improvements, and honest limitations.", tone: "amber" },
                { title: "Contacts and escalation", note: "Who to call for what, with response times, including the vendor and your own team.", tone: "plain" },
              ]}
            />
          </Figure>

          <p>A minimal runbook entry shows the level of detail that is actually useful:</p>
          <pre>
            <code>{`## Alert: invoice-matcher queue depth > 500 for 10 minutes

Meaning:   The matching service is falling behind incoming invoices.
Impact:    Clerks see delays; no data loss.

1. Check the service:     kubectl get pods -n invoices
2. Look for errors:       kubectl logs deploy/matcher -n invoices --tail=100
3. If pods are restarting (OOMKilled): increase memory limit to 2Gi, redeploy (see Deploy)
4. If the ERP is slow:    check erp-health dashboard; the queue will drain when it recovers
5. Still failing after 30 min: page platform on-call (see Contacts)

Last verified: 2026-10-20 by J. Okafor`}</code>
          </pre>

          <Callout tone="tip" title="Test the docs with a stranger">
            Ask someone who has never seen the system to follow the runbook to deploy it to a test
            environment. Every place they get stuck is a documentation bug. This single exercise
            finds more gaps than any review.
          </Callout>
        </>
      ),
    },
    {
      id: "transfer",
      title: "Transfer ownership in stages",
      body: (
        <>
          <p>
            Dropping a system on a team in one day rarely works. Move ownership in three stages,
            gradually shifting who holds the keyboard.
          </p>

          <Figure caption="Staged handoff. Responsibility moves from the FDE to the customer team one step at a time, with a checkpoint between each.">
            <Flow
              numbered
              steps={[
                { title: "I do, you watch", note: "FDE operates; customer engineers observe and ask questions", tone: "sky" },
                { title: "We do together", note: "Pair on deploys and incidents; customer drives when ready", tone: "lime" },
                { title: "You do, I watch", note: "Customer operates; FDE reviews and corrects", tone: "amber" },
                { title: "You do", note: "Customer owns it; FDE available on request", tone: "plain" },
              ]}
            />
          </Figure>

          <p>
            Between stages, run a <strong>failure drill</strong>: deliberately break something in a
            test environment (stop a service, expire a credential, send malformed data) and watch how
            the customer team responds using the runbook. It builds confidence and reveals gaps while
            you are still around to help.
          </p>

          <Figure caption="A handoff session in which the customer team runs a deployment while the FDE observes.">
            <Sequence
              label="Sequence of a handoff drill: customer engineer deploys, hits a problem, finds the runbook step, and fixes it with the FDE observing"
              actors={[
                { id: "eng", label: "Customer engineer" },
                { id: "doc", label: "Runbook" },
                { id: "sys", label: "System" },
                { id: "fde", label: "FDE (observing)" },
              ]}
              messages={[
                { from: "eng", to: "doc", text: "Open the deploy section" },
                { from: "eng", to: "sys", text: "Run deploy steps" },
                { from: "sys", to: "eng", text: "Fails: missing config value", dashed: true },
                { from: "eng", to: "doc", text: "Search for the error" },
                { note: "Gap found: the config value is not documented. FDE notes it; does not intervene.", over: ["doc", "fde"] },
                { from: "eng", to: "fde", text: "Ask for help only after trying" },
                { from: "fde", to: "doc", text: "Update the runbook with the missing step" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "training",
      title: "Train people, not just systems",
      body: (
        <>
          <p>
            There are two audiences, and they need different things. Operators run the system; end
            users use its output.
          </p>
          <Table
            head={["Audience", "Needs", "Format"]}
            rows={[
              ["Operators (customer engineers)", "How it works, how to deploy, monitor and recover; what the dashboards mean", "Hands-on workshop, runbook, recorded walkthrough"],
              ["End users", "What it does, when to trust it, what to do when it is wrong, how to give feedback", "Short live session, one-page guide, in-app hints"],
              ["Managers", "What changed, what metrics to watch, whom to ask", "Short briefing and a monthly summary"],
              ["Security and compliance", "Data flows, access controls, audit logs", "Architecture review and a written summary"],
            ]}
          />
          <p>
            Verify that training worked with a test, not a survey. Ask an operator to perform a task
            from the runbook without help. Ask a user to explain when they would not trust an answer.
            If they cannot, adjust the training or the product.
          </p>
        </>
      ),
    },
    {
      id: "support",
      title: "Support windows and letting go",
      body: (
        <>
          <p>
            After go-live, plan a defined <strong>hypercare</strong> period (often two to four weeks)
            where you respond quickly to issues while the customer team gains confidence. Write down
            what is included, response times, and when it ends. Open-ended free support becomes an
            unmanaged dependency, and it prevents the customer team from learning.
          </p>
          <ul>
            <li>
              <strong>Define the boundary.</strong> What is a bug in your work, what is an
              enhancement, and what is an operational question the customer team should handle?
            </li>
            <li>
              <strong>Agree an escalation path.</strong> When your involvement ends, who do they call
              at your company? A support rota or an account owner, not you personally.
            </li>
            <li>
              <strong>Hold a retrospective</strong> with the customer: what went well, what was hard,
              what you would change. Feed this into your own team&apos;s playbook.
            </li>
            <li>
              <strong>Archive and credit.</strong> Store the decision log, code and documentation
              somewhere durable, and credit the customer team members who made it work.
            </li>
          </ul>

          <Callout tone="warn" title="The hero trap">
            If you are the only one who can fix an incident at 2 a.m., you have not handed off. Plan
            to be unnecessary. A system that keeps working without you is the strongest proof of a
            good engagement.
          </Callout>

          <Exercise
            title="Audit a handoff"
            task={
              <p>
                You finish a project and give the customer team a 40-page design document and a link
                to the repository. Two weeks later, the system fails and they cannot restart it. List
                at least four things that were missing from the handoff.
              </p>
            }
          >
            <ol>
              <li>A concise <strong>runbook</strong> with exact commands for the common failures, rather than a long design document.</li>
              <li><strong>Operator training and a drill</strong>, so they had practised recovery before it mattered.</li>
              <li><strong>Access and credentials</strong> for their engineers to the environments, with rotation steps.</li>
              <li><strong>Monitoring and alerts</strong> that reach them, so they notice problems before users do.</li>
              <li>An <strong>escalation path and hypercare window</strong>, so they knew whom to call.</li>
              <li>A <strong>known-issues list</strong> that mentions the failure they hit.</li>
            </ol>
            <p>
              A long document is not a handoff. Practised operation is.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Handoff is planned from day one and ownership shifts gradually, not in the last week.",
    "A package covers purpose, decisions, a runbook, access, data and quality, known issues and contacts.",
    "Transfer in stages (I do, we do, you do) with failure drills between them.",
    "Train operators and users separately, and verify with tasks rather than surveys.",
    "Define a hypercare window, an escalation path and an exit date, and plan to be unnecessary.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why should handoff planning start at the beginning of a project?",
      options: [
        "Knowledge, docs and design choices that enable handover are cheapest to build as you go",
        "It lets you finish earlier",
        "Customers dislike late handoffs",
        "It avoids writing tests",
      ],
      answer: 0,
      explain: "Retrofitting runbooks, docs and ownership in the last week is rushed and incomplete.",
    },
    {
      kind: "mcq",
      q: "What is a failure drill in a handoff?",
      options: [
        "Deliberately breaking something in a test environment so the customer team practises recovery",
        "Firing the FDE",
        "A review of last quarter's outages",
        "Blaming the customer",
      ],
      answer: 0,
      explain: "A drill proves the runbook and the team's readiness while you are still available to help.",
    },
    {
      kind: "mcq",
      q: "A 40-page design document is handed over without a runbook. What is the main problem?",
      options: [
        "Operators need exact, practical recovery steps rather than background design",
        "The document is too short",
        "Customers do not read documents",
        "Documents are always worthless",
      ],
      answer: 0,
      explain: "A runbook gives concrete steps for failures; design docs explain why, not how to recover.",
    },
    {
      kind: "mcq",
      q: "Why define an end date for hypercare support?",
      options: [
        "Open-ended free support creates dependency and stops the customer team learning",
        "To save you money",
        "Because the contract forbids support",
        "So you can avoid incidents",
      ],
      answer: 0,
      explain: "A defined window builds customer capability and avoids an unmanaged dependency on one person.",
    },
    {
      kind: "text",
      q: "In the staged transfer, what is the last stage called? (Complete: 'You ...')",
      format: "*** **",
      accept: ["you do", "you do it"],
      explain: "In the last stage the customer owns the system and the FDE is available only on request.",
    },
  ],
};

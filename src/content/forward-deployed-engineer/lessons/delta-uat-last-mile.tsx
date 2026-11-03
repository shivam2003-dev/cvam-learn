import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Define the delta between a product and a customer's need",
    "Run user acceptance testing (UAT) with clear exit criteria",
    "Explain why the last mile of integration is where projects stall",
  ],
  tasks: [
    {
      id: "delta",
      title: "The delta",
      body: (
        <>
          <p>
            The <strong>delta</strong> is the gap between what the product does out of the box and
            what this customer needs to get value. Finding and sizing the delta is the first real
            FDE task, because everything you build is spent closing it.
          </p>
          <p>Deltas usually fall into a few buckets:</p>
          <ul>
            <li>
              <strong>Data delta.</strong> The product expects clean, structured input; the
              customer has spreadsheets, PDFs and a database from 2009.
            </li>
            <li>
              <strong>Workflow delta.</strong> The product assumes one process; the customer has
              three approval steps and a regional exception.
            </li>
            <li>
              <strong>Integration delta.</strong> It must talk to a system with no API.
            </li>
            <li>
              <strong>Trust delta.</strong> Users do not believe the output yet.
            </li>
          </ul>
          <Callout tone="tip">
            Write the delta as a short list with an owner and a rough size for each item. It
            becomes your scope document and your progress report.
          </Callout>
        </>
      ),
    },
    {
      id: "uat",
      title: "User acceptance testing",
      body: (
        <>
          <p>
            <strong>UAT</strong> is where real users confirm the solution does their job. It is
            different from your own testing: you check the code works, they check it is
            <em> useful</em>.
          </p>
          <Table
            head={["Step", "What to do"]}
            rows={[
              ["Agree criteria first", "Write acceptance criteria with the customer before UAT starts, in plain language"],
              ["Use real data and real users", "Not your sample file and not the project sponsor alone"],
              ["Script the happy path and the awkward ones", "Include bad input, missing fields and the regional exception"],
              ["Log every finding", "Bug, change request or training issue, each with an owner"],
              ["Define exit", "Sign-off when all must-haves pass; the rest go on a dated backlog"],
            ]}
          />
          <Callout tone="warn">
            Without written criteria, UAT turns into an endless stream of new wishes. Separate
            "does not meet what we agreed" from "would be nice", and say so out loud.
          </Callout>
        </>
      ),
    },
    {
      id: "last-mile",
      title: "Last-mile integration",
      body: (
        <>
          <p>
            Most of a project can look finished while the <strong>last mile</strong> remains: the
            final connection that makes the output land in the system the user actually works in.
            Typical last-mile items:
          </p>
          <ul>
            <li>Writing results back to the CRM, ERP or ticketing tool, not just a dashboard.</li>
            <li>Single sign-on, permissions and audit logging that security requires.</li>
            <li>Firewall rules, allow-lists and network paths into a locked-down environment.</li>
            <li>Notifications and exports in the exact format a downstream team expects.</li>
            <li>Training, a short guide, and a named person to call.</li>
          </ul>
          <p>
            These are rarely glamorous, and they decide adoption. A model with 95% accuracy that
            nobody can reach is worth nothing. Plan last-mile work from day one and ask about it in
            discovery: "where does the answer need to end up, and who has to approve getting it
            there?"
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "The delta is the gap between the product and this customer's need; list it, size it, own it.",
    "UAT needs written acceptance criteria, real users and real data, and a clear exit.",
    "Last-mile integration (write-back, SSO, network, training) decides adoption; plan it early.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why write UAT acceptance criteria before testing starts?",
      options: [
        "To make testing take longer",
        "To separate agreed requirements from new wishes",
        "Because the code needs them to compile",
        "To avoid involving users",
      ],
      answer: 1,
      explain: "Agreed criteria give UAT a finish line and let you distinguish defects from change requests.",
    },
    {
      kind: "mcq",
      q: "Which is a last-mile integration task?",
      options: [
        "Choosing a font",
        "Writing model output back into the customer's ticketing system with proper permissions",
        "Renaming a variable",
        "Reading a research paper",
      ],
      answer: 1,
      explain: "Last mile is getting results into the place and format where users work, within the customer's security rules.",
    },
    {
      kind: "mcq",
      q: "A customer stores data only in scanned PDFs, but the product expects structured records. What kind of delta is this?",
      options: ["Data delta", "Workflow delta", "Trust delta", "Pricing delta"],
      answer: 0,
      explain: "The shape and quality of the input data differs from what the product assumes.",
    },
  ],
};

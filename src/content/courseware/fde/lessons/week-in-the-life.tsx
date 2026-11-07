import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Follow a realistic five-day FDE engagement from kickoff to a status review",
    "See how time splits between building, customer contact, and unblocking",
    "Recognise the common blockers (access, data, security, people) and how FDEs handle them",
    "Plan a week with a fixed goal and a realistic buffer",
  ],
  tasks: [
    {
      id: "setting",
      title: "The engagement we will follow",
      body: (
        <>
          <p>
            Job descriptions make the role sound abstract. This lesson makes it concrete by following
            one week of a fictional engagement. The details are invented but typical.
          </p>
          <p>
            <strong>Northwind Freight</strong> is a mid-sized logistics company. Every day its finance
            team receives about 1,200 supplier invoices as PDFs and emails. Four clerks match each
            invoice to a purchase order in the company&apos;s ERP, flag mismatches, and route
            exceptions to buyers. It takes roughly eight minutes per invoice and mistakes are costly.
          </p>
          <p>
            Your company sells an AI document-processing platform. Northwind signed a six-week pilot:{" "}
            <em>reduce manual matching time by at least half on the three highest-volume suppliers</em>.
            You are the forward deployed engineer. Today is Monday of week one.
          </p>

          <DiagramReference lesson="week-in-the-life" panel={1} />
        </>
      ),
    },
    {
      id: "monday",
      title: "Monday: align and unlock",
      body: (
        <>
          <p>
            The first day is mostly listening. The kickoff call has the sponsor (the finance director),
            the team lead, two clerks and someone from IT. A good FDE enters with questions, not a
            pitch:
          </p>
          <ul>
            <li>&ldquo;Walk me through the last invoice you processed, step by step.&rdquo;</li>
            <li>&ldquo;What happens when the amounts don&apos;t match?&rdquo;</li>
            <li>&ldquo;What would make you say this pilot was a success?&rdquo;</li>
            <li>&ldquo;Who has to approve something before it touches the ERP?&rdquo;</li>
          </ul>
          <p>
            The last question surfaces the real constraints. IT mentions that any service calling the
            ERP needs a security review, which usually takes two weeks. You write that down and start
            the request <em>that afternoon</em>. Long-lead items are started on day one, because they
            run in parallel with everything else.
          </p>
          <p>
            In the afternoon you sit next to a clerk named Priya for ninety minutes and watch her work.
            You learn things no interview would reveal: she keeps a personal spreadsheet of supplier
            quirks, one supplier always puts the PO number in the footer, and she ignores invoices
            under a certain amount unless something looks odd.
          </p>

          <Callout tone="tip" title="Start the slow things first">
            Access requests, firewall rules, security reviews and data extracts all take elapsed time
            that no amount of coding can shorten. On day one, list every approval you will need and
            file each request before you write a line of code.
          </Callout>
        </>
      ),
    },
    {
      id: "tuesday",
      title: "Tuesday: understand the data",
      body: (
        <>
          <p>
            Tuesday is a data day. You receive 400 sample invoices across the three target suppliers
            and a CSV export of open purchase orders. Before building anything you profile what you
            have:
          </p>
          <Table
            head={["Question", "What you find", "Consequence"]}
            rows={[
              ["How many formats?", "Supplier A: clean PDFs. Supplier B: scans, some rotated. Supplier C: emailed Excel files", "Three extraction paths, not one"],
              ["Where is the PO number?", "A: header. B: footer, sometimes handwritten. C: a cell on sheet 2", "Per-supplier rules plus a fallback"],
              ["Missing or wrong values?", "About 6% of Supplier B's PO numbers are unreadable", "A review queue for low-confidence cases"],
              ["How clean are the POs?", "Duplicate PO numbers exist across plants", "Match on PO plus supplier plus plant"],
            ]}
          />
          <p>
            You also settle the success metric, because &ldquo;reduce effort by half&rdquo; is not yet
            measurable. With the team lead you agree: <strong>median handling time per invoice</strong>,
            measured with a baseline of eight minutes from Priya&apos;s time study, and{" "}
            <strong>field accuracy</strong> of at least 95% on a held-out set of 100 invoices that Priya
            labels by hand. Writing the metric down on Tuesday means nobody argues about it on Friday.
          </p>

          <Exercise
            title="Pick the first slice"
            task={
              <p>
                You have three suppliers with three formats and only a week. Which one would you
                automate first, and why? Consider volume, difficulty and what you will learn.
              </p>
            }
          >
            <p>
              Start with Supplier A: clean PDFs with the PO number in the header. It is the easiest
              path to a working end-to-end result, which proves the whole chain (extraction, matching,
              ERP write-back, review screen) early. The hard cases (B&apos;s scans, C&apos;s Excel
              files) are added after the pipeline exists. If Supplier A has high volume, even better,
              because the first demo then moves a real number. The wrong choice would be to start with
              the hardest supplier: you would spend the week on OCR and have nothing end to end to
              show.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "wednesday",
      title: "Wednesday: build the thin slice",
      body: (
        <>
          <p>
            Wednesday is the closest to ordinary engineering: a focused day of coding. You build one
            vertical slice for Supplier A: take a PDF in, extract the fields, match to a purchase order,
            and show the result.
          </p>

          <DiagramReference lesson="week-in-the-life" panel={2} />

          <p>
            By late afternoon it runs end to end on 40 invoices. Accuracy is 91%, below the 95% target,
            but you now know exactly why: two date formats are mis-parsed and one field is picked from
            the wrong table. These are fixable. More importantly you have something to show, so you
            book a 30-minute demo for Friday with Priya and the team lead.
          </p>
          <p>
            Notice what you did not do: you did not build a polished interface, support all
            suppliers, or write a generic framework. The aim of the first week is evidence and
            learning, not completeness.
          </p>
        </>
      ),
    },
    {
      id: "thursday",
      title: "Thursday: the wall",
      body: (
        <>
          <p>
            Thursday brings the blocker that FDE work is famous for. To write matched invoices back to
            the ERP, your service needs to call an internal API. IT replies that the security review
            has found a problem: services are not allowed to hold long-lived credentials, and the ERP
            API only supports static keys.
          </p>
          <p>You have a choice of responses, and the difference between them is the job:</p>
          <Table
            head={["Reaction", "What happens"]}
            rows={[
              ["Ask IT to make an exception", "Probably refused; creates friction and delay"],
              ["Hard-code a key and hope", "Breaks the customer's rules; will be found and shut down"],
              ["Redesign to fit the rule", "Slower today, but accepted and sustainable"],
            ]}
          />
          <p>
            You choose the third. After a short call with an IT engineer you agree on a design that
            avoids storing the key in your service: the ERP team exposes a small internal job that
            reads from a queue, and your service only writes matched results to that queue.
          </p>

          <DiagramReference lesson="week-in-the-life" panel={3} />

          <p>
            The redesign costs most of Thursday. It also produces a better system: the customer owns
            the final write, so their auditors are comfortable, and the queue gives you retry and
            replay for free. This pattern, working with the constraint rather than around it, recurs
            throughout the course.
          </p>
        </>
      ),
    },
    {
      id: "friday",
      title: "Friday: show evidence",
      body: (
        <>
          <p>
            Friday is about proof. In the morning you fix the two date-parsing bugs and rerun the
            held-out set: accuracy is now 96.5% on Supplier A, and median handling time in the review
            screen is 2 minutes 10 seconds against the 8-minute baseline.
          </p>
          <p>
            The demo with Priya and the team lead is short and concrete. You show real invoices, you
            show the failure cases honestly, and you ask Priya to try to break it. She finds an edge
            case within five minutes (a credit note that looks like an invoice). You log it, and it
            becomes next week&apos;s first test case.
          </p>
          <p>
            Then you write the weekly status note for the sponsor. It is short and uses the structure
            from the communication chapter:
          </p>
          <pre>
            <code>{`Status: AMBER

Headline: Supplier A pipeline works end to end; 96.5% field accuracy, 2m10s median
handling (baseline 8m). Security review changed the write-back design; now agreed.

Next week: Supplier B (scans). Add a review queue for low-confidence extractions.

Risks
- ERP import job needs 2 days of work from the ERP team by Wednesday. Owner: M. Okafor.
- Supplier B scan quality may cap accuracy. Plan: measure by Tuesday, then decide.

Ask: Please confirm the ERP team's capacity for Wednesday.`}</code>
          </pre>
          <p>
            The status is amber, not green, and you said why. Executives trust an honest amber far
            more than a surprise red later.
          </p>
        </>
      ),
    },
    {
      id: "time",
      title: "Where the time went",
      body: (
        <>
          <p>
            Looking back across the five days, the week is nothing like a purely coding job. A
            plausible split of working hours:
          </p>
          <Table
            head={["Activity", "Approximate share", "Examples this week"]}
            rows={[
              ["Customer contact", "25%", "Kickoff, shadowing Priya, IT call, demo"],
              ["Building and testing", "35%", "Extraction, matching, validation, bug fixes"],
              ["Unblocking and coordination", "20%", "Access requests, security redesign, ERP team"],
              ["Understanding and measuring", "15%", "Data profiling, labelling, metric design"],
              ["Writing and reporting", "5%", "Status note, decision log"],
            ]}
          />
          <p>
            Two things stand out. First, only about a third of the time is pure building. The
            engineers who thrive in this role find the rest interesting, not a distraction. Second,
            nearly every blocker was about people, process or policy, not technology. Solving
            Thursday&apos;s problem took one good conversation and a clean redesign.
          </p>
          <Callout tone="note" title="Not every week looks like this">
            Early weeks lean toward discovery and access. Late weeks lean toward hardening, handover
            and training. Some weeks are consumed by an incident. The skill is reading which phase
            you are in and adjusting the mix.
          </Callout>

          <Exercise
            title="Plan your own Monday"
            task={
              <p>
                You start a one-week feasibility sprint tomorrow for a customer you have never met.
                List the five things you would do on day one, in order, and mark which ones involve a
                long lead time.
              </p>
            }
          >
            <ol>
              <li>
                <strong>File every access and security request</strong> (long lead): cloud account,
                data extracts, VPN, security review.
              </li>
              <li>
                <strong>Kickoff call with sponsor and users</strong>, asking about past behaviour and
                what success means.
              </li>
              <li>
                <strong>Shadow a real user</strong> for an hour or two.
              </li>
              <li>
                <strong>Request a realistic data sample</strong> (long lead): ideally the messy kind.
              </li>
              <li>
                <strong>Write a half-page problem statement</strong> and send it back for
                confirmation.
              </li>
            </ol>
            <p>
              The first and fourth items are the long-lead ones. Notice that none of the five is
              writing the solution.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Early days are listening, shadowing, access requests and data profiling, not coding.",
    "Start every long-lead approval on day one, because it runs in parallel with everything else.",
    "Agree a measurable success metric and baseline before building, so Friday has no arguments.",
    "Build one thin end-to-end slice on real data rather than a broad, shallow system.",
    "When a policy blocks you, redesign to fit it; the result is usually better and accepted.",
    "Only about a third of an FDE's time is pure building; most blockers are about people and process.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why file the security review request on Monday afternoon, before any code exists?",
      options: [
        "It has a long lead time and can run in parallel with the work",
        "Security reviews are quick, so it does not matter when",
        "To avoid having to talk to IT later",
        "It is required before attending a kickoff",
      ],
      answer: 0,
      explain: "Elapsed-time dependencies cannot be shortened by effort, so start them first.",
    },
    {
      kind: "mcq",
      q: "The ERP only supports static API keys and policy forbids services holding them. What is the best response?",
      options: [
        "Redesign so the customer's own job performs the write, and the service only posts to a queue",
        "Hard-code a key and hide it",
        "Ask for the policy to be ignored for the pilot",
        "Abandon the write-back entirely",
      ],
      answer: 0,
      explain: "Designing to fit the constraint is accepted and sustainable. Workarounds get shut down.",
    },
    {
      kind: "mcq",
      q: "Why choose Supplier A (clean PDFs) as the first slice?",
      options: [
        "It gets a full end-to-end chain working early and proves the architecture",
        "It is the hardest supplier and shows skill",
        "It has the fewest invoices",
        "The customer asked for it last",
      ],
      answer: 0,
      explain: "An early end-to-end result exposes integration problems and gives something real to demo.",
    },
    {
      kind: "mcq",
      q: "Roughly what share of a typical FDE week is pure building and testing in this example?",
      options: ["About a third", "About 90%", "Almost none", "Exactly half"],
      answer: 0,
      explain: "In the example about 35% is building. The rest is customer contact, unblocking, measurement and writing.",
    },
    {
      kind: "text",
      q: "Priya found a credit note that looked like an invoice during the demo. Where should that case go?",
      format: "** * **** ****",
      accept: ["test set", "the test set", "into the test set", "to the test set", "eval set", "test case", "a test case"],
      explain: "Every failure found becomes a permanent test case so the same mistake is not repeated.",
    },
  ],
};

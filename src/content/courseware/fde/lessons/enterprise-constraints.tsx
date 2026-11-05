import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Layers, Timeline } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Identify the main categories of enterprise constraint: security, data, network, procurement, change and legacy",
    "Treat constraints as design inputs and discover them early",
    "Navigate security reviews and deployment approvals with prepared evidence",
    "Design for restricted environments: private networks, no internet, strict data residency",
    "Choose between pushing back, adapting, or escalating for a blocked path",
  ],
  tasks: [
    {
      id: "nature",
      title: "Constraints are not obstacles to engineer around",
      body: (
        <>
          <p>
            Startups optimise for speed. Large organisations optimise for not breaking things. Their
            rules about access, change, data and procurement exist because past incidents, audits and
            regulations taught them to. When you meet such a rule, the productive stance is: this is a
            requirement of the system, like latency or cost.
          </p>
          <p>
            Engineers who treat constraints as annoyances spend their weeks in escalation fights. Those
            who treat them as design inputs ask early, adapt the design, and keep the project moving.
            Enterprise skill is mostly the discipline of discovering constraints on day one rather
            than week six.
          </p>

          <Figure caption="The six families of enterprise constraint. Most blockers you will meet belong to one of them.">
            <Graph
              label="Six families of enterprise constraint around the project: security, data, network, procurement, change and legacy"
              cellW={200}
              cellH={104}
              nodeW={162}
              nodes={[
                { id: "sec", label: "Security and access", sub: "SSO, least privilege, review", col: 0, row: 0, tone: "rose" },
                { id: "data", label: "Data and privacy", sub: "Residency, retention, PII", col: 1, row: 0, tone: "rose" },
                { id: "net", label: "Network", sub: "Private, no outbound, allow-lists", col: 2, row: 0, tone: "rose" },
                { id: "proj", label: "Your project", col: 1, row: 1, tone: "lime", shape: "pill", w: 170 },
                { id: "proc", label: "Procurement and legal", sub: "Vendors, contracts, terms", col: 0, row: 2, tone: "amber" },
                { id: "chg", label: "Change control", sub: "Release windows, CAB", col: 1, row: 2, tone: "amber" },
                { id: "leg", label: "Legacy systems", sub: "Old APIs, batch jobs", col: 2, row: 2, tone: "amber" },
              ]}
              edges={[
                { from: "sec", to: "proj", dashed: true },
                { from: "data", to: "proj", dashed: true },
                { from: "net", to: "proj", dashed: true },
                { from: "proc", to: "proj", dashed: true },
                { from: "chg", to: "proj", dashed: true },
                { from: "leg", to: "proj", dashed: true },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "discover",
      title: "Discover constraints in week one",
      body: (
        <>
          <p>
            Build a standard constraint questionnaire and ask it in the first days, to IT, security and
            the champion. The questions are boring, and the answers decide the architecture.
          </p>
          <Table
            head={["Area", "Ask", "Why it shapes the design"]}
            rows={[
              ["Hosting", "Where may this run: their cloud, our cloud, on premises? Which accounts and regions?", "Determines deployment model and data flows"],
              ["Network", "Is there outbound internet? Are services reached through a proxy or allow-list?", "Decides whether you can call hosted model APIs"],
              ["Identity", "How do users sign in? Is there an identity provider? How are service accounts issued?", "Drives auth design and lead time"],
              ["Data", "What categories of data are involved? Residency, retention, masking rules?", "Limits what can be sent to models and stored"],
              ["Approvals", "What reviews are needed (security, privacy, architecture, vendor)? How long do they take?", "Sets the critical path"],
              ["Change", "Release windows, freeze periods, change tickets?", "Affects when you can deploy"],
              ["Tooling", "Approved languages, container registries, CI, monitoring?", "Avoids building something that cannot be installed"],
            ]}
          />

          <Figure caption="Typical approval lead times vary enormously. Start every long one on day one; they run alongside your build.">
            <Timeline
              phases={[
                { label: "Account and VPN access", when: "2 to 5 days", tone: "sky", weight: 1 },
                { label: "Data extract approval", when: "1 to 2 weeks", tone: "sky", weight: 1.6 },
                { label: "Firewall / allow-list change", when: "1 to 3 weeks", tone: "amber", weight: 2 },
                { label: "Security architecture review", when: "2 to 6 weeks", tone: "rose", weight: 3 },
                { label: "Vendor / legal onboarding", when: "4 to 12 weeks", tone: "rose", weight: 5 },
              ]}
            />
          </Figure>

          <Callout tone="tip" title="Make a critical-path list on day one">
            List every approval, its owner, and how long it takes. The longest chain, not the amount of
            code, determines your end date. Review the list weekly with your champion.
          </Callout>
        </>
      ),
    },
    {
      id: "security",
      title: "Passing a security review",
      body: (
        <>
          <p>
            Security reviews are the most common reason enterprise projects stall. They go smoothly
            when you arrive prepared and badly when you arrive with a prototype and a request for
            access. A short, honest package answers most of the reviewer&apos;s questions in advance.
          </p>

          <Figure caption="What a security reviewer wants to see. Preparing these in advance usually cuts weeks from the review.">
            <Layers
              layers={[
                { title: "Architecture and data-flow diagram", note: "Components, trust boundaries, and exactly what data crosses each.", tone: "sky" },
                { title: "Data inventory", note: "What data is processed, its classification, where it is stored and for how long.", tone: "sky" },
                { title: "Access model", note: "Who can do what, how authentication works, how access is granted and revoked.", tone: "lime" },
                { title: "Third parties and sub-processors", note: "Each external service, what it receives, its certifications and retention terms.", tone: "lime" },
                { title: "Controls and evidence", note: "Encryption, logging, vulnerability scanning, incident response, and relevant certifications.", tone: "amber" },
                { title: "Risks and mitigations", note: "Known risks, owners and how they are handled, including prompt injection for AI features.", tone: "amber" },
              ]}
            />
          </Figure>

          <ul>
            <li>
              <strong>Answer the question behind the question.</strong> &ldquo;Does it store
              data?&rdquo; usually means &ldquo;what is exposed if it is breached?&rdquo;
            </li>
            <li>
              <strong>Offer options.</strong> If a hosted model API is refused, have a self-hosted or
              in-region alternative ready.
            </li>
            <li>
              <strong>Never ask for exceptions as a first move.</strong> Reviewers say no to
              exceptions and yes to compliant designs.
            </li>
            <li>
              <strong>Be a partner, not an adversary.</strong> Reviewers who trust you tend to
              prioritise you.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "restricted",
      title: "Designing for restricted environments",
      body: (
        <>
          <p>
            Many customers cannot allow outbound internet, hosted APIs or even cloud services. Banks,
            hospitals, defence and government often run <strong>private</strong> or{" "}
            <strong>air-gapped</strong> environments. The same product has to work there.
          </p>

          <Figure caption="Deployment options for a model-backed feature, ordered from least to most restricted. Each step trades convenience for control.">
            <Flow
              direction="col"
              steps={[
                { title: "Vendor-hosted SaaS", note: "Easiest to run. Data leaves the customer; often unacceptable for sensitive data.", tone: "lime" },
                { title: "Single-tenant in vendor cloud", note: "Isolated resources and a dedicated environment; data still leaves the customer's account.", tone: "sky" },
                { title: "Customer's cloud account (VPC)", note: "Runs in their account with their controls; models via their cloud's private endpoints.", tone: "amber" },
                { title: "On-premises", note: "Runs in their data centre; you ship installable artifacts and self-hosted models.", tone: "rose" },
                { title: "Air-gapped", note: "No internet at all: offline updates, mirrored registries, signed bundles, local models.", tone: "rose" },
              ]}
            />
          </Figure>

          <p>Practical design habits for restricted settings:</p>
          <ul>
            <li>
              <strong>Package everything.</strong> Containers or installers that bring their own
              dependencies, with no calls out to public registries at run time.
            </li>
            <li>
              <strong>Make external calls optional and swappable.</strong> Put model access behind an
              interface so a hosted API can be replaced by a local model.
            </li>
            <li>
              <strong>Plan updates.</strong> How do patches arrive when there is no internet? Usually
              signed bundles transferred through an approved process.
            </li>
            <li>
              <strong>Log locally.</strong> Telemetry that normally goes to your cloud must stay
              inside; give the customer exportable logs instead.
            </li>
            <li>
              <strong>Test in their environment early.</strong> Differences in OS version, proxies or
              certificates are best found in week one.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "navigate",
      title: "Pushing back, adapting, or escalating",
      body: (
        <>
          <p>
            When a constraint blocks you, you have three moves. Pick deliberately.
          </p>
          <Table
            head={["Move", "Use when", "Example"]}
            rows={[
              ["Adapt the design", "The rule is reasonable and a compliant design exists", "Replace direct credentials with a queue the customer's job reads"],
              ["Push back with evidence", "The rule seems to rest on a misunderstanding", "Show the data never leaves the region; offer a zero-retention provider"],
              ["Escalate", "The rule blocks the agreed goal and the owner cannot resolve it", "Ask the sponsor to align security and the business on a trade-off"],
            ]}
          />
          <p>
            Adapt first, and keep push-back for genuine misunderstandings. Escalate rarely and with
            options, because each escalation spends relationship capital. When you escalate, never
            describe someone as &ldquo;blocking&rdquo; you. Describe the decision needed:
            &ldquo;We cannot meet the date unless a way to reach the data is agreed. Here are two
            options and what each costs.&rdquo;
          </p>

          <Exercise
            title="Design around the rule"
            task={
              <p>
                A hospital will not allow patient notes to leave its network, and your product uses a
                hosted language-model API. The pilot is in six weeks. List three design options, and
                recommend one.
              </p>
            }
          >
            <ol>
              <li>
                <strong>Run a model inside the hospital&apos;s network</strong> (self-hosted open
                model or a cloud-provider model in their private account): data never leaves.
              </li>
              <li>
                <strong>De-identify before sending</strong>: remove names and identifiers, send only
                text that is no longer personal data, with legal approval.
              </li>
              <li>
                <strong>Narrow the first slice</strong> to non-sensitive text (for example internal
                policies) while the sensitive path is approved.
              </li>
            </ol>
            <p>
              A sound recommendation is option 3 now, to keep the six-week timeline and show value,
              together with option 1 started in parallel for the sensitive data, as the long-term
              design. Option 2 carries re-identification and approval risk, so use it only with the
              privacy team&apos;s agreement.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Treat enterprise rules as requirements, like latency or cost, not as obstacles.",
    "Constraints fall into six families: security, data, network, procurement, change and legacy.",
    "Run a constraint questionnaire in week one and build a critical-path list of approvals.",
    "Arrive at security reviews with diagrams, data inventory, access model, third parties and controls.",
    "Design deployment to fit restricted environments, from VPC to air-gapped, with swappable external calls.",
    "Adapt first, push back on misunderstandings, and escalate rarely with options.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which approach most reduces the time a security review takes?",
      options: [
        "Arriving with a data-flow diagram, data inventory, access model and control evidence",
        "Asking for an exception",
        "Submitting a prototype with no documentation",
        "Waiting until after launch",
      ],
      answer: 0,
      explain: "Reviewers need to understand and assess risk; a prepared package answers their questions in advance.",
    },
    {
      kind: "mcq",
      q: "A customer's network has no outbound internet. What should you design for?",
      options: [
        "Packaged artifacts, swappable model access and offline updates",
        "Calls to public package registries at run time",
        "A hosted-only API",
        "Ignoring the restriction",
      ],
      answer: 0,
      explain: "Restricted environments need self-contained packaging and the ability to replace external calls with local ones.",
    },
    {
      kind: "mcq",
      q: "Which should you usually try first when a rule blocks your design?",
      options: [
        "Adapt the design to a compliant approach",
        "Escalate to the CEO",
        "Ask for a permanent exception",
        "Hide the issue",
      ],
      answer: 0,
      explain: "A compliant design is usually fastest and preserves relationships. Escalation is for rare cases.",
    },
    {
      kind: "mcq",
      q: "What most often determines the end date of an enterprise project?",
      options: [
        "The longest chain of approvals and lead times",
        "The number of lines of code",
        "The choice of programming language",
        "The size of the team",
      ],
      answer: 0,
      explain: "Lead times for access, reviews and legal can exceed coding time, so the critical path is the approval chain.",
    },
    {
      kind: "text",
      q: "What word describes an environment with no internet connection at all?",
      format: "***-******",
      accept: ["air-gapped", "air gapped", "airgapped", "air-gap", "air gap"],
      explain: "An air-gapped environment is physically isolated from external networks.",
    },
  ],
};

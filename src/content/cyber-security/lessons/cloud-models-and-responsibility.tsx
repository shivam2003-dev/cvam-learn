import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Tell IaaS, PaaS and SaaS apart and say what each one hands to the provider",
    "Describe public, private, hybrid and multi-cloud deployments",
    "Use the shared responsibility model to work out who must secure each layer",
    "Name the three duties that always stay with the customer",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: who is guarding what?",
      body: (
        <>
          <p>
            When you run servers in your own office, the answer to "who secures this?" is simple:
            you do. You lock the door, patch the machine, and set the firewall. The cloud moves
            many of those jobs to another company. That is useful, but it creates a new risk. Each
            side can assume the other side is handling something, and then nobody does.
          </p>
          <p>
            Think of renting a flat. The landlord looks after the building, the roof and the main
            entrance. You look after your own door key, who you let in, and what you leave on the
            table. If a burglar walks in because you left your door open, you can't blame the
            landlord. The cloud works the same way. The formal name for this split is the{" "}
            <strong>shared responsibility model</strong>.
          </p>
          <p>
            Most cloud security failures come from the customer's side of the line, usually a
            setting that was left open or a permission that was too wide. So the first skill is
            knowing exactly where the line sits for each service you use.
          </p>
        </>
      ),
    },
    {
      id: "service-models",
      title: "Service models: how much does the provider run?",
      body: (
        <>
          <p>
            A <strong>service model</strong> describes how much of the technology stack the
            provider manages for you. More provider management means less control and less work
            for you.
          </p>
          <ul>
            <li>
              <strong>IaaS (Infrastructure as a Service):</strong> you rent raw building blocks,
              such as virtual machines, disks and virtual networks. You choose and patch the
              operating system.
            </li>
            <li>
              <strong>PaaS (Platform as a Service):</strong> you rent a ready platform to run code
              on, such as a managed database or an app hosting service. The provider patches the
              operating system and runtime. You supply the code and settings.
            </li>
            <li>
              <strong>SaaS (Software as a Service):</strong> you use a finished application, such
              as hosted email or a document tool. You manage who has an account and what data goes
              in.
            </li>
          </ul>
          <p>
            Function-as-a-service, often called serverless, sits near PaaS. It is covered in the{" "}
            Infrastructure as Code and Serverless lesson.
          </p>
          <Callout tone="note">
            The labels are guides, not laws. Real products blend models, so always read the
            provider's own responsibility documentation for the exact service you use.
          </Callout>
        </>
      ),
    },
    {
      id: "deployment-models",
      title: "Deployment models: where does it run?",
      body: (
        <>
          <p>
            The <strong>deployment model</strong> says who the infrastructure is shared with.
          </p>
          <Table
            head={["Model", "What it means", "Security trade-off"]}
            rows={[
              ["Public cloud", "Shared provider data centres, many customers", "Cheap and fast to scale; you rely on logical isolation"],
              ["Private cloud", "Infrastructure used by one organisation", "More control; you carry more cost and more upkeep"],
              ["Hybrid cloud", "Private and public linked together", "Flexible; the link between them becomes a target"],
              ["Multi-cloud", "More than one public provider", "Avoids lock-in; every provider has its own controls to learn"],
            ]}
          />
          <p>
            Hybrid and multi-cloud setups add a hidden cost. Each environment has its own identity
            system, logging format and settings. Gaps appear at the joins, so a security team must
            watch the connections between environments as closely as the environments themselves.
          </p>
        </>
      ),
    },
    {
      id: "responsibility",
      title: "Reading the shared responsibility line",
      body: (
        <>
          <p>
            Here is a simplified map of eight layers. "Provider" means the cloud company. "You"
            means the customer. This is a teaching model, and real services vary.
          </p>
          <Table
            head={["Layer", "IaaS", "PaaS", "SaaS"]}
            rows={[
              ["1. Physical data centre", "Provider", "Provider", "Provider"],
              ["2. Network hardware and hypervisor", "Provider", "Provider", "Provider"],
              ["3. Guest operating system and patches", "You", "Provider", "Provider"],
              ["4. Runtime and middleware", "You", "Provider", "Provider"],
              ["5. Application code", "You", "You", "Provider"],
              ["6. Configuration and network rules", "You", "You", "You"],
              ["7. Data and its classification", "You", "You", "You"],
              ["8. Identities and access", "You", "You", "You"],
            ]}
          />
          <p>Count the rows marked "You" in each column. It gives a rough feel for your workload:</p>
          <Formula>your share = layers you own ÷ total layers</Formula>
          <pre>
            <code>{`IaaS: 6 ÷ 8 = 75%
PaaS: 4 ÷ 8 = 50%
SaaS: 3 ÷ 8 = 37.5%`}</code>
          </pre>
          <p>
            These figures are illustrative. In real life the layers are not equal in weight, so
            don't read them as a precise measure. The point is the pattern. Moving from IaaS to
            SaaS removes work, but never the last three rows.
          </p>
          <Callout tone="tip" title="The three duties that never move">
            Configuration, data and identities stay with you in every model. Even with SaaS, you
            decide who can log in, whether MFA is on, and who can share data outside the company.
          </Callout>
        </>
      ),
    },
    {
      id: "in-practice",
      title: "Turning the model into a working habit",
      body: (
        <>
          <p>
            Write the split down for every service your team uses. A short register stops the
            "I thought they handled that" problem. A simple format works well:
          </p>
          <pre>
            <code>{`service: managed-database (PaaS)
provider_owns:
  - os patching
  - database engine patching
  - physical security
we_own:
  - who can connect (network rules)
  - user accounts and password policy
  - encryption key choice
  - backups we need beyond the default
  - data classification
review: every 6 months, or when the provider changes the service`}</code>
          </pre>
          <p>
            Then check that your side is actually being done. Three habits cover most of it:
          </p>
          <ul>
            <li>
              <strong>Turn on audit logs.</strong> Each major provider records who did what in
              your account, for example AWS CloudTrail, the Azure Activity Log and Google Cloud
              Audit Logs. Without them you cannot investigate anything later.
            </li>
            <li>
              <strong>Check settings continuously.</strong> Cloud settings change often. Use the
              provider's posture tools or an automated scanner to catch a setting that drifts into
              an unsafe state.
            </li>
            <li>
              <strong>Protect identities first.</strong> Use MFA on every human account and give
              each person or service only the access it needs.
            </li>
          </ul>
          <Callout tone="warn">
            Only review or test cloud accounts you own or have written permission to assess.
            Providers publish their own rules for security testing, so read them before you run
            any scanner against a live environment.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Security in the cloud is shared: the provider secures the cloud itself, and you secure what you put in it.",
    "IaaS gives you the most control and the most work. SaaS gives the least of both.",
    "Configuration, data and identities remain your job in every service model.",
    "Hybrid and multi-cloud setups add risk at the joins between environments.",
    "Write down who owns each layer for every service, then check your side regularly.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service model leaves the customer the most security work?",
      options: ["IaaS", "PaaS", "SaaS", "They are all equal"],
      answer: 0,
      explain: "With IaaS you manage the operating system, runtime, code, configuration, data and access.",
    },
    {
      kind: "mcq",
      q: "A company uses a hosted email service (SaaS). Who is responsible for turning on MFA for its staff accounts?",
      options: [
        "The provider, always",
        "Nobody, it is automatic",
        "The customer, because identity and access stays with them",
        "The staff's internet provider",
      ],
      answer: 2,
      explain: "Identities and access stay with the customer in every service model, even SaaS.",
    },
    {
      kind: "mcq",
      q: "Which deployment model joins a private environment to a public cloud?",
      options: ["Community", "Single-tenant", "Multi-cloud", "Hybrid"],
      answer: 3,
      explain: "Hybrid cloud links private and public environments, so the link itself needs protection.",
    },
    {
      kind: "text",
      q: "Using the table in this lesson, how many of the 8 layers does the customer own under PaaS?",
      format: "*",
      accept: ["4", "four"],
      explain: "Application code, configuration, data and identities: 4 layers, or 50%.",
    },
    {
      kind: "text",
      q: "Which three-letter acronym means you rent virtual machines, disks and networks and patch the operating system yourself?",
      format: "****",
      accept: ["iaas"],
      explain: "IaaS, Infrastructure as a Service.",
    },
  ],
};

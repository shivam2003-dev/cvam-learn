import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Graph, Layers, Quadrant } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Easy",
  objectives: [
    "Explain the last-mile problem that created the forward deployed engineer role",
    "Define an FDE by what they own and deliver, not by a job title",
    "Place the FDE among software engineers, solutions engineers, consultants and support engineers",
    "Describe the loop of work an FDE runs inside a customer engagement",
    "List the technical and human skills the rest of this course builds",
  ],
  tasks: [
    {
      id: "last-mile",
      title: "The last-mile problem",
      body: (
        <>
          <p>
            Imagine a company that has built an excellent product: a data platform, a fraud model, a
            language-model assistant. It works in demos. It works for the first friendly customers.
            Then a large hospital group, bank or logistics firm signs a contract, and the product
            meets reality.
          </p>
          <p>
            The hospital stores records in three systems from three different decades. Its security
            team will not allow outbound internet access. The data the model needs is spread across
            spreadsheets that one clerk updates by hand. The people who would use the product have a
            workflow that the product&apos;s designers never saw. Nothing is broken, exactly. The
            product simply does not <em>fit</em> yet.
          </p>

          <Figure caption="The product team builds for the general case. The customer lives in the specific one. The gap between them is the last mile.">
            <Graph
              label="A product team on the left, a customer environment on the right, and a gap between them labelled the last mile"
              cellW={215}
              cellH={120}
              nodes={[
                { id: "product", label: "General product", sub: "Built for many customers", col: 0, row: 0, tone: "lime" },
                { id: "gap", label: "The last mile", sub: "Integration, data, workflow, trust, security", col: 1.5, row: 0, tone: "amber", shape: "pill", w: 190 },
                { id: "customer", label: "Customer reality", sub: "Legacy systems, rules, people, habits", col: 3, row: 0, tone: "sky" },
              ]}
              edges={[
                { from: "product", to: "gap", dashed: true },
                { from: "gap", to: "customer", dashed: true },
              ]}
            />
          </Figure>

          <p>
            Closing that gap is real engineering work: writing connectors, cleaning data, adjusting
            workflows, wiring in single sign-on, tuning prompts to a domain&apos;s vocabulary,
            proving the result is correct enough to trust. It is too specific for the core product
            team, who must serve everyone, and too technical for a consultant who produces slides.
          </p>
          <p>
            Companies have tried three ways to handle it. They throw the work over the wall to the
            customer&apos;s IT department (slow, and the product gets blamed when it fails). They
            hire a services firm (expensive, and what is learned stays outside the company). Or they
            put their own engineers next to the customer. The third option is the{" "}
            <strong>forward deployed engineer</strong>.
          </p>

          <Callout tone="note" title="Where the idea came from">
            Palantir popularised the model in the 2000s and 2010s by embedding engineers with
            government and enterprise customers, and the title spread widely once AI products ran
            into the same fit problem. Names vary by company: applied AI engineer, solutions
            architect, customer engineer, deployment engineer. What matters is the work, which is the
            same under every name.
          </Callout>
        </>
      ),
    },
    {
      id: "definition",
      title: "A working definition",
      body: (
        <>
          <p>A useful definition has three parts. A forward deployed engineer:</p>
          <ol>
            <li>
              <strong>Is an engineer.</strong> They write production code, review it, test it and
              deploy it. If the role stops writing code, it has drifted into something else.
            </li>
            <li>
              <strong>Works close to the customer.</strong> They sit in the customer&apos;s calls,
              read the customer&apos;s data, and often work inside the customer&apos;s environment.
              &ldquo;Forward&rdquo; means toward the front line, where the work is used.
            </li>
            <li>
              <strong>Owns an outcome.</strong> Their success is measured by whether the customer
              gets value, not by tickets closed or lines written.
            </li>
          </ol>
          <p>
            That third part is what separates the role from many neighbours. A software engineer is
            usually measured on what ships in the product. An FDE is measured on what the customer
            can do afterwards that they could not before.
          </p>

          <Figure caption="The FDE loop. Each pass through it turns a customer's problem into a working system, and turns what was learned into product.">
            <Flow
              numbered
              steps={[
                { title: "Discover", note: "Find the real problem and the people who have it", tone: "sky" },
                { title: "Scope", note: "Choose a first slice that proves value in weeks", tone: "sky" },
                { title: "Build", note: "Code, integrate and configure on real data", tone: "lime" },
                { title: "Deploy", note: "Run it in the customer's environment, securely", tone: "lime" },
                { title: "Prove", note: "Measure the result in the customer's terms", tone: "amber" },
                { title: "Feed back", note: "Turn repeated custom work into product", tone: "amber" },
              ]}
            />
          </Figure>

          <p>
            Notice the last step. A good FDE team does not accumulate a pile of one-off projects. The
            pattern that appears in the third customer becomes a product feature, so the fourth
            customer needs less custom work. This is how the role pays for itself, and it is covered
            in depth in the chapter on the field feedback loop.
          </p>
        </>
      ),
    },
    {
      id: "neighbours",
      title: "How the role differs from its neighbours",
      body: (
        <>
          <p>
            Job titles blur, so compare the roles on two questions that actually differ: how close
            is the person to the customer, and how much production code do they own?
          </p>

          <Figure caption="An approximate map. Companies draw these lines in different places, but the FDE is the one that combines high customer proximity with real code ownership.">
            <Quadrant
              label="A chart of roles by customer proximity and code ownership"
              xLabel="Customer proximity"
              yLabel="Production code ownership"
              corners={["Builds for everyone", "Forward deployed", "Advises from outside", "Advises and demos"]}
              items={[
                { label: "Product engineer", x: 0.12, y: 0.9, tone: "plain" },
                { label: "Data scientist", x: 0.3, y: 0.62, tone: "plain" },
                { label: "Support engineer", x: 0.58, y: 0.28, tone: "sky" },
                { label: "Solutions engineer", x: 0.78, y: 0.34, tone: "sky" },
                { label: "Consultant", x: 0.86, y: 0.1, tone: "amber" },
                { label: "FDE", x: 0.9, y: 0.82, tone: "lime" },
              ]}
            />
          </Figure>

          <Table
            head={["Role", "Main job", "Measured on", "Code they keep"]}
            rows={[
              ["Product engineer", "Build features for every customer", "Quality and adoption of the product", "The core product"],
              ["Solutions engineer", "Show the product fits during the sale", "Deals won", "Demos and proofs of concept, often thrown away"],
              ["Support engineer", "Fix problems customers report", "Resolution time and satisfaction", "Small fixes and scripts"],
              ["Consultant", "Advise on strategy and process", "Client satisfaction with the advice", "Usually none"],
              ["Forward deployed engineer", "Make the product work in a specific customer", "Customer outcomes in production", "Real integration and application code, often reused later"],
            ]}
          />

          <p>
            A few boundary cases come up constantly. A solutions engineer who stays after the
            contract is signed and starts building production integrations is acting as an FDE. An
            FDE who spends all week writing slides has become a consultant. A product engineer who
            joins a customer for a month to understand a hard problem is on a short forward
            deployment. The role is a mode of working, and engineers move in and out of it.
          </p>
        </>
      ),
    },
    {
      id: "work",
      title: "What FDEs actually build",
      body: (
        <>
          <p>
            Most FDE work falls into a handful of categories. Understanding them helps you see why
            the skill set is so broad.
          </p>

          <Figure caption="A typical deployment. The FDE builds the layer in the middle, which connects customer systems to the product and to the people who use it.">
            <Graph
              label="Customer systems connect through an FDE-built integration layer to the product and to end users"
              cellW={205}
              cellH={118}
              nodes={[
                { id: "erp", label: "ERP", sub: "Orders, finance", col: 0, row: 0, tone: "sky", shape: "db" },
                { id: "docs", label: "Document store", sub: "PDFs, contracts", col: 0, row: 1, tone: "sky", shape: "db" },
                { id: "crm", label: "CRM", sub: "Accounts, tickets", col: 0, row: 2, tone: "sky", shape: "db" },
                { id: "layer", label: "FDE-built layer", sub: "Connectors, data prep, auth, workflow glue", col: 1.5, row: 1, tone: "lime", w: 190 },
                { id: "product", label: "The product", sub: "Models, platform, agents", col: 3, row: 0.4, tone: "plain" },
                { id: "users", label: "End users", sub: "Operators, analysts", col: 3, row: 1.6, tone: "amber", shape: "pill" },
              ]}
              groups={[
                { label: "Customer environment", c1: 0, r1: 0, c2: 0, r2: 2, tone: "sky" },
              ]}
              edges={[
                { from: "erp", to: "layer", label: "API" },
                { from: "docs", to: "layer", label: "files" },
                { from: "crm", to: "layer", label: "events" },
                { from: "layer", to: "product" },
                { from: "layer", to: "users", label: "UI + alerts" },
                { from: "product", to: "users", dashed: true },
              ]}
            />
          </Figure>

          <p>Across engagements, the same kinds of work keep appearing:</p>
          <ul>
            <li>
              <strong>Integrations.</strong> Connectors to systems of record, authentication bridges,
              data pipelines that turn awkward inputs into the shape the product expects.
            </li>
            <li>
              <strong>Domain adaptation.</strong> Prompts, retrieval, rules and evaluations tuned to
              the customer&apos;s vocabulary and edge cases.
            </li>
            <li>
              <strong>Workflow applications.</strong> A review queue, an approval screen, an alert
              that lands in the tool people already use.
            </li>
            <li>
              <strong>Deployment and operations.</strong> Getting the system running inside the
              customer&apos;s cloud or data centre, with monitoring and a runbook.
            </li>
            <li>
              <strong>Proof.</strong> Measurements that show the system works, written in business
              terms.
            </li>
          </ul>
          <p>
            One engagement might need all five in a single month. This is why FDEs value breadth,
            and why a later chapter in this course gives you system-design practice rather than only
            algorithm drills.
          </p>
        </>
      ),
    },
    {
      id: "skills",
      title: "The skill stack",
      body: (
        <>
          <p>
            It helps to picture FDE skills as layers. The bottom layer is what every software
            engineer needs. Each layer above it is what makes someone effective in front of a
            customer.
          </p>

          <Figure caption="The skill stack, from the engineering base to the human skills at the top. Strength in the upper layers separates a good FDE from a good engineer.">
            <Layers
              layers={[
                { title: "Judgment and ownership", note: "Decide what to build, what to cut, and when to say no. Take responsibility for the outcome.", tone: "amber" },
                { title: "Communication", note: "Run discovery calls, write clearly, explain risk to executives and detail to engineers.", tone: "amber" },
                { title: "Domain and business sense", note: "Understand the customer's workflow, constraints and how they measure value.", tone: "sky" },
                { title: "AI and data systems", note: "LLMs, retrieval, agents, evaluation, pipelines and data quality.", tone: "lime" },
                { title: "Integration and platform", note: "APIs, authentication, cloud, containers, networking and security.", tone: "lime" },
                { title: "Software engineering core", note: "A language or two, data structures, version control, testing, debugging.", tone: "plain" },
              ]}
            />
          </Figure>

          <p>
            Nobody arrives strong in every layer. Most people come in strong at the bottom and learn
            upward, which is why this course is arranged the way it is: first the working method
            (discovery, POC, pilot, handoff), then the enterprise realities, then the AI
            architecture, then interview preparation.
          </p>

          <Callout tone="tip" title="Range with a spike">
            The strongest FDEs have one area of real depth, such as data engineering or machine
            learning, and enough breadth in the rest to be useful on day one. Customers trust the
            spike. Teams value the breadth.
          </Callout>
        </>
      ),
    },
    {
      id: "success",
      title: "What success and failure look like",
      body: (
        <>
          <p>
            Because the role is outcome-based, it is worth being precise about the outcomes.
            Successful engagements tend to share a pattern:
          </p>
          <ul>
            <li>The customer&apos;s own users adopt the system without being chased.</li>
            <li>A metric the customer already cared about moves, and the customer says so.</li>
            <li>The customer&apos;s team can operate the system after the FDE leaves.</li>
            <li>The product team learns something and ships a change because of it.</li>
          </ul>
          <p>Failures are just as recognisable, and most are avoidable:</p>
          <Table
            head={["Failure mode", "How it looks", "Usual cause"]}
            rows={[
              ["Demo that never ships", "Impressive proof of concept, no production use", "Skipped security, data access and last-mile work"],
              ["Hero dependency", "Everything works but only the FDE can run it", "No runbook, no handover, no training"],
              ["Scope sprawl", "Months pass; the original problem is still unsolved", "Saying yes to every request without a plan"],
              ["Solution looking for a problem", "A clever system nobody asked for", "Discovery was skipped or done with one stakeholder"],
              ["Fork hell", "A custom copy of the product per customer", "Never feeding changes back into the product"],
            ]}
          />
          <p>
            Each row corresponds to a chapter later in the course. The rest of the course is, in
            effect, a set of tools for avoiding these five failures.
          </p>

          <Exercise
            title="Classify the role"
            task={
              <p>
                A company calls someone a &ldquo;solutions engineer&rdquo;. In practice they spend
                half their time in pre-sales demos and half their time, after contracts are signed,
                building and running a data connector in the customer&apos;s cloud account, which
                the customer now depends on. Is this an FDE role? Argue using the three-part
                definition.
              </p>
            }
          >
            <p>
              In the second half of their time, yes. They write production code (engineer), work
              inside the customer&apos;s environment (close to the customer), and the customer now
              depends on the result (owns an outcome). The pre-sales half is a solutions engineering
              job. The title is less important than the split: the more the second half grows, the
              more the person needs FDE habits such as scoping, operations and handover, even though
              nobody changed their title.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The role exists because products rarely fit a specific customer on day one: the last mile needs real engineering.",
    "An FDE is an engineer who works close to the customer and owns the outcome.",
    "FDEs differ from solutions engineers, consultants and support engineers by combining customer proximity with code ownership.",
    "The work loop is discover, scope, build, deploy, prove and feed back to product.",
    "Skills stack from an engineering core up to communication, judgment and ownership.",
    "Most failures (demo that never ships, hero dependency, scope sprawl, no discovery, fork hell) are avoidable with method.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the last-mile problem?",
      options: [
        "The gap between a general product and what a specific customer's environment needs to get value",
        "Slow network speed between data centres",
        "Delivering physical goods to homes",
        "A bug in the product's installer",
      ],
      answer: 0,
      explain: "Products are built for the general case. Integration, data, workflow, trust and security work in the specific customer is the last mile.",
    },
    {
      kind: "mcq",
      q: "Which pair best captures what separates an FDE from a consultant?",
      options: [
        "FDEs own and write production code; consultants usually advise without keeping code",
        "Consultants write more code",
        "FDEs never speak to customers",
        "There is no difference",
      ],
      answer: 0,
      explain: "Both are close to the customer. The FDE also owns real, production code and the outcome it produces.",
    },
    {
      kind: "mcq",
      q: "Why does the FDE loop end with feeding back to the product?",
      options: [
        "So repeated custom work becomes a product feature and later customers need less custom effort",
        "So the FDE can avoid writing documentation",
        "Because customers demand it",
        "To increase the number of tickets",
      ],
      answer: 0,
      explain: "Without feedback the company accumulates one-off projects. Feeding patterns back is how the role scales.",
    },
    {
      kind: "mcq",
      q: "An engagement produced an impressive demo, but nothing runs in production six months later. What most likely went wrong?",
      options: [
        "Security, data access and last-mile integration were left until too late",
        "The demo was too short",
        "The model was too small",
        "The customer chose the wrong colour theme",
      ],
      answer: 0,
      explain: "A demo that never ships usually skipped the unglamorous work that production needs.",
    },
    {
      kind: "text",
      q: "In the three-part definition, an FDE is an engineer, works close to the customer, and owns what?",
      format: "*******",
      accept: ["an outcome", "outcome", "the outcome", "outcomes"],
      explain: "Ownership of the customer outcome is what makes the role different from many neighbouring jobs.",
    },
  ],
};

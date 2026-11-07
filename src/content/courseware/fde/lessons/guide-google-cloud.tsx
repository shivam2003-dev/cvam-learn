import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Describe what a cloud-provider generative AI field engineering role is likely to involve",
    "Map generic AI architecture components to a cloud provider's service categories",
    "Prepare to design, cost and secure AI solutions on a major cloud",
    "Practise customer conversations about adoption, governance and total cost",
    "Verify current services, names and process from official sources",
  ],
  tasks: [
    {
      id: "context",
      title: "The role in context",
      body: (
        <>
          <Callout tone="warn" title="Verify names and process">
            Cloud product names, features and the hiring process change often. Use this lesson for the
            structure of the work and treat any product name as an example to confirm in the
            provider&apos;s current documentation and job descriptions. Nothing here describes a
            private interview.
          </Callout>
          <p>
            Cloud providers employ engineers who help large customers build generative AI solutions
            on the provider&apos;s platform: workshops, proofs of concept, reference architectures,
            and guidance on security, governance, cost and scale. The role blends solution architecture
            with hands-on building, and requires the same discovery, scoping and communication skills
            as any FDE role, plus deep familiarity with one cloud&apos;s services.
          </p>
        </>
      ),
    },
    {
      id: "map",
      title: "Think in components, then name the services",
      body: (
        <>
          <p>
            A reliable technique: design with generic components first, then map each to the
            provider&apos;s offering. This keeps you from reciting a product list and makes your
            design portable.
          </p>
          <DiagramReference lesson="guide-google-cloud" panel={1} />
          <Table
            head={["Generic component", "What to be able to explain on any cloud"]}
            rows={[
              ["Model access", "Managed endpoints for foundation models; choosing models; quotas and regional availability; private connectivity; data-use terms; tuning options"],
              ["Retrieval", "Managed search or vector options; when a general database with vector support is enough; evaluation of retrieval"],
              ["Data platform", "How enterprise data reaches the application: warehouses, lakes, change feeds; governance and lineage"],
              ["Hosting and orchestration", "Serverless containers, functions, workflow services, queues; scaling and cold starts"],
              ["Identity and security", "Service accounts, least privilege, private networking, customer-managed keys, audit logging, data residency"],
              ["Cost and operations", "Token costs, provisioned versus on-demand capacity, caching, budgets and alerts, monitoring quality"],
            ]}
          />
        </>
      ),
    },
    {
      id: "prep",
      title: "Preparation plan",
      body: (
        <>
          <DiagramReference lesson="guide-google-cloud" panel={2} />
          <ul>
            <li>Build at least one end-to-end solution on the target cloud, and be ready to walk through every service choice and its alternative.</li>
            <li>Learn the identity model deeply. Most real customer blockers are permissions and networking, not models.</li>
            <li>Practise estimating cost: tokens in and out, requests per day, storage, and the break-even between on-demand and reserved capacity.</li>
            <li>Know the provider&apos;s governance and responsible-AI documentation well enough to answer customer security reviews.</li>
          </ul>
        </>
      ),
    },
    {
      id: "practice",
      title: "Practice customer scenario",
      body: (
        <>
          <Exercise
            title="Architecture conversation"
            task={
              <p>
                A European retailer wants a product-discovery assistant on its website for 2 million
                monthly visitors. Catalogue data is in a warehouse, updated nightly. They worry about
                cost, data residency and brand safety. Outline your approach in ten minutes.
              </p>
            }
          >
            <p>
              <strong>Clarify:</strong> traffic and peak load; expected conversations per visitor and
              length; languages; what &ldquo;discovery&rdquo; means (search, comparison,
              recommendations); success metrics (conversion, engagement); brand rules; regulations.
            </p>
            <p>
              <strong>Design:</strong> catalogue to a search or vector index refreshed after the
              nightly load; an application tier with streaming responses; model calls through managed
              endpoints in an EU region; retrieval of product facts with grounding and links, so the
              assistant only recommends items in stock; a classifier or rules to route simple queries
              to a smaller model and block out-of-scope topics; caching of common queries and stable
              prompt prefixes.
            </p>
            <p>
              <strong>Cost:</strong> estimate per conversation (input and output tokens, retrieval
              calls), multiply by projected volume, and show the effect of routing and caching.
              Provide budget alerts and a per-session cost cap.
            </p>
            <p>
              <strong>Risk and governance:</strong> EU residency for data and processing; content
              filters and brand-tone tests; red-team for jailbreaks; logging with retention and
              privacy rules; a human review process for flagged conversations; an A/B test against the
              current search experience before full launch.
            </p>
          </Exercise>
          <Callout tone="tip" title="Show commercial awareness">
            Field roles are judged on helping customers succeed on the platform, which includes
            candid advice about cost and fit. Saying &ldquo;for this volume a smaller model with
            caching is enough&rdquo; builds more trust than recommending the biggest option.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Cloud GenAI field roles blend solution architecture with hands-on building, security, governance and cost guidance.",
    "Design with generic components first, then map to the provider's named services.",
    "Identity, networking, data residency and cost are the usual real-world blockers; know them deeply.",
    "Build and secure at least one end-to-end solution on the target cloud and estimate its cost.",
    "Verify current service names and the interview process from official sources.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why design with generic components before naming cloud products?",
      options: [
        "It makes your design portable and avoids reciting a product list",
        "Products never matter",
        "It is required by the interviewer",
        "It reduces diagrams",
      ],
      answer: 0,
      explain: "Clear component thinking comes first; product mapping is a second step.",
    },
    {
      kind: "mcq",
      q: "A customer worries about cost. Which recommendation shows commercial awareness?",
      options: [
        "Route simple queries to a smaller model, cache common requests and set budgets",
        "Always use the largest model",
        "Ignore cost until launch",
        "Reduce monitoring",
      ],
      answer: 0,
      explain: "Right-sizing and caching reduce cost while protecting quality.",
    },
    {
      kind: "mcq",
      q: "What most often blocks real customer deployments on a cloud?",
      options: [
        "Permissions, networking and data governance",
        "The model's name",
        "The font in the console",
        "The colour of the dashboard",
      ],
      answer: 0,
      explain: "Identity, network and governance issues dominate enterprise rollouts.",
    },
    {
      kind: "text",
      q: "Requests per month: 2 million visitors with 3 conversations each. How many conversations is that? (millions)",
      format: "*",
      accept: ["6", "6 million", "6,000,000", "6000000"],
      explain: "2 million x 3 = 6 million conversations per month.",
    },
  ],
};

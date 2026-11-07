import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 24,
  difficulty: "Medium",
  objectives: [
    "Explain what API management provides beyond a load balancer",
    "Describe Apigee components: proxies, policies, products, apps, environments, analytics",
    "Choose between Apigee, API Gateway and Cloud Endpoints",
    "Apply API security, quotas, versioning and monetisation best practice",
    "Advise development and operations teams on deployment and testing frameworks",
  ],
  tasks: [
    {
      id: "why",
      title: "Why API management",
      body: (
        <>
          <p>
            APIs are products. An API management layer sits between consumers and backends to apply
            security, traffic management, transformation, analytics and a developer experience
            consistently, so backend teams do not each rebuild these features.
          </p>
          <Figure caption="Apigee as a façade. Consumers use stable, secured API products; the proxy layer applies policies and routes to diverse backends.">
            <Graph
              label="API consumers call Apigee proxies which apply policies and route to Cloud Run, GKE and on-premises backends"
              cellW={190}
              cellH={96}
              nodeW={160}
              nodes={[
                { id: "dev", label: "Developers / apps", sub: "partners, mobile, web", col: 0, row: 0.5, tone: "sky" },
                { id: "portal", label: "Developer portal", col: 1, row: 0, tone: "plain" },
                { id: "apigee", label: "Apigee", sub: "proxies + policies", col: 1, row: 1, tone: "lime" },
                { id: "b1", label: "Cloud Run / GKE", col: 2, row: 0.5, tone: "amber" },
                { id: "b2", label: "On-premises / legacy", col: 2, row: 1.5, tone: "amber" },
              ]}
              edges={[
                { from: "dev", to: "portal", dashed: true },
                { from: "dev", to: "apigee" },
                { from: "apigee", to: "b1" },
                { from: "apigee", to: "b2" },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "apigee",
      title: "Apigee building blocks",
      body: (
        <>
          <Table
            head={["Concept", "Meaning"]}
            rows={[
              ["API proxy", "The façade: ProxyEndpoint (consumer side) and TargetEndpoint (backend side) with a flow of policies"],
              ["Policies", "Reusable steps: OAuth/API key verification, JWT, spike arrest, quota, response cache, transformations (XML↔JSON), threat protection, message logging, custom logic"],
              ["API product", "Bundle of proxies/resources with quotas and access rules offered to developers"],
              ["Developer app and keys", "Consumers register apps to receive credentials for products"],
              ["Environments and groups", "dev, test, prod isolation; deploy revisions of proxies to environments"],
              ["Analytics", "Traffic, latency, errors, developer engagement; custom reports; monetisation reporting"],
              ["Deployment options", "Apigee (fully managed, in your VPC via peering or PSC), Apigee hybrid (runtime on your Kubernetes), with Cloud Armor/WAF integration"],
            ]}
          />
          <ul>
            <li><strong>Security:</strong> OAuth 2.0 and OIDC, mutual TLS to backends, API key validation, JWT verification, threat protection (JSON/XML), IP allow lists, Cloud Armor and Advanced API Security (abuse detection).</li>
            <li><strong>Traffic:</strong> Spike Arrest smooths bursts (rate per second); Quota enforces per-app limits over a period; caching reduces backend load; target servers and load balancing.</li>
            <li><strong>Lifecycle:</strong> version via base paths or headers, deprecate with notice, publish OpenAPI specs to the portal.</li>
          </ul>
        </>
      ),
    },
    {
      id: "choose",
      title: "Choosing a gateway and advising teams",
      body: (
        <>
          <Table
            head={["Option", "Choose when"]}
            rows={[
              ["Apigee", "Enterprise API programs: external partners, monetisation, rich policies, analytics, developer portal, hybrid/multicloud"],
              ["API Gateway", "Simple serverless gateway in front of Cloud Run, functions or App Engine with OpenAPI, API keys/JWT"],
              ["Cloud Endpoints", "Lightweight OpenAPI/gRPC management for services using ESP/ESPv2 proxy"],
              ["Load balancer / Cloud Run IAM only", "Internal service-to-service calls without product management needs"],
              ["Service mesh (Cloud Service Mesh)", "East-west traffic policy, mTLS and observability between microservices"],
            ]}
          />
          <Callout tone="note" title="Advising development and operations teams">
            Section 5.1 also covers application and infrastructure deployment, testing frameworks
            (unit, integration, load), migration and data management tooling, and Gemini Cloud Assist.
            Advise teams to automate deployment, test at several levels (including load tests of
            APIs against quotas), use migration tools instead of hand-built scripts, and use Gemini
            Cloud Assist to speed up design, troubleshooting and code and infrastructure generation
            while reviewing the output.
          </Callout>
          <Exercise
            title="Which gateway?"
            task={<p>A logistics company exposes shipment APIs to 300 partners. It needs per-partner quotas, OAuth, a developer portal, usage analytics and the ability to bill for premium tiers. The backends run on GKE and in an on-premises data center. Which service?</p>}
          >
            <p>
              <strong>Apigee</strong>, with API products and quotas per partner app, OAuth policies,
              the developer portal, analytics and monetisation features; it reaches both GKE and
              on-premises backends over hybrid connectivity. API Gateway lacks the portal,
              monetisation and rich policy set.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "API management adds security, traffic control, transformation, analytics and developer experience in front of backends.",
    "Apigee: proxies, policies, products, apps, environments, analytics, portal and monetisation; managed or hybrid.",
    "Use API Gateway or Cloud Endpoints for lighter needs; a mesh for east-west traffic.",
    "Spike Arrest smooths bursts; Quota limits consumption; version and deprecate APIs deliberately.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which Apigee policy enforces a per-app limit over a period?",
      options: ["Quota", "Spike Arrest", "Response Cache", "Assign Message"],
      answer: 0,
      explain: "Quota counts requests per app/product over time; Spike Arrest smooths short bursts.",
    },
    {
      kind: "mcq",
      q: "Which service fits an enterprise partner API program with monetisation?",
      options: ["Apigee", "Cloud DNS", "Cloud NAT", "Pub/Sub"],
      answer: 0,
      explain: "Apigee provides full API lifecycle management including monetisation.",
    },
    {
      kind: "mcq",
      q: "A lightweight gateway for Cloud Run using an OpenAPI spec and API keys is:",
      options: ["API Gateway", "Apigee hybrid", "Cloud Deploy", "Dataflow"],
      answer: 0,
      explain: "API Gateway is a serverless gateway for simple use cases.",
    },
    {
      kind: "mcq",
      q: "Where do partners self-register and discover APIs in Apigee?",
      options: ["Developer portal", "Cloud Console only", "Cloud Build", "Artifact Registry"],
      answer: 0,
      explain: "The developer portal publishes API products and documentation.",
    },
    {
      kind: "text",
      q: "Which Apigee deployment option runs the runtime on your own Kubernetes clusters?",
      format: "****** ******",
      accept: ["apigee hybrid", "hybrid"],
      explain: "Apigee hybrid runs the runtime plane in your environment.",
    },
  ],
};

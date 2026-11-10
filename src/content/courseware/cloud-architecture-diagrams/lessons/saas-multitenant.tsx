import { ACCOUNT } from "../kit/builder";
import { makeLesson } from "../kit/makeLesson";

export const lesson = makeLesson({
  minutes: 27,
  difficulty: "Hard",
  context: "Any B2B software product: CRM, analytics, HR, project tools. One running system serves many customer companies (tenants) that must never see each other's data.",
  objectives: [
    "Contrast pooled, bridge and silo tenancy models",
    "Carry tenant identity from sign-in to every data access",
    "Design a control plane for onboarding, billing and per-tenant metrics",
    "Decide where premium tenants get dedicated resources",
  ],
  problem: [
    "A software company has 800 customers today and wants 8,000. Running a separate stack per customer is safe but costs a fortune and makes every release 800 deployments. Sharing everything is cheap but one bug could show Customer A's data to Customer B, and one noisy customer could slow everyone.",
    "Multi-tenant architecture shares what is safe to share, isolates what is not, and carries the tenant's identity through every layer so isolation does not depend on each developer remembering.",
  ],
  diagramTitle: "Multi-tenant SaaS with pooled and dedicated data",
  arch: {
    width: 960,
    height: 565,
    groups: [
      { id: "acct", kind: "region", x: 130, y: 20, w: 810, h: 375, label: ACCOUNT, step: 1 },
      { id: "scale", kind: "scaling", x: 380, y: 85, w: 150, h: 220, label: "Shared application tier", step: 3 },
      { id: "cp", kind: "private", x: 380, y: 405, w: 560, h: 135, label: "Control plane", sub: "onboarding, billing, metrics", step: 5 },
    ],
    nodes: [
      { id: "ua", svc: "users", x: 55, y: 110, step: 1, label: "Tenant A users" },
      { id: "ub", svc: "users", x: 55, y: 310, step: 1, label: "Tenant B users" },
      { id: "auth", svc: "auth", x: 205, y: 210, step: 2, label: "Tenant-aware sign-in", sub: "tenant ID in token" },
      { id: "api", svc: "apigw", x: 330, y: 210, step: 2 },
      { id: "app", svc: "container", x: 455, y: 210, step: 3, label: "Application", sub: "tenant context" },
      { id: "pool", svc: "db", x: 660, y: 110, step: 4, label: "Pooled database", sub: "row-level isolation" },
      { id: "silo", svc: "db", x: 660, y: 290, step: 4, label: "Dedicated database", sub: "premium tenants" },
      { id: "kms", svc: "kms", x: 850, y: 110, step: 4, label: "Per-tenant keys" },
      { id: "flow", svc: "workflow", x: 460, y: 480, step: 5, label: "Tenant onboarding" },
      { id: "cat", svc: "nosql", x: 640, y: 480, step: 5, label: "Tenant catalogue" },
      { id: "met", svc: "monitor", x: 820, y: 480, step: 5, label: "Per-tenant metrics and billing" },
    ],
    edges: [
      { from: "ua", to: "auth", step: 2, num: 1, via: [[55, 210]] },
      { from: "ub", to: "auth", step: 2, via: [[55, 210]] },
      { from: "auth", to: "api", step: 2, num: 2 },
      { from: "api", to: "app", step: 3, num: 3, label: "JWT" },
      { from: "app", to: "pool", step: 4, num: 4, via: [[660, 210]] },
      { from: "app", to: "silo", step: 4, via: [[660, 210]], dashed: true },
      { from: "kms", to: "pool", step: 4, dashed: true, label: "encrypts" },
      { from: "flow", to: "cat", step: 5 },
      { from: "cat", to: "met", step: 5, dashed: true },
    ],
    steps: [
      {
        title: "Many tenants, one platform",
        body: "Each tenant is a customer organisation with its own users, data and settings. The platform serves them all, so every design decision starts with 'how do we keep tenants apart?'",
        points: ["Define the tenant: usually a company, with many users beneath it.", "Decide your isolation tiers early; retrofitting tenancy is one of the hardest migrations."],
        per: {
          aws: "AWS: many SaaS teams use one account per environment and add accounts for silo tenants under AWS Organizations.",
          azure: "Azure: one subscription per environment, with extra subscriptions or resource groups for silo tenants.",
          gcp: "Google Cloud: one project per environment, with extra projects for silo tenants under a folder.",
          oci: "OCI: one compartment per environment, with child compartments for silo tenants.",
        },
      },
      {
        title: "Sign in with tenant identity",
        body: "Authentication returns a token that carries the tenant ID and the user's role. The gateway validates it, so every request arrives with a trusted tenant context.",
        points: ["Take the tenant ID from the verified token, never from a query parameter or request body.", "Support enterprise single sign-on (SAML, OIDC) per tenant for larger customers."],
        per: {
          aws: "AWS: Cognito user pools with a pool or group per tenant, or a custom claim; API Gateway authorisers validate the token.",
          azure: "Azure: Entra External ID with organisation identifiers in claims; API Management validates the JWT.",
          gcp: "Google Cloud: Identity Platform multi-tenancy gives each tenant its own user directory and IdP configuration.",
          oci: "OCI: IAM identity domains with a domain or app role per tenant, and API Gateway token validation.",
        },
      },
      {
        title: "Share the application tier",
        body: "One fleet of stateless services handles all tenants, which keeps cost low and releases simple. Tenant context flows through every call as a first-class value.",
        points: ["Put tenant context in a middleware layer so business code cannot forget it.", "Apply per-tenant rate limits and quotas so one customer cannot starve the rest (the noisy-neighbour problem)."],
        per: {
          aws: "AWS: ECS or EKS with an ALB, usage plans or WAF rate rules per tenant.",
          azure: "Azure: Container Apps or AKS with API Management rate-limit-by-key per tenant.",
          gcp: "Google Cloud: Cloud Run or GKE with Apigee or API Gateway quotas per tenant.",
          oci: "OCI: OKE or Container Instances with API Gateway usage plans per tenant.",
        },
      },
      {
        title: "Choose the data isolation model",
        body: "Pooled: all tenants share tables, separated by a tenant ID column and row-level security. Bridge: shared server, separate schema or database per tenant. Silo: dedicated database or stack per tenant.",
        points: ["Pooled is cheapest and scales to thousands of tenants but relies on perfect query filtering.", "Silo gives strongest isolation, custom retention and per-tenant keys for regulated or large customers.", "Use row-level security in the database as a second lock behind application code."],
        per: {
          aws: "AWS: Aurora PostgreSQL with row-level security (pool); a separate cluster or account per silo tenant; KMS key per tenant.",
          azure: "Azure: Azure SQL elastic pools or PostgreSQL row-level security (pool); a dedicated database per silo tenant; Key Vault key per tenant.",
          gcp: "Google Cloud: Cloud SQL or Spanner with row-level patterns (pool); a dedicated instance per silo tenant; Cloud KMS key per tenant.",
          oci: "OCI: Autonomous Database with Virtual Private Database (pool) or a pluggable database per tenant (silo); Vault key per tenant.",
        },
      },
      {
        title: "Run a control plane",
        body: "A separate set of services manages tenants rather than serving them: onboarding, configuration, plans and limits, usage metering and billing. It is the part that lets you grow from 800 tenants to 8,000 without hiring 10x the staff.",
        points: ["Automate onboarding end to end: create the tenant, identity, data space and defaults in one workflow.", "Tag every log line and metric with the tenant ID to see cost, errors and latency per customer.", "Keep the control plane isolated from tenant-facing services so an outage in one does not stop the other."],
        per: {
          aws: "AWS: Step Functions for onboarding, DynamoDB for the tenant catalogue, CloudWatch with tenant dimensions and cost allocation tags.",
          azure: "Azure: Logic Apps or Durable Functions for onboarding, Cosmos DB for the catalogue, Azure Monitor with tenant-tagged logs.",
          gcp: "Google Cloud: Workflows for onboarding, Firestore for the catalogue, Cloud Monitoring with tenant labels and billing export to BigQuery.",
          oci: "OCI: Workflow or Functions for onboarding, NoSQL Database for the catalogue, Monitoring with tenant dimensions.",
        },
      },
    ],
  },
  notes: {
    aws: ["AWS publishes SaaS Lens guidance in the Well-Architected Framework and a SaaS Factory programme with reference code.", "Use tags and the Cost and Usage Report to attribute spend per tenant, especially for silo resources."],
    azure: ["Azure Architecture Center has detailed multitenant guidance with tenancy-model trade-offs by service.", "SQL elastic pools let many small tenant databases share compute and are a classic Azure pattern."],
    gcp: ["Identity Platform's multi-tenancy feature supports separate user pools and identity providers per tenant.", "Spanner's interleaved tables and Cloud SQL row-level patterns both help, but evaluate cost per tenant at your scale."],
    oci: ["Pluggable databases give silo-level isolation with container-database efficiency.", "Compartment quotas and budgets can cap what a silo tenant's environment consumes."],
  },
  decisions: [
    { title: "Pooled, bridge or silo", text: "Offer more than one. Most SaaS products pool small tenants, silo a few large or regulated ones and charge for the difference." },
    { title: "Tenant context everywhere", text: "A tenant filter forgotten in one query is a data breach. Enforce tenancy in middleware, in the data layer and with row-level security." },
    { title: "Noisy neighbours", text: "Rate limits, quotas, queues per tenant tier and autoscaling protect fairness; measure per-tenant resource use." },
    { title: "Upgrades", text: "A single shared version makes upgrades easy. Silo tenants need an automated way to roll each release across hundreds of stacks." },
  ],
  exercise: {
    title: "The cross-tenant bug",
    task: "A support engineer reports that Tenant A briefly saw one of Tenant B's invoices. List how this architecture limits the damage and prevents it from recurring.",
    answer: [
      "Row-level security in the database would have refused to return Tenant B rows for a session scoped to Tenant A, even if the application query missed the filter.",
      "Tenant context taken from the verified token (not the request) and enforced in middleware removes the chance to pass the wrong ID.",
      "Per-tenant logs and audit trails identify exactly which requests and users were involved so you can notify affected tenants.",
      "Add an automated cross-tenant test in CI that logs in as Tenant A and tries to read Tenant B's resources by ID, and run it on every release.",
    ],
  },
  takeaways: [
    "Carry the verified tenant ID from the token through every layer.",
    "Share the application tier; choose pooled, bridge or silo data per tenant tier.",
    "Enforce isolation twice: in application middleware and in database row-level security.",
    "Rate limits and quotas stop a noisy tenant harming others.",
    "A control plane automates onboarding, metering and billing so growth does not need proportional headcount.",
  ],
  quiz: [
    { kind: "mcq", q: "Where should the tenant ID come from on each request?", options: ["The verified token", "A URL query parameter the client chooses", "A cookie the user can edit", "The request body"], answer: 0, explain: "Anything the client controls can be forged; the verified token cannot." },
    { kind: "mcq", q: "Which model gives the strongest data isolation?", options: ["Silo", "Pooled", "Shared table with a tenant column", "No isolation"], answer: 0, explain: "Silo gives each tenant dedicated data resources, at higher cost." },
    { kind: "mcq", q: "What problem do per-tenant rate limits solve?", options: ["One tenant degrading performance for the others", "DNS failures", "Certificate expiry", "Backup size"], answer: 0, explain: "They address the noisy-neighbour problem." },
    { kind: "text", q: "What database feature adds a second lock by filtering rows per tenant? (three words, abbreviation RLS)", format: "***", accept: ["rls", "row level security", "row-level security"], explain: "Row-level security (RLS) restricts which rows a session may see." },
  ],
});

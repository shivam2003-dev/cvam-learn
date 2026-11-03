import type { Course } from "@/lib/types";

export const forwardDeployedEngineer: Course = {
  slug: "forward-deployed-engineer",
  title: "Forward Deployed Engineer",
  tagline:
    "Engineer who ships inside the customer's world: scope the problem, integrate with messy systems, deploy AI, and prove the value.",
  description:
    "Learn what a Forward Deployed Engineer does and the mix of skills it takes: broad engineering, data and AI building blocks, integration with legacy systems, cloud and security, plus discovery, scoping, business sense and clear communication with customers and executives.",
  level: "Intermediate",
  skills: ["Customer discovery", "Integration engineering", "AI & agents", "Cloud & security", "Scoping & ROI", "Communication"],
  modules: [
    {
      id: "introduction",
      title: "Introduction",
      blurb: "What the role is, how it is levelled, and the shapes an engagement takes.",
      lessons: [
        { slug: "what-is-an-fde", title: "What Is a Forward Deployed Engineer?", summary: "The role, its daily work and how it differs from SWE, solutions engineering and consulting." },
        { slug: "fde-tiers-and-paths", title: "FDE Tiers and Paths In", summary: "How FDE roles are levelled and how to move into one from another background." },
        { slug: "delta-uat-last-mile", title: "Delta, UAT and Last-Mile Integration", summary: "The gap between product and customer need, acceptance testing, and finishing the final stretch." },
        { slug: "day-2-productized-embedded", title: "Day 2 Operations, Productized Consulting and Embedding", summary: "Life after go-live, turning one-offs into products, and working on site." },
      ],
    },
    {
      id: "engineering-foundations",
      title: "Engineering Foundations",
      blurb: "The general toolkit you reach for on every engagement.",
      lessons: [
        { slug: "languages-for-fdes", title: "Languages for FDEs", summary: "Python and TypeScript first, and when Java, Go, Rust or C++ show up." },
        { slug: "dsa-and-system-design", title: "Data Structures, Algorithms and System Design", summary: "Enough theory to pick the right structure and sketch a sound system." },
        { slug: "git-and-github", title: "Git and GitHub", summary: "Branching, pull requests and keeping customer-specific work tidy." },
        { slug: "linux-skills", title: "Linux Skills", summary: "The shell, processes, files and networking on the boxes you will be handed." },
      ],
    },
    {
      id: "application-skills",
      title: "Application Skills",
      blurb: "Build the screens, services and APIs a customer actually uses.",
      lessons: [
        { slug: "frontend-for-fdes", title: "Frontend Skills", summary: "HTML, CSS, JavaScript and React for fast internal tools and demos." },
        { slug: "backend-and-databases", title: "Backend and Databases", summary: "SQL, PostgreSQL, NoSQL and Node.js services." },
        { slug: "api-design-and-graphql", title: "API Design and GraphQL", summary: "Clear contracts between systems, REST and GraphQL." },
      ],
    },
    {
      id: "data-engineering",
      title: "Data Engineering",
      blurb: "Get customer data into a shape you can use.",
      lessons: [
        { slug: "data-modeling-and-pipelines", title: "Data Modeling and Pipelines", summary: "Model data sensibly and move it reliably with ETL and ELT." },
        { slug: "warehouses-spark-airflow", title: "Warehouses, Spark and Airflow", summary: "Analytics stores, large-scale processing and orchestration." },
      ],
    },
    {
      id: "ai-foundations",
      title: "AI Engineering Foundations",
      blurb: "LLMs, context, retrieval and model choices for customer problems.",
      lessons: [
        { slug: "llm-prompt-context", title: "LLMs, Prompting and Context", summary: "How models behave and how to shape what they see." },
        { slug: "rag-and-vector-dbs", title: "RAG and Vector Databases", summary: "Ground answers in the customer's own documents." },
        { slug: "model-providers-and-prompt-management", title: "Model Providers and Prompt Management", summary: "Choose a provider and version prompts like code." },
      ],
    },
    {
      id: "agents",
      title: "AI Agents",
      blurb: "Systems that plan, call tools and remember.",
      lessons: [
        { slug: "agent-architectures", title: "Agent Architectures and Multi-Agent Systems", summary: "Workflows, single agents and when several agents help." },
        { slug: "tools-memory-mcp", title: "Tools, Memory and MCP", summary: "Connect agents to systems, keep state, and use the Model Context Protocol." },
      ],
    },
    {
      id: "vibe-coding",
      title: "AI-Assisted Development",
      blurb: "Move fast with coding agents without losing control.",
      lessons: [
        { slug: "ai-coding-agents", title: "Coding Agents for FDEs", summary: "Claude Code, Codex, Gemini, Cursor, OpenCode and how to keep output trustworthy." },
      ],
    },
    {
      id: "integration",
      title: "Integration Engineering",
      blurb: "The defining skill: making new things work with old things.",
      lessons: [
        { slug: "working-with-legacy-systems", title: "Working with Legacy Systems", summary: "Read the unknown, wrap it safely and migrate in steps." },
      ],
    },
    {
      id: "cloud-devops",
      title: "Cloud, Containers and MLOps",
      blurb: "Run your work where the customer needs it.",
      lessons: [
        { slug: "cloud-platforms-and-terraform", title: "Cloud Platforms and Terraform", summary: "AWS, GCP and Azure basics, and infrastructure as code." },
        { slug: "docker-and-kubernetes", title: "Docker, Kubernetes and DevOps", summary: "Package, ship and run workloads repeatably." },
        { slug: "mlops-for-fdes", title: "MLOps for FDEs", summary: "Deploy, monitor and update models and AI features in production." },
      ],
    },
    {
      id: "observability",
      title: "Observability and Evaluation",
      blurb: "Know whether the system works, and why it doesn't.",
      lessons: [
        { slug: "building-eval-pipelines", title: "Building Eval Pipelines", summary: "Datasets, graders and CI checks for AI behaviour." },
        { slug: "debugging-agent-logic", title: "Debugging Agent Logic", summary: "Read traces, find the failing step, and fix it." },
        { slug: "inference-optimization", title: "Inference Optimization", summary: "Cut cost and latency without hurting quality." },
      ],
    },
    {
      id: "security",
      title: "Security and Governance",
      blurb: "Customers trust you with their data and systems.",
      lessons: [
        { slug: "secure-apis-and-auth", title: "Secure APIs, Authentication and DevSecOps", summary: "Auth, API hardening and security in the pipeline." },
        { slug: "ai-governance-and-privacy", title: "AI Governance, Privacy and Compliance", summary: "Policies, data handling and regulatory basics." },
      ],
    },
    {
      id: "discovery",
      title: "Discovery and Scoping",
      blurb: "Decide what to build before you build it.",
      lessons: [
        { slug: "requirements-gathering", title: "Requirements Gathering", summary: "Interview users, find the real problem and write it down." },
        { slug: "scoping-and-sequencing", title: "Scoping and Sequencing", summary: "Cut work into slices and order them by value and risk." },
        { slug: "scope-speed-quality", title: "Scope, Speed and Quality", summary: "The trade-off triangle and how to negotiate it." },
      ],
    },
    {
      id: "business",
      title: "Business Acumen",
      blurb: "Understand the customer's business well enough to help it.",
      lessons: [
        { slug: "enterprise-workflows", title: "Enterprise Workflows", summary: "How large organisations actually get work done." },
        { slug: "roi-and-time-to-value", title: "ROI and Time-to-Value", summary: "Measure impact and show early wins." },
        { slug: "stakeholders-and-feedback-loop", title: "Stakeholders and the Product Feedback Loop", summary: "Manage people and feed field learning back to the product." },
      ],
    },
    {
      id: "communication",
      title: "Communication",
      blurb: "Write and speak so decisions get made.",
      lessons: [
        { slug: "technical-writing", title: "Technical Writing", summary: "Docs, runbooks and handover notes people use." },
        { slug: "executive-reporting", title: "Executive Reporting", summary: "Status, risk and results in language leaders act on." },
      ],
    },
  ],
};

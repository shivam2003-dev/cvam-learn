import type { Course } from "@/lib/types";

/**
 * Structure follows the current Google Cloud Professional Cloud Architect
 * exam guide: six sections weighted ~25 / 17.5 / 17.5 / 15 / 12.5 / 12.5
 * percent, plus four published case studies.
 */
export const gcpPca: Course = {
  slug: "gcp-pca",
  title: "Google Cloud Professional Cloud Architect (PCA)",
  tagline:
    "Design, provision, secure and operate Google Cloud solutions, mapped section by section to the current Professional Cloud Architect exam guide.",
  description:
    "A full courseware for the Google Cloud Professional Cloud Architect exam. Every chapter maps to the six exam sections: designing and planning a solution architecture (about 25%), managing and provisioning infrastructure (17.5%), security and compliance (17.5%), analyzing and optimizing technical and business processes (15%), managing implementation (12.5%) and ensuring solution and operations excellence (12.5%). It covers the Well-Architected Framework, compute, storage, data, networking, hybrid and migration, generative AI and Agent Platform topics, IAM, VPC Service Controls, KMS, CI/CD, Apigee, observability and SRE, then practises the case-study format with scenarios, a hands-on lab and exam technique.",
  level: "Advanced",
  skills: [
    "Well-Architected Framework",
    "Compute and GKE",
    "Data and storage",
    "VPC and hybrid networking",
    "IAM and VPC Service Controls",
    "Migration",
    "Generative AI on Google Cloud",
    "SRE and observability",
  ],
  modules: [
    {
      id: "orientation",
      title: "Exam Blueprint and Google Cloud Foundations",
      blurb: "Understand the exam, the case-study format and the platform concepts every question assumes.",
      lessons: [
        { slug: "pca-exam-overview", title: "PCA Exam Overview and Study Strategy", summary: "Format, six sections, case studies, recommended experience and a study plan." },
        { slug: "gcp-foundations", title: "Google Cloud Foundations for Architects", summary: "Regions, zones, global resources, the resource hierarchy, billing and shared fate." },
      ],
    },
    {
      id: "design-plan",
      title: "Designing and Planning a Solution (Section 1, ~25%)",
      blurb: "Turn business and technical requirements into compute, storage, data, network, migration and AI choices.",
      lessons: [
        { slug: "business-requirements-wellarchitected", title: "Business Requirements and the Well-Architected Framework", summary: "Functional and non-functional requirements, KPIs, build-buy-modify-deprecate and the framework pillars." },
        { slug: "ha-dr-scalability", title: "High Availability, Disaster Recovery and Scalability", summary: "RTO and RPO, regional and multi-regional design, failover, backup and recovery." },
        { slug: "compute-choices", title: "Choosing Compute: Compute Engine, GKE, Cloud Run and Functions", summary: "Map workloads to platform products, machine types, Spot VMs and specialised hardware." },
        { slug: "storage-database-choices", title: "Choosing Storage and Databases", summary: "Cloud Storage, Filestore, Cloud SQL, AlloyDB, Spanner, Bigtable, Firestore, Memorystore." },
        { slug: "data-processing-analytics", title: "Choosing Data Processing and Analytics", summary: "Pub/Sub, Dataflow, Dataproc, BigQuery, Composer and Dataplex." },
        { slug: "networking-design", title: "Cloud-Native Network Design", summary: "VPC, subnets, Shared VPC, peering, Private Service Connect, firewalls and routing." },
        { slug: "hybrid-multicloud-connectivity", title: "Hybrid and Multicloud Connectivity", summary: "Cloud VPN, Interconnect, Cloud Router, Network Connectivity Center and Cross-Cloud Interconnect." },
        { slug: "migration-planning", title: "Migration Planning and Tooling", summary: "Migration Center, the six Rs, migration tools, dependencies, licensing and cost." },
        { slug: "ai-ml-solution-design", title: "Designing Generative AI and ML Solutions", summary: "Gemini, Model Garden, Agent Builder, RAG and AI Hypercomputer in an architecture." },
      ],
    },
    {
      id: "manage-provision",
      title: "Managing and Provisioning Infrastructure (Section 2, ~17.5%)",
      blurb: "Configure networks, storage, compute and AI workflows correctly.",
      lessons: [
        { slug: "load-balancing-edge-security", title: "Load Balancing, Cloud CDN and Cloud Armor", summary: "Pick and configure the right load balancer, with edge protection and DNS." },
        { slug: "storage-configuration-lifecycle", title: "Configuring Storage: Lifecycle, Protection and Transfer", summary: "Retention, lifecycle, backups, transfer services and growth planning." },
        { slug: "compute-configuration-iac", title: "Configuring Compute: Instance Groups, GKE, Serverless and IaC", summary: "Managed instance groups, GKE modes, serverless networking, patching and Terraform." },
        { slug: "ai-platform-workflows", title: "ML Workflows on the Agent Platform and AI Hypercomputer", summary: "Pipelines, data integration, GPUs and TPUs, and consumption models." },
        { slug: "prebuilt-ai-apis", title: "Prebuilt AI APIs, Model Garden and Gemini Enterprise", summary: "Differentiate Google AI APIs and integrate agents, NotebookLM and models." },
      ],
    },
    {
      id: "security-compliance",
      title: "Designing for Security and Compliance (Section 3, ~17.5%)",
      blurb: "Identity, data protection, perimeter controls, supply chain, AI security and regulation.",
      lessons: [
        { slug: "iam-resource-hierarchy", title: "IAM and the Resource Hierarchy", summary: "Roles, service accounts, conditions, deny policies and separation of duties." },
        { slug: "data-protection-kms-secrets", title: "Data Protection: Cloud KMS, Secrets and Sensitive Data", summary: "CMEK, HSM, EKM, Secret Manager and Sensitive Data Protection." },
        { slug: "perimeter-controls", title: "Perimeter and Access Controls", summary: "VPC Service Controls, organization policy, hierarchical firewalls, IAP and Workload Identity Federation." },
        { slug: "supply-chain-ai-security", title: "Software Supply Chain and AI Security", summary: "Artifact Registry, Binary Authorization, provenance and Model Armor." },
        { slug: "compliance-governance", title: "Compliance, Residency and Audit", summary: "Regulation, Assured Workloads, audit logs and Access Transparency." },
      ],
    },
    {
      id: "analyze-optimize",
      title: "Analyzing and Optimizing Processes (Section 4, ~15%)",
      blurb: "Improve delivery, troubleshooting, disaster recovery and the business side of architecture.",
      lessons: [
        { slug: "sdlc-cicd-testing", title: "SDLC, CI/CD and Testing", summary: "Cloud Build, Artifact Registry, Cloud Deploy and release strategies." },
        { slug: "troubleshooting-dr-testing", title: "Troubleshooting, Root Cause Analysis and DR Testing", summary: "A method for incidents, postmortems and validating recovery." },
        { slug: "business-processes-finops", title: "Business Processes, Change Management and Cost", summary: "Stakeholders, skills, CapEx versus OpEx and FinOps on Google Cloud." },
      ],
    },
    {
      id: "implementation",
      title: "Managing Implementation (Section 5, ~12.5%)",
      blurb: "Guide teams through deployment and interact with Google Cloud programmatically.",
      lessons: [
        { slug: "api-management-apigee", title: "API Management and Apigee", summary: "Proxies, products, security, quotas and the right gateway for the job." },
        { slug: "programmatic-access-terraform", title: "Programmatic Access: gcloud, SDKs, Emulators and Terraform", summary: "Cloud Shell, client libraries, authentication, emulators and infrastructure as code." },
      ],
    },
    {
      id: "operations",
      title: "Solution and Operations Excellence (Section 6, ~12.5%)",
      blurb: "Observe, release safely and keep systems reliable in production.",
      lessons: [
        { slug: "observability-monitoring", title: "Google Cloud Observability and Alerting", summary: "Monitoring, Logging, Trace, Profiler, SLO monitoring and Gemini Cloud Assist." },
        { slug: "release-reliability-sre", title: "Release Management, SRE and Reliability Testing", summary: "SLOs, error budgets, progressive delivery, chaos, load and penetration testing." },
      ],
    },
    {
      id: "practice",
      title: "Case Studies, Scenarios and Exam Readiness",
      blurb: "Practise the case-study format, build a secure three-tier service and rehearse exam technique.",
      lessons: [
        { slug: "case-study-technique", title: "Working the Case Studies: Altostrat, Cymbal, EHR Healthcare, KnightMotives", summary: "How case-study questions are written and a method to answer them." },
        { slug: "scenario-retail-modernization", title: "Scenario: Modernizing a Retail Platform", summary: "A full design question across compute, data, network, security and operations." },
        { slug: "scenario-regulated-hybrid", title: "Scenario: A Regulated Hybrid Healthcare Platform", summary: "Compliance, hybrid connectivity, data residency and recovery." },
        { slug: "lab-secure-three-tier", title: "Lab: Deploy a Secure Three-Tier Service", summary: "Cloud lab: Cloud Run, private Cloud SQL, load balancer, Cloud Armor and Terraform.", kind: "lab" },
        { slug: "exam-technique-and-review", title: "Exam Technique, Pattern Review and Final Checklist", summary: "Read questions, eliminate distractors and run a final-week review." },
      ],
    },
  ],
};

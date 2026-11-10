import type { Provider } from "@/lib/cloud";
import icons from "./icons.json";

type Names = [aws: string, azure: string, gcp: string, oci: string];

/**
 * One entry per kind of building block. The icon lives at
 * /images/cloud-icons/<provider>/<kind>.png; the names are what each cloud
 * calls that block. Lessons refer to blocks by kind and get all four clouds.
 */
export const catalog = {
  // Edge and network
  dns: { role: "DNS", names: ["Route 53", "Azure DNS", "Cloud DNS", "OCI DNS"] },
  cdn: { role: "CDN", names: ["CloudFront", "Front Door / CDN", "Cloud CDN", "Edge WAF and CDN"] },
  waf: { role: "Web application firewall", names: ["AWS WAF", "Front Door WAF", "Cloud Armor", "OCI WAF"] },
  ddos: { role: "DDoS protection", names: ["Shield", "DDoS Protection", "Cloud Armor", "OCI DDoS protection"] },
  lb: { role: "Load balancer", names: ["Application Load Balancer", "Application Gateway", "Cloud Load Balancing", "Load Balancer"] },
  igw: { role: "Internet gateway", names: ["Internet gateway", "Public IP", "External IP", "Internet gateway"] },
  nat: { role: "NAT", names: ["NAT gateway", "NAT Gateway", "Cloud NAT", "NAT gateway"] },
  firewall: { role: "Network firewall", names: ["Network Firewall", "Azure Firewall", "Firewall rules / NGFW", "Network Firewall"] },
  vpn: { role: "Site-to-site VPN", names: ["Site-to-Site VPN", "VPN Gateway", "Cloud VPN", "Site-to-Site VPN"] },
  interconnect: { role: "Dedicated link", names: ["Direct Connect", "ExpressRoute", "Dedicated Interconnect", "FastConnect"] },
  transit: { role: "Network hub", names: ["Transit Gateway", "Virtual WAN hub", "Network Connectivity Center", "DRG"] },
  privlink: { role: "Private service access", names: ["PrivateLink / VPC endpoint", "Private Endpoint", "Private Service Connect", "Service gateway"] },
  network: { role: "Private network", names: ["VPC", "Virtual network", "VPC network", "VCN"] },
  // Compute
  vm: { role: "Virtual machines", names: ["EC2", "Virtual Machines", "Compute Engine", "Compute instances"] },
  fn: { role: "Functions", names: ["Lambda", "Azure Functions", "Cloud Functions", "OCI Functions"] },
  container: { role: "Serverless containers", names: ["ECS on Fargate", "Container Apps", "Cloud Run", "Container Instances"] },
  k8s: { role: "Managed Kubernetes", names: ["EKS", "AKS", "GKE", "OKE"] },
  registry: { role: "Container registry", names: ["ECR", "Container Registry", "Artifact Registry", "OCI Registry"] },
  edgeiot: { role: "Edge runtime", names: ["IoT Greengrass", "IoT Edge", "Edge VM", "Edge VM"] },
  // Integration
  apigw: { role: "API gateway", names: ["API Gateway", "API Management", "API Gateway", "API Gateway"] },
  queue: { role: "Message queue", names: ["SQS", "Service Bus", "Pub/Sub", "OCI Queue"] },
  topic: { role: "Pub/sub topic", names: ["SNS", "Event Grid", "Pub/Sub", "Notifications"] },
  eventbus: { role: "Event bus", names: ["EventBridge", "Event Grid", "Eventarc / Pub/Sub", "Events"] },
  workflow: { role: "Workflow orchestration", names: ["Step Functions", "Logic Apps", "Workflows", "Workflow"] },
  stream: { role: "Event stream", names: ["Kinesis Data Streams", "Event Hubs", "Pub/Sub", "OCI Streaming"] },
  notify: { role: "Notifications", names: ["SNS email / SES", "Notification Hubs", "Pub/Sub push", "Email Delivery"] },
  // Data
  db: { role: "Relational database", names: ["RDS", "Azure Database", "Cloud SQL", "Database service"] },
  nosql: { role: "NoSQL database", names: ["DynamoDB", "Cosmos DB", "Firestore", "NoSQL Database"] },
  cache: { role: "In-memory cache", names: ["ElastiCache", "Cache for Redis", "Memorystore", "OCI Cache"] },
  storage: { role: "Object storage", names: ["S3", "Blob Storage", "Cloud Storage", "Object Storage"] },
  lake: { role: "Data lake storage", names: ["S3 data lake", "Data Lake Storage Gen2", "Cloud Storage", "Object Storage"] },
  etl: { role: "Data integration / ETL", names: ["Glue", "Data Factory", "Dataflow", "Data Integration"] },
  dwh: { role: "Data warehouse", names: ["Redshift", "Synapse Analytics", "BigQuery", "Autonomous Data Warehouse"] },
  catalog: { role: "Data catalog", names: ["Glue Data Catalog", "Purview", "Data Catalog", "Data Catalog"] },
  bi: { role: "BI dashboards", names: ["QuickSight", "Power BI", "Looker", "Analytics Cloud"] },
  ml: { role: "Machine learning platform", names: ["SageMaker", "Azure Machine Learning", "Vertex AI", "Data Science"] },
  backup: { role: "Backup", names: ["AWS Backup", "Backup vault", "Backup and DR", "Backup service"] },
  iot: { role: "IoT ingestion", names: ["IoT Core", "IoT Hub", "IoT Core / Pub/Sub", "IoT Platform"] },
  // Security and operations
  iam: { role: "Identity and access", names: ["IAM", "Entra ID", "Cloud IAM", "IAM"] },
  auth: { role: "Customer sign-in", names: ["Cognito", "Entra External ID", "Identity Platform", "Identity Domains"] },
  kms: { role: "Key management", names: ["KMS", "Key Vault", "Cloud KMS", "Vault (KMS)"] },
  secrets: { role: "Secrets", names: ["Secrets Manager", "Key Vault", "Secret Manager", "Vault secrets"] },
  siem: { role: "Threat detection", names: ["GuardDuty / Security Hub", "Microsoft Sentinel", "Security Command Center", "Cloud Guard"] },
  audit: { role: "Audit trail", names: ["CloudTrail", "Activity log", "Cloud Audit Logs", "Audit"] },
  logs: { role: "Central logs", names: ["CloudWatch Logs", "Log Analytics", "Cloud Logging", "Logging"] },
  monitor: { role: "Metrics and alarms", names: ["CloudWatch", "Azure Monitor", "Cloud Monitoring", "Monitoring"] },
  policy: { role: "Guardrails / policy", names: ["SCPs and Config", "Azure Policy", "Organization Policy", "Compartment policies"] },
  scan: { role: "Vulnerability scanning", names: ["Inspector", "Defender for Cloud", "Security scanner", "Vulnerability Scanning"] },
  // DevOps
  repo: { role: "Source repository", names: ["CodeCommit / GitHub", "Azure Repos / GitHub", "Source Repositories / GitHub", "DevOps Code Repository"] },
  build: { role: "Build service", names: ["CodeBuild", "Pipelines (build)", "Cloud Build", "DevOps Build"] },
  pipeline: { role: "Deployment pipeline", names: ["CodePipeline", "Azure Pipelines", "Cloud Deploy / Build", "DevOps Deployment"] },
  artifact: { role: "Artifact store", names: ["CodeArtifact / ECR", "Azure Artifacts", "Artifact Registry", "Artifact Registry"] },
  // Generic clients
  users: { role: "Users", names: ["Users", "Users", "Users", "Users"], common: true },
  device: { role: "Devices", names: ["Devices", "Devices", "Devices", "Devices"], common: true },
  mobile: { role: "Mobile app", names: ["Mobile app", "Mobile app", "Mobile app", "Mobile app"], common: true },
  server: { role: "On-premises", names: ["Data centre", "Data centre", "Data centre", "Data centre"], common: true },
  client: { role: "Client", names: ["Client", "Client", "Client", "Client"], common: true },
} satisfies Record<string, { role: string; names: Names; common?: boolean }>;

export type Svc = keyof typeof catalog;

const order: Provider[] = ["aws", "azure", "gcp", "oci"];

export function svcName(svc: Svc, provider: Provider) {
  return catalog[svc].names[order.indexOf(provider)];
}

/** Per-provider file extension overrides written by scripts/cloud-icons/import-official.py. */
const extensions = icons as Record<string, Record<string, string>>;

export function svcIcon(svc: Svc, provider: Provider) {
  const entry = catalog[svc] as { common?: boolean };
  if (entry.common) return `/images/cloud-icons/common/${svc}.png`;
  return `/images/cloud-icons/${provider}/${svc}.${extensions[provider]?.[svc] ?? "png"}`;
}

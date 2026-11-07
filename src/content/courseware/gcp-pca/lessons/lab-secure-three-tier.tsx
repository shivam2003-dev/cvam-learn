import { CloudDiagram } from "@/components/CloudVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 60,
  difficulty: "Hard",
  objectives: [
    "Deploy a Cloud Run service behind a global external Application Load Balancer",
    "Connect it privately to Cloud SQL using private IP and a dedicated service account",
    "Protect it with Cloud Armor, a managed certificate and least-privilege IAM",
    "Verify, observe and clean up every billable resource",
  ],
  tasks: [
    {
      id: "scenario",
      title: "What you will build",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="lab-secure-three-tier-diagram-1" />
          <Callout tone="warn" title="Cost and safety">
            Cloud SQL, load balancer forwarding rules and static IPs bill by the hour. Use a
            sandbox project with a budget alert and complete the cleanup task the same day. Replace
            <code> PROJECT_ID</code> and region with your values. Never put real secrets in the sample
            code.
          </Callout>
        </>
      ),
    },
    {
      id: "build",
      title: "Build it",
      body: (
        <>
          <CloudDiagram course="gcp-pca" id="lab-secure-three-tier-diagram-2" />
          <p>1. Project, APIs and network:</p>
          <pre>
            <code>{`gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com compute.googleapis.com sqladmin.googleapis.com \\
  servicenetworking.googleapis.com secretmanager.googleapis.com
gcloud compute networks create app-vpc --subnet-mode=custom
gcloud compute networks subnets create app-subnet --network=app-vpc --region=europe-west4 \\
  --range=10.10.0.0/24 --enable-private-ip-google-access
# Private services access for Cloud SQL
gcloud compute addresses create google-managed-services --global --purpose=VPC_PEERING \\
  --prefix-length=20 --network=app-vpc
gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com \\
  --ranges=google-managed-services --network=app-vpc`}</code>
          </pre>
          <p>2. Cloud SQL with private IP only, and a dedicated runtime service account:</p>
          <pre>
            <code>{`gcloud sql instances create app-db --database-version=POSTGRES_16 --region=europe-west4 \\
  --tier=db-custom-1-3840 --network=app-vpc --no-assign-ip --availability-type=ZONAL
gcloud iam service-accounts create app-runtime
gcloud projects add-iam-policy-binding PROJECT_ID \\
  --member=serviceAccount:app-runtime@PROJECT_ID.iam.gserviceaccount.com --role=roles/cloudsql.client`}</code>
          </pre>
          <p>3. Deploy Cloud Run with Direct VPC egress and ingress only from the load balancer:</p>
          <pre>
            <code>{`gcloud run deploy app --image=europe-west4-docker.pkg.dev/PROJECT_ID/app/web:1 \\
  --region=europe-west4 --service-account=app-runtime@PROJECT_ID.iam.gserviceaccount.com \\
  --network=app-vpc --subnet=app-subnet --vpc-egress=private-ranges-only \\
  --ingress=internal-and-cloud-load-balancing --no-allow-unauthenticated \\
  --set-secrets=DB_PASSWORD=db-password:latest`}</code>
          </pre>
          <p>4. Load balancer with a serverless NEG, managed certificate and Cloud Armor policy:</p>
          <pre>
            <code>{`gcloud compute network-endpoint-groups create app-neg --region=europe-west4 \\
  --network-endpoint-type=serverless --cloud-run-service=app
gcloud compute backend-services create app-be --global --load-balancing-scheme=EXTERNAL_MANAGED
gcloud compute backend-services add-backend app-be --global \\
  --network-endpoint-group=app-neg --network-endpoint-group-region=europe-west4
gcloud compute security-policies create app-policy
gcloud compute security-policies rules create 1000 --security-policy=app-policy \\
  --expression="evaluatePreconfiguredWaf('sqli-v33-stable')" --action=deny-403
gcloud compute backend-services update app-be --global --security-policy=app-policy
# URL map, managed SSL certificate, target HTTPS proxy and forwarding rule follow.`}</code>
          </pre>
          <Table
            head={["Check", "Why"]}
            rows={[
              ["Cloud Run ingress is internal and load balancing", "The *.run.app URL cannot be used to bypass Cloud Armor"],
              ["Cloud SQL has no public IP", "Only reachable from the VPC"],
              ["Dedicated service account with cloudsql.client only", "Least privilege"],
              ["Secret from Secret Manager", "No password in the image or env literal"],
            ]}
          />
        </>
      ),
    },
    {
      id: "verify",
      title: "Verify and observe",
      body: (
        <>
          <ol>
            <li>Call the load balancer IP over HTTPS (wait for the managed certificate to become ACTIVE). Expect HTTP 200 from the app.</li>
            <li>Call the Cloud Run <code>*.run.app</code> URL directly: expect 403/404 because ingress is restricted.</li>
            <li>Send a request containing a SQL injection pattern such as <code>?id=1&apos; OR &apos;1&apos;=&apos;1</code>: Cloud Armor should return 403; confirm in the load balancer logs.</li>
            <li>In Cloud SQL, check that the instance shows only a private IP; try to connect from Cloud Shell without the VPC: it should fail.</li>
            <li>Open Cloud Monitoring: view request count, latency and 4xx/5xx; create an uptime check and an alert on 5xx rate.</li>
          </ol>
          <Exercise
            title="Break and fix"
            task={<p>The app returns 500 and logs show it cannot reach the database. Name three things you would check.</p>}
          >
            <p>
              (1) Cloud Run has <strong>VPC egress</strong> configured to the right network/subnet and
              the destination range is routed through it. (2) <strong>Private services access</strong>{" "}
              peering is active and the allocated range matches the instance. (3) The runtime{" "}
              <strong>service account</strong> has <code>roles/cloudsql.client</code> and the secret
              is readable; also check firewall rules and that the database user/password are correct.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "cleanup",
      title: "Clean up",
      body: (
        <>
          <pre>
            <code>{`gcloud compute forwarding-rules delete app-fr --global --quiet
gcloud compute target-https-proxies delete app-proxy --quiet
gcloud compute url-maps delete app-map --quiet
gcloud compute backend-services delete app-be --global --quiet
gcloud compute network-endpoint-groups delete app-neg --region=europe-west4 --quiet
gcloud compute security-policies delete app-policy --quiet
gcloud run services delete app --region=europe-west4 --quiet
gcloud sql instances delete app-db --quiet
gcloud compute addresses delete google-managed-services --global --quiet
gcloud compute networks subnets delete app-subnet --region=europe-west4 --quiet
gcloud compute networks delete app-vpc --quiet`}</code>
          </pre>
          <Callout tone="tip" title="Extend the lab">
            Put the whole stack in Terraform with remote state in Cloud Storage, add a VPC Service
            Controls perimeter around the project in dry-run mode, and add a Cloud Deploy pipeline
            with a canary release.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Restrict Cloud Run ingress to the load balancer so Cloud Armor cannot be bypassed.",
    "Use private services access and Direct VPC egress for private Cloud SQL connectivity.",
    "Dedicated service accounts and Secret Manager give least privilege and no embedded secrets.",
    "Always verify by testing the blocked paths, then delete resources in dependency order.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which setting prevents users bypassing the load balancer through the run.app URL?",
      options: ["Ingress: internal and Cloud Load Balancing", "Allow all ingress", "Public IP on Cloud SQL", "Standard Tier"],
      answer: 0,
      explain: "Restricting ingress forces traffic through the load balancer and Cloud Armor.",
    },
    {
      kind: "mcq",
      q: "Which feature gives Cloud SQL a private IP in your VPC?",
      options: ["Private services access", "Cloud NAT", "Cloud CDN", "Public IP with authorized networks only"],
      answer: 0,
      explain: "Private services access peers your VPC with Google-managed services.",
    },
    {
      kind: "mcq",
      q: "How does the load balancer reach a Cloud Run service?",
      options: ["Serverless network endpoint group", "Instance group", "VPN tunnel", "Internet NEG only"],
      answer: 0,
      explain: "A serverless NEG points the backend service at Cloud Run.",
    },
    {
      kind: "mcq",
      q: "Which role lets the Cloud Run service account connect to Cloud SQL?",
      options: ["roles/cloudsql.client", "roles/owner", "roles/viewer", "roles/storage.admin"],
      answer: 0,
      explain: "cloudsql.client allows connecting to instances.",
    },
    {
      kind: "text",
      q: "Which service stores the database password so it is not in the container image?",
      format: "****** *******",
      accept: ["secret manager"],
      explain: "Secret Manager stores and serves secrets securely.",
    },
  ],
};

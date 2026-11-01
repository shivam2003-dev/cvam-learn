import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Map the core services an ML system uses across AWS, Azure and GCP",
    "Compare on-demand, committed and spot pricing for ML workloads",
    "Estimate GPU and data transfer costs",
    "Give workloads narrow permissions through roles, not stored keys",
  ],
  tasks: [
    {
      id: "why-cloud",
      title: "Why ML runs in the cloud",
      body: (
        <>
          <p>
            Training a model might need eight GPUs for two days, then none for a month. Buying that
            hardware makes little sense when it sits idle most of the time. The cloud lets you rent
            it by the hour.
          </p>
          <p>
            Think of a tool rental shop. You pay for the concrete mixer on the days you use it, and
            someone else maintains it. But if you forget to return it, the meter keeps running. Much
            of cloud work for an MLOps engineer comes down to that trade.
          </p>
          <p>
            AWS, Azure and GCP (Google Cloud) look different, but they sell the same building
            blocks. Learn the concepts once, and the names are just translation.
          </p>
        </>
      ),
    },
    {
      id: "service-map",
      title: "The service map",
      body: (
        <>
          <Table
            head={["Need", "AWS", "Azure", "GCP"]}
            rows={[
              ["Object storage", "S3", "Blob Storage", "Cloud Storage"],
              ["Virtual machines", "EC2", "Virtual Machines", "Compute Engine"],
              ["Managed Kubernetes", "EKS", "AKS", "GKE"],
              ["Container registry", "ECR", "Container Registry (ACR)", "Artifact Registry"],
              ["Serverless containers", "ECS on Fargate", "Container Apps", "Cloud Run"],
              ["Serverless functions", "Lambda", "Azure Functions", "Cloud Run functions"],
              ["Data warehouse", "Redshift", "Synapse Analytics", "BigQuery"],
              ["Event streaming", "Kinesis", "Event Hubs", "Pub/Sub"],
              ["Identity", "IAM", "Entra ID with role assignments", "Cloud IAM"],
              ["Secrets", "Secrets Manager", "Key Vault", "Secret Manager"],
              ["Monitoring", "CloudWatch", "Azure Monitor", "Cloud Monitoring"],
              ["ML platform", "SageMaker", "Azure Machine Learning", "Vertex AI"],
            ]}
          />
          <p>
            A typical stack uses only a few of these. Data and models sit in object storage, images
            sit in the registry, training runs on GPU machines, and serving runs on Kubernetes or a
            managed endpoint.
          </p>
          <p>
            <strong>Object storage</strong> holds files in a flat bucket, reached over an API. It's
            cheap and nearly unlimited, which makes it the default home for datasets and models.
            The command line looks much the same on each cloud:
          </p>
          <pre>
            <code>{`aws s3 cp model.joblib s3://acme-models/fraud/7/

az storage blob upload --auth-mode login \\
  --account-name acmemodels --container-name fraud \\
  --name 7/model.joblib --file model.joblib

gcloud storage cp model.joblib gs://acme-models/fraud/7/`}</code>
          </pre>
          <p>
            Resources live in a <strong>region</strong>, a geographic area such as Frankfurt. Each
            region has several <strong>zones</strong>, which are separate data centers or groups of
            them. Spreading across zones protects you when one fails.
          </p>
        </>
      ),
    },
    {
      id: "gpus-pricing",
      title: "GPUs and how you pay for them",
      body: (
        <>
          <p>
            Each cloud groups machines into families. On AWS, GPU work uses the G and P families.
            Azure uses N-series machines. GCP offers accelerator-optimized machines such as the A
            and G series. Google also rents TPUs, its own AI chips, and AWS has its own Trainium and
            Inferentia chips. Line-ups change often, so check current lists.
          </p>
          <Table
            head={["Pricing", "How it works", "Best for"]}
            rows={[
              ["On-demand", "Pay by the hour, no commitment", "Experiments and spiky work"],
              ["Committed", "Commit to one to three years for a discount", "Steady 24/7 inference"],
              ["Spot", "Big discount, but the cloud can reclaim the machine", "Checkpointed training, batch jobs"],
            ]}
          />
          <p>
            Azure and GCP both have their own names for these, but the ideas match. Here's a worked
            comparison. The prices are illustrative, so look up current ones.
          </p>
          <pre>
            <code>{`Assume a GPU at $3.00/hour on demand.

Training job: 40 hours
  On-demand: 40 × $3.00 = $120.00
  Spot at 70% off is $0.90/hour.
  Interruptions add 10% more time: 44 hours.
  44 × $0.90 = $39.60

Inference server: running all month (730 hours)
  On-demand: 730 × $3.00 = $2,190
  With a 40% commitment discount: 730 × $1.80 = $1,314`}</code>
          </pre>
          <p>
            Spot only works if your job survives losing its machine. The warning is short, from
            seconds to a couple of minutes, so save checkpoints to object storage often.
          </p>
          <Callout tone="warn">
            New accounts often have a GPU quota near zero, and popular GPUs can be sold out in a
            region. Request quota well before a launch, and confirm that your region actually has
            the machines you need.
          </Callout>
        </>
      ),
    },
    {
      id: "data-gravity",
      title: "Data gravity and transfer costs",
      body: (
        <>
          <p>
            Big datasets are expensive and slow to move, so compute tends to go where the data
            already is. People call this <strong>data gravity</strong>. Clouds typically charge
            little to bring data in, and charge for sending it out, which is known as{" "}
            <strong>egress</strong>.
          </p>
          <Formula>transfer cost = data in GB × price per GB</Formula>
          <p>
            At an illustrative $0.09 per GB, moving 5 TB out costs 5,000 × $0.09 = $450. Do that
            with every retraining run and it adds up. Keep training, data and models in the same
            region, and it's usually free or close to it. Read your provider's price list, because
            the details vary.
          </p>
          <p>
            Storage has tiers too. Recent data sits in a standard tier, and old checkpoints can move
            to a colder, cheaper one. Lifecycle rules can do that automatically.
          </p>
        </>
      ),
    },
    {
      id: "identity",
      title: "Identity: roles, not keys",
      body: (
        <>
          <p>
            Long-lived access keys get pasted into notebooks and committed to Git. A much better
            pattern is to give the workload an <strong>identity</strong>, called a role on AWS, a
            managed identity on Azure and a service account on GCP. The platform hands it
            short-lived credentials automatically.
          </p>
          <p>
            Apply <strong>least privilege</strong>: grant only what's needed. This AWS policy lets a
            training job read one bucket and nothing else:
          </p>
          <pre>
            <code>{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::acme-ml-data",
        "arn:aws:s3:::acme-ml-data/*"
      ]
    }
  ]
}`}</code>
          </pre>
          <p>
            If that job leaks its credentials, the damage stops at one read-only bucket. That's the
            point of narrow permissions.
          </p>
          <Callout tone="tip">
            Tag every resource with a team and a project, and set budget alerts on day one. A
            forgotten GPU machine is the classic surprise on a cloud bill, so add a job that
            reports idle ones.
          </Callout>
          <p>
            Which cloud should you learn? Whichever your company uses. Data, skills and contracts
            usually decide it. Running one workload across several clouds adds real complexity, so
            do it only for a strong reason.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "All three clouds offer the same building blocks under different names.",
    "Object storage is the default home for datasets, checkpoints and models.",
    "Use spot for checkpointed training and commitments for steady inference.",
    "Keep compute close to data to avoid egress charges and slow transfers.",
    "Give workloads roles with narrow permissions rather than long-lived keys.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which service is GCP's equivalent of Amazon S3?",
      options: ["BigQuery", "Cloud Storage", "Cloud Run", "Pub/Sub"],
      answer: 1,
      explain: "Cloud Storage is Google's object storage service.",
    },
    {
      kind: "mcq",
      q: "Which workload suits spot instances best?",
      options: [
        "A live API that must always be up",
        "Your only production database",
        "A training job that saves checkpoints often",
        "A login service",
      ],
      answer: 2,
      explain: "A checkpointed job can resume after the cloud reclaims its machine.",
    },
    {
      kind: "mcq",
      q: "Your dataset is in one region and your GPUs are in another. What's the main problem?",
      options: [
        "Models lose accuracy",
        "Slow transfers and possible transfer charges",
        "The GPUs won't start",
        "Object storage stops working",
      ],
      answer: 1,
      explain: "Moving data between regions costs time and often money, so keep them together.",
    },
    {
      kind: "text",
      q: "What is the AWS name for managed Kubernetes? Three letters.",
      format: "***",
      accept: ["eks"],
      explain: "Elastic Kubernetes Service. Azure has AKS and GCP has GKE.",
    },
    {
      kind: "text",
      q: "A GPU costs $2 per hour and runs for 730 hours in a month. What's the monthly cost in dollars?",
      format: "****",
      accept: ["1460", "1,460", "$1460", "$1,460"],
      explain: "730 × $2 = $1,460.",
    },
  ],
};

import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Package an application as a Docker image with a lean, safe Dockerfile",
    "Explain pods, deployments and services in Kubernetes",
    "Set up a basic CI/CD flow with health checks and rollback",
  ],
  tasks: [
    {
      id: "docker",
      title: "Docker",
      body: (
        <>
          <p>
            A <strong>container</strong> bundles your code with its dependencies so it runs the
            same on your laptop, in CI and on the customer's servers. That removes "works on my
            machine" from customer deployments.
          </p>
          <pre>
            <code>{`FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m app && chown -R app /app
USER app
EXPOSE 8000
HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`}</code>
          </pre>
          <ul>
            <li>Copy dependency files first so layers cache between builds.</li>
            <li>Run as a non-root user and use a slim base image.</li>
            <li>Keep secrets out of the image; pass them at run time.</li>
            <li>Tag images with a version or commit SHA, not only <code>latest</code>.</li>
          </ul>
          <pre>
            <code>{`docker build -t invoice-api:1.4.2 .
docker run --rm -p 8000:8000 --env-file .env invoice-api:1.4.2`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "k8s",
      title: "Kubernetes in one page",
      body: (
        <>
          <Table
            head={["Object", "What it is"]}
            rows={[
              ["Pod", "One or more containers running together"],
              ["Deployment", "Keeps N replicas of a pod running and handles rolling updates"],
              ["Service", "Stable address and load balancing for a set of pods"],
              ["Ingress", "HTTP routing into the cluster"],
              ["ConfigMap / Secret", "Configuration and sensitive values injected into pods"],
              ["Namespace", "A boundary to group and isolate resources"],
            ]}
          />
          <pre>
            <code>{`kubectl get pods -n invoices
kubectl describe pod invoice-api-7d9f -n invoices   # events explain most failures
kubectl logs deploy/invoice-api -n invoices --tail=100
kubectl rollout status deploy/invoice-api -n invoices
kubectl rollout undo deploy/invoice-api -n invoices`}</code>
          </pre>
          <p>
            When a pod will not start, read <code>describe</code> events first. Typical causes are
            a missing secret, a bad image tag, an unready dependency, or too little memory
            (OOMKilled).
          </p>
          <Callout tone="tip">
            Set resource requests and limits, plus readiness and liveness probes. Without them the
            cluster cannot tell a healthy pod from a stuck one.
          </Callout>
        </>
      ),
    },
    {
      id: "cicd",
      title: "Delivery pipeline",
      body: (
        <>
          <ol>
            <li>Push triggers CI: lint, unit tests, security scan.</li>
            <li>Build an image tagged with the commit SHA and push to a registry.</li>
            <li>Deploy to staging automatically and run smoke tests.</li>
            <li>Promote to production with approval where the customer requires it.</li>
            <li>Roll out gradually and watch error rate and latency; roll back on regression.</li>
          </ol>
          <Callout tone="note">
            Some customers run air-gapped or locked-down clusters. Be ready to ship images through
            their registry, with signed artifacts and a software bill of materials, and to deliver
            with their own tooling.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Containers make deployments repeatable; keep images lean, non-root, secret-free and versioned.",
    "Pods run containers, deployments manage replicas, services give stable access.",
    "Use probes and limits, read pod events when debugging, and roll back with rollout undo.",
    "A CI/CD pipeline tests, builds, stages, promotes and watches before and after release.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why copy requirements.txt before the rest of the source in a Dockerfile?",
      options: [
        "To make layers cache so dependencies are not reinstalled on every code change",
        "Because Docker requires it alphabetically",
        "To hide the code",
        "To make the image bigger",
      ],
      answer: 0,
      explain: "Unchanged dependency layers are reused, speeding rebuilds.",
    },
    {
      kind: "mcq",
      q: "A pod is stuck in CrashLoopBackOff. Which command is the best start?",
      options: ["kubectl describe pod and kubectl logs", "kubectl delete namespace", "reboot every node", "docker system prune on production"],
      answer: 0,
      explain: "Events and logs usually show the reason: bad config, missing secret, or an error at startup.",
    },
    {
      kind: "mcq",
      q: "Which Kubernetes object keeps a set number of replicas running and handles rolling updates?",
      options: ["Deployment", "Secret", "Namespace", "Ingress"],
      answer: 0,
      explain: "A Deployment manages replica sets and rolling updates.",
    },
  ],
};

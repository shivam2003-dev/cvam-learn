import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Hard",
  objectives: [
    "Explain desired state and the core Kubernetes objects",
    "Deploy a model service with GPU requests and health probes",
    "Run training as a Job that survives failures",
    "Autoscale on the right signal and debug common pod failures",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem Kubernetes solves",
      body: (
        <>
          <p>
            Docker runs a container on one machine. Now you have 30 model replicas across 10 GPU
            servers. A server dies at 3 a.m. Traffic doubles at noon. A new version must go out with
            no downtime. Doing this by hand isn't realistic.
          </p>
          <p>
            <strong>Kubernetes</strong> is a system that runs containers across a group of machines,
            called a <strong>cluster</strong>. Each machine is a <strong>node</strong>. You don't
            give it commands one at a time. You declare what you want, and it works constantly to
            make reality match. Think of a thermostat: you set the temperature, and it keeps
            correcting. This is called <strong>desired state</strong>.
          </p>
          <Table
            head={["Object", "What it does", "ML use"]}
            rows={[
              ["Pod", "One or more containers that run together", "One model replica"],
              ["Deployment", "Keeps N pods running, handles rollouts", "Online inference"],
              ["Service", "A stable address that balances across pods", "Reaching the model API"],
              ["Job", "Runs a pod until it finishes", "Training, batch scoring"],
              ["CronJob", "Runs a Job on a schedule", "Nightly retraining"],
              ["ConfigMap and Secret", "Settings and credentials", "Model URI, API tokens"],
              ["HorizontalPodAutoscaler", "Changes the replica count", "Following traffic"],
            ]}
          />
        </>
      ),
    },
    {
      id: "deployment",
      title: "Deploying a model service",
      body: (
        <>
          <pre>
            <code>{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: fraud-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fraud-api
  template:
    metadata:
      labels:
        app: fraud-api
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/fraud-api:3f9c2ab
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: "2"
              memory: 8Gi
            limits:
              memory: 8Gi
              nvidia.com/gpu: 1
          startupProbe:
            httpGet:
              path: /healthz
              port: 8000
            periodSeconds: 10
            failureThreshold: 30
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: fraud-api
spec:
  selector:
    app: fraud-api
  ports:
    - port: 80
      targetPort: 8000`}</code>
          </pre>
          <p>Apply it and watch the rollout:</p>
          <pre>
            <code>{`kubectl apply -f fraud-api.yaml
kubectl rollout status deployment/fraud-api
kubectl rollout undo deployment/fraud-api   # roll back`}</code>
          </pre>
          <p>Two parts deserve attention for ML:</p>
          <p>
            <strong>Resources.</strong> A <em>request</em> is what the scheduler reserves. A{" "}
            <em>limit</em> is the maximum allowed. Set memory too low and the pod is killed.
          </p>
          <p>
            <strong>Probes.</strong> Models can take minutes to load. The startup probe here allows
            30 × 10 seconds = 5 minutes. Without it, a liveness probe (if you add one) may restart the
            pod before it's ready, again and again. The readiness probe keeps traffic away until the model can answer.
          </p>
          <Callout tone="warn">
            A readiness check that returns OK before the model has loaded sends live traffic to a
            pod that can only fail. Make <code>/ready</code> run a real test prediction if you can.
          </Callout>
        </>
      ),
    },
    {
      id: "gpus",
      title: "Scheduling GPUs",
      body: (
        <>
          <p>
            Kubernetes doesn't know about GPUs by default. The NVIDIA <strong>device plugin</strong>{" "}
            advertises them to the cluster as the resource <code>nvidia.com/gpu</code>. GPUs are set
            in whole numbers, and by default a pod gets the whole device, so a lightly used GPU is
            still fully paid for.
          </p>
          <p>
            Cluster operators often add a <strong>taint</strong> to GPU nodes. It repels pods that
            lack a matching <strong>toleration</strong>, which keeps small CPU jobs from taking space
            on expensive machines.
          </p>
          <p>
            Plan for rollouts when you size the cluster. Here's a worked example with 10 replicas,
            one GPU each, on nodes with 4 GPUs:
          </p>
          <pre>
            <code>{`Steady state: 10 ÷ 4 = 2.5, so 3 nodes (12 GPUs)

Rolling update with the default maxSurge of 25%:
  25% of 10 = 2.5, which rounds up to 3 extra pods
  10 + 3 = 13 GPUs during the rollout
  13 ÷ 4 = 3.25, so 4 nodes`}</code>
          </pre>
          <p>
            If there's no room, surge pods sit in Pending and the rollout crawls. You can set{" "}
            <code>maxSurge: 0</code> and <code>maxUnavailable: 1</code> to replace pods one at a
            time, but you run short of capacity while it happens.
          </p>
        </>
      ),
    },
    {
      id: "training-jobs",
      title: "Training as a Job",
      body: (
        <>
          <pre>
            <code>{`apiVersion: batch/v1
kind: Job
metadata:
  name: train-fraud-v12
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: trainer
          image: ghcr.io/acme/fraud-train:3f9c2ab
          args: ["--epochs", "10", "--checkpoints", "s3://acme-ml/ckpt/v12"]
          resources:
            limits:
              memory: 32Gi
              nvidia.com/gpu: 1
          volumeMounts:
            - name: shm
              mountPath: /dev/shm
      volumes:
        - name: shm
          emptyDir:
            medium: Memory
            sizeLimit: 8Gi`}</code>
          </pre>
          <p>
            <code>backoffLimit: 2</code> retries twice on failure. The script must resume from its
            latest checkpoint, or a retry starts over. The memory-backed volume gives PyTorch data
            loaders more shared memory than the small container default. Its contents count toward
            the pod's memory use, so leave room in your limit.
          </p>
          <p>
            Tools such as Kubeflow build on these same objects to run multi-step pipelines and
            distributed training.
          </p>
        </>
      ),
    },
    {
      id: "scaling-debugging",
      title: "Autoscaling and debugging",
      body: (
        <>
          <p>
            The <strong>HorizontalPodAutoscaler</strong> (HPA) adjusts replicas with this formula:
          </p>
          <Formula>desired replicas = ceil(current replicas × current metric ÷ target metric)</Formula>
          <p>
            With 4 replicas averaging 90 in-flight requests and a target of 60, that's ceil(4 × 90 ÷
            60) = 6 replicas.
          </p>
          <p>
            Choose that metric with care. CPU is a poor signal for GPU inference, where the CPU can
            look idle while requests pile up. Queue length or in-flight requests track load better.
            You can expose these through a metrics adapter for Prometheus, or use KEDA.
          </p>
          <p>
            New pods aren't instant. A node may need to start, pull a large image and load the
            model, which can take minutes. A <strong>node autoscaler</strong> such as Cluster
            Autoscaler or Karpenter adds machines, but you'll still want spare capacity for sudden
            spikes.
          </p>
          <Table
            head={["Status", "Usually means", "Check"]}
            rows={[
              ["Pending", "No node has the requested resources", "Events in kubectl describe pod"],
              ["ImagePullBackOff", "Wrong tag or missing registry access", "Image name, pull secret"],
              ["CrashLoopBackOff", "The app keeps exiting", "kubectl logs --previous"],
              ["OOMKilled", "It exceeded its memory limit", "Raise the limit or cut batch size"],
              ["Running, not Ready", "Readiness probe is failing", "Model load, probe path"],
            ]}
          />
          <pre>
            <code>{`kubectl get pods -l app=fraud-api
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
kubectl exec -it <pod-name> -- nvidia-smi`}</code>
          </pre>
          <Callout tone="tip">
            Start with <code>kubectl describe pod</code>. Its Events section explains most failures
            in plain text, including "Insufficient nvidia.com/gpu".
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "You declare desired state, and Kubernetes keeps correcting toward it.",
    "Use Deployments for serving, and Jobs and CronJobs for training and batch work.",
    "Startup and readiness probes protect models that load slowly.",
    "Request GPUs as nvidia.com/gpu, and leave room for rolling updates.",
    "Scale GPU inference on queue or request metrics rather than CPU.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which object should run a nightly retraining task?",
      options: ["Service", "CronJob", "ConfigMap", "Deployment"],
      answer: 1,
      explain: "A CronJob creates a Job on a schedule, and the Job runs until it finishes.",
    },
    {
      kind: "mcq",
      q: "A pod shows OOMKilled. What happened?",
      options: [
        "The image couldn't be pulled",
        "It exceeded its memory limit",
        "No GPU was available",
        "The Service had no port",
      ],
      answer: 1,
      explain: "The container used more memory than allowed, so it was killed.",
    },
    {
      kind: "mcq",
      q: "Why is CPU often a poor autoscaling signal for GPU inference?",
      options: [
        "CPU metrics can't be collected",
        "Kubernetes can't scale GPU pods",
        "CPU can stay low while requests queue up",
        "GPUs have no memory",
      ],
      answer: 2,
      explain: "The real work happens on the GPU, so queue or in-flight metrics show load better.",
    },
    {
      kind: "text",
      q: "An HPA sees 5 replicas with a metric of 80 and a target of 40. How many replicas does it want?",
      format: "**",
      accept: ["10"],
      explain: "ceil(5 × 80 ÷ 40) = 10.",
    },
    {
      kind: "text",
      q: "You need 9 replicas with one GPU each, on nodes with 4 GPUs. How many nodes do you need, ignoring rollouts?",
      format: "*",
      accept: ["3"],
      explain: "9 ÷ 4 = 2.25, which rounds up to 3 nodes.",
    },
  ],
};

import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain images, containers, layers and registries",
    "Write a small, cache-friendly Dockerfile for a model service",
    "Decide whether to bake model weights into an image",
    "Run GPU containers and avoid common ML-specific failures",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem Docker solves",
      body: (
        <>
          <p>
            A model works on a data scientist's laptop and crashes on the server. The Python version
            differs, a system library is missing, or NumPy is one release newer. ML makes this worse
            because models depend on long chains of native libraries.
          </p>
          <p>
            Shipping had the same problem. Goods came in every shape until the standard steel
            container arrived. Now cranes, ships and trucks don't care what's inside. A Docker
            container does this for software: it bundles an application with everything it needs.
          </p>
          <Table
            head={["Term", "Meaning"]}
            rows={[
              ["Image", "A read-only package of files and settings"],
              ["Container", "A running instance of an image"],
              ["Dockerfile", "The recipe that builds an image"],
              ["Layer", "One cached filesystem change in an image"],
              ["Registry", "A server that stores images, such as ECR or GitHub Container Registry"],
            ]}
          />
          <p>
            A container isn't a virtual machine. A VM runs its own operating system kernel. A
            container shares the host's kernel and is just an isolated process, so it starts in
            moments.
          </p>
          <p>
            That's why containers matter for reproducibility. In the MLOps principles, the
            environment is one of the things you must record, and an image captures it exactly.
          </p>
        </>
      ),
    },
    {
      id: "dockerfile",
      title: "A Dockerfile for model serving",
      body: (
        <>
          <pre>
            <code>{`# Stage 1: install dependencies
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.lock .
RUN pip install --no-cache-dir --prefix=/install -r requirements.lock

# Stage 2: the image we ship
FROM python:3.12-slim
WORKDIR /app
RUN useradd --create-home appuser
COPY --from=builder /install /usr/local
COPY src/ ./src/
USER appuser
EXPOSE 8000
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]`}</code>
          </pre>
          <p>Each choice has a reason:</p>
          <ul>
            <li><strong>Slim base image:</strong> fewer files, fewer vulnerabilities.</li>
            <li><strong>Pinned dependencies:</strong> a lock file means rebuilds install the same versions.</li>
            <li><strong>Multi-stage build:</strong> build tools stay behind in the first stage. Only the final stage ships.</li>
            <li><strong>Non-root user:</strong> limits the damage if the service is compromised.</li>
            <li><strong>Dependencies before code:</strong> this one needs more explanation.</li>
          </ul>
          <p>
            Docker caches layers from the top down. When one layer changes, every layer below it
            rebuilds. Code changes often, and dependencies rarely. So copy dependencies first, and
            a code change won't reinstall them. That turns a long rebuild into seconds.
          </p>
          <p>
            Also add a <code>.dockerignore</code> file. Without it, your whole project folder,
            datasets included, is sent to the build.
          </p>
          <pre>
            <code>{`.git
.venv
data/
notebooks/
mlruns/
*.pt
*.joblib`}</code>
          </pre>
          <Callout tone="warn">
            Never put secrets in an image. Layers are permanent: a file added in one layer and
            deleted in a later one is still in the image, and anyone who can pull it can read it.
            The same rule means deleting a large file later doesn't shrink the image.
          </Callout>
        </>
      ),
    },
    {
      id: "model-weights",
      title: "Where should the weights go?",
      body: (
        <>
          <Table
            head={["", "Bake into the image", "Download at startup"]}
            rows={[
              ["Versioning", "One tag covers code and model", "Code and model versions are separate"],
              ["Startup", "No download once the image is on the node", "Downloads on every fresh start"],
              ["Image size", "Large", "Small"],
              ["Changing a model", "Requires a new image", "Change a setting and restart"],
              ["Runtime dependency", "None at startup", "Storage must be reachable"],
            ]}
          />
          <p>
            Small models usually go in the image. Very large ones often live in object storage or on
            a shared volume. Layers help here too, since changing only the top layer leaves the
            others cached.
          </p>
          <p>Here's an illustrative image going out to 20 nodes:</p>
          <pre>
            <code>{`Base 0.15 GB + libraries 1.2 GB + weights 4 GB = 5.35 GB

First rollout:  5.35 GB × 20 nodes = 107 GB transferred
Pull time at 100 MB/s: 5,350 MB ÷ 100 = about 54 seconds per node

New weights only: 4 GB × 20 nodes = 80 GB transferred
New code only, a 10 MB layer on top: 0.01 GB × 20 = 0.2 GB`}</code>
          </pre>
          <p>
            The last line holds only if the code layer sits above the weights. So put the things
            that change most often last.
          </p>
        </>
      ),
    },
    {
      id: "gpus",
      title: "GPUs in containers",
      body: (
        <>
          <p>
            A container shares the host kernel, and that decides where each GPU piece lives. The{" "}
            <strong>NVIDIA driver</strong> runs on the host. <strong>CUDA libraries</strong> usually
            ship in the image. The <strong>NVIDIA Container Toolkit</strong>, installed on the host,
            connects the two. Check it with:
          </p>
          <pre>
            <code>{`docker run --rm --gpus all ubuntu nvidia-smi`}</code>
          </pre>
          <p>
            If this prints your GPUs, the host is ready. The driver must be new enough for the CUDA
            version in your image. An old driver is a common reason for a model that falls back to
            CPU or fails to start.
          </p>
          <Table
            head={["Problem", "Fix"]}
            rows={[
              ["CPU-only image is several GB", "Install PyTorch's CPU-only wheels, not the CUDA build"],
              ["DataLoader workers crash on shared memory", "Docker's default /dev/shm is 64 MB, so raise it with --shm-size"],
              ["Image built on an Arm Mac fails on x86 servers", "Build with --platform linux/amd64"],
              ["Container exits with code 137", "It was usually killed for using too much memory"],
            ]}
          />
        </>
      ),
    },
    {
      id: "workflow",
      title: "The everyday workflow",
      body: (
        <>
          <pre>
            <code>{`# Tag images with the Git commit, not "latest"
IMAGE=ghcr.io/acme/fraud-api:$(git rev-parse --short HEAD)

docker build -t "$IMAGE" .
docker run --rm -p 8000:8000 -e MODEL_URI=s3://acme-models/fraud/7 "$IMAGE"
docker history "$IMAGE"    # see which layers are large
docker push "$IMAGE"`}</code>
          </pre>
          <p>
            The tag <code>latest</code> is only a label, and it moves. If you deploy it, you can't
            say what's running. A tag with the commit hash links the running service to its code.
          </p>
          <p>
            Before you push, send a test prediction to the running container. Mount data with{" "}
            <code>-v</code> rather than copying it in. Scan images in CI too, with a tool such as
            Trivy.
          </p>
          <Callout tone="tip">
            Add <code>/healthz</code> and <code>/ready</code> endpoints to your service now. The
            first says the process is alive, and the second says the model has loaded. You'll need
            both for Kubernetes.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An image packages code and environment, and a container runs that image.",
    "Order Dockerfile steps from least to most frequently changed.",
    "Use slim bases, lock files, multi-stage builds and a non-root user.",
    "The GPU driver lives on the host, and CUDA libraries live in the image.",
    "Tag images by Git commit, and never store secrets in them.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why install dependencies before copying source code in a Dockerfile?",
      options: [
        "Docker requires that order",
        "Code changes then won't invalidate the cached dependency layer",
        "It encrypts the code",
        "It makes containers use less GPU memory",
      ],
      answer: 1,
      explain: "A changed layer rebuilds everything below it, so put stable steps first.",
    },
    {
      kind: "mcq",
      q: "A Dockerfile copies an API key in one step and deletes it in the next. Is the key safe?",
      options: [
        "Yes, it was deleted",
        "Yes, if the image uses a non-root user",
        "No, it still exists in the earlier layer",
        "No, but only on GPU machines",
      ],
      answer: 2,
      explain: "Layers are permanent, so anyone who can pull the image can read the key.",
    },
    {
      kind: "mcq",
      q: "Where does the NVIDIA kernel driver live?",
      options: ["In the image", "On the host", "In the registry", "In the Dockerfile"],
      answer: 1,
      explain: "Containers share the host's kernel, so the driver belongs on the host.",
    },
    {
      kind: "text",
      q: "Which docker run flag gives a container access to GPUs?",
      format: "******",
      accept: ["--gpus", "gpus", "--gpus all"],
      explain: "For example: docker run --gpus all.",
    },
    {
      kind: "text",
      q: "A 2 GB layer has changed, and 15 nodes must pull it. How many GB is transferred in total?",
      format: "**",
      accept: ["30", "30gb", "30 gb"],
      explain: "2 GB × 15 nodes = 30 GB. Unchanged layers stay cached.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Map which GPU software lives on the host and which lives in the image",
    "Explain how NVIDIA drivers and CUDA versions relate",
    "Write a Dockerfile that pins versions and keeps images small",
    "Diagnose the most common GPU container failures",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            "It worked on my machine" is painful with GPUs. An engine update can bring a new PyTorch
            build, which expects a newer CUDA, which your cluster's driver doesn't support. The pod
            starts, finds no GPU, then falls back to CPU or simply crashes. Sometimes it's just slow,
            and nobody notices for a week.
          </p>
          <p>
            Containers package an application with its libraries, so the same image runs the same
            way anywhere. GPUs complicate that promise, because part of the stack can't go inside
            the image. Think of shipping a kitchen appliance: everything fits in the box, but the
            plug still needs a compatible socket in the wall. The driver is that socket.
          </p>
        </>
      ),
    },
    {
      id: "stack",
      title: "What lives where",
      body: (
        <>
          <Table
            head={["Layer", "Examples", "Where it lives"]}
            rows={[
              ["Kernel driver", "NVIDIA kernel module", "Host"],
              ["Container runtime", "Docker, containerd, NVIDIA Container Toolkit", "Host"],
              ["Driver user library", "libcuda.so, injected at start", "Host, mounted into container"],
              ["CUDA libraries", "CUDA runtime, cuDNN", "Image, often inside Python wheels"],
              ["ML framework", "PyTorch, ONNX Runtime", "Image"],
              ["Inference engine", "vLLM, SGLang, TensorRT-LLM", "Image"],
              ["Your server", "API code, config", "Image"],
              ["Model weights", "Safetensors files", "Mounted volume or object store"],
            ]}
          />
          <p>
            The key point is that a container shares its host's kernel, so the driver isn't packaged
            with your image. The <strong>NVIDIA Container Toolkit</strong> connects the two. At
            startup, it exposes the GPU devices and mounts driver libraries such as{" "}
            <code>libcuda.so</code> into the container.
          </p>
          <pre>
            <code>{`# Check that a container can see the GPU
docker run --rm --gpus all nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi`}</code>
          </pre>
          <p>
            On Kubernetes, the same role is played by the NVIDIA device plugin, or the GPU Operator
            that installs it for you. Pods ask for a GPU with the <code>nvidia.com/gpu</code>{" "}
            resource.
          </p>
        </>
      ),
    },
    {
      id: "versions",
      title: "Drivers and CUDA versions",
      body: (
        <>
          <p>
            The rule to remember: <strong>a newer driver can run older CUDA applications</strong>.
            The reverse usually fails. So the host's driver sets a ceiling on the CUDA version your
            image should target.
          </p>
          <Formula>CUDA in image ≤ highest CUDA supported by host driver</Formula>
          <Callout tone="warn">
            The "CUDA Version" printed by <code>nvidia-smi</code> doesn't mean CUDA is installed.
            It's the highest version that driver supports. The version your app actually uses is
            whichever one its libraries were built with.
          </Callout>
          <p>
            PyTorch wheels are a good example. A standard CUDA build of PyTorch bundles its own CUDA
            runtime libraries. That means you often don't need a full CUDA toolkit in the image,
            which saves many gigabytes. You mainly need the full toolkit to compile code.
          </p>
          <p>Add a smoke test to your build pipeline or startup probe:</p>
          <pre>
            <code>{`import torch

print("torch", torch.__version__)
print("cuda build", torch.version.cuda)
print("gpu available", torch.cuda.is_available())

assert torch.cuda.is_available(), "No GPU visible"
x = torch.ones(1024, 1024, device="cuda")
print((x @ x).sum().item())  # forces real GPU work`}</code>
          </pre>
          <p>Here are failures you'll see in real life:</p>
          <Table
            head={["Symptom", "Likely cause"]}
            rows={[
              ["torch.cuda.is_available() is False", "CPU-only wheel, or no GPU passed to the container"],
              ["libcuda.so not found", "Container wasn't started with the NVIDIA runtime"],
              ["Driver/library version mismatch", "Host driver updated without a reload or reboot"],
              ["CUDA error at model load", "Driver too old for the app's CUDA build"],
              ["Container killed at startup", "Too little shared memory or host RAM"],
            ]}
          />
        </>
      ),
    },
    {
      id: "image",
      title: "Building a good image",
      body: (
        <>
          <pre>
            <code>{`FROM python:3.12-slim

ENV HF_HOME=/models
WORKDIR /app

# Dependencies first: this layer changes rarely, so it stays cached
COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock

# Code last: this layer changes often
COPY server/ ./server/

EXPOSE 8000
CMD ["python", "-m", "server.main"]`}</code>
          </pre>
          <p>A few choices in that file carry most of the value:</p>
          <ul>
            <li>
              <strong>Pin everything.</strong> Use a lockfile with exact versions, generated by a
              tool like <code>uv</code> or <code>pip-compile</code>. Pin the base image too.
              Unpinned builds silently change over time.
            </li>
            <li>
              <strong>Order layers well.</strong> Docker rebuilds every layer after a change. Put
              what changes least at the top.
            </li>
            <li>
              <strong>Skip Alpine.</strong> Alpine uses musl rather than glibc, and CUDA libraries
              and many Python wheels expect glibc. A slim Debian or Ubuntu base is the safe choice.
            </li>
            <li>
              <strong>Use multi-stage builds.</strong> If you must compile, do it in a build stage,
              then copy only the results across. Compilers don't need to reach production.
            </li>
            <li>
              <strong>Deploy by digest.</strong> A tag can move, but <code>image@sha256:...</code>{" "}
              can't. Run exactly what you tested.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "size",
      title: "Worked example: image size and startup",
      body: (
        <>
          <p>
            Image size directly affects cold starts, because every new node must pull the image
            first. Here's an illustrative comparison on a 1 Gbps link, which is 125 MB per second,
            ignoring decompression.
          </p>
          <Formula>pull time ≈ image size ÷ network speed</Formula>
          <pre>
            <code>{`Image with weights baked in: 12 GB + 40 GB = 52 GB
52,000 MB ÷ 125 MB/s = 416 s ≈ 6.9 min

Image alone:                 12 GB
12,000 MB ÷ 125 MB/s = 96 s ≈ 1.6 min`}</code>
          </pre>
          <p>
            Weights still have to reach the node, of course. But separating them lets you cache them
            on a shared volume or node disk, so a second pod on that node starts at once. It also
            lets you update code without moving 40 GB and reuse the same image for several models.
          </p>
          <pre>
            <code>{`docker run --rm --gpus all \\
  -v /mnt/models:/models \\
  -p 8000:8000 \\
  my-inference:1.4.2`}</code>
          </pre>
          <p>
            In the Dockerfile above, <code>HF_HOME=/models</code> makes Hugging Face libraries
            cache to that mounted volume instead of the container's temporary disk.
          </p>
          <Callout tone="tip">
            Run <code>docker history my-inference:1.4.2</code> to see which layers are largest.
            Common waste includes build tools, pip caches and an extra copy of PyTorch pulled in by
            an unpinned dependency.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The driver lives on the host. Everything else ships with the image, except weights.",
    "A newer driver runs older CUDA builds, so the host driver sets the ceiling.",
    "nvidia-smi shows the highest supported CUDA, not an installed CUDA.",
    "Pin versions, order layers carefully, and use a glibc-based image.",
    "Keep weights out of the image to shrink pulls and speed up cold starts.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where does the NVIDIA kernel driver live in a containerized setup?",
      options: ["In the image", "On the host", "In the model weights", "In the Python wheel"],
      answer: 1,
      explain: "Containers share the host kernel, so the kernel driver must be installed on the host.",
    },
    {
      kind: "mcq",
      q: "nvidia-smi shows 'CUDA Version: 12.4'. What does that tell you?",
      options: [
        "CUDA 12.4 is installed in the container",
        "The driver supports CUDA up to 12.4",
        "PyTorch is using CUDA 12.4",
        "The GPU was made for CUDA 12.4",
      ],
      answer: 1,
      explain: "That number is the driver's supported maximum. It says nothing about what's installed.",
    },
    {
      kind: "mcq",
      q: "Why is Alpine a poor base image for GPU inference?",
      options: [
        "It has no shell",
        "It uses musl, while CUDA libraries and many wheels expect glibc",
        "It only runs on ARM",
        "It can't expose ports",
      ],
      answer: 1,
      explain: "Prebuilt GPU libraries and most Python wheels target glibc systems.",
    },
    {
      kind: "text",
      q: "How many seconds does a 30 GB image take to pull at 150 MB/s? Use 1 GB = 1,000 MB.",
      format: "***",
      accept: ["200", "200 s", "200 seconds"],
      explain: "30,000 MB ÷ 150 MB/s = 200 seconds.",
    },
    {
      kind: "text",
      q: "On the host, what provides libcuda.so: the driver or the container toolkit? One word.",
      format: "******",
      accept: ["driver", "the driver", "nvidia driver"],
      explain: "libcuda.so ships with the NVIDIA driver and is mounted into containers at startup.",
    },
  ],
};

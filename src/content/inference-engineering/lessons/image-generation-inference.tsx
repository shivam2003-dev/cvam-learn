import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Walk through the stages of a diffusion image pipeline",
    "Estimate image latency and throughput from step counts",
    "Decide when batching helps and what limits it",
    "Design an asynchronous queue-based image API",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Text models stream results token by token, so users see progress almost immediately.
            Image models usually give you nothing useful until the very end, and each image may hold a GPU
            for seconds. A burst of users can't be served with a plain request and response without
            timeouts and wasted capacity.
          </p>
          <p>
            Serving images well means understanding where time goes, then wrapping the model in a
            system of queues and workers. The main mental shift: this is closer to running a print
            shop than a web server. Jobs join a queue, a machine runs through them at a set pace,
            and customers collect finished work.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "The diffusion pipeline",
      body: (
        <>
          <p>
            Most image models today use <strong>diffusion</strong>. Generation starts with random
            noise and removes a little of that noise at each step, guided by the prompt. To keep it
            affordable, the work happens in a compressed <strong>latent</strong> space rather than
            on pixels. Stable Diffusion XL, for example, uses a latent one-eighth the width and
            height of the image, with 4 channels:
          </p>
          <pre>
            <code>{`Pixels:  1,024 × 1,024 × 3 = 3,145,728 values
Latent:  128 × 128 × 4     = 65,536 values
Ratio:   3,145,728 ÷ 65,536 = 48 times smaller`}</code>
          </pre>
          <p>A request passes through three models:</p>
          <Table
            head={["Stage", "What it does", "How often", "Share of time"]}
            rows={[
              ["Text encoder", "Turns the prompt into embeddings", "Once", "Small"],
              ["Denoiser", "U-Net or transformer removes noise", "Every step", "Most of it"],
              ["VAE decoder", "Turns the latent into pixels", "Once", "Small, but memory hungry"],
            ]}
          />
          <p>
            A <strong>VAE</strong> (variational autoencoder) is the network that translates between
            pixels and latents. Many pipelines also use <strong>classifier-free guidance</strong>,
            which runs the denoiser once with the prompt and once without, then pushes the result
            toward the prompt. That's two passes for every step, usually handled as a batch of two.
          </p>
          <p>Here's a typical call with the Diffusers library:</p>
          <pre>
            <code>{`import torch
from diffusers import StableDiffusionXLPipeline

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
).to("cuda")

# Decode the VAE in tiles to reduce peak memory
pipe.vae.enable_tiling()

result = pipe(
    prompt=["a red bicycle against a brick wall"] * 4,
    num_inference_steps=30,
    guidance_scale=7.0,
    height=1024,
    width=1024,
)
result.images[0].save("bicycle.png")`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "latency",
      title: "Worked example: latency and batching",
      body: (
        <>
          <p>Latency follows directly from the pipeline:</p>
          <Formula>latency = text encoding + (steps × step time) + VAE decode</Formula>
          <p>
            Suppose encoding takes 20 ms, a step takes 100 ms with guidance, and a VAE decode takes
            200 ms. These numbers are illustrative.
          </p>
          <pre>
            <code>{`Latency:    20 + (30 × 100) + 200 = 3,220 ms = 3.22 s
Throughput: 60 ÷ 3.22 ≈ 18.6 images/min`}</code>
          </pre>
          <p>
            Steps are the strongest control you have. Going from 30 to 15 steps roughly halves
            denoising time, though quality may drop. Some models and fast samplers are designed to
            work well in very few steps. FLUX.1 [schnell], for instance, targets 1 to 4 steps.
          </p>
          <p>
            Now batch 4 images. Say a batched step takes 280 ms rather than 400 ms, since the GPU
            does the work in parallel. The VAE decodes each image, so that's 800 ms.
          </p>
          <pre>
            <code>{`Batch latency:    20 + (30 × 280) + 800 = 9,220 ms = 9.22 s
Batch throughput: 4 images ÷ 9.22 s × 60 ≈ 26 images/min`}</code>
          </pre>
          <Table
            head={["", "Single", "Batch of 4", "Change"]}
            rows={[
              ["Latency per request", "3.22 s", "9.22 s", "About 2.9 times slower"],
              ["Images per minute", "18.6", "26", "About 40% more"],
            ]}
          />
          <p>
            Batching trades latency for throughput, and it's limited in ways text batching isn't:
          </p>
          <ul>
            <li>
              <strong>Same shape:</strong> images in a batch must generally have one resolution.
              Group requests into standard size buckets.
            </li>
            <li>
              <strong>Same settings:</strong> requests usually need matching step counts and
              scheduler settings, so a fast draft can't easily share with a high-quality job.
            </li>
            <li>
              <strong>Memory:</strong> memory grows with batch size and resolution. The VAE decode
              often sets the peak, which is why tiled decoding exists.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "queues",
      title: "Queues and async APIs",
      body: (
        <>
          <p>
            Because jobs take seconds, an asynchronous API works better than holding a connection
            open:
          </p>
          <pre>
            <code>{`POST /v1/images      → 202 Accepted, returns job_id
GET  /v1/images/:id  → status: queued | running | done | failed
(worker uploads image to object storage)
Client receives URL by polling or a webhook`}</code>
          </pre>
          <p>Workers pull jobs from a queue. You can size the fleet from arrival rate:</p>
          <Formula>GPUs ≈ arrival rate × service time ÷ target utilization</Formula>
          <p>For 60 images per minute, which is 1 per second, at 3.22 s each:</p>
          <pre>
            <code>{`Busy GPUs:     1 × 3.22 = 3.22
At 70% target: 3.22 ÷ 0.70 = 4.6, so 5 GPUs`}</code>
          </pre>
          <p>
            Always round up, and keep that target below 100%. Queue wait climbs steeply as
            utilization nears full. Track queue wait time as a first-class metric, since users feel
            it as latency even though no GPU is busy on their job.
          </p>
          <Callout tone="tip" title="Useful production habits">
            Store each image in object storage rather than the queue. Save the seed and all
            settings with the job so results can be reproduced. Accept cancellations and check for
            them between steps, because a user who left no longer needs the remaining 20 steps. Run
            safety checks on prompts and outputs.
          </Callout>
          <Callout tone="warn">
            Requests with custom LoRA weights can stall workers while loading. Keep popular adapters
            in memory, and route jobs to workers that already have them loaded. Changing the base
            checkpoint between jobs is much slower still.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A diffusion pipeline runs a text encoder, many denoising steps and a VAE decode.",
    "Denoising dominates time, so step count is your strongest control over latency.",
    "Batching raises throughput and latency, and needs matching shapes and settings.",
    "VAE decoding often sets peak memory, especially at high resolution.",
    "Use an async API with a queue, and size workers from arrival rate and service time.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which pipeline stage usually takes the most total time?",
      options: ["Text encoder", "The denoiser, across all steps", "Saving the PNG", "Tokenizing the prompt"],
      answer: 1,
      explain: "The denoiser runs once per step, and sometimes twice per step with guidance.",
    },
    {
      kind: "mcq",
      q: "Why are image requests often grouped into standard resolutions?",
      options: [
        "Browsers need it",
        "Images in a batch generally need the same shape",
        "PNG only supports certain sizes",
        "Smaller files upload faster",
      ],
      answer: 1,
      explain: "Tensors in a batch must have matching dimensions, so size buckets make batching possible.",
    },
    {
      kind: "text",
      q: "A job has 10 ms of text encoding, 20 steps at 50 ms each, and a 90 ms VAE decode. What is the latency in ms?",
      format: "****",
      accept: ["1100", "1,100", "1100 ms"],
      explain: "10 + (20 × 50) + 90 = 1,100 ms.",
    },
    {
      kind: "text",
      q: "Images arrive at 2 per second and each takes 4 seconds. At 80% target utilization, how many GPUs do you need?",
      format: "**",
      accept: ["10"],
      explain: "2 × 4 = 8 busy GPUs, and 8 ÷ 0.8 = 10.",
    },
    {
      kind: "text",
      q: "SDXL's latent is how many times smaller than the image in width? Answer with a number.",
      format: "*",
      accept: ["8", "8x"],
      explain: "A 1,024-pixel image has a 128-unit latent, and 1,024 ÷ 128 = 8.",
    },
  ],
};

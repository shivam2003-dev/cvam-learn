import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Hard",
  objectives: [
    "Explain why video generation costs far more than image generation",
    "Estimate job time, cost and GPU fleet size",
    "Design a durable job system that survives failures",
    "Reduce cost through drafts, admission checks and post-processing",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Picture a job that holds an expensive GPU for ten minutes, cannot give useful partial
            results, and fails at the very end if memory runs short. That's a normal video
            generation request. Teams that run it like a chat API end up with lost jobs and a large
            bill.
          </p>
          <p>
            A good video service is built more like a render farm for film than a web service.
            Jobs are large, slow and valuable. Each one is tracked from start to finish, and
            finished work should never be thrown away by accident.
          </p>
        </>
      ),
    },
    {
      id: "why-so-heavy",
      title: "Why video is so much heavier",
      body: (
        <>
          <p>
            Video models extend image diffusion. They compress video into a latent, denoise it over
            many steps, then decode it. The extra difficulty is that latents now span time as well.
            Each frame has to agree with its neighbors, or objects flicker and shift.
          </p>
          <p>
            Open models such as Wan commonly use a 3D VAE that shrinks each frame 8 times in width
            and height, and also compresses time by 4. Let's count the units a transformer has to
            process for a 720p clip of 81 frames, about 5 seconds at 16 frames per second, with
            2×2 patches. A <strong>patch</strong> is a small block of latent treated as one token.
          </p>
          <pre>
            <code>{`Latent size per frame: 1,280 ÷ 8 = 160, 720 ÷ 8 = 90
Latent frames:         (81 − 1) ÷ 4 + 1 = 21
Patches per frame:     80 × 45 = 3,600
Tokens in total:       3,600 × 21 = 75,600`}</code>
          </pre>
          <p>Compare a 1,024 × 1,024 image with the same 8× latent and 2×2 patches:</p>
          <pre>
            <code>{`Tokens: 64 × 64 = 4,096
Ratio:  75,600 ÷ 4,096 ≈ 18.5 times more tokens`}</code>
          </pre>
          <p>
            The gap can be much larger in compute. Full attention compares every token with every
            other, so doubling tokens quadruples that work. An 18.5-fold increase in tokens means up
            to about 340 times the attention work, since 18.5 squared is roughly 342. Real models
            soften this with windowed or factorized designs, but the direction holds.
          </p>
          <Callout tone="note">
            The memory peak often comes last. Decoding 81 frames at 720p with a 3D VAE needs a lot
            of GPU memory, so most pipelines decode in overlapping tiles. Tiling trades some speed
            for a lower peak.
          </Callout>
        </>
      ),
    },
    {
      id: "costing",
      title: "Worked example: cost and capacity",
      body: (
        <>
          <p>
            Take one clip with these illustrative figures: text encoding 5 s, 40 denoising steps at
            12 s each, and 60 s of VAE decoding, on one GPU at $3 per hour. Prices and speeds
            change, so plug in your own.
          </p>
          <Formula>job time = text encoding + (steps × step time) + VAE decode</Formula>
          <pre>
            <code>{`Job time:       5 + (40 × 12) + 60 = 545 s ≈ 9.1 min
Compute cost:   (545 ÷ 3,600) × $3 ≈ $0.454
At 60% busy:    $0.454 ÷ 0.60 ≈ $0.76 per clip`}</code>
          </pre>
          <p>
            That last line matters. You pay for a GPU while it's idle, so real cost per clip depends
            on utilization, and so does your pricing.
          </p>
          <p>Fleet size follows the same logic you'd use for images:</p>
          <Formula>GPUs ≈ jobs per hour × seconds per job ÷ 3,600 ÷ utilization</Formula>
          <pre>
            <code>{`Demand:    30 jobs/hour
Work:      30 × 545 s = 16,350 GPU-seconds/hour
Busy GPUs: 16,350 ÷ 3,600 ≈ 4.54
At 80%:    4.54 ÷ 0.80 ≈ 5.7, so 6 GPUs`}</code>
          </pre>
          <p>
            Larger models or resolutions may need several GPUs for one job, which makes
            scheduling harder. A multi-GPU job must wait for all its GPUs to be free at once, and
            that creates idle gaps. Count GPU-seconds, not jobs.
          </p>
        </>
      ),
    },
    {
      id: "job-system",
      title: "A job system that survives failure",
      body: (
        <>
          <p>
            A nine-minute job will sometimes meet a failure, because machines crash, spot instances
            disappear and deploys happen. A good system assumes this.
          </p>
          <Table
            head={["Need", "How to do it"]}
            rows={[
              ["Never lose a job", "Save it in a durable queue or database before accepting"],
              ["Handle dead workers", "Give each worker a lease it must renew, then requeue on expiry"],
              ["Avoid double charges", "Use idempotency keys on submission"],
              ["Protect work done", "Save latents every few steps to object storage"],
              ["Stay fair", "Use per-customer limits and priority lanes"],
              ["Show progress", "Report the current step, plus events or webhooks"],
            ]}
          />
          <p>
            <strong>Checkpointing</strong> pays for itself on long jobs. If a worker dies at step 35
            of 40, resuming from step 30 loses just 60 seconds at 12 s per step. Starting over would
            lose 420 seconds. To resume correctly you need the latent, the step index, the seed and
            all settings. Saving isn't free, so choose an interval that suits your failure rate.
          </p>
          <p>
            Priority needs care as well. A paying customer's job can't usually preempt a running
            job at no cost, unless checkpoints allow it to pause and return later. Without them,
            all the work on the paused job is wasted.
          </p>
        </>
      ),
    },
    {
      id: "saving-money",
      title: "Spending GPU time wisely",
      body: (
        <>
          <ul>
            <li>
              <strong>Draft first.</strong> Offer a short, low-resolution preview. Users refine
              their prompt cheaply, then pay for the final render only once they're happy.
            </li>
            <li>
              <strong>Check before running.</strong> Estimate memory and time from resolution and
              frame count. Reject impossible jobs at the door.
            </li>
            <li>
              <strong>Generate small, then enhance.</strong> A base clip followed by upscaling and
              frame interpolation can cost less than rendering everything at full size.
            </li>
            <li>
              <strong>Separate stages.</strong> Run final video encoding on CPU workers, and don't
              hold a GPU while uploading files.
            </li>
          </ul>
          <p>The last stage turns frames into a file people can actually play:</p>
          <pre>
            <code>{`ffmpeg -framerate 16 -i frames/%05d.png \\
  -c:v libx264 -crf 18 -pix_fmt yuv420p \\
  -movflags +faststart output.mp4`}</code>
          </pre>
          <p>
            <code>-pix_fmt yuv420p</code> keeps the file playable on most devices.{" "}
            <code>-movflags +faststart</code> moves index data to the front so playback can begin
            during download. <code>-crf</code> sets quality, with lower meaning larger and better.
          </p>
          <Callout tone="warn">
            The worst failure is running out of memory during the VAE decode, after every
            denoising step has been paid for. Test the largest job you offer, at full resolution
            and length, on each GPU type. Save the latent before decoding so you can retry just
            that last stage.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Video adds a time dimension, so token counts and attention work grow sharply.",
    "Cost per clip depends on GPU-seconds and on fleet utilization.",
    "Treat video like a render farm: durable jobs, leases, retries and checkpoints.",
    "Save latents before VAE decoding, since late failures waste the most money.",
    "Drafts, admission checks and CPU post-processing keep GPU time focused.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why are worker leases useful in a video job system?",
      options: [
        "They reduce GPU power use",
        "They let the system detect dead workers and requeue their jobs",
        "They compress the latents",
        "They improve image quality",
      ],
      answer: 1,
      explain: "If a worker stops renewing its lease, the job is assumed lost and can be picked up elsewhere.",
    },
    {
      kind: "mcq",
      q: "What should a checkpoint save so a job can resume correctly?",
      options: [
        "Only the prompt",
        "The latent, step index, seed and settings",
        "Only the final video",
        "The GPU driver version",
      ],
      answer: 1,
      explain: "The denoising state and settings are all needed to continue from that exact point.",
    },
    {
      kind: "text",
      q: "A job has 50 steps at 10 s each, plus 40 s of VAE decoding and 10 s of text encoding. How many seconds does it take?",
      format: "***",
      accept: ["550", "550 s", "550 seconds"],
      explain: "10 + (50 × 10) + 40 = 550 seconds.",
    },
    {
      kind: "text",
      q: "Each job takes 600 seconds and 36 jobs arrive per hour. At 100% utilization, how many GPUs are busy?",
      format: "*",
      accept: ["6"],
      explain: "36 × 600 = 21,600 GPU-seconds, and 21,600 ÷ 3,600 = 6.",
    },
    {
      kind: "text",
      q: "With 4× temporal compression, how many latent frames does a 49-frame clip have, using (frames − 1) ÷ 4 + 1?",
      format: "**",
      accept: ["13"],
      explain: "(49 − 1) ÷ 4 + 1 = 12 + 1 = 13.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Hard",
  objectives: [
    "Explain why video needs far more compute than an image",
    "Calculate latent size and token count for a video clip",
    "Compare full spatiotemporal attention with factorized attention",
    "Estimate GPU time and cost for one generated clip",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: video is not a stack of images",
      body: (
        <>
          <p>
            A simple idea for making a video is to generate an image for each frame. It doesn't work.
            Each frame comes from its own random noise, so objects flicker, faces shift and textures
            crawl. Viewers are very good at spotting this. Frames have to agree with each other over
            time, a property called <strong>temporal consistency</strong>.
          </p>
          <p>
            Video diffusion models get there by generating the whole clip at once. The latent gains a
            new dimension for time, and the denoiser sees all frames together at every step. So the
            pipeline from the Image Generation Architectures lesson stays much the same: text encoder,
            denoiser, scheduler and VAE. The difference is scale.
          </p>
          <p>
            Think of the difference between painting a portrait and shooting a film. A film needs
            every shot to match the last one, so you can't hand each frame to a different painter. Some
            director has to see them all at once, which is expensive.
          </p>
          <p>
            Open video models with published pipelines include HunyuanVideo, Wan, LTX-Video and Mochi.
            Most follow this general design. Exact compression factors vary by model.
          </p>
        </>
      ),
    },
    {
      id: "size",
      title: "Worked example: how big is the latent?",
      body: (
        <>
          <p>
            Take a 5-second clip at 24 frames per second and 720p, which is 1,280 × 720, or 120 frames.
            We'll use typical illustrative settings: 8 times spatial compression, 4 times temporal
            compression, 16 latent channels and a spatial patch size of 2.
          </p>
          <pre>
            <code>{`Pixels:  1,280 × 720 × 3 × 120 frames = 331,776,000 values

Latent:  160 × 90 per frame, 120 ÷ 4 = 30 latent frames
         160 × 90 × 16 × 30 = 6,912,000 values
         About 48 times smaller than the pixels

Tokens:  80 × 45 = 3,600 tokens per latent frame
         3,600 × 30 = 108,000 tokens`}</code>
          </pre>
          <p>
            The VAE helps a lot here, since it also compresses across time by merging similar
            neighboring frames. Even so, a 1,024 × 1,024 image was 4,096 tokens, so this clip has about
            26 times as many (108,000 ÷ 4,096 = 26.4). Each token also has to run on every step.
          </p>
          <Callout tone="note">
            Many video VAEs treat the first frame on its own, so sizes follow a rule like "4n + 1
            frames". Wan is one example: 81 frames map to 21 latent frames, as 1 + 80 ÷ 4 = 21. That's
            why you'll see odd frame counts such as 81.
          </Callout>
        </>
      ),
    },
    {
      id: "attention",
      title: "Space and time in attention",
      body: (
        <>
          <p>
            Attention is where the cost explodes. The natural design lets every token attend to every
            other token, in any frame. That's called <strong>full spatiotemporal attention</strong>,
            and it gives the best consistency, because a moving object can be tracked anywhere. But
            pairs grow with the square of the token count.
          </p>
          <p>
            The cheaper option is <strong>factorized attention</strong>, which splits the operation in
            two. Spatial attention connects tokens within one frame. Temporal attention connects the
            same position across frames. For our clip:
          </p>
          <Formula>factorized pairs = F × S² + S × F²</Formula>
          <pre>
            <code>{`F = 30 frames, S = 3,600 tokens per frame

Full:       108,000 × 108,000  = about 11.7 billion pairs

Factorized:
  Spatial:   30 × 3,600²       = 388.8 million pairs
  Temporal:  3,600 × 30²       =   3.24 million pairs
  Total:                       = about 392 million pairs

Ratio: 11.7 billion ÷ 392 million = about 30 times fewer`}</code>
          </pre>
          <Table
            head={["", "Full spatiotemporal", "Factorized"]}
            rows={[
              ["Compute", "Very high", "Much lower"],
              ["Motion across positions", "Handled directly", "Harder, needs stacked layers"],
              ["Scaling with length", "Doubling frames gives 4× pairs", "Spatial part only doubles"],
            ]}
          />
          <p>
            Pair counts tell you how each design scales, not exact runtime. Attention is only one part
            of the network, and fast kernels change the constants. Newer models have often leaned
            toward full attention for quality, which is one reason they're so demanding.
          </p>
        </>
      ),
    },
    {
      id: "run",
      title: "Running a video pipeline",
      body: (
        <>
          <p>
            The Diffusers code looks similar to image generation, which hides how long it takes. This
            is a Wan pipeline:
          </p>
          <pre>
            <code>{`import torch
from diffusers import AutoencoderKLWan, WanPipeline
from diffusers.utils import export_to_video

model_id = "Wan-AI/Wan2.1-T2V-14B-Diffusers"
vae = AutoencoderKLWan.from_pretrained(
    model_id, subfolder="vae", torch_dtype=torch.float32
)
pipe = WanPipeline.from_pretrained(
    model_id, vae=vae, torch_dtype=torch.bfloat16
).to("cuda")

frames = pipe(
    prompt="a paper boat drifting down a rainy street",
    height=720,
    width=1280,
    num_frames=81,
    guidance_scale=5.0,
).frames[0]

export_to_video(frames, "boat.mp4", fps=16)`}</code>
          </pre>
          <p>
            Notice the VAE stays in FP32 while the rest uses bfloat16. Memory runs short at this
            scale, which is why tiled and sliced decoding are common for video.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "Worked example: cost of one clip",
      body: (
        <>
          <p>
            Video runs often use 30 to 50 steps with CFG. Take an illustrative setup of 50 steps with
            CFG, 3 seconds per denoiser pass, 30 seconds of VAE decoding and a $3 per hour GPU. Real
            numbers vary a lot by model and hardware.
          </p>
          <Formula>GPU seconds = steps × 2 × pass time + VAE decode</Formula>
          <pre>
            <code>{`Passes:     50 × 2 = 100
Denoising:  100 × 3 s = 300 s
VAE decode:              30 s
Total:                  330 s, or 5.5 minutes

Clips per hour:  3,600 ÷ 330 = about 10.9
Cost per clip:   $3 ÷ 10.9 = about $0.28`}</code>
          </pre>
          <p>
            So a single clip holds a full GPU for over five minutes. An image took a few seconds. This
            changes how you build the product:
          </p>
          <ul>
            <li>Video is an async product. Nobody holds an HTTP request open for minutes.</li>
            <li>Batches are small, often one clip, because memory runs out first.</li>
            <li>Large models may need several GPUs for one clip.</li>
            <li>Previews at low resolution or few steps avoid wasting long runs on bad prompts.</li>
          </ul>
          <Callout tone="warn">
            Cost grows quickly with settings. Doubling the duration doubles tokens, and doubling each
            side of the frame gives four times the tokens. Combine them and one clip has eight times
            the tokens. Set clear limits on duration, resolution and steps before launch.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Frames must stay consistent, so video models denoise the whole clip together.",
    "The pipeline matches image generation, but with a time dimension in the latent.",
    "VAEs compress across space and time, yet clips still reach many thousands of tokens.",
    "Factorized attention cuts pairs sharply, while full attention gives stronger consistency.",
    "A clip can hold a GPU for minutes, so video is served as an async job.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why not generate each frame with a separate image model run?",
      options: [
        "Images can't be stored in video files",
        "Frames wouldn't match, so the result would flicker",
        "Text encoders can't run more than once",
        "GPUs can't process images in sequence",
      ],
      answer: 1,
      explain: "Independent frames lack temporal consistency, and viewers notice right away.",
    },
    {
      kind: "mcq",
      q: "What does temporal attention connect in a factorized model?",
      options: [
        "All tokens within one frame",
        "The same position across different frames",
        "Text tokens with each other",
        "Different GPUs",
      ],
      answer: 1,
      explain: "Spatial attention works inside a frame. Temporal attention works across frames.",
    },
    {
      kind: "text",
      q: "A clip has 20 latent frames with 1,000 tokens per frame. How many tokens is that in total?",
      format: "*****",
      accept: ["20000", "20,000"],
      explain: "20 × 1,000 = 20,000.",
    },
    {
      kind: "text",
      q: "A clip has 40 steps with CFG, 2 s per pass and 20 s of VAE decoding. How many GPU seconds does it take?",
      format: "***",
      accept: ["180", "180s", "180 s"],
      explain: "40 × 2 × 2 = 160 s, plus 20 s, gives 180 s.",
    },
  ],
};

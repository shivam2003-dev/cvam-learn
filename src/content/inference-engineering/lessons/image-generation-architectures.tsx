import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Name the components of a latent diffusion pipeline and what each does",
    "Calculate how much a VAE reduces the data the denoiser handles",
    "Compare U-Net and transformer denoisers",
    "Work out how resolution changes token count and attention cost",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: pixels are too expensive",
      body: (
        <>
          <p>
            The Diffusion Models lesson described a denoiser that runs dozens of times. If it worked
            directly on pixels, a 1,024 × 1,024 image would mean over three million values at every
            step. Early pixel-space models were slow for this reason.
          </p>
          <p>
            Modern image models solve this with <strong>latent diffusion</strong>. They compress the
            image into a much smaller representation called a <strong>latent</strong>, do all the
            denoising there, and expand the result only at the end. A latent isn't a tiny picture.
            It's a compact encoding that keeps the structure the model needs.
          </p>
          <p>
            An architect works the same way. They revise a floor plan dozens of times, and only then
            build the real house. Editing the plan is cheap. So is denoising a latent.
          </p>
        </>
      ),
    },
    {
      id: "components",
      title: "The four parts of a pipeline",
      body: (
        <>
          <Table
            head={["Component", "Job", "Runs how often per image"]}
            rows={[
              ["Text encoder", "Turns the prompt into embeddings", "Once"],
              ["Denoiser", "Predicts noise from the latent", "Every step, twice with CFG"],
              ["Scheduler", "Picks timesteps, updates the latent", "Every step, tiny math on the CPU or GPU"],
              ["VAE decoder", "Expands the latent into pixels", "Once"],
            ]}
          />
          <p>
            <strong>Text encoders</strong> are separate models with their own weights. Different image
            models use different ones. SDXL uses two CLIP encoders, and FLUX.1 pairs CLIP with the much
            larger T5. These may take more memory than you'd expect, even though they run only once.
          </p>
          <p>
            The <strong>VAE</strong>, or variational autoencoder, is the compression model. Its encoder
            turns an image into a latent, and it's only needed for tasks that start from an image, such
            as editing. Its decoder turns the final latent back into pixels.
          </p>
          <p>The Diffusers library shows this structure directly:</p>
          <pre>
            <code>{`import torch
from diffusers import FluxPipeline

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16,
)
print(list(pipe.components.keys()))
# Includes text_encoder, text_encoder_2, transformer, vae and scheduler.`}</code>
          </pre>
          <p>
            Since these parts are separate, you can load, place and scale them separately, as the
            Independent Component Scaling lesson will show.
          </p>
        </>
      ),
    },
    {
      id: "latent",
      title: "Worked example: what the VAE saves",
      body: (
        <>
          <p>
            Common VAEs shrink height and width by 8. The latent then has a few channels, instead of
            the three color channels of an RGB image. SDXL's latent has 4 channels and FLUX.1's has 16.
          </p>
          <pre>
            <code>{`Pixels: 1,024 × 1,024 × 3 = 3,145,728 values

SDXL latent:   128 × 128 × 4  =  65,536 values
  3,145,728 ÷ 65,536 = 48 times smaller

FLUX.1 latent: 128 × 128 × 16 = 262,144 values
  3,145,728 ÷ 262,144 = 12 times smaller`}</code>
          </pre>
          <p>
            More channels keep more fine detail, such as small text, but give the denoiser more to
            process. This is a real design trade-off, and it shows up directly in step time.
          </p>
          <Callout tone="warn">
            The VAE decoder runs once, but it's a common cause of out-of-memory errors. It expands to
            full resolution, so it can spike memory right at the end of a run, after all the slow work
            is done. For large images, tiled decoding helps. In Diffusers, it's{" "}
            <code>pipe.vae.enable_tiling()</code>.
          </Callout>
        </>
      ),
    },
    {
      id: "denoisers",
      title: "U-Net and transformer denoisers",
      body: (
        <>
          <p>The denoiser is the heart of the model, and there are two main designs.</p>
          <p>
            A <strong>U-Net</strong> is a convolutional network. It shrinks the latent step by step to
            capture the overall layout, then grows it back to recover detail. Shortcut connections
            link matching sizes. SD 1.5 and SDXL use this design, with attention added at some levels.
          </p>
          <p>
            A <strong>diffusion transformer</strong>, or DiT, cuts the latent into small patches and
            treats each patch as a token. From there it works much like an LLM, with blocks of
            attention and feed-forward layers. FLUX.1 and Stable Diffusion 3 are built this way, and
            most new image and video models follow.
          </p>
          <Table
            head={["", "U-Net", "Transformer (DiT)"]}
            rows={[
              ["Main operation", "Convolution, some attention", "Attention on every block"],
              ["Long-range layout", "Harder, via downsampling", "Natural, all tokens interact"],
              ["Scaling with resolution", "Close to linear for convolution", "Attention grows much faster"],
              ["Prompt handling", "Cross-attention to text", "Often joint or cross-attention"],
            ]}
          />
          <p>
            DiT resolution scaling deserves a calculation, because it surprises people. With a patch
            size of 2, a 128 × 128 latent gives 64 × 64 tokens. Attention compares every token with
            every other, so its cost follows the square of the token count:
          </p>
          <Formula>attention pairs = tokens × tokens</Formula>
          <Table
            head={["Image size", "Latent size", "Tokens", "Attention pairs"]}
            rows={[
              ["1,024 × 1,024", "128 × 128", "4,096", "About 16.8 million"],
              ["2,048 × 2,048", "256 × 256", "16,384", "About 268 million"],
            ]}
          />
          <p>
            Doubling each side gives 4 times the tokens and 16 times the attention pairs. In practice,
            layers other than attention grow only 4 times, so total time lands somewhere between the
            two. That's why high-resolution output is often made by a cheaper upscaling pass.
          </p>
        </>
      ),
    },
    {
      id: "extras",
      title: "Extras that change the pipeline",
      body: (
        <>
          <p>Production pipelines add more parts, and each one has a serving cost.</p>
          <ul>
            <li>
              <strong>Image-to-image:</strong> runs the VAE encoder on an input image, then starts from
              partly noised latents, so fewer steps run.
            </li>
            <li>
              <strong>Inpainting:</strong> regenerates only a masked area, though the denoiser still
              usually processes the full latent.
            </li>
            <li>
              <strong>ControlNet:</strong> a second network guides layout from an edge map or pose,
              adding compute to every step.
            </li>
            <li>
              <strong>LoRA adapters:</strong> small weight changes that add a style or subject.
              Swapping them takes time, so routing matters.
            </li>
          </ul>
          <Callout tone="tip">
            If memory is tight on a test machine, <code>pipe.enable_model_cpu_offload()</code> keeps
            components on the CPU until they're needed. It saves GPU memory, but moving weights around
            hurts latency, so it's usually not what you want on a busy production server.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Latent diffusion does its work in a compressed space, then expands to pixels at the end.",
    "A pipeline combines text encoders, a denoiser, a scheduler and a VAE.",
    "The denoiser runs every step, while the text encoder and VAE decoder each run once.",
    "U-Nets rely on convolution, and DiTs treat latent patches as tokens.",
    "Doubling each side of an image gives 4 times the tokens and 16 times the attention pairs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which component turns the final latent into a visible image?",
      options: ["Text encoder", "Scheduler", "VAE decoder", "Tokenizer"],
      answer: 2,
      explain: "The VAE decoder expands the latent into pixels once, at the end.",
    },
    {
      kind: "mcq",
      q: "What does a diffusion transformer use as its tokens?",
      options: ["Words of the prompt only", "Patches of the latent", "Single pixels", "Timesteps"],
      answer: 1,
      explain: "It cuts the latent into patches and processes them with attention.",
    },
    {
      kind: "text",
      q: "A 512 × 512 RGB image has 786,432 values. A latent is 64 × 64 × 4. How many times smaller is the latent?",
      format: "**",
      accept: ["48", "48x"],
      explain: "64 × 64 × 4 = 16,384, and 786,432 ÷ 16,384 = 48.",
    },
    {
      kind: "text",
      q: "A DiT's token count grows 3 times. By what factor do attention pairs grow?",
      format: "*",
      accept: ["9", "9x"],
      explain: "Attention pairs follow the square of the token count, and 3 × 3 = 9.",
    },
  ],
};

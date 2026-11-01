import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why fewer steps normally damage image quality",
    "Compare better solvers, distilled models and straighter paths",
    "Calculate the real speedup once fixed pipeline stages are included",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: quality has been costing 60 passes",
      body: (
        <>
          <p>
            A standard diffusion run needs around 30 steps, and CFG doubles that to 60 denoiser
            passes. That's a few seconds per image, and a lot of GPU time at scale. For interactive
            features like live previews, it's far too slow.
          </p>
          <p>
            So why not run 4 steps? Because sampling is a numerical approximation. The true path from
            noise to image is a curve, and each step assumes the path is straight for a short distance.
            With small steps, that's nearly true. With large steps, the guess overshoots and the image
            turns blurry, smeared or noisy.
          </p>
          <p>
            Imagine driving a winding road while only glancing up every so often. Glance every second
            and you stay on the road. Glance every ten seconds and you crash. To glance less, you can
            do one of three things: predict the road better, take a course on this exact road, or
            straighten the road.
          </p>
          <Table
            head={["Approach", "Road analogy", "Retrain?", "Typical steps"]}
            rows={[
              ["Better solvers", "Predict the bend", "No", "Often 15 to 25"],
              ["Distilled models", "Learn this exact road", "Yes", "1 to 8"],
              ["Straighter paths", "Straighten the road", "Yes, at model design", "Varies"],
            ]}
          />
          <p>Step ranges are rough guides, and results depend on the model.</p>
        </>
      ),
    },
    {
      id: "solvers",
      title: "Better solvers: no retraining",
      body: (
        <>
          <p>
            A <strong>solver</strong> is the math inside the scheduler that takes a noise prediction
            and moves the latent forward. The basic methods take simple first-order steps. Smarter
            ones, such as DPM-Solver++ and UniPC, use more of the path's structure, or reuse earlier
            predictions to estimate the curve. They get the same denoiser closer to the true path.
          </p>
          <p>This is the cheapest speedup available, as it's a one-line change in Diffusers:</p>
          <pre>
            <code>{`from diffusers import DPMSolverMultistepScheduler

pipe.scheduler = DPMSolverMultistepScheduler.from_config(
    pipe.scheduler.config
)
image = pipe(prompt, num_inference_steps=20).images[0]`}</code>
          </pre>
          <p>
            No new model is needed, and you keep CFG and negative prompts. But solvers hit a limit.
            Below a certain step count, the denoiser's predictions alone don't carry enough
            information, so quality falls quickly.
          </p>
        </>
      ),
    },
    {
      id: "distilled",
      title: "Distilled models: teach big jumps directly",
      body: (
        <>
          <p>
            <strong>Step distillation</strong> trains a new model to take large jumps in one call. It's
            the same teacher and student idea from Fine-Tuning &amp; Distillation, applied to steps
            rather than size. The teacher is a normal diffusion model, and the student learns to
            reach, in one step, what the teacher reaches in several.
          </p>
          <p>Several families do this in different ways:</p>
          <ul>
            <li>
              <strong>Progressive distillation:</strong> halve the step count repeatedly, each student
              becoming the next teacher.
            </li>
            <li>
              <strong>Consistency approaches, such as LCM:</strong> train the model so that predictions
              from different noise levels agree on the same final image.
            </li>
            <li>
              <strong>Adversarial approaches, such as SDXL Turbo and SDXL-Lightning:</strong> add a
              discriminator, a network that spots fakes, so one or a few steps still look sharp.
            </li>
          </ul>
          <p>
            These models usually work without CFG, which is where much of the speedup comes from.
            Without CFG, each step needs one pass instead of two. SDXL Turbo is run this way:
          </p>
          <pre>
            <code>{`import torch
from diffusers import AutoPipelineForText2Image

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo",
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")

image = pipe(
    prompt="a lighthouse at dusk",
    num_inference_steps=1,
    guidance_scale=0.0,
).images[0]`}</code>
          </pre>
          <Callout tone="warn">
            There are costs to read before you switch. With no CFG, negative prompts stop working.
            Variety between seeds can fall, and fine detail often suffers. A checkpoint may also have
            its own resolution limits and license, so check its model card.
          </Callout>
        </>
      ),
    },
    {
      id: "straight",
      title: "Straighter paths and reusing work",
      body: (
        <>
          <p>
            If curves are the problem, train a model whose paths are straighter. That's the idea
            behind <strong>rectified flow</strong>, a form of flow matching. A straight path has less
            error for a large step, so fewer steps go further. FLUX.1 uses flow matching, and its
            schnell variant is distilled to run in about 4 steps.
          </p>
          <p>
            A separate family of tricks reduces the cost of each step rather than the number of
            steps. Nearby steps produce similar internal features, so a <strong>step cache</strong> can
            reuse some of them and skip part of the network. This trades some quality for speed, and
            it's most useful at higher step counts.
          </p>
        </>
      ),
    },
    {
      id: "arithmetic",
      title: "Worked example: the real speedup",
      body: (
        <>
          <p>
            Fewer steps only speed up denoising. Text encoding and VAE decoding stay the same, and they
            set a floor. Using the illustrative timings from the Diffusion Models lesson, with 40 ms per
            pass, 20 ms of text encoding and 200 ms of VAE decoding:
          </p>
          <Formula>total time = text encode + (steps × passes per step × pass time) + VAE decode</Formula>
          <pre>
            <code>{`Standard (30 steps, CFG):
  20 + (30 × 2 × 40) + 200 = 2,620 ms
  60 passes

Distilled (4 steps, no CFG):
  20 + (4 × 1 × 40) + 200 = 380 ms
  4 passes

Denoising speedup: 2,400 ÷ 160 = 15 times
Overall speedup:   2,620 ÷ 380 = about 6.9 times`}</code>
          </pre>
          <p>
            Denoising got 15 times faster, but the whole request only 6.9 times. After the change, the
            VAE decoder is over half the total time (200 ÷ 380), which is a big shift. The bottleneck
            has moved. If you want to go faster now, a faster VAE matters more than removing another
            step.
          </p>
          <p>
            Throughput still improves greatly. One GPU goes from about 1,374 images per hour (3,600 ÷
            2.62) to about 9,474 (3,600 ÷ 0.38), which cuts the GPU cost per image by the same 6.9
            times.
          </p>
          <Callout tone="tip">
            A common product pattern uses both. Show fast drafts from a few-step model, then
            generate the final image the user picks with a slower, higher-quality pipeline.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Large steps follow a curved path badly, so quality falls as step count drops.",
    "Better solvers need no retraining, but they hit a limit.",
    "Distilled models learn big jumps and often drop CFG, which halves passes per step.",
    "Straighter paths from flow matching make large steps less harmful.",
    "Fixed stages cap the overall speedup, and the bottleneck can move to the VAE.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You want a faster pipeline without training anything or changing the model. What should you try?",
      options: ["A better solver", "Progressive distillation", "Consistency training", "A new discriminator"],
      answer: 0,
      explain: "Solvers change only the scheduler math, so the same weights work.",
    },
    {
      kind: "mcq",
      q: "A distilled model runs with guidance scale 0. Which feature stops working?",
      options: ["Text prompts", "Negative prompts", "Seeds", "The VAE"],
      answer: 1,
      explain: "Negative prompts work through CFG, so with no CFG they have no effect.",
    },
    {
      kind: "text",
      q: "Text encoding takes 30 ms and VAE decoding 170 ms. The pass time is 50 ms. With 4 steps and no CFG, what is the total time in ms?",
      format: "***",
      accept: ["400", "400ms", "400 ms"],
      explain: "30 + (4 × 1 × 50) + 170 = 30 + 200 + 170 = 400 ms.",
    },
    {
      kind: "text",
      q: "Going from 30 steps with CFG to 2 steps without CFG reduces denoiser passes by what factor?",
      format: "**",
      accept: ["30", "30x"],
      explain: "60 passes ÷ 2 passes = 30.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Explain how a diffusion model turns noise into an image",
    "Describe the sampling loop and what a scheduler does",
    "Calculate forward passes per image, including classifier-free guidance",
    "Contrast the cost shape of diffusion with LLM decoding",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: creating an image in one shot is hard",
      body: (
        <>
          <p>
            An LLM generates one token at a time, and each token is a choice from a list. An image is
            different. It's millions of values that must all agree with each other: shadows must
            match the light, and a hand needs five fingers. Producing all of that in a single pass is
            very hard to learn.
          </p>
          <p>
            A <strong>diffusion model</strong> sidesteps this by breaking the job into many small,
            easy ones. It starts with pure random noise and removes a little at a time, until an image
            remains. No single step has to be perfect, because the next one can correct it.
          </p>
          <p>
            Think of restoring an old photo covered in heavy static. Cleaning it all at once seems
            impossible. But making it very slightly clearer is manageable, and you can repeat that
            step. A sculptor works much the same way, with rough shapes first and fine detail last.
          </p>
          <p>
            That design decides everything about serving these models. Generating one image means
            running a large neural network dozens of times.
          </p>
        </>
      ),
    },
    {
      id: "training",
      title: "How the model learns",
      body: (
        <>
          <p>
            Training rests on a neat trick. Destroying an image is easy, so we create the training
            data by doing exactly that. Take a clean image and mix in random noise:
          </p>
          <Formula>noisy image = a(t) × clean image + b(t) × noise</Formula>
          <p>
            Here <code>t</code> is the <strong>timestep</strong>, a number that says how far along the
            process we are. At a small <code>t</code>, the image is nearly clean. At a large{" "}
            <code>t</code>, it's almost all noise. The functions <code>a(t)</code> and{" "}
            <code>b(t)</code> come from a fixed noise schedule.
          </p>
          <p>
            The network, called the <strong>denoiser</strong>, gets the noisy image and{" "}
            <code>t</code>, and predicts the noise that was added. We know the true noise, since we
            added it, so we can measure the error and train on it. Repeat this over millions of images
            at every noise level, and the model learns what real images look like at each stage of
            blur.
          </p>
          <Callout tone="note">
            Many newer models use <strong>flow matching</strong>, where the network predicts a
            direction from noise toward the image rather than the noise itself. The math differs, but
            for serving it's the same shape: a loop of repeated network calls.
          </Callout>
        </>
      ),
    },
    {
      id: "sampling",
      title: "The sampling loop",
      body: (
        <>
          <p>
            At inference, we run the process in reverse. This loop is called{" "}
            <strong>sampling</strong>, and the component that manages it is the{" "}
            <strong>scheduler</strong>, also known as the sampler. The scheduler picks which timesteps
            to visit, and how to use each noise prediction to update the image.
          </p>
          <p>
            Using the Diffusers library, the loop looks like this. Pipelines normally run it for you,
            but it's worth seeing once:
          </p>
          <pre>
            <code>{`scheduler.set_timesteps(30)

for t in scheduler.timesteps:
    # Run the conditional and unconditional inputs as a batch of two.
    doubled = torch.cat([latents, latents])
    doubled = scheduler.scale_model_input(doubled, t)

    noise = unet(doubled, t, encoder_hidden_states=embeds).sample

    uncond, cond = noise.chunk(2)
    guided = uncond + scale * (cond - uncond)

    latents = scheduler.step(guided, t, latents).prev_sample`}</code>
          </pre>
          <p>
            Two details matter for performance. First, the number of steps is chosen before the run
            and stays fixed. Second, each step processes the entire image, so every step costs about
            the same.
          </p>
        </>
      ),
    },
    {
      id: "guidance",
      title: "Classifier-free guidance doubles the work",
      body: (
        <>
          <p>
            How does a prompt steer the result? The denoiser receives text embeddings, which pull
            each step toward the description. But this pull alone tends to be weak. The common fix is{" "}
            <strong>classifier-free guidance</strong>, or CFG.
          </p>
          <p>
            In the loop above, the model makes two predictions at each step: one with your prompt and
            one without it. The gap between them shows the direction your prompt adds. We then push
            further in that direction:
          </p>
          <Formula>guided = uncond + scale × (cond − uncond)</Formula>
          <p>
            The <strong>guidance scale</strong> sets how hard to push. A value of 1 just gives the
            prompted prediction. Higher values follow the prompt more strictly, and very high ones can
            look harsh and oversaturated. The negative prompt feature works by replacing the empty
            prompt with text you want to avoid.
          </p>
          <p>
            The inference cost is simple. Two predictions per step means two forward passes, or one
            pass at double the batch size.
          </p>
          <Formula>forward passes = steps × 2 (with CFG)</Formula>
        </>
      ),
    },
    {
      id: "cost",
      title: "Worked example: what one image costs",
      body: (
        <>
          <p>
            Take illustrative timings on one GPU: 40 ms per forward pass, 20 ms to encode the prompt,
            and 200 ms to turn the final result into pixels. Those last two stages are covered in
            Image Generation Architectures.
          </p>
          <pre>
            <code>{`Forward passes:  30 steps × 2 = 60
Denoising time:  60 × 40 ms   = 2,400 ms
Text encoding:                     20 ms
Final decode:                     200 ms
Total:                          2,620 ms, about 2.6 s

Images per hour on one GPU: 3,600 s ÷ 2.62 s = about 1,374`}</code>
          </pre>
          <p>
            Denoising is over 90% of the time here (2,400 ÷ 2,620). So the two things that matter most
            are the number of steps and the time per step. The Few-Step Image Generation lesson works
            on the first.
          </p>
          <p>Compared with LLM serving, the cost shape is quite different:</p>
          <Table
            head={["", "LLM decode", "Diffusion"]}
            rows={[
              ["Work per step", "One new token", "The whole image"],
              ["Number of steps", "Unknown until the model stops", "Fixed in advance"],
              ["State between steps", "Growing KV cache", "A fixed-size image or latent"],
              ["Result streaming", "Natural, token by token", "Only low-quality previews"],
              ["Runtime predictability", "Varies by request", "Very predictable for fixed settings"],
            ]}
          />
          <Callout tone="tip">
            Predictable runtime is a gift. Requests with the same size and step count can be batched
            neatly, since they all finish together. Letting users pick any size and step count takes
            that away, so offer a few presets instead.
          </Callout>
          <Callout tone="warn">
            Requests with the same seed, model and settings usually give matching images on the same
            setup. But a change of hardware, library version or precision can change the output. Don't
            promise exact reproducibility across deployments.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Diffusion turns noise into an image over many small denoising steps.",
    "Training adds known noise to images and teaches a network to predict it.",
    "The scheduler chooses the timesteps and applies each prediction.",
    "Classifier-free guidance makes two predictions per step, which doubles the forward passes.",
    "Unlike LLM decoding, each step processes the full image and the step count is fixed.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does the denoiser usually predict during training?",
      options: [
        "The next token",
        "The noise that was added to the image",
        "The prompt text",
        "The number of steps",
      ],
      answer: 1,
      explain: "We added the noise ourselves, so we know the right answer and can train on it.",
    },
    {
      kind: "mcq",
      q: "Which is true of diffusion but not of LLM decoding?",
      options: [
        "It needs a GPU",
        "It uses a neural network",
        "The number of steps is fixed before the run",
        "It can handle many requests",
      ],
      answer: 2,
      explain: "An LLM stops when it decides to. A diffusion run has a preset step count.",
    },
    {
      kind: "text",
      q: "A run uses 40 steps with classifier-free guidance. How many denoiser forward passes does it need?",
      format: "**",
      accept: ["80"],
      explain: "40 × 2 = 80.",
    },
    {
      kind: "text",
      q: "What does CFG stand for?",
      format: "**********-**** ********",
      accept: ["classifier-free guidance", "classifier free guidance"],
      explain: "Classifier-free guidance compares predictions with and without the prompt.",
    },
  ],
};

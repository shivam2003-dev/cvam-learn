import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain why image and video generation tend to be compute-bound",
    "Calculate cost from step count and per-step time",
    "Show how video multiplies tokens and attention cost",
  ],
  tasks: [
    {
      id: "different",
      title: "A different shape of work",
      body: (
        <>
          <p>
            An LLM decodes by generating a token, then reading all weights again for the next one.
            A diffusion model works differently: it processes a whole image, or a whole video
            clip, at every step. There's no slow token-by-token loop, but each step is heavy.
          </p>
          <p>
            That heavy step processes thousands of image patches at once. Each weight is reused
            across all of them, which gives high arithmetic intensity. So image and video models
            usually sit on the compute side of the roofline, the opposite of LLM decoding.
          </p>
        </>
      ),
    },
    {
      id: "steps",
      title: "Cost is steps times step time",
      body: (
        <>
          <p>
            Generation repeats a denoising step many times. Total time is the number of steps
            multiplied by the time of one forward pass of the main network.
          </p>
          <pre>
            <code>{`30 steps × 0.5 s per step  =  15 seconds

Cut to 6 steps (few-step methods):  6 × 0.5 s  =  3 seconds`}</code>
          </pre>
          <p>
            That makes step count the most important lever, which is why few-step methods are so
            valuable. Cost also scales with image size, because larger images mean more patches
            per step.
          </p>
          <Callout tone="tip">
            Some pipelines run a guidance technique that does two network passes per step, so
            always check how many forward passes one step really costs when you estimate time.
          </Callout>
        </>
      ),
    },
    {
      id: "video",
      title: "Video multiplies everything",
      body: (
        <>
          <p>
            A video model must also model time. Compare the token counts, using illustrative
            numbers:
          </p>
          <Table
            head={["Content", "Latent patches", "Calculation"]}
            rows={[
              ["One image", "1,024", "A 32 × 32 grid of patches"],
              ["16 frames of video", "16,384", "1,024 patches × 16 frames"],
            ]}
          />
          <p>
            Sixteen times more tokens means roughly sixteen times more work in the layers that
            scale linearly. Attention is worse. If every patch attends to every other, cost grows
            with the square of the token count, so 16 times the tokens means about{" "}
            <strong>256 times</strong> the attention work.
          </p>
          <p>
            This is why video generation is so expensive, and why models use tricks such as
            attending only within windows or across compressed representations.
          </p>
        </>
      ),
    },
    {
      id: "other-costs",
      title: "Costs outside the main network",
      body: (
        <>
          <p>The denoiser isn't the only expense:</p>
          <ul>
            <li>
              <strong>Text encoding</strong> happens once per request and is usually small.
            </li>
            <li>
              <strong>The decoder that turns latents back into pixels</strong> can be surprisingly
              heavy at high resolution, especially for video, and may need tiling to fit in memory.
            </li>
            <li>
              <strong>Memory</strong> can run out before compute does, since activations for long
              videos are large.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Diffusion processes a whole image or clip per step, so it's usually compute-bound.",
    "Total time equals step count times the time of one step.",
    "Fewer steps give the biggest speedup.",
    "Video multiplies patches by frames, and attention can grow with the square.",
    "The pixel decoder and activation memory can also become bottlenecks.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A pipeline runs 40 steps at 0.25 seconds each. How many seconds does it take?",
      format: "**",
      accept: ["10"],
      explain: "40 × 0.25 = 10 seconds.",
    },
    {
      kind: "mcq",
      q: "Why are diffusion models usually compute-bound while LLM decoding is memory-bound?",
      options: [
        "They use smaller weights",
        "Each step processes many patches at once, so weights are heavily reused",
        "They run on CPUs",
        "They don't use matrices",
      ],
      answer: 1,
      explain: "High weight reuse means high arithmetic intensity.",
    },
    {
      kind: "text",
      q: "A clip has 24 frames of 1,000 patches each. How many tokens is that in total?",
      format: "*****",
      accept: ["24000", "24,000"],
      explain: "24 × 1,000 = 24,000.",
    },
    {
      kind: "mcq",
      q: "If token count rises 4 times and attention cost grows with its square, attention work rises by how much?",
      options: ["4 times", "8 times", "16 times", "64 times"],
      answer: 2,
      explain: "4² = 16.",
    },
  ],
};

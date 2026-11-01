import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Explain what a reference implementation is and why it matters",
    "Run an LLM with Transformers and an image pipeline with Diffusers",
    "List the limits that push production traffic onto an engine",
    "Use a reference implementation to check an engine's output",
  ],
  tasks: [
    {
      id: "reference",
      title: "What a reference implementation is for",
      body: (
        <>
          <p>
            When a new model appears, you want to run it today, not after a month of engineering.
            You also need something to trust: if a fast engine gives odd answers, how do you know
            whether the engine or the model is at fault?
          </p>
          <p>
            Hugging Face's <strong>Transformers</strong> (for text and multimodal models) and{" "}
            <strong>Diffusers</strong> (for image and video generation) solve both problems. They
            hold readable PyTorch definitions of a large number of models, often available soon
            after release. They're <strong>reference implementations</strong>: code written to be
            correct and clear, rather than as fast as possible.
          </p>
          <p>
            A reference implementation is like a recipe from the chef who invented the dish. It
            shows what the result should taste like. It isn't how a busy restaurant gets 500 plates
            out each night.
          </p>
        </>
      ),
    },
    {
      id: "transformers",
      title: "Running an LLM with Transformers",
      body: (
        <>
          <p>
            Three pieces matter: a <strong>tokenizer</strong> turns text into token IDs, a{" "}
            <strong>chat template</strong> formats messages the way the model was trained to see
            them, and <code>generate</code> runs the decode loop.
          </p>
          <pre>
            <code>{`import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

name = "Qwen/Qwen2.5-7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(
    name, dtype=torch.bfloat16, device_map="auto"
)

messages = [{"role": "user", "content": "Explain the KV cache in one line."}]
inputs = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    return_tensors="pt",
    return_dict=True,
).to(model.device)

output = model.generate(**inputs, max_new_tokens=64, do_sample=False)
new_tokens = output[0][inputs["input_ids"].shape[1]:]
print(tokenizer.decode(new_tokens, skip_special_tokens=True))`}</code>
          </pre>
          <p>
            Setting <code>do_sample=False</code> picks the most likely token each time, so runs are
            easy to compare. Note the slice: <code>generate</code> returns the prompt plus the new
            tokens, so you cut the prompt off before decoding.
          </p>
          <Callout tone="warn">
            When you batch prompts of different lengths, set{" "}
            <code>tokenizer.padding_side = "left"</code>. A decoder model continues from the last
            position, so padding on the right makes it generate after the padding tokens, and
            output quality drops.
          </Callout>
        </>
      ),
    },
    {
      id: "diffusers",
      title: "Running an image pipeline with Diffusers",
      body: (
        <>
          <p>
            An image model is a pipeline of several models, not one. A text encoder reads the
            prompt. A denoiser (a UNet or a transformer) cleans up noise over many steps. A VAE, or
            variational autoencoder, turns the final compressed result into pixels. A{" "}
            <strong>scheduler</strong> is the algorithm that decides how much noise to remove at
            each step.
          </p>
          <pre>
            <code>{`import torch
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler

pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe.to("cuda")

image = pipe(
    "a lighthouse at dusk",
    num_inference_steps=30,
    guidance_scale=7.0,
).images[0]
image.save("out.png")`}</code>
          </pre>
          <p>
            The cost is easy to estimate. With classifier-free guidance, a technique that steers
            the image toward the prompt, the denoiser predicts twice per step: once with the prompt
            and once without.
          </p>
          <Formula>denoiser predictions = steps × 2</Formula>
          <p>
            So 30 steps means 60 predictions. At an illustrative 40 ms each, denoising takes 2.4
            seconds, and the text encoder and VAE add a little more. This is why the denoiser is
            where you spend your optimization effort.
          </p>
          <Callout tone="tip">
            On a smaller GPU, <code>pipe.enable_model_cpu_offload()</code> keeps only the active
            component on the GPU. Call it instead of <code>pipe.to("cuda")</code>. You trade speed
            for memory, so it suits development better than busy production.
          </Callout>
        </>
      ),
    },
    {
      id: "limits",
      title: "Where they stop being enough",
      body: (
        <>
          <p>
            A plain <code>generate</code> call runs one fixed batch from start to finish. That's
            fine in a notebook, but a server faces requests that arrive at random, with different
            lengths. Consider four prompts of 10, 20, 30 and 300 tokens in one batch. Each is
            padded to 300:
          </p>
          <pre>
            <code>{`Real tokens:   10 + 20 + 30 + 300 = 360
Padded slots:  4 × 300 = 1,200
Useful share:  360 ÷ 1,200 = 30%`}</code>
          </pre>
          <p>
            So 70% of the prefill work is on padding. Output lengths waste capacity the same way,
            because the batch waits for its slowest member.
          </p>
          <Table
            head={["Need", "Reference library", "Inference engine"]}
            rows={[
              ["Run a brand-new model", "Usually first", "May lag behind"],
              ["Read and modify the code", "Easy", "Harder"],
              ["Mid-flight request scheduling", "Not the plain generate path", "Core feature"],
              ["KV cache paging and prefix reuse", "Limited", "Core feature"],
              ["Network API, metrics, load handling", "Build it yourself", "Included"],
            ]}
          />
          <p>
            Recent Transformers releases have added some serving features of their own, so check
            what your version offers. The general split still holds: use the library to learn and
            verify, and an engine such as vLLM or SGLang to serve.
          </p>
          <p>
            Image pipelines are different. They have no token-by-token loop to schedule, so
            production image services often stay closer to Diffusers, with their own queue and
            compiled components around it.
          </p>
        </>
      ),
    },
    {
      id: "golden",
      title: "Use it as your source of truth",
      body: (
        <>
          <p>
            The library stays useful even after you've moved to an engine. Engines reimplement
            models for speed, and mistakes can creep in. A wrong chat template or a bug in a new
            architecture can give answers that look fine and score worse.
          </p>
          <p>A simple test catches most of these:</p>
          <ol>
            <li>Run fixed prompts through Transformers with sampling off, and save the output.</li>
            <li>Run the same prompts through your engine, also with sampling off.</li>
            <li>Compare token IDs. If the prompts tokenize differently, look there first.</li>
          </ol>
          <Callout tone="note">
            Small differences are normal. Different kernels and precisions round slightly
            differently, so tokens may diverge late in a long output. Early divergence on many
            prompts deserves a closer look.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Transformers and Diffusers are reference implementations: correct and readable before fast.",
    "Chat templates and tokenizers are part of the model, so errors there change the output.",
    "Fixed batches waste capacity on padding and on waiting for the slowest request.",
    "Image pipelines spend most of their time in the denoiser, at steps × 2 with guidance.",
    "Keep the reference library as a correctness check even after moving to an engine.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which side should you pad on when batching prompts for generation with a decoder model?",
      options: ["Right", "Left", "Both", "Padding doesn't matter"],
      answer: 1,
      explain: "The model continues from the final position, so that position must be real text and not padding.",
    },
    {
      kind: "mcq",
      q: "What's the main reason to compare an engine's output with Transformers?",
      options: [
        "Transformers is faster",
        "Engines can't run on GPUs",
        "To catch template or implementation errors that a speed test won't show",
        "To lower the token price",
      ],
      answer: 2,
      explain: "A fast engine can still be subtly wrong, and only an output comparison reveals it.",
    },
    {
      kind: "text",
      q: "An image pipeline uses 25 steps with classifier-free guidance. How many denoiser predictions does it make?",
      format: "**",
      accept: ["50"],
      explain: "25 steps × 2 predictions = 50.",
    },
    {
      kind: "text",
      q: "A batch has prompts of 50, 50, 100 and 200 tokens, all padded to 200. What percentage of the slots hold real tokens?",
      format: "**",
      accept: ["50", "50%"],
      explain: "Real tokens are 400 and slots are 4 × 200 = 800, so 400 ÷ 800 = 50%.",
    },
  ],
};

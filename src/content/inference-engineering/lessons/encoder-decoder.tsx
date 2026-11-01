import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Describe what a neural network computes during inference",
    "Explain the encoder-decoder pattern and where it appears",
    "Predict how a model's architecture shapes its serving costs",
  ],
  tasks: [
    {
      id: "networks",
      title: "A neural network is mostly matrix math",
      body: (
        <>
          <p>
            A neural network is a stack of layers. Each layer multiplies its input by a matrix of
            learned weights, applies a simple nonlinear function, and passes the result on. Text,
            images and audio are all first turned into arrays of numbers called{" "}
            <strong>tensors</strong>.
          </p>
          <p>
            During inference, you run this stack forward. That's why GPUs dominate this field:
            they're built to do huge numbers of multiply and add operations in parallel.
          </p>
          <p>Two model properties immediately affect your serving bill:</p>
          <ul>
            <li>
              <strong>Parameter count</strong> sets memory. A 7 billion parameter model at 2 bytes
              each needs about 14 GB just to hold its weights.
            </li>
            <li>
              <strong>Operations per input</strong> set compute time, and so your latency and
              throughput.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "pattern",
      title: "The encoder-decoder pattern",
      body: (
        <>
          <p>
            Many models split into two parts. An <strong>encoder</strong> reads the input and
            compresses it into an internal representation. A <strong>decoder</strong> uses that
            representation to produce the output.
          </p>
          <p>
            A human translator works the same way: first read and understand a sentence, then
            write it in the other language. The original 2017 Transformer was built exactly like
            this for translation, with the decoder reading the encoder's output through{" "}
            <strong>cross-attention</strong>.
          </p>
          <Table
            head={["Model type", "Encoder", "Decoder"]}
            rows={[
              ["Speech recognition (Whisper)", "Audio to features", "Features to text, token by token"],
              ["Image generation (VAE)", "Image to latent space", "Latent back to pixels"],
              ["Vision language model", "Image to embeddings", "An LLM reads them with the prompt"],
              ["Embedding model", "Text to one vector", "None"],
            ]}
          />
        </>
      ),
    },
    {
      id: "llm",
      title: "Where LLMs fit",
      body: (
        <>
          <p>
            Most modern chat LLMs are <strong>decoder-only</strong>. There's no separate encoder: the
            prompt and the response share one sequence, and the model continues it.
          </p>
          <p>
            Prefill is still a bit like encoding, since it reads the whole prompt in one pass.
            But it uses the same layers and the same weights as decode, and it fills the KV cache
            for what comes next.
          </p>
        </>
      ),
    },
    {
      id: "serving",
      title: "Why serving engineers care",
      body: (
        <>
          <p>Encoder-decoder models have a helpful property: the two parts run at different rates.</p>
          <ul>
            <li>The encoder usually runs once per input.</li>
            <li>The decoder runs many times, once per output step.</li>
          </ul>
          <p>
            That lets you treat them as separate jobs. You can cache encoder output, so re-asking
            about the same image doesn't re-encode it. You can also batch encoders separately, or
            even scale them on different hardware, which comes up again in the Autoscaling module.
          </p>
          <Callout tone="tip">
            When you meet a new model, ask three questions: which parts does it have, how often
            does each run per request, and how much memory does each need? Those answers shape
            nearly every serving decision.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Neural networks are stacks of learned matrix operations on tensors.",
    "Parameter count sets memory, and operations per input set compute time.",
    "Encoders read the input once. Decoders run once per output step.",
    "Chat LLMs are decoder-only, with prefill reading the prompt.",
    "Different parts can be cached, batched and scaled separately.",
  ],
  quiz: [
    {
      kind: "text",
      q: "A model has 10 billion parameters stored at 2 bytes each. How many GB do its weights need?",
      format: "**",
      accept: ["20"],
      explain: "10 billion × 2 bytes = 20 billion bytes, or about 20 GB.",
    },
    {
      kind: "mcq",
      q: "In a speech recognition model, which part usually runs many times per request?",
      options: ["The encoder", "The decoder", "Both run exactly once", "Neither runs on a GPU"],
      answer: 1,
      explain: "Audio is encoded once, but text is decoded step by step.",
    },
    {
      kind: "mcq",
      q: "How are modern chat LLMs structured?",
      options: [
        "Encoder-only",
        "Decoder-only, with the prompt and response in one sequence",
        "Separate encoder and decoder weights",
        "Rule-based lookup",
      ],
      answer: 1,
      explain: "Chat LLMs continue a single sequence, without a separate encoder.",
    },
  ],
};

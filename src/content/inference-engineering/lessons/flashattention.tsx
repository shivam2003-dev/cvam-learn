import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Hard",
  objectives: [
    "Explain why textbook attention wastes memory bandwidth",
    "Describe how tiling and online softmax avoid storing the score matrix",
    "Estimate the memory traffic that FlashAttention removes",
    "Turn on a fast attention kernel in PyTorch and confirm it is in use",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: attention is a memory problem",
      body: (
        <>
          <p>
            Attention is the most expensive operation in an LLM during prefill, the phase that
            processes the whole prompt. In its textbook form it has three steps:
          </p>
          <ol>
            <li>Multiply queries by keys to get a score for every pair of tokens.</li>
            <li>Run softmax over each row of scores to get weights.</li>
            <li>Multiply those weights by the values.</li>
          </ol>
          <Formula>attention = softmax(Q × Kᵀ ÷ √d) × V</Formula>
          <p>
            The score matrix has one entry per pair of tokens, so it grows with the square of the
            sequence length. A naive kernel writes that whole matrix out to high-bandwidth memory
            (HBM), reads it back for softmax, writes the weights, and reads them again for the
            final multiply. Each trip costs bandwidth, and the matrix isn't useful in itself. It's
            a temporary value on the way to the output.
          </p>
          <p>
            <strong>FlashAttention</strong>, from Tri Dao and colleagues, removes that round trip.
            It's a fused kernel: one routine that does all three steps together on the GPU. The
            output is the same exact attention, not an approximation. The model and its weights
            don't change.
          </p>
          <Callout tone="note">
            Think of a chef who needs a sauce. The slow way is to carry each ingredient to the
            pantry between steps. The fast way is to keep a small batch on the counter, finish it
            there, and only send the final sauce to storage.
          </Callout>
        </>
      ),
    },
    {
      id: "arithmetic",
      title: "How much traffic are we talking about?",
      body: (
        <>
          <p>Take an illustrative prompt of 8,000 tokens, 16 heads, and 16-bit scores:</p>
          <pre>
            <code>{`Scores per head:  8,000 × 8,000 = 64,000,000
Bytes per head:   64,000,000 × 2 = 128 MB
Bytes per layer:  128 MB × 16 heads = 2,048 MB ≈ 2 GB`}</code>
          </pre>
          <p>
            That's about 2 GB of temporary data for one layer of one sequence, and it would be
            written and read more than once. Across a batch of 8 sequences, it's about 16 GB per
            layer. Memory holding those temporaries can't be used for KV caches, and the bandwidth
            spent on them can't be used for anything else.
          </p>
          <p>
            Doubling the prompt to 16,000 tokens quadruples the matrix to 8 GB per layer, because
            the size depends on the square of the length. Long prompts are where this cost hurts
            most.
          </p>
        </>
      ),
    },
    {
      id: "tiling",
      title: "Trick one: tiling",
      body: (
        <>
          <p>
            A GPU has a small, very fast on-chip memory (SRAM) as well as large, slower HBM.
            Moving data within SRAM is far cheaper than going out to HBM. FlashAttention splits Q,
            K and V into <strong>tiles</strong> small enough to fit in that SRAM. For each tile
            pair it:
          </p>
          <ol>
            <li>Loads one tile of Q, K and V from HBM into SRAM.</li>
            <li>Computes that tile's scores in SRAM.</li>
            <li>Folds the result into a running total for each output row.</li>
            <li>Throws the tile's scores away.</li>
          </ol>
          <p>
            The arithmetic is unchanged, so the time complexity is still quadratic in sequence
            length. What changes is the number of HBM accesses. The score matrix is never written
            out at all, and the extra working memory scales with the sequence length rather than
            its square.
          </p>
          <Table
            head={["", "Textbook kernel", "FlashAttention"]}
            rows={[
              ["Score matrix in HBM", "Yes, full size", "Never written"],
              ["Extra memory", "Grows with length squared", "Grows with length"],
              ["Compute (FLOPs)", "Quadratic", "Quadratic, slightly more"],
              ["Result", "Exact", "Exact"],
            ]}
          />
          <p>
            Notice the third row. FlashAttention can do slightly more math, yet it runs faster.
            That's the key idea: on a GPU, avoiding memory trips can matter more than counting
            operations.
          </p>
        </>
      ),
    },
    {
      id: "online-softmax",
      title: "Trick two: online softmax",
      body: (
        <>
          <p>
            Tiling has an obvious obstacle. Softmax needs every score in a row, because each
            weight is divided by a sum across that row. If you only see one tile at a time, how
            can you normalize?
          </p>
          <p>
            <strong>Online softmax</strong> computes it in pieces. Keep two running values per
            row: the largest score so far, m, and a sum, l. When a new tile raises the maximum,
            rescale the old sum:
          </p>
          <Formula>l′ = l × exp(m − m′) + Σ exp(s − m′)</Formula>
          <p>Here's a small worked example with scores 2 and 1 in the first tile, then 3:</p>
          <pre>
            <code>{`First tile:  m = 2
             l = exp(2-2) + exp(1-2) = 1 + 0.368 = 1.368

Next tile:   m' = 3
             l' = 1.368 × exp(2-3) + exp(3-3)
                = 1.368 × 0.368 + 1 = 1.503

Check, all at once with max 3:
             exp(-1) + exp(-2) + exp(0) = 0.368 + 0.135 + 1 = 1.503`}</code>
          </pre>
          <p>
            The answers match. The partial output is rescaled by the same factor, so it stays
            correct. Subtracting the maximum also keeps the exponentials in a safe range, which
            helps numerical stability in 16-bit floats.
          </p>
        </>
      ),
    },
    {
      id: "using-it",
      title: "Using it in practice",
      body: (
        <>
          <p>
            You rarely call FlashAttention yourself. Serving engines use it or a similar kernel by
            default. In PyTorch, <code>scaled_dot_product_attention</code> picks a backend for
            you, and you can force one to check it works for your inputs:
          </p>
          <pre>
            <code>{`import torch
import torch.nn.functional as F
from torch.nn.attention import sdpa_kernel, SDPBackend

device = "cuda"
q = torch.rand(1, 16, 8000, 64, device=device, dtype=torch.float16)
k = v = q

# Raises an error if the flash backend can't handle these inputs
with sdpa_kernel(SDPBackend.FLASH_ATTENTION):
    out = F.scaled_dot_product_attention(q, k, v, is_causal=True)`}</code>
          </pre>
          <p>In Hugging Face Transformers, choose it when loading the model:</p>
          <pre>
            <code>{`model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    attn_implementation="flash_attention_2",  # needs the flash-attn package
)
# "sdpa" uses PyTorch's built-in version instead`}</code>
          </pre>
          <p>
            FlashAttention has evolved with the hardware. Later versions added better parallelism
            on newer GPUs and, on Hopper, support for 8-bit floats. Exact speedups depend on GPU,
            sequence length and precision, so measure on your own setup.
          </p>
          <Callout tone="warn">
            FlashAttention mainly helps prefill. During decode, each request has just one new
            query, so the score matrix is a single row and there's little to avoid. Decode is held
            back by reading weights and the KV cache instead. Don't expect a faster attention
            kernel to fix slow streaming once a response has started.
          </Callout>
          <Callout tone="tip">
            Fall-backs are silent in many setups. An unusual attention mask or data type can push
            PyTorch onto a slower path. The forced-backend check above fails loudly, which makes
            it a useful test in your build pipeline.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Textbook attention writes a score matrix to HBM that grows with sequence length squared.",
    "FlashAttention fuses the whole operation into one kernel and never writes that matrix.",
    "Tiling keeps work in fast on-chip SRAM, and online softmax normalizes one tile at a time.",
    "The results are exact, so no model changes or quality checks for approximation are needed.",
    "The biggest gain is in prefill, because decode has only one query per step.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main thing FlashAttention avoids?",
      options: [
        "Computing the keys",
        "Writing the full score matrix to HBM",
        "Using softmax at all",
        "Loading the model weights",
      ],
      answer: 1,
      explain: "The score matrix is only a temporary. Keeping it out of HBM saves memory and bandwidth.",
    },
    {
      kind: "mcq",
      q: "How does the output of FlashAttention compare with standard attention?",
      options: [
        "It's a lower-quality approximation",
        "It needs retrained weights",
        "It's the same exact attention",
        "It only works for short prompts",
      ],
      answer: 2,
      explain: "It computes the same result in a different order, so the model doesn't change.",
    },
    {
      kind: "mcq",
      q: "Which phase benefits most from FlashAttention?",
      options: ["Prefill", "Decode", "Tokenization", "Detokenization"],
      answer: 0,
      explain: "Prefill has many queries and a large score matrix. Decode has a single query per step.",
    },
    {
      kind: "text",
      q: "If you double the sequence length, by what factor does the textbook score matrix grow?",
      format: "*",
      accept: ["4"],
      explain: "The matrix has one entry per token pair, so 2 × 2 = 4.",
    },
    {
      kind: "text",
      q: "What is the technique called that normalizes scores one tile at a time? Two words.",
      format: "****** *******",
      accept: ["online softmax"],
      explain: "Online softmax keeps a running maximum and sum, so it doesn't need all the scores at once.",
    },
  ],
};

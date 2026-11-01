import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Follow a token through an LLM from embedding to prediction",
    "Name the parts of a transformer block and what each does",
    "Tell which parts cost memory and which cost compute",
  ],
  tasks: [
    {
      id: "journey",
      title: "One forward pass",
      body: (
        <>
          <p>An LLM forward pass has three stages:</p>
          <ol>
            <li>
              <strong>Embedding.</strong> Each token ID becomes a vector of numbers. A lookup
              table with one row per vocabulary entry provides it.
            </li>
            <li>
              <strong>Transformer blocks.</strong> Those vectors pass through a stack of identical
              blocks, often dozens. This is where almost all the work happens.
            </li>
            <li>
              <strong>Output head.</strong> The final vector is projected to one score per
              vocabulary token. The sampler then picks the next token.
            </li>
          </ol>
        </>
      ),
    },
    {
      id: "block",
      title: "Inside a block",
      body: (
        <>
          <p>Each block has two main jobs, each wrapped with normalization and a skip connection:</p>
          <Table
            head={["Part", "What it does", "Cost"]}
            rows={[
              ["Normalization", "Keeps values in a stable range", "Very cheap"],
              ["Attention", "Lets tokens read from earlier tokens", "Heavy, and needs the KV cache"],
              ["Feed-forward network", "Processes each token independently", "Heavy, holds many of the weights"],
              ["Residual connections", "Add a layer's input back to its output", "Almost free"],
            ]}
          />
          <p>
            A helpful way to remember it: <strong>attention is communication</strong> between
            tokens, and the <strong>feed-forward network is computation</strong> on each token.
          </p>
          <pre>
            <code>{`def block(x):
    x = x + attention(norm(x))     # tokens share information
    x = x + feed_forward(norm(x))  # each token thinks alone
    return x`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "position",
      title: "Knowing word order",
      body: (
        <>
          <p>
            Attention by itself doesn't know the order of tokens. Models add position information
            to fix that. A widely used method is <strong>RoPE</strong>, or rotary position
            embeddings, which rotates query and key vectors by an amount based on position.
          </p>
          <p>
            For serving, position methods affect the maximum context a model supports, and how
            cleanly requests can be batched.
          </p>
        </>
      ),
    },
    {
      id: "costs",
      title: "What this means for performance",
      body: (
        <>
          <p>
            A model's name usually hides two numbers that matter: <strong>depth</strong> (number of
            blocks) and <strong>width</strong> (hidden size). Increasing either costs you.
          </p>
          <Table
            head={["Increase", "Effect on compute", "Effect on KV cache"]}
            rows={[
              ["Depth (more blocks)", "Linear", "Linear"],
              ["Width (hidden size)", "Roughly quadratic in the FFN", "Linear"],
              ["Context length", "More attention work", "Linear"],
            ]}
          />
          <Callout tone="note">
            Modern models often replace parts of this recipe: RMSNorm in place of LayerNorm, or
            Mixture of Experts in place of a single feed-forward network. The structure of
            communicate, then compute stays the same.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "An LLM runs embedding, a stack of transformer blocks, then an output head.",
    "Attention lets tokens communicate. The feed-forward network computes per token.",
    "Normalization and residual connections keep deep stacks stable.",
    "Position methods like RoPE tell the model about token order.",
    "Depth and width drive compute and KV cache costs.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which part of a block lets one token use information from others?",
      options: ["Normalization", "Attention", "Residual connection", "Tokenizer"],
      answer: 1,
      explain: "Attention is the communication step. The feed-forward network works on each token separately.",
    },
    {
      kind: "mcq",
      q: "Doubling the number of blocks does what to the KV cache?",
      options: ["Nothing", "Roughly doubles it", "Quadruples it", "Removes it"],
      answer: 1,
      explain: "Each block stores its own keys and values, so size grows linearly with depth.",
    },
    {
      kind: "text",
      q: "What does the acronym FFN stand for? Use a hyphen in the first part.",
      format: "****-******* *******",
      accept: ["feed-forward network", "feed forward network", "feedforward network"],
      explain: "The feed-forward network processes each token on its own.",
    },
  ],
};

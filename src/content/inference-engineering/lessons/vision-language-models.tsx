import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Trace an image through a vision language model",
    "Calculate how many tokens an image becomes",
    "Estimate the prefill and memory cost of images",
    "Apply limits, batching and caching to image traffic",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            An LLM only understands tokens. But users want to send a receipt, a chart or a
            screenshot and ask about it. A <strong>vision language model</strong> (VLM) handles
            this by turning an image into a sequence of vectors that looks like text to the LLM.
          </p>
          <p>
            The serving challenge is that an innocent-looking image can cost as much as a page of
            text or more. A user who attaches four photos may trigger more prefill work than a
            long prompt. To plan capacity, you need to see images as tokens.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "From pixels to tokens",
      body: (
        <>
          <p>Most VLMs follow the same five stages:</p>
          <ol>
            <li>
              <strong>Preprocess.</strong> Decode the JPEG or PNG, resize it, and normalize the
              pixel values. This usually runs on the CPU.
            </li>
            <li>
              <strong>Split into patches.</strong> Cut the image into small squares, often 14 or
              16 pixels wide.
            </li>
            <li>
              <strong>Encode.</strong> A <strong>vision encoder</strong>, usually a Vision
              Transformer (ViT), turns each patch into a vector while looking at all the other
              patches.
            </li>
            <li>
              <strong>Project and merge.</strong> A small network maps those vectors to the LLM's
              hidden size. They're placed in the prompt where the image belongs.
            </li>
            <li>
              <strong>Generate.</strong> From here, it's a normal LLM. Prefill reads text and
              image tokens together, then decode writes the answer.
            </li>
          </ol>
          <p>
            Think of a translator at a meeting. The vision encoder describes the picture in a
            language the LLM speaks. The translator speaks only once per image, but everything
            they said stays in the LLM's notes for the rest of the conversation.
          </p>
          <p>
            Those notes are the KV cache. Each image token takes up cache space, just like a text
            token. The encoder's job ends quickly, but the memory cost stays.
          </p>
        </>
      ),
    },
    {
      id: "token-count",
      title: "How many tokens is an image?",
      body: (
        <>
          <p>With one token per patch, the count follows from simple division:</p>
          <Formula>image tokens = (width ÷ patch size) × (height ÷ patch size)</Formula>
          <p>
            LLaVA-1.5 uses a fixed 336 × 336 input with 14-pixel patches. That's 24 × 24 = 576
            tokens, for every image, whatever its original size.
          </p>
          <p>
            Other models scale with the image. The Qwen VL family merges groups of patches, so
            one final token covers a 28-pixel square. An image of 1,008 × 756 pixels becomes 36 ×
            27 = 972 tokens. Exact rules differ by model, and processors often snap images to a
            multiple of the patch size. Always check the model's processor, and use it to count.
          </p>
          <Table
            head={["Image size", "Grid at 28 px per token", "Tokens"]}
            rows={[
              ["504 × 378", "18 × 13.5, snapped to about 18 × 14", "About 252"],
              ["1,008 × 756", "36 × 27", "972"],
              ["2,016 × 1,512", "72 × 54", "3,888"],
            ]}
          />
          <Callout tone="note" title="The rule to remember">
            Double the width and height, and you get four times the tokens. Resolution is the
            strongest cost lever you have.
          </Callout>
        </>
      ),
    },
    {
      id: "cost",
      title: "Worked example: four photos",
      body: (
        <>
          <p>
            A user sends four photos of 972 tokens each. Assume the LLM can prefill 20,000 tokens
            per second and uses 0.5 MiB of KV cache per token. These figures are illustrative.
          </p>
          <pre>
            <code>{`Image tokens:  4 × 972 = 3,888 tokens
Prefill time:  3,888 ÷ 20,000 ≈ 194 ms
KV memory:     3,888 × 0.5 MiB = 1,944 MiB ≈ 1.9 GiB`}</code>
          </pre>
          <p>
            That's before the encoder runs, and before any text. Add the encoder time and you get
            a simple model of first-token delay:
          </p>
          <Formula>TTFT ≈ queue + preprocess + encode + prefill</Formula>
          <p>
            Now look at chat. Each new turn normally resends the whole conversation, images
            included. Without caching, you'd decode and encode the same four photos on every
            turn. This is where caching helps:
          </p>
          <ul>
            <li>
              <strong>Embedding cache.</strong> Hash the image bytes and processing settings, and
              reuse the encoder output.
            </li>
            <li>
              <strong>Prefix cache.</strong> Reuse the KV cache for the earlier conversation,
              images included.
            </li>
          </ul>
          <Callout tone="warn">
            Image placeholders in a prompt can have identical token IDs. A prefix cache must
            include the image's content in its key. If it doesn't, two different images could
            share a cache entry, and the model would answer about the wrong picture.
          </Callout>
        </>
      ),
    },
    {
      id: "serving",
      title: "Serving VLMs in production",
      body: (
        <>
          <p>Clients typically use the OpenAI-compatible chat format with an image part:</p>
          <pre>
            <code>{`from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="Qwen/Qwen2.5-VL-7B-Instruct",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What is the total on this receipt?"},
            {"type": "image_url",
             "image_url": {"url": "data:image/jpeg;base64,..."}},
        ],
    }],
    max_tokens=200,
)`}</code>
          </pre>
          <p>On the server, cap the number of images per request:</p>
          <pre>
            <code>{`vllm serve Qwen/Qwen2.5-VL-7B-Instruct \\
  --limit-mm-per-prompt '{"image": 4}'`}</code>
          </pre>
          <p>A few practical points matter most:</p>
          <Table
            head={["Concern", "What to do"]}
            rows={[
              ["CPU preprocessing", "Size CPU cores for image decoding, as it can bottleneck a fast GPU"],
              ["Encoder batching", "Group images of the same shape, as they batch cleanly"],
              ["Encoder placement", "Share the LLM's GPU at first, then split into a pool if encoders fall behind"],
              ["Large uploads", "Downscale before sending, and set a pixel limit on the server"],
              ["Quality checks", "Test your own images, as small text may need a higher resolution"],
            ]}
          />
          <Callout tone="warn">
            If your server fetches image URLs for users, treat it as a security boundary. A
            crafted URL can target your internal network. Block private addresses, and set limits
            on size and timeouts. Also cap pixel counts, as a small file can decompress into a
            huge image.
          </Callout>
          <Callout tone="tip">
            Count image tokens in your metrics and in rate limits. A limit based on request count
            alone lets one client send far more work than another at the same request rate.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A VLM turns images into token-like vectors, then runs a normal LLM.",
    "Image token count is set by resolution and patch size.",
    "Doubling width and height gives four times the tokens.",
    "Image tokens cost prefill time and KV cache memory, like text tokens.",
    "Cache encoder output, and make sure prefix caches key on image content.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "After the encoder finishes, what ongoing cost does an image keep creating?",
      options: [
        "None, it's fully released",
        "KV cache memory for its image tokens",
        "It reruns the encoder at each decode step",
        "Extra CPU decoding at each step",
      ],
      answer: 1,
      explain: "Image tokens sit in the KV cache like text, so they use memory until the request ends.",
    },
    {
      kind: "mcq",
      q: "Why must a prefix cache key include image content?",
      options: [
        "It makes hashing faster",
        "Image placeholders can match while the pictures differ",
        "Images can't be stored in a KV cache",
        "It reduces image resolution",
      ],
      answer: 1,
      explain: "Matching on token IDs alone could reuse the cache from a different image.",
    },
    {
      kind: "text",
      q: "A model uses a fixed 448 × 448 input, with 14-pixel patches and one token per patch. How many image tokens is that?",
      format: "*****",
      accept: ["1024", "1,024"],
      explain: "448 ÷ 14 = 32, and 32 × 32 = 1,024.",
    },
    {
      kind: "text",
      q: "One token covers a 28-pixel square. How many tokens does a 560 × 840 image produce?",
      format: "***",
      accept: ["600"],
      explain: "560 ÷ 28 = 20, 840 ÷ 28 = 30, and 20 × 30 = 600.",
    },
  ],
};

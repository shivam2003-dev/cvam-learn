import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Easy",
  objectives: [
    "Describe what the Hugging Face Hub hosts and how to read a model card",
    "Match a job to a task name and run it with a Transformers pipeline",
    "Choose between running a model yourself, in the browser with Transformers.js, or through the inference SDK",
    "Estimate the download size and memory of a model from its parameter count",
  ],
  tasks: [
    {
      id: "hub",
      title: "The problem: finding and trusting models",
      body: (
        <>
          <p>
            Hosted APIs give you a handful of models from a handful of companies. But thousands of
            other models exist: small ones that classify text, ones that transcribe audio, ones
            tuned for a single language, open-weight chat models you can run yourself. Where do you
            find them, and how do you load them without writing custom code each time?
          </p>
          <p>
            The <strong>Hugging Face Hub</strong> is the answer most teams use. Think of it as
            GitHub for machine learning. It is a website and a set of libraries built around git
            repositories that hold files.
          </p>
          <Table
            head={["Hub item", "What it is"]}
            rows={[
              ["Models", "Repos with weights, config and a tokenizer, identified as owner/name"],
              ["Datasets", "Repos of training or evaluation data you can stream or download"],
              ["Spaces", "Small hosted demo apps, handy for trying a model before you commit"],
            ]}
          />
          <p>
            Every model repo has a <strong>model card</strong>, a readme describing what the model
            does. Before you adopt a model, read four things on it:
          </p>
          <ul>
            <li>
              <strong>Task and languages:</strong> what it was built for and tested on.
            </li>
            <li>
              <strong>License:</strong> some are open for commercial use, others are not. This
              decides whether you can ship it.
            </li>
            <li>
              <strong>Size:</strong> parameter count and file sizes, which decide where it can run.
            </li>
            <li>
              <strong>Limits and bias notes:</strong> where the authors say it fails.
            </li>
          </ul>
          <Callout tone="warn">
            Anyone can upload to the Hub. Prefer weights stored in the <code>safetensors</code>{" "}
            format, which can't run code when loaded, avoid enabling remote code execution options
            for repos you don't trust, and pin a specific revision so a later upload can't change
            what you deploy.
          </Callout>
        </>
      ),
    },
    {
      id: "tasks",
      title: "Tasks: naming the job",
      body: (
        <>
          <p>
            The Hub labels models by <strong>task</strong>, the kind of input and output. Searching
            by task is the fastest way to a short list, and the task name is also what the
            libraries use to wire up the right pre-processing and post-processing for you.
          </p>
          <Table
            head={["Task", "Input to output", "Example job"]}
            rows={[
              ["text-classification", "Text to a label and score", "Sentiment, spam, topic"],
              ["token-classification", "Text to a label per token", "Find names and places"],
              ["question-answering", "Question plus passage to a span", "Pull an answer from a document"],
              ["summarization", "Long text to short text", "Condense a report"],
              ["text-generation", "Prompt to continued text", "Chat, drafting, code"],
              ["feature-extraction", "Text to a vector", "Embeddings for search"],
              ["automatic-speech-recognition", "Audio to text", "Transcription"],
              ["image-classification", "Image to a label", "Tag photos"],
            ]}
          />
          <p>
            A key lesson for newcomers: a small model fine-tuned for one task often beats a giant
            general model on cost, speed and predictability for that task. Classifying support
            tickets into six buckets does not need a frontier chat model.
          </p>
        </>
      ),
    },
    {
      id: "pipeline",
      title: "Run a model with a pipeline",
      body: (
        <>
          <p>
            The <code>transformers</code> library offers <code>pipeline</code>, a one-line wrapper
            that downloads the model, loads the tokenizer, runs inference and formats the result.
            The first call downloads files to a local cache. Later calls reuse them.
          </p>
          <pre>
            <code>{`from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="distilbert-base-uncased-finetuned-sst-2-english",
)

print(classifier("The refund arrived fast and support was friendly."))
# [{'label': 'POSITIVE', 'score': 0.99...}]   (illustrative output)`}</code>
          </pre>
          <p>
            Passing the model id explicitly is good practice. If you leave it out, the library
            picks a default for the task, and defaults can change. For private or gated models,
            set an access token in the <code>HF_TOKEN</code> environment variable. Never paste a
            token into source code.
          </p>
          <p>
            The same idea works in JavaScript. <strong>Transformers.js</strong> runs models in the
            browser or in Node, using ONNX-format weights, so a web page can classify text with no
            server and no data leaving the user's device:
          </p>
          <pre>
            <code>{`import { pipeline } from "@huggingface/transformers";

const classify = await pipeline("sentiment-analysis");
console.log(await classify("I love this."));`}</code>
          </pre>
          <p>
            Browser use suits small models. A model of hundreds of megabytes is a heavy first page
            load, so cache it and show progress.
          </p>
        </>
      ),
    },
    {
      id: "size",
      title: "Will it fit? Size arithmetic",
      body: (
        <>
          <p>
            Model weights are just numbers, and every number takes bytes. That gives you a quick
            estimate before you download anything:
          </p>
          <Formula>weight size ≈ parameters × bytes per parameter</Formula>
          <p>
            Worked example. A 7-billion-parameter model stored in 16-bit precision uses 2 bytes
            per parameter. Quantized to 4 bits, it uses about half a byte:
          </p>
          <pre>
            <code>{`16-bit: 7,000,000,000 × 2   bytes = 14,000,000,000 bytes ≈ 14 GB
 4-bit: 7,000,000,000 × 0.5 bytes =  3,500,000,000 bytes ≈ 3.5 GB`}</code>
          </pre>
          <p>
            Running it needs more than the files: extra memory for the context cache and runtime
            overhead. As a rule, leave generous headroom above the weight size. The next lessons
            cover this in more depth for local runs.
          </p>
        </>
      ),
    },
    {
      id: "inference",
      title: "Using hosted models through the inference SDK",
      body: (
        <>
          <p>
            You don't have to download a model to use it. The <code>huggingface_hub</code> package
            includes an <code>InferenceClient</code> that sends requests to hosted inference
            instead, so you get Hub models without owning a GPU.
          </p>
          <pre>
            <code>{`import os
from huggingface_hub import InferenceClient

client = InferenceClient(token=os.environ["HF_TOKEN"])

reply = client.chat_completion(
    model=os.environ["HF_MODEL_ID"],
    messages=[{"role": "user", "content": "Give me one tip for naming variables."}],
    max_tokens=120,
)
print(reply.choices[0].message.content)`}</code>
          </pre>
          <p>
            Which route is right? A rough guide:
          </p>
          <Table
            head={["Route", "Best when", "Trade-off"]}
            rows={[
              ["transformers pipeline, local", "You need privacy, offline use or a small custom model", "You manage hardware and updates"],
              ["Transformers.js", "The model is small and should run in the user's browser", "Download size and device speed vary"],
              ["Inference SDK", "You want to try many Hub models quickly", "Availability and limits depend on the service; check current docs"],
            ]}
          />
          <Callout tone="tip">
            Prototype with a hosted route to confirm the model is good enough for your task. Only
            then spend time on self-hosting. Many tasks never need it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "The Hub hosts models, datasets and Spaces as git repos. Read the model card and license first.",
    "Tasks name the job, and the right small model often beats a large general one.",
    "A pipeline downloads, loads and runs a model in a few lines. Pin the model id and revision.",
    "Weight size is roughly parameters times bytes per parameter.",
    "Use the inference SDK to prototype, then decide whether to self-host.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is a model card?",
      options: [
        "A billing record for API usage",
        "A GPU compatibility chip",
        "A cache file created by pipeline",
        "A readme describing a model's purpose, license, limits and usage",
      ],
      answer: 3,
      explain: "Read it before adopting a model, especially the license and the stated limits.",
    },
    {
      kind: "mcq",
      q: "Which task name would you search for to find a model that produces embeddings?",
      options: [
        "feature-extraction",
        "summarization",
        "image-classification",
        "question-answering",
      ],
      answer: 0,
      explain: "Feature extraction maps text to a vector, which is what an embedding is.",
    },
    {
      kind: "text",
      q: "A model has 3 billion parameters stored in 16-bit precision (2 bytes each). About how many GB are the weights?",
      format: "*",
      accept: ["6", "6 gb", "6gb"],
      explain: "3,000,000,000 × 2 = 6,000,000,000 bytes, about 6 GB.",
    },
    {
      kind: "text",
      q: "Which environment variable commonly holds a Hugging Face access token?",
      format: "********",
      accept: ["HF_TOKEN", "hf_token"],
      explain: "Read the token from the environment instead of writing it in code.",
    },
  ],
};

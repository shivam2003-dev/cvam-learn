import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

const layers = [
  ["Application", "Your product: prompts, retries, streaming to the user"],
  ["Gateway", "Auth, rate limits, usage metering, model routing"],
  ["Router & autoscaler", "Picks a replica, adds or removes capacity"],
  ["Inference engine", "vLLM, SGLang, TensorRT-LLM: batching and KV cache"],
  ["Framework & runtime", "PyTorch, CUDA, optimized kernels"],
  ["Model", "Weights, tokenizer, quantization format"],
  ["Hardware", "GPU compute, memory, interconnects"],
];

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Name each layer of a production inference stack",
    "Trace a request from the client to the GPU and back",
    "Identify which layer to work on for a given problem",
  ],
  tasks: [
    {
      id: "layers",
      title: "Seven layers, top to bottom",
      body: (
        <>
          <p>
            Calling a model looks like one API request, but several systems cooperate to serve
            it. This is also the map of the course: later modules zoom in on each layer.
          </p>
          <div className="grid gap-2">
            {layers.map(([name, role], index) => (
              <div
                key={name}
                className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg border border-line bg-panel px-3 py-2"
              >
                <span className="font-mono text-xs text-lime">L{layers.length - index}</span>
                <span className="font-semibold text-text sm:w-44">{name}</span>
                <span className="text-sm text-soft">{role}</span>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "request-life",
      title: "Follow one request",
      body: (
        <>
          <p>Suppose a user asks a chat app a question. Here's what happens:</p>
          <ol>
            <li>
              <strong>The app</strong> builds a prompt from the system message, history and the
              question, then opens a streaming request.
            </li>
            <li>
              <strong>The gateway</strong> checks the API key and rate limits, then records usage.
            </li>
            <li>
              <strong>The router</strong> chooses a replica, ideally one with spare capacity that
              already has this conversation's prefix cached.
            </li>
            <li>
              <strong>The engine</strong> tokenizes the prompt and queues it. A scheduler adds it
              to the running batch when there's room.
            </li>
            <li>
              <strong>Prefill:</strong> the GPU processes every input token in parallel and
              builds the KV cache, ending with the first output token.
            </li>
            <li>
              <strong>Decode:</strong> the GPU produces one token per step for each request in
              the batch, until a stop token or length limit.
            </li>
            <li>
              <strong>Streaming:</strong> tokens turn back into text and reach the user as they
              appear.
            </li>
          </ol>
          <Callout tone="note">
            Prefill and decode are the two words you'll hear most in this field. Prefill is
            usually limited by compute, and decode more often by memory bandwidth. A later module
            explains why.
          </Callout>
        </>
      ),
    },
    {
      id: "where-to-look",
      title: "Which layer do I fix?",
      body: (
        <>
          <p>
            Beginners often reach for hardware first. It's usually the most expensive fix, so
            check the layers above it before buying anything.
          </p>
          <Table
            head={["Symptom", "Look first at", "Typical fix"]}
            rows={[
              ["Long wait before the first token", "Router, engine queue", "Add replicas, tune scheduling, cache prefixes"],
              ["Tokens arrive slowly once started", "Engine, model", "Smaller batches, quantize, faster GPU"],
              ["Fine alone, slow under load", "Autoscaler, engine", "Scale sooner, set queue limits"],
              ["Errors during traffic spikes", "Gateway, autoscaler", "Rate limit, shed load, shorten cold start"],
              ["Bill is too high", "Whole stack", "Raise utilization, batch more, smaller model"],
              ["Out-of-memory crashes", "Engine, model", "Cap context and batch, quantize"],
            ]}
          />
        </>
      ),
    },
    {
      id: "across-layers",
      title: "Think across layers",
      body: (
        <>
          <p>
            The largest wins often come from a change in one layer that helps another.
            Cache-aware routing lives in the router, but its benefit shows up as shorter prefill
            in the engine. Quantization happens in the model layer, but it frees GPU memory for
            larger batches, which raises throughput.
          </p>
          <p>
            So inference engineers tend to be generalists. You don't need to master every layer
            on day one, but you do need to know they exist and how they affect each other.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "One API call crosses the application, gateway, router, engine, runtime, model and hardware.",
    "Prefill processes the prompt in parallel; decode generates output step by step.",
    "Match the symptom to the layer before changing anything.",
    "Hardware is usually the most expensive fix, so check it last.",
    "The biggest gains often cross layers, like routing that improves cache hits.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which layer handles continuous batching and KV cache management?",
      options: ["Gateway", "Inference engine", "Application", "Hardware"],
      answer: 1,
      explain: "Engines such as vLLM and SGLang schedule batches and manage the KV cache.",
    },
    {
      kind: "mcq",
      q: "Users wait a long time for the first token, but streaming is fast after that. Where do you look first?",
      options: ["Router and engine queue", "Output length limits", "Client rendering", "The billing system"],
      answer: 0,
      explain: "Delay before the first token points to queueing or prefill, not decode speed.",
    },
    {
      kind: "text",
      q: "What is the phase called where the model processes all input tokens in parallel?",
      format: "*******",
      accept: ["prefill"],
      explain: "Prefill handles the prompt. Decode then generates output step by step.",
    },
  ],
};

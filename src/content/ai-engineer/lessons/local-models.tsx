import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Explain when running a model on your own machine is the right choice",
    "Estimate whether a model fits in memory using parameters and quantization",
    "Start a local model with Ollama or LM Studio and call it from code",
    "Point existing OpenAI-style code at a local server",
  ],
  tasks: [
    {
      id: "why",
      title: "Why run a model locally?",
      body: (
        <>
          <p>
            Hosted APIs are convenient, but they have costs that matter during development: every
            test call is billed, the network must be up, and your prompts leave your machine. For a
            team handling private documents, that last point can block the whole project.
          </p>
          <p>
            Running an open-weight model locally flips those trade-offs. It is like cooking at home
            instead of ordering out. It costs you setup time and kitchen space, but each meal is
            nearly free and nobody else sees what you made.
          </p>
          <Table
            head={["", "Local model", "Hosted API"]}
            rows={[
              ["Per-call cost", "None beyond electricity", "Billed by tokens"],
              ["Privacy", "Data stays on your machine", "Data goes to the provider; read its terms"],
              ["Offline use", "Works on a plane", "Needs a network"],
              ["Quality", "Limited by what your hardware can hold", "Access to the largest models"],
              ["Speed", "Depends on your chip and memory", "Usually fast and consistent"],
              ["Upkeep", "You update models and tools", "Provider handles it"],
            ]}
          />
          <p>
            Local models are a great fit for private prototyping, offline demos, unit tests that
            shouldn't spend money, and experiments with prompts. They are rarely the right way to
            serve thousands of users, which is a job for dedicated inference servers.
          </p>
        </>
      ),
    },
    {
      id: "fit",
      title: "Will it fit? Memory and quantization",
      body: (
        <>
          <p>
            The number one limit is memory. A model's weights must sit in RAM, or in GPU memory if
            you have a GPU. On many laptops the chip shares one memory pool between CPU and GPU,
            which makes total memory the number to watch.
          </p>
          <p>
            <strong>Quantization</strong> shrinks a model by storing each weight with fewer bits,
            for example 4 instead of 16. Quality drops a little, memory drops a lot. Local tools
            mostly use model files in the <strong>GGUF</strong> format, which packages quantized
            weights for the llama.cpp engine.
          </p>
          <Formula>weights in GB ≈ parameters (billions) × bits per weight ÷ 8</Formula>
          <p>Worked example for an 8-billion-parameter model:</p>
          <pre>
            <code>{`16-bit: 8 × 16 / 8 = 16 GB
 8-bit: 8 ×  8 / 8 =  8 GB
 4-bit: 8 ×  4 / 8 =  4 GB   (real files run a bit larger because
                              some layers keep higher precision)`}</code>
          </pre>
          <p>
            On top of the weights you need room for the context cache, which grows with the length
            of the conversation, plus the operating system and your other apps. A machine with 16
            GB of total memory can comfortably run the 4-bit version above, and would struggle with
            the 16-bit one.
          </p>
          <Callout tone="note">
            Quantization names in model files (such as Q4 or Q8 variants) hint at bits per weight.
            The exact naming and quality trade-offs vary by scheme, so read the file's description
            rather than guessing.
          </Callout>
        </>
      ),
    },
    {
      id: "ollama",
      title: "Ollama: a model runner for the command line",
      body: (
        <>
          <p>
            <strong>Ollama</strong> is a small tool that downloads models, runs them and exposes a
            local HTTP server. You use it from a terminal, which makes it easy to script.
          </p>
          <pre>
            <code>{`# download a model by name from the Ollama library
ollama pull <model-name>

# chat with it in the terminal
ollama run <model-name>

# see what you have installed, and what is loaded in memory
ollama list
ollama ps`}</code>
          </pre>
          <p>
            Replace the placeholder with a model name from the library; pick one whose size fits
            your memory using the arithmetic above. While Ollama is running, it serves an API on
            your machine, by default on port 11434, including an OpenAI-compatible route.
          </p>
          <p>
            That means the client code from the previous lesson works unchanged. Only the
            settings differ:
          </p>
          <pre>
            <code>{`import os
from openai import OpenAI

client = OpenAI(
    base_url=os.environ.get("LLM_BASE_URL", "http://localhost:11434/v1"),
    api_key=os.environ.get("LLM_API_KEY", "not-needed"),  # local servers ignore it
)

resp = client.chat.completions.create(
    model=os.environ["MODEL_NAME"],   # the name you pulled
    messages=[{"role": "user", "content": "Say hello in five words."}],
)
print(resp.choices[0].message.content)`}</code>
          </pre>
          <p>
            The client library insists on a key, so a placeholder value is fine for a local server
            that doesn't check it. Real keys still come from the environment, never from source.
          </p>
        </>
      ),
    },
    {
      id: "lmstudio",
      title: "LM Studio: the same idea with a window",
      body: (
        <>
          <p>
            <strong>LM Studio</strong> is a desktop app. You search for models inside it, download
            a quantized file, chat in a built-in interface, and flip a switch to start a local
            server. That server is also OpenAI-compatible, usually on its own default port, so the
            same code works again with a different base URL.
          </p>
          <Table
            head={["", "Ollama", "LM Studio"]}
            rows={[
              ["Interface", "Command line and API", "Desktop app with a chat window"],
              ["Best for", "Scripts, servers, repeatable setups", "Browsing models and comparing quality by hand"],
              ["Model files", "Managed for you", "You choose the exact quantized file"],
              ["Server", "OpenAI-compatible route", "OpenAI-compatible route"],
            ]}
          />
          <p>
            Many developers use both: LM Studio to explore which model and quantization feels
            good, then Ollama to script it.
          </p>
        </>
      ),
    },
    {
      id: "practice",
      title: "Practical habits",
      body: (
        <>
          <ul>
            <li>
              <strong>Start small.</strong> A small model that answers fast helps you iterate on
              prompts. Scale up only when quality blocks you.
            </li>
            <li>
              <strong>Keep the base URL in config.</strong> Develop against a local server and
              switch to a hosted model for production by changing environment variables.
            </li>
            <li>
              <strong>Test on the real target.</strong> A prompt that works on a small local model
              may behave differently on a large hosted one, and the reverse. Re-run your checks on
              the model you will ship.
            </li>
            <li>
              <strong>Mind the context length.</strong> Local runners often use a modest default
              context window. Long inputs may be silently cut, so check the setting and raise it
              if you need more, remembering it uses more memory.
            </li>
          </ul>
          <Callout tone="warn">
            A local server with no key check is open to anything that can reach it. Keep it bound
            to your own machine and don't expose its port to a network unless you add
            authentication.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Local models give privacy, offline use and zero per-call cost, in exchange for hardware limits.",
    "Weights in GB are about parameters in billions times bits per weight divided by 8.",
    "Quantization trades a little quality for a large memory saving. GGUF is the common local format.",
    "Ollama and LM Studio both expose an OpenAI-compatible server, so client code barely changes.",
    "Keep the base URL in config and re-test on the model you will actually ship.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which situation is the best fit for a local model?",
      options: [
        "Serving thousands of simultaneous customers",
        "Prototyping with private documents that must not leave the machine",
        "Needing the largest model available",
        "Running with no memory to spare",
      ],
      answer: 1,
      explain: "Local runs keep data on your machine. They are weak at large-scale serving and giant models.",
    },
    {
      kind: "mcq",
      q: "Why can existing OpenAI-style client code usually talk to Ollama or LM Studio?",
      options: [
        "They copy the provider's private keys",
        "Both are owned by the same company",
        "They expose an OpenAI-compatible API route",
        "Quantization converts the code",
      ],
      answer: 2,
      explain: "Matching the API shape means you only change the base URL and model name.",
    },
    {
      kind: "text",
      q: "An 8-billion-parameter model is quantized to 4 bits per weight. About how many GB are the weights?",
      format: "*",
      accept: ["4", "4 gb", "4gb"],
      explain: "8 × 4 ÷ 8 = 4 GB, ignoring overhead.",
    },
    {
      kind: "text",
      q: "What is the name for storing model weights with fewer bits to save memory?",
      format: "************",
      accept: ["quantization", "quantisation"],
      explain: "Quantization lowers precision per weight, cutting memory at a small quality cost.",
    },
  ],
};

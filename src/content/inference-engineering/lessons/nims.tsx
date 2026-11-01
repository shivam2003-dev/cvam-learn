import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Explain what NVIDIA NIM provides and what it hides",
    "Run a NIM container and send it a request",
    "Weigh a NIM against building your own inference image",
    "Calculate a simple build-or-buy break-even point",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Building a production inference image takes a lot of work. You pick an engine, match
            CUDA versions, tune batching, choose quantization, convert weights, and repeat all that
            for every model and GPU type you run. It's valuable work, but it's not always your
            product.
          </p>
          <p>
            <strong>NVIDIA NIM</strong> is a set of prebuilt containers that each serve a specific
            model behind a standard API. It's the difference between a meal kit and shopping for
            each ingredient: someone already measured everything, but you eat what's in the box.
          </p>
          <p>A NIM generally bundles these parts:</p>
          <ul>
            <li>The model, or a way to download its weights at startup</li>
            <li>An inference engine tuned for that model</li>
            <li>Compatible CUDA libraries and dependencies</li>
            <li>An API server, with an OpenAI-compatible endpoint for chat models</li>
            <li>Prebuilt configurations for different GPU setups</li>
          </ul>
          <p>
            NIMs cover more than chat models. The catalog also includes embedding, reranking,
            speech and vision models. The containers come from NVIDIA's registry, which is{" "}
            <code>nvcr.io</code>.
          </p>
        </>
      ),
    },
    {
      id: "run",
      title: "Running one",
      body: (
        <>
          <p>
            You need a host with an NVIDIA GPU, a working driver, Docker with the NVIDIA Container
            Toolkit, and an NVIDIA API key. Then log in to the registry and start the container. The
            image name below is an example, so copy the current name and tag from NVIDIA's catalog.
          </p>
          <pre>
            <code>{`export NGC_API_KEY="your-key"

echo "$NGC_API_KEY" | docker login nvcr.io \\
  --username '$oauthtoken' --password-stdin

docker run -it --rm \\
  --gpus all \\
  --shm-size=16GB \\
  -e NGC_API_KEY \\
  -v "$HOME/.cache/nim:/opt/nim/.cache" \\
  -p 8000:8000 \\
  nvcr.io/nim/meta/llama3-8b-instruct:1.0.0`}</code>
          </pre>
          <p>
            The volume mount matters. It keeps downloaded weights on the host, so the next start
            doesn't fetch them again. <code>--shm-size</code> gives the container more shared
            memory, which multi-process engines commonly need.
          </p>
          <p>Once the server reports ready, call it like any OpenAI-compatible service:</p>
          <pre>
            <code>{`from openai import OpenAI

client = OpenAI(base_url="http://localhost:8000/v1", api_key="not-used")

response = client.chat.completions.create(
    model="meta/llama3-8b-instruct",
    messages=[{"role": "user", "content": "Explain batching in one sentence."}],
    max_tokens=64,
)
print(response.choices[0].message.content)`}</code>
          </pre>
          <p>
            Because the API is standard, your application code doesn't need to change if you later
            move to a self-built vLLM server. That's worth remembering, since it keeps your exit
            open. Only the base URL and model name would differ.
          </p>
        </>
      ),
    },
    {
      id: "profiles",
      title: "Profiles: choosing a configuration",
      body: (
        <>
          <p>
            A single NIM image supports several hardware setups. Each setup is a{" "}
            <strong>profile</strong>: a combination of engine, precision and GPU count. At startup, a
            NIM can detect your GPUs and choose a compatible profile on its own.
          </p>
          <p>
            You can also set one explicitly with the <code>NIM_MODEL_PROFILE</code> environment
            variable. Do this in production. Automatic selection is convenient on a laptop, but an
            explicit setting means every node runs the same configuration, and a hardware change
            can't quietly change your performance.
          </p>
          <p>
            In Kubernetes, you'd normally use NVIDIA's Helm chart or the NIM Operator rather than a
            plain <code>docker run</code>. The same basics apply: GPU resources, a volume for
            weights, a secret for the API key, and a readiness probe.
          </p>
          <Callout tone="warn">
            Avoid the <code>latest</code> tag. Pin an exact version, and test it with your own
            traffic before you upgrade. A new image can change the engine, defaults or the
            output for the same request.
          </Callout>
        </>
      ),
    },
    {
      id: "tradeoffs",
      title: "NIM or your own image?",
      body: (
        <>
          <Table
            head={["", "NIM", "Your own image"]}
            rows={[
              ["Time to first deploy", "Fast", "Slower"],
              ["Tuning for NVIDIA GPUs", "Done for you", "Your job"],
              ["Custom engine changes", "Limited", "Full control"],
              ["Newest models", "When published", "As soon as your engine supports them"],
              ["Hardware", "NVIDIA GPUs", "Whatever your engine supports"],
              ["Debugging internals", "Harder, less visible", "Everything is yours to inspect"],
              ["Cost", "May need a license", "Engineering time"],
              ["Vendor support", "Available with a license", "Community or your own team"],
            ]}
          />
          <Callout tone="note">
            NIM's licensing has changed over time. Development access and production use may have
            different terms, and production use has typically required NVIDIA AI Enterprise. Check
            the current terms before planning around it.
          </Callout>
          <p>
            NIM is a good fit when you run standard models on NVIDIA hardware and need to move
            quickly, or when you need vendor support. Your own image fits better when you have
            unusual models, custom scheduling, non-NVIDIA hardware, or a team that already does
            this work.
          </p>
        </>
      ),
    },
    {
      id: "break-even",
      title: "Worked example: break-even",
      body: (
        <>
          <p>
            A simple model compares license cost with the engineering time you'd spend otherwise.
            All figures here are illustrative, so use your real quotes.
          </p>
          <Formula>break-even GPUs = yearly in-house cost ÷ license per GPU per year</Formula>
          <pre>
            <code>{`Half an engineer on image upkeep: 0.5 × $160,000 = $80,000/year
License, per GPU per year:        $4,000

Break-even: $80,000 ÷ $4,000 = 20 GPUs

10 GPUs: 10 × $4,000 = $40,000, cheaper than in-house
40 GPUs: 40 × $4,000 = $160,000, in-house is cheaper`}</code>
          </pre>
          <p>
            Performance can shift the answer. If a tuned container gets 10% more throughput than
            your own build at the same latency target, 40 GPUs of work needs about 37 GPUs:
          </p>
          <pre>
            <code>{`40 ÷ 1.10 ≈ 36.4, so 37 GPUs`}</code>
          </pre>
          <p>
            The gain could equally go the other way, since a well-tuned open engine can match or
            beat a prebuilt one on your traffic. Don't trust a general claim. Run the same load
            test on both, using your own prompts, GPUs and latency targets.
          </p>
          <Callout tone="tip">
            A common path is to start with a NIM to get a baseline quickly. You then have a real
            performance number to beat, and you only build your own image if the gap justifies it.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "A NIM packages a model, engine, dependencies and API server into one container.",
    "OpenAI-compatible APIs keep application code portable if you change serving stacks.",
    "Set a profile and pin an image version in production.",
    "You trade control and possible license cost for speed and vendor support.",
    "Load test on your own traffic, and compare license cost with engineering time.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is a NIM profile?",
      options: [
        "A user's account settings",
        "A configuration of engine, precision and GPU count",
        "A cached prompt",
        "A billing plan",
      ],
      answer: 1,
      explain: "Profiles let one image support different hardware setups.",
    },
    {
      kind: "mcq",
      q: "Why mount a host volume when running a NIM?",
      options: [
        "To increase GPU clocks",
        "So downloaded weights survive and don't need to be fetched again",
        "To enable the API",
        "To disable logging",
      ],
      answer: 1,
      explain: "Without a persistent cache, each new container may have to download the weights again.",
    },
    {
      kind: "mcq",
      q: "Which situation favors building your own image over a NIM?",
      options: [
        "A standard model on NVIDIA GPUs, needed this week",
        "A custom scheduler change on non-NVIDIA hardware",
        "A small team that needs vendor support",
        "A quick baseline test",
      ],
      answer: 1,
      explain: "NIMs target NVIDIA hardware and limit deep engine changes.",
    },
    {
      kind: "text",
      q: "In-house upkeep costs $120,000 a year and a license costs $3,000 per GPU per year. At how many GPUs do the two break even?",
      format: "**",
      accept: ["40", "40 gpus"],
      explain: "$120,000 ÷ $3,000 = 40 GPUs.",
    },
  ],
};

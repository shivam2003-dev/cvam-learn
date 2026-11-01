import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Define closed (hosted API) models, open-weights models and open-source models",
    "Compare the two on cost, control, privacy, quality and effort",
    "Estimate the memory needed to self-host a model from its parameter count",
    "Judge when an API is cheaper than renting a GPU",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: where does the model live?",
      body: (
        <>
          <p>
            Before you can call a model, you must decide where it runs and who controls it. Do you
            send text to a company's servers and get an answer back? Or do you download the model
            and run it on hardware you control? This choice shapes your costs, your privacy story
            and how much engineering you take on.
          </p>
          <p>Three terms get mixed up, so pin them down first.</p>
          <Table
            head={["Term", "Meaning", "You can"]}
            rows={[
              ["Closed / hosted model", "Weights are private; you reach the model only through the provider's API", "Call it, pay per use, follow its terms"],
              ["Open-weights model", "The trained weights are published for download, under a licence", "Run it yourself, fine-tune it, within the licence"],
              ["Open-source model", "Weights plus the training code, data details and a licence that meets an open-source definition", "Rarely the full set; most 'open' models are only open-weights"],
            ]}
          />
          <Callout tone="note">
            Read the licence. Some open-weights licences restrict commercial use, large user counts
            or certain purposes. &quot;You can download it&quot; does not mean &quot;you can use it
            for anything&quot;.
          </Callout>
        </>
      ),
    },
    {
      id: "compare",
      title: "Side by side",
      body: (
        <>
          <Table
            head={["Factor", "Hosted API (closed)", "Self-hosted open weights"]}
            rows={[
              ["Start-up effort", "Minutes: get a key and call it", "Days or more: GPUs, serving software, monitoring"],
              ["Cost shape", "Pay per token; scales to zero", "Pay for hardware by time, busy or idle"],
              ["Control", "Provider sets versions, limits and retirement dates", "You choose the version and keep it as long as you like"],
              ["Privacy", "Data goes to a third party under its terms", "Data can stay inside your own network"],
              ["Customisation", "Prompting, sometimes provider fine-tuning", "Full fine-tuning, quantisation, custom serving"],
              ["Top-end quality", "The strongest models are often hosted ones, but this changes", "Strong and improving; often a size or two behind the leading hosted models"],
              ["Operations", "Provider handles scaling and uptime", "You handle scaling, upgrades and outages"],
            ]}
          />
          <p>
            Notice that none of these says one side is simply better. A hosted API wins on speed to
            market and low volume. Self-hosting wins when you need data control, steady heavy
            traffic, deep customisation or a fixed model version for years.
          </p>
          <p>
            There is also a middle path. Many companies host open-weights models and sell access by
            API. You get open-model flexibility without running GPUs, though you give up some of the
            privacy benefit.
          </p>
        </>
      ),
    },
    {
      id: "memory",
      title: "Will it fit? Memory arithmetic",
      body: (
        <>
          <p>
            A model's weights are just numbers, and each number takes a fixed number of bytes. So
            the memory for weights is easy to estimate:
          </p>
          <Formula>weights memory ≈ parameters × bytes per parameter</Formula>
          <p>
            Precision sets the bytes: 16-bit uses 2 bytes, 8-bit uses 1, and 4-bit uses 0.5.
            Reducing precision is called <strong>quantisation</strong>. It shrinks memory at some
            cost in accuracy, which is often small at 8-bit and varies at 4-bit.
          </p>
          <pre>
            <code>{`7 billion parameters:
  16-bit: 7e9 × 2   = 14 GB
   8-bit: 7e9 × 1   =  7 GB
   4-bit: 7e9 × 0.5 =  3.5 GB

70 billion parameters:
  16-bit: 70e9 × 2   = 140 GB
   8-bit: 70e9 × 1   =  70 GB
   4-bit: 70e9 × 0.5 =  35 GB`}</code>
          </pre>
          <p>
            Weights are not the whole story. You also need room for the KV cache, which grows with
            context length and the number of simultaneous users, plus runtime overhead. A common
            planning habit is to add a healthy margin on top of the weights figure and then test on
            real hardware.
          </p>
          <Callout tone="tip">
            A 7-billion-parameter model at 4-bit fits on many consumer GPUs and laptops, which is
            why small open models are popular for local development.
          </Callout>
        </>
      ),
    },
    {
      id: "breakeven",
      title: "When is renting a GPU cheaper than an API?",
      body: (
        <>
          <p>
            Here is a rough break-even calculation with <strong>illustrative</strong> numbers. Real
            prices vary by provider, region and month, so use current ones.
          </p>
          <pre>
            <code>{`GPU rental:      $2.00 per hour × 24 h × 30 days = $1,440 per month
API price:       $1.00 per million tokens (blended, illustrative)

break-even = $1,440 ÷ ($1.00 / 1M tokens)
           = 1,440 million tokens
           = 1.44 billion tokens per month`}</code>
          </pre>
          <p>
            Below roughly 1.44 billion tokens a month, in this example, the API is cheaper. Above it,
            the GPU can win, <em>if</em> it is busy and one GPU can serve that traffic. Both
            conditions matter:
          </p>
          <ul>
            <li><strong>Utilisation.</strong> An idle GPU costs the same as a busy one. Spiky traffic wastes money.</li>
            <li><strong>Capacity.</strong> One GPU has a throughput ceiling. Extra GPUs mean extra cost.</li>
            <li><strong>People time.</strong> Engineers who run the serving stack are a real cost, often larger than the hardware.</li>
            <li><strong>Redundancy.</strong> A production service usually needs more than one replica.</li>
          </ul>
          <p>
            A sensible path for most teams: start on a hosted API, measure real token volume and
            quality needs, and only then consider self-hosting if the numbers or the privacy
            requirements justify it.
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Closed models are reached through a provider's API; open-weights models can be downloaded and run by you.",
    "Open-weights is not the same as open-source, and licences can limit commercial use, so read them.",
    "Weights memory is roughly parameters times bytes per parameter; quantisation cuts it at some accuracy cost.",
    "APIs win on speed and low or spiky volume; self-hosting wins on control, privacy and steady heavy use.",
    "Include utilisation, capacity and engineer time in any break-even maths.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What does an open-weights model give you?",
      options: [
        "Downloadable trained weights you can run, under a licence",
        "A guarantee of the best quality",
        "Free GPUs",
        "The full training data",
      ],
      answer: 0,
      explain: "Open-weights means the trained weights are published. The licence still sets what you may do, and training data is often not included.",
    },
    {
      kind: "mcq",
      q: "Which situation most favours a hosted API?",
      options: [
        "Steady heavy traffic with strict data residency rules",
        "A prototype with low, uneven traffic and a small team",
        "A need to freeze the exact model for five years",
        "A requirement for deep custom fine-tuning of the weights",
      ],
      answer: 1,
      explain: "Low or spiky volume and little operations capacity are where pay-per-use APIs shine.",
    },
    {
      kind: "text",
      q: "How many GB do the weights of a 13-billion-parameter model need at 16-bit precision (2 bytes per parameter)?",
      format: "**",
      accept: ["26"],
      explain: "13 billion × 2 bytes = 26 billion bytes = 26 GB, before KV cache and overhead.",
    },
    {
      kind: "text",
      q: "What is the name for reducing the number of bits per weight to shrink a model's memory use?",
      format: "************",
      accept: ["quantisation", "quantization"],
      explain: "Quantisation stores weights with fewer bits, saving memory at some cost in accuracy.",
    },
  ],
};

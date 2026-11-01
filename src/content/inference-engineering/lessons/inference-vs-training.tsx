import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Easy",
  objectives: [
    "Explain what inference is and how it differs from training",
    "Name the constraints that make serving its own engineering discipline",
    "Turn daily request volume into the tokens-per-second number you must plan for",
  ],
  tasks: [
    {
      id: "two-phases",
      title: "Two phases of a model's life",
      body: (
        <>
          <p>
            Every machine learning model has two lives. In <strong>training</strong>, an
            algorithm repeatedly adjusts millions or billions of parameters, called weights,
            until the model's outputs get good. In <strong>inference</strong>, those weights are
            frozen and the model is used to produce outputs for new inputs.
          </p>
          <p>
            A chef is a useful picture. Training is the years in culinary school: slow,
            expensive, done once in a while. Inference is dinner service: the same skills used
            thousands of times, with hungry customers waiting at every table.
          </p>
          <p>
            <strong>Inference engineering</strong> is the work of running that dinner service.
            You take a trained model and make it answer real traffic quickly, reliably and at a
            cost the business can survive. You usually don't touch what the model knows. You
            change how it runs: which hardware, which engine, how requests are batched, what gets
            cached, and how capacity follows demand.
          </p>
        </>
      ),
    },
    {
      id: "what-changes",
      title: "What changes when you serve",
      body: (
        <>
          <p>
            Both phases run on GPUs and do lots of matrix math, so they can look similar. In
            practice, they optimize for opposite things.
          </p>
          <Table
            head={["", "Training", "Inference"]}
            rows={[
              ["Main goal", "Reach a good model", "Answer each request well"],
              ["Direction", "Forward and backward passes", "Forward pass only"],
              ["Success metric", "Validation loss, eval scores", "Latency, throughput, cost, uptime"],
              ["Time pressure", "Hours to months, a job can pause", "Milliseconds to seconds, a person waits"],
              ["Load shape", "Steady and planned", "Spiky and outside your control"],
              ["Failure impact", "Resume from a checkpoint", "Users see errors right now"],
              ["Cost shape", "Large, occasional", "Recurring, grows with usage"],
            ]}
          />
          <p>
            Dropping the backward pass means no gradients to store, so inference avoids a major
            memory cost of training. But it adds its own: language models keep a growing cache
            for every active conversation, which you'll meet in the KV cache lesson.
          </p>
          <p>
            The biggest shift is that <strong>you no longer control the workload</strong>. A
            training job has a fixed dataset and a batch size you picked. Production traffic has
            short prompts and huge ones, lunchtime peaks, and a customer who sends 10,000
            requests at once without warning.
          </p>
          <Callout tone="note" title="Why this matters to the business">
            Training is a one-off bill for each model version. Inference runs for as long as the
            product exists, and it scales with users. For a successful product, serving can
            become the larger cost, so a 20% efficiency win here keeps paying every month.
          </Callout>
        </>
      ),
    },
    {
      id: "tokens",
      title: "Tokens: the unit of work",
      body: (
        <>
          <p>
            Language models read and write <strong>tokens</strong>, which are chunks of text
            often shorter than a word. As a rough English rule of thumb, 1 token is about 0.75
            words, though the real figure depends on the tokenizer.
          </p>
          <p>
            Input and output tokens behave very differently. The model reads all input tokens in
            one large parallel pass, then generates output tokens mostly one at a time. That's
            why API providers usually charge several times more for output tokens, and why this
            course keeps separating the two phases.
          </p>
        </>
      ),
    },
    {
      id: "first-estimate",
      title: "Your first capacity estimate",
      body: (
        <>
          <p>
            Almost every inference conversation starts with one question: how many tokens per
            second do we need? You can answer it on a napkin.
          </p>
          <Formula>average tokens/s = requests per day × tokens per request ÷ 86,400</Formula>
          <p>
            Say a product gets 1,000,000 requests a day and each response is 500 output tokens.
            That's 500,000,000 tokens a day. Dividing by the 86,400 seconds in a day gives about{" "}
            <strong>5,787 tokens per second</strong> on average.
          </p>
          <p>
            Never plan for the average, because traffic isn't flat. If your busiest hour runs at
            3× the daily average, you need about <strong>17,361 tokens per second</strong> at
            peak. The multiplier depends on your product, so measure it as soon as you have real
            traffic.
          </p>
          <Callout tone="warn">
            This estimate covers output tokens only and assumes evenly sized requests. A real
            plan also has to cover input processing, latency targets and headroom for failures.
            The next lessons add those pieces.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Training creates the weights. Inference uses frozen weights to answer real requests.",
    "Training optimizes for model quality; serving optimizes for latency, reliability and cost.",
    "You control a training workload, but production traffic controls you.",
    "Tokens are the unit of work, and input and output tokens behave differently.",
    "Always plan for peak traffic, not the daily average.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "What is the main difference in computation between inference and training?",
      options: [
        "Inference runs only a forward pass with frozen weights",
        "Inference always runs on CPUs",
        "Inference updates weights more slowly",
        "Training never uses GPUs",
      ],
      answer: 0,
      explain: "Inference uses fixed weights and runs forward only. No backward pass or weight updates happen.",
    },
    {
      kind: "mcq",
      q: "Which is the biggest new challenge when a model moves into production?",
      options: [
        "The weights get larger",
        "The workload is spiky and outside your control",
        "Python stops working",
        "Gradients take more memory",
      ],
      answer: 1,
      explain: "A training job is planned. Production traffic has unpredictable volume and request sizes, with users waiting.",
    },
    {
      kind: "text",
      q: "How many seconds are in a day? You'll use this number constantly.",
      format: "*****",
      accept: ["86400", "86,400"],
      explain: "24 × 60 × 60 = 86,400 seconds.",
    },
    {
      kind: "mcq",
      q: "A product does 200,000 requests a day at 900 output tokens each. What's the average output rate?",
      options: ["About 208 tokens/s", "About 2,083 tokens/s", "About 20,833 tokens/s", "About 180,000 tokens/s"],
      answer: 1,
      explain: "200,000 × 900 = 180,000,000 tokens a day. Divided by 86,400, that's about 2,083 tokens/s.",
    },
  ],
};

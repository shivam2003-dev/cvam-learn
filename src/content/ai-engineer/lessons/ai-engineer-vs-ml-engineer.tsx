import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "Contrast the work of an ML engineer with the work of an AI engineer",
    "Decide when a problem needs custom model work and when an API is enough",
    "Explain what AGI means and why the term is slippery",
  ],
  tasks: [
    {
      id: "confusion",
      title: "Why the two titles get mixed up",
      body: (
        <>
          <p>
            Job posts often use machine learning engineer, AI engineer and data scientist as if they
            were the same thing. They overlap, but the centre of gravity is different. Knowing the
            difference helps you pick what to learn and helps you decide who on a team should own
            which problem.
          </p>
          <p>
            An analogy helps. Picture the car industry. One group designs and manufactures engines.
            Another group takes a finished engine and builds a vehicle around it: chassis, controls,
            safety checks, a dashboard people can read. Both groups need to understand engines, but
            only one of them builds the engine.
          </p>
          <ul>
            <li>
              The <strong>ML engineer</strong> is closer to the engine builder. They prepare data,
              train and tune models, and run them efficiently at scale.
            </li>
            <li>
              The <strong>AI engineer</strong> is closer to the vehicle builder. They take a
              ready-made model and make it into a dependable product.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "comparison",
      title: "Side by side",
      body: (
        <>
          <Table
            head={["", "ML engineer", "AI engineer"]}
            rows={[
              ["Main input", "Datasets and training code", "A trained model and a product need"],
              ["Typical output", "A trained, tuned, deployed model", "A feature, workflow or agent that uses a model"],
              ["Core skills", "Statistics, model training, data pipelines, MLOps", "APIs, prompting, retrieval, tool use, evals"],
              ["Feedback loop", "Hours to days per training run", "Seconds to minutes per prompt change"],
              ["Common worry", "Overfitting, data quality, drift", "Hallucination, cost, prompt injection"],
              ["Typical tools", "Training frameworks, experiment trackers", "Model APIs, vector stores, tracing tools"],
            ]}
          />
          <p>
            The feedback loop row matters most in daily life. If you change a prompt, you can see the
            effect in seconds. If you change a training setup, you wait for a run to finish. That is
            why AI engineering feels closer to application development.
          </p>
          <Callout tone="note">
            These are tendencies, not rules. In a small company one person may do both. In a large
            company one team may train the models and another may build products on them. Judge a
            role by its tasks, not its title.
          </Callout>
        </>
      ),
    },
    {
      id: "overlap",
      title: "Where the skills overlap",
      body: (
        <>
          <p>
            An AI engineer who knows a little about training makes better choices. They understand
            why a model has a knowledge cutoff, why it can be fooled by odd phrasing and why
            fine-tuning is not a magic fix. In the other direction, an ML engineer who knows prompt
            and retrieval techniques can often solve a problem without training anything.
          </p>
          <p>Shared ground includes the following.</p>
          <ul>
            <li>Evaluation: both must measure quality with test sets and metrics.</li>
            <li>Data thinking: both care about what data goes in and how clean it is.</li>
            <li>Serving: both care about latency, throughput and cost.</li>
            <li>Monitoring: both need to notice when behaviour drifts in production.</li>
          </ul>
        </>
      ),
    },
    {
      id: "build-or-buy",
      title: "When do you need custom model work?",
      body: (
        <>
          <p>
            A good rule is to climb a ladder and stop at the first rung that meets your quality bar.
            Each rung costs more time and money than the one before.
          </p>
          <Table
            head={["Rung", "Approach", "Reach for it when"]}
            rows={[
              ["1", "Prompt an existing model", "The task is general and the model already does it well"],
              ["2", "Add context or retrieval", "The model needs your private or fresh data"],
              ["3", "Add tools or an agent loop", "The task needs actions, calculations or live lookups"],
              ["4", "Fine-tune a model", "You need a stable style, format or narrow skill that prompts cannot hold"],
              ["5", "Train your own model", "You have unique data, strict control needs and the team to support it"],
            ]}
          />
          <p>
            Cost is often the deciding factor. Here is an illustrative calculation. Say a feature
            handles 1,000,000 requests a month, each using about 1,500 tokens in total, and the
            blended price is 1 dollar per million tokens. This price is made up for the exercise.
          </p>
          <Formula>1,000,000 requests × 1,500 tokens = 1,500,000,000 tokens</Formula>
          <p>
            That is 1,500 million tokens, so the monthly bill is 1,500 × 1 dollar = 1,500 dollars.
            Training and hosting your own model needs people, hardware and time that would likely
            cost far more than that, so the API wins at this volume. At a hundred times the volume,
            or with strict privacy rules, the answer could change. The point is to do the sum with
            real prices before you decide.
          </p>
          <Callout tone="tip">
            Most teams should begin at rung 1 or 2. Move down the ladder only when you have an
            evaluation that shows the current rung falls short.
          </Callout>
        </>
      ),
    },
    {
      id: "agi",
      title: "What AGI does and does not mean",
      body: (
        <>
          <p>
            You will hear the term <strong>AGI</strong>, short for artificial general intelligence.
            It usually means a system that can learn and perform a very wide range of intellectual
            tasks at roughly human level, rather than being built for one task.
          </p>
          <p>
            There is no single agreed definition. Some people mean human-level performance on most
            economically useful work. Others mean a system that can learn any new task as quickly as
            a person. Because the definition shifts, claims that AGI has arrived or is close are hard
            to check, and people talk past each other.
          </p>
          <p>
            For your work, the term is mostly a distraction. Today's models are general in the sense
            that one model handles many tasks, yet they still make basic mistakes, lack reliable
            memory and need guardrails. You build for what the model does in your tests, not for a
            label. Judge any model by its measured behaviour on your own task.
          </p>
          <Callout tone="warn">
            Be sceptical of anyone who uses AGI to justify skipping evaluation or safety work. Your
            users experience the system you shipped, not the one in a keynote.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "ML engineers mostly build and train models. AI engineers mostly build products on top of models.",
    "AI engineering has a fast feedback loop: a prompt change shows results in seconds.",
    "Climb the ladder: prompt, context, tools, fine-tune, train. Stop at the first rung that meets your bar.",
    "Do the cost sum with real prices before choosing between an API and custom work.",
    "AGI has no single agreed definition, so judge models by measured behaviour on your task.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which task is closest to what a typical ML engineer owns?",
      options: [
        "Writing a system prompt for a support bot",
        "Training and tuning a model on a prepared dataset",
        "Adding a loading spinner to a chat page",
        "Choosing a brand colour",
      ],
      answer: 1,
      explain: "ML engineers focus on data, training, tuning and running models efficiently.",
    },
    {
      kind: "mcq",
      q: "Your app needs answers drawn from your company's private documents, and a general model already writes well. Which rung of the ladder fits first?",
      options: [
        "Train your own model from scratch",
        "Fine-tune before trying anything else",
        "Add context or retrieval to an existing model",
        "Do nothing, the model already knows your documents",
      ],
      answer: 2,
      explain: "Retrieval supplies private data at request time without any training.",
    },
    {
      kind: "text",
      q: "AGI stands for what? Three words.",
      format: "********** ******* ************",
      accept: ["artificial general intelligence"],
      explain: "AGI means artificial general intelligence, a loosely defined idea of human-level breadth.",
    },
    {
      kind: "text",
      q: "A feature makes 2,000,000 requests a month at 1,000 tokens each, at an illustrative 2 dollars per million tokens. What is the monthly cost in dollars?",
      format: "****",
      accept: ["4000", "4,000", "$4000", "$4,000"],
      explain: "2,000,000 × 1,000 = 2,000,000,000 tokens, which is 2,000 million. 2,000 × 2 = 4,000 dollars.",
    },
  ],
};

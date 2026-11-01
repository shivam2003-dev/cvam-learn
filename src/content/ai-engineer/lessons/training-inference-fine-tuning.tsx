import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Name the stages a model goes through: pre-training, post-training, then inference",
    "Explain what fine-tuning changes and what it does not",
    "Choose between prompting, retrieval and fine-tuning for a given problem",
    "Estimate model memory and the size of a LoRA adapter",
  ],
  tasks: [
    {
      id: "stages",
      title: "Three phases, three different jobs",
      body: (
        <>
          <p>
            When people say a model was trained, they often blur several different activities
            together. Keeping them apart answers many practical questions, such as why a model does
            not know yesterday's news and why it cannot learn from your chats.
          </p>
          <p>
            An analogy: a person goes to school, then gets job training, then works. Schooling gives
            broad knowledge. Job training sharpens it for one role. Working is using what they know,
            without going back to school each morning.
          </p>
          <Table
            head={["Phase", "Human analogy", "What happens", "Who does it"]}
            rows={[
              ["Pre-training", "School", "Learn language and world knowledge from huge amounts of text", "Model labs"],
              ["Post-training", "Job induction", "Teach it to follow instructions and behave helpfully and safely", "Model labs"],
              ["Fine-tuning", "Specialist course", "Adjust a model further for your task, style or format", "You, optionally"],
              ["Inference", "Doing the job", "Use the fixed model to answer requests", "You, every request"],
            ]}
          />
        </>
      ),
    },
    {
      id: "pretraining",
      title: "Pre-training: learning to predict text",
      body: (
        <>
          <p>
            In pre-training, the model reads an enormous amount of text and learns to predict the
            next token. Each wrong prediction produces a small correction to its{" "}
            <strong>weights</strong>, the numbers (called parameters) that define its behaviour.
            After a very large number of such corrections, the model has absorbed grammar, facts,
            code patterns and reasoning habits.
          </p>
          <p>
            This stage is extremely expensive and is done once by a model lab. The result is a base
            model that is good at continuing text but not yet good at taking orders. Ask it a
            question and it may continue with more questions, because that is a plausible
            continuation.
          </p>
          <p>
            Pre-training also explains the <strong>knowledge cutoff</strong>. The model only knows
            what was in its training data, which ends at some date. Later events are unknown unless
            you put them in the prompt.
          </p>
        </>
      ),
    },
    {
      id: "post-training",
      title: "Post-training: turning a base model into an assistant",
      body: (
        <>
          <p>
            Post-training shapes the base model into something you can talk to. Two common ideas are
            worth knowing at a high level.
          </p>
          <ul>
            <li>
              <strong>Instruction tuning</strong> (supervised fine-tuning): train on many examples
              of an instruction paired with a good answer, so the model learns to respond rather
              than just continue.
            </li>
            <li>
              <strong>Preference tuning</strong>: show the model pairs of answers where people or
              other models marked one as better, and nudge it toward the preferred style. Methods
              such as reinforcement learning from human feedback and direct preference optimisation
              belong here.
            </li>
          </ul>
          <p>
            Labs use many more techniques and the details change often. What matters for you is the
            effect: this stage is why chat models obey system prompts, refuse some requests and
            write in a helpful tone.
          </p>
        </>
      ),
    },
    {
      id: "inference",
      title: "Inference: the weights stay fixed",
      body: (
        <>
          <p>
            <strong>Inference</strong> means running the trained model to produce output. This is
            what happens on every API call. The weights do not change. The model does not learn
            from your conversation, which is why you must supply facts in the prompt each time.
          </p>
          <p>
            Inference is also where your bill comes from. Memory needed just to hold the weights is
            simple arithmetic:
          </p>
          <Formula>weight memory = parameters × bytes per parameter</Formula>
          <p>
            Take a hypothetical model with 7 billion parameters stored as 16-bit numbers (2 bytes
            each): 7,000,000,000 × 2 = 14,000,000,000 bytes, about 14 GB. Store the same weights as
            8-bit numbers and it is about 7 GB. This is why smaller or compressed models can run on
            laptops while the largest ones need clusters. A running model needs extra memory beyond
            weights for working data, so treat this as a lower bound.
          </p>
        </>
      ),
    },
    {
      id: "fine-tuning",
      title: "Fine-tuning: continuing training on your data",
      body: (
        <>
          <p>
            Fine-tuning takes an already trained model and trains it a little more on your own
            examples. It changes behaviour: style, format, tone, or a narrow skill. A typical
            training set is a file of example conversations, one per line:
          </p>
          <pre>
            <code>{`{"messages": [{"role": "system", "content": "Reply as a concise support agent."}, {"role": "user", "content": "I forgot my password."}, {"role": "assistant", "content": "Use Reset password on the sign-in page. A link arrives by email within a few minutes."}]}`}</code>
          </pre>
          <p>
            That is one example, and it sits on a single line. A JSONL file holds one such line per
            example. The exact format varies by provider, so follow the current guide for the
            service you use.
          </p>
          <p>
            Training every weight of a large model is costly. A popular shortcut is{" "}
            <strong>LoRA</strong> (low-rank adaptation). It freezes the original weights and
            trains two small matrices per adapted layer. If a weight matrix is d × d, a LoRA
            adapter of rank r adds only:
          </p>
          <Formula>adapter parameters = 2 × d × r</Formula>
          <p>
            For d = 4,096 and r = 8: the full matrix has 4,096 × 4,096 = 16,777,216 parameters. The
            adapter has 2 × 4,096 × 8 = 65,536. That is 65,536 ÷ 16,777,216 = 1/256, about 0.39
            percent of the matrix. Far less to train and store, and you can keep many small adapters
            for one base model.
          </p>
        </>
      ),
    },
    {
      id: "choose",
      title: "Prompt, retrieve or fine-tune?",
      body: (
        <>
          <Table
            head={["Problem", "Best first move", "Why"]}
            rows={[
              ["Model ignores your format or tone", "Better prompt, add examples", "Cheap and fast to test"],
              ["Needs facts from your documents", "Retrieval (RAG)", "Facts change, and weights cannot be updated cheaply"],
              ["Needs a consistent house style at scale", "Fine-tuning", "Bakes behaviour in and shortens prompts"],
              ["Needs fresh or private data per user", "Retrieval or tools", "Fine-tuning cannot track per-user data"],
              ["Small model must match a big one on one task", "Fine-tuning", "Specialisation can close the gap"],
            ]}
          />
          <Callout tone="warn">
            Fine-tuning is poor at teaching new facts and good at teaching new behaviour. If your
            answers go wrong because the model lacks information, supply the information at request
            time instead.
          </Callout>
          <Callout tone="tip">
            Before fine-tuning, build an evaluation set. Without one you cannot tell whether the
            tuned model is better, and you may have made it worse at tasks you did not test.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Pre-training builds broad knowledge and sets the knowledge cutoff. Post-training makes the model follow instructions.",
    "Inference runs a fixed model on every request. The model does not learn from your chats.",
    "Weight memory is parameters times bytes per parameter, so lower precision shrinks it.",
    "Fine-tuning changes behaviour well and facts poorly. LoRA trains a tiny adapter instead of all weights.",
    "Try prompting, then retrieval, then fine-tuning, and measure each step.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which phase gives a model its knowledge cutoff?",
      options: ["Inference", "Pre-training", "Prompting", "Streaming"],
      answer: 1,
      explain: "Pre-training data ends at some date, and the model knows nothing newer unless you supply it.",
    },
    {
      kind: "mcq",
      q: "Your model gives wrong answers because it lacks your latest internal documents. What fits best?",
      options: [
        "Fine-tune on the documents once and never update",
        "Lower the temperature",
        "Retrieve the relevant documents and add them to the prompt",
        "Rename the model",
      ],
      answer: 2,
      explain: "Retrieval supplies current facts at request time. Fine-tuning is weak at teaching and refreshing facts.",
    },
    {
      kind: "text",
      q: "During which phase are the model weights fixed while it answers requests? One word.",
      format: "*********",
      accept: ["inference"],
      explain: "Inference uses the trained model as is. Weights change only during training and fine-tuning.",
    },
    {
      kind: "text",
      q: "A LoRA adapter of rank 4 is applied to a 1,024 × 1,024 weight matrix. Using 2 × d × r, how many adapter parameters is that?",
      format: "****",
      accept: ["8192", "8,192"],
      explain: "2 × 1,024 × 4 = 8,192 parameters.",
    },
  ],
};

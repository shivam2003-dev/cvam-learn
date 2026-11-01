import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Separate fine-tuning from distillation and say when each one fits",
    "Explain how LoRA adapters keep tuning small and cheap to serve",
    "Calculate the break-even point of moving to a smaller tuned model",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: a large model is often overkill",
      body: (
        <>
          <p>
            Your product may send a million requests a day to a large general model, and nearly all
            of them are the same kind of task: label this ticket, pull fields from this email, rewrite
            this text in the house style. You're paying for a model that can write poetry and prove
            theorems to do one narrow job.
          </p>
          <p>
            A smaller model would be faster and cheaper, since it has fewer weights to read and
            compute. Out of the box, though, it may not be good enough. Training can close that gap,
            and it needs far less data and time than building a model from nothing.
          </p>
          <Table
            head={["", "Fine-tuning", "Distillation"]}
            rows={[
              ["Goal", "Adapt a model to a task or style", "Copy a big model's behavior into a small one"],
              ["Training data", "Your labeled examples", "Outputs produced by a larger model"],
              ["Model size", "Unchanged", "Student is smaller than teacher"],
              ["Main benefit", "Better quality on your task", "Lower cost and latency"],
            ]}
          />
          <p>
            In short, <strong>fine-tuning</strong> means continuing to train an existing model on your
            own data. <strong>Distillation</strong> means training a small <strong>student</strong>{" "}
            model to imitate a large <strong>teacher</strong>. The two often combine: you distill by
            fine-tuning a small open model on a large model's outputs.
          </p>
          <p>
            An analogy: fine-tuning is sending a general doctor on a dermatology course. Distillation
            is a new assistant shadowing an experienced specialist, learning to handle the routine
            cases the same way.
          </p>
        </>
      ),
    },
    {
      id: "when",
      title: "Try the cheap fixes first",
      body: (
        <>
          <p>
            Training brings a new pipeline, a new model version and new evals to keep up. So check
            whether something simpler solves it, in this order:
          </p>
          <ol>
            <li>Improve the prompt, and add a few examples to it.</li>
            <li>Use structured outputs, if the problem is format.</li>
            <li>Use RAG, if the model lacks knowledge.</li>
            <li>Fine-tune, if the task and data are stable and volume justifies it.</li>
          </ol>
          <p>
            The third point is a common trap. Fine-tuning mainly teaches <em>behavior</em>, not facts. If
            your prices change every week, a tuned model will keep quoting old ones. Retrieval
            handles facts that change, and tuning handles how the model behaves.
          </p>
          <Table
            head={["Good fit for tuning", "Poor fit for tuning"]}
            rows={[
              ["Classification and routing", "Fresh or fast-changing facts"],
              ["Extraction into a fixed format", "Tasks that shift every month"],
              ["A consistent tone or style", "Low volume, where savings are tiny"],
              ["Long prompts you want to shorten", "Open-ended reasoning"],
            ]}
          />
        </>
      ),
    },
    {
      id: "lora",
      title: "LoRA: tune a tiny fraction of the model",
      body: (
        <>
          <p>
            Retraining every weight is slow and creates a full model copy for each task. A{" "}
            <strong>LoRA</strong> adapter, short for low-rank adaptation, avoids this. It freezes the
            original weights and learns a small update, stored as two thin matrices. Multiplying them
            gives a change the same shape as the original weights.
          </p>
          <p>The savings are large. For a layer with weight matrix size d × d, and adapter rank r:</p>
          <Formula>adapter parameters = 2 × d × r</Formula>
          <p>Take a layer with d = 4,096 and r = 16:</p>
          <pre>
            <code>{`Full matrix:  4,096 × 4,096     = 16,777,216 parameters
LoRA adapter: 2 × 4,096 × 16    =    131,072 parameters

131,072 ÷ 16,777,216 = 0.78%`}</code>
          </pre>
          <p>
            Most projects use the PEFT library. Here, <code>r</code> is the rank, and{" "}
            <code>target_modules</code> names the layers to adapt. Those names vary by model
            architecture.
          </p>
          <pre>
            <code>{`from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    task_type="CAUSAL_LM",
)
model = get_peft_model(base_model, config)
model.print_trainable_parameters()`}</code>
          </pre>
          <p>
            For serving, the best part is that one set of base weights can back many adapters. So a
            single GPU can serve several tuned tasks, picking the adapter for each request:
          </p>
          <pre>
            <code>{`vllm serve Qwen/Qwen2.5-7B-Instruct \\
  --enable-lora \\
  --lora-modules ticket-router=/models/adapters/ticket-router`}</code>
          </pre>
          <p>
            Clients then pass <code>ticket-router</code> as the model name. The catch is routing:
            adapters must be loaded somewhere, which is the subject of LoRA-Aware Routing later on. If
            one adapter gets all your traffic, you can merge it into the base weights and avoid the
            small runtime overhead.
          </p>
        </>
      ),
    },
    {
      id: "distill",
      title: "Distillation in practice",
      body: (
        <>
          <p>A typical distillation project for an LLM runs like this:</p>
          <ol>
            <li>Collect real inputs from your product.</li>
            <li>Run them through the teacher and keep the outputs.</li>
            <li>Filter out bad teacher outputs, so the student doesn't learn from mistakes.</li>
            <li>Fine-tune a small student on these input and output pairs.</li>
            <li>Compare student and teacher on a held-out eval set.</li>
          </ol>
          <p>
            Classic distillation goes further and trains the student on the teacher's full
            probability distribution for each token, not only its final text. That gives a richer
            signal, but it needs access to the teacher's outputs at that level, so it mostly applies
            when you run the teacher yourself.
          </p>
          <Callout tone="warn">
            Check the terms first. Some commercial model providers restrict using their outputs to
            train other models. Open model licenses can also carry conditions. Read the terms for your
            exact case before you collect training data.
          </Callout>
        </>
      ),
    },
    {
      id: "breakeven",
      title: "Worked example: does it pay off?",
      body: (
        <>
          <p>Tuning has an upfront cost and saves money each day, so calculate the payback time:</p>
          <Formula>break-even days = project cost ÷ daily savings</Formula>
          <p>All of these figures are illustrative:</p>
          <pre>
            <code>{`Current: 20M tokens/day at $10 per 1M tokens
  20 × $10 = $200/day

Tuned small model: 2 dedicated GPUs at $2/hour
  2 × $2 × 24 hours = $96/day

Daily savings: $200 − $96 = $104
Project cost:  $5,000 for data, training and evals

Break-even: $5,000 ÷ $104 = about 48 days`}</code>
          </pre>
          <p>
            That looks good, but check what it leaves out. The tuned model needs retraining as data
            drifts, plus evals and someone on call. If volume drops to 5M tokens a day, the API costs
            only $50 and the dedicated GPUs cost more than it. So volume decides this, as it does for
            shared vs. dedicated inference generally.
          </p>
          <Callout tone="tip">
            Set the quality target before you start: for example, "the student must match the teacher
            on 95% of eval cases." Then stop when you reach it. Otherwise tuning projects tend to run
            on with no clear end.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Fine-tuning adapts a model to your task, and distillation moves a large model's skill into a small one.",
    "Fix prompts, formats and retrieval first, since tuning mainly teaches behavior rather than facts.",
    "LoRA trains a tiny fraction of the parameters and lets many adapters share one base model.",
    "Distillation relies on clean teacher outputs and on terms that allow the use.",
    "Payback depends on sustained volume, so calculate break-even before you start.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Your product's prices change weekly and the model must quote them. What's the best fix?",
      options: ["Fine-tune every week", "Use RAG to retrieve current prices", "Distill a larger model", "Raise the temperature"],
      answer: 1,
      explain: "Tuning teaches behavior. Retrieval supplies facts that change.",
    },
    {
      kind: "mcq",
      q: "Why are LoRA adapters attractive for serving?",
      options: [
        "They replace the base weights entirely",
        "Many adapters can share one set of base weights",
        "They remove the need for a KV cache",
        "They only run on CPUs",
      ],
      answer: 1,
      explain: "Adapters are small, so one GPU's base model can back many tuned tasks.",
    },
    {
      kind: "text",
      q: "A layer has d = 1,000 and a LoRA adapter has rank 8. Using 2 × d × r, how many adapter parameters does it have?",
      format: "*****",
      accept: ["16000", "16,000"],
      explain: "2 × 1,000 × 8 = 16,000.",
    },
    {
      kind: "text",
      q: "In distillation, what is the small model called?",
      format: "*******",
      accept: ["student", "the student"],
      explain: "The small student learns to imitate the large teacher.",
    },
    {
      kind: "text",
      q: "A tuning project costs $3,000 and saves $100 a day. How many days until it breaks even?",
      format: "**",
      accept: ["30", "30 days"],
      explain: "$3,000 ÷ $100 = 30 days.",
    },
  ],
};

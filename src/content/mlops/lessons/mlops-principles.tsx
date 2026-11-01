import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 10,
  difficulty: "Easy",
  objectives: [
    "List the core principles behind MLOps",
    "Separate continuous integration, delivery, training and monitoring",
    "Apply reproducibility and testing to a real ML project",
  ],
  tasks: [
    {
      id: "principles",
      title: "Five ideas that hold it together",
      body: (
        <>
          <p>Tools change every year, but these principles don't.</p>
          <Table
            head={["Principle", "In one line"]}
            rows={[
              ["Automation", "If you repeat it, make a pipeline do it"],
              ["Versioning", "Track code, data, models and config together"],
              ["Testing", "Check code, data and model behavior before release"],
              ["Reproducibility", "Anyone can rebuild the same model later"],
              ["Monitoring", "Watch the system, the data and the predictions"],
            ]}
          />
        </>
      ),
    },
    {
      id: "continuous",
      title: "The four continuous practices",
      body: (
        <>
          <p>DevOps gave us two of these. ML adds two more.</p>
          <ul>
            <li><strong>Continuous integration:</strong> test code, and also validate data and models.</li>
            <li><strong>Continuous delivery:</strong> automatically release a pipeline or model.</li>
            <li><strong>Continuous training:</strong> retrain automatically on new data or a trigger.</li>
            <li><strong>Continuous monitoring:</strong> track live data and model performance.</li>
          </ul>
        </>
      ),
    },
    {
      id: "reproducible",
      title: "What reproducible really means",
      body: (
        <>
          <p>
            Six months from now, someone asks why the model rejected a customer. Can you tell them
            which model made that decision, what data trained it, and which code built it? To
            answer, each model needs a record of:
          </p>
          <ul>
            <li>The Git commit of the training code</li>
            <li>The exact version of the dataset</li>
            <li>Hyperparameters and random seeds</li>
            <li>Library versions and the environment</li>
            <li>Evaluation results</li>
          </ul>
          <Callout tone="warn">
            GPU training isn't always perfectly deterministic, even with fixed seeds. The practical
            goal is to get very close and to know exactly what went into each model.
          </Callout>
        </>
      ),
    },
    {
      id: "testing",
      title: "Testing an ML system",
      body: (
        <>
          <Table
            head={["Test", "Example check"]}
            rows={[
              ["Data validation", "Schema, missing values, value ranges"],
              ["Unit tests", "A feature function handles empty input"],
              ["Model quality", "Accuracy beats the current production model"],
              ["Slice tests", "Performance doesn't collapse for one user group"],
              ["Infrastructure", "The model loads and answers within its latency target"],
            ]}
          />
          <Callout tone="tip">
            Add a data validation check first. Bad data causes many production ML failures, and it's
            one of the cheapest tests to write.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Automation, versioning, testing, reproducibility and monitoring are the core principles.",
    "ML adds continuous training and monitoring to CI and CD.",
    "Each model should trace back to its code, data, parameters and environment.",
    "Test data and model behavior as well as code.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which practice is specific to ML and doesn't come from classic DevOps?",
      options: ["Continuous integration", "Continuous training", "Code review", "Version control"],
      answer: 1,
      explain: "Continuous training retrains models automatically as data changes.",
    },
    {
      kind: "mcq",
      q: "Which is needed to reproduce a model besides the code?",
      options: ["The office location", "The exact dataset version", "The team's calendar", "The domain name"],
      answer: 1,
      explain: "Model behavior depends on data, so data must be versioned too.",
    },
    {
      kind: "text",
      q: "What term means retraining models automatically on new data or a trigger? Two words.",
      format: "********** ********",
      accept: ["continuous training"],
      explain: "Continuous training keeps a model up to date as new data arrives.",
    },
  ],
};

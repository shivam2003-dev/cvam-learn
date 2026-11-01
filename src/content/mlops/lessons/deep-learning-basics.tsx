import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Medium",
  objectives: [
    "Explain what layers, weights and activation functions do",
    "Count a network's parameters and estimate its memory",
    "Read a PyTorch training loop and estimate how long it will run",
    "Diagnose common GPU training and serving problems",
  ],
  tasks: [
    {
      id: "why-deep",
      title: "The problem deep learning solves",
      body: (
        <>
          <p>
            For a table of customer data, a person can hand-pick useful features. For a photo, that
            doesn't work. Raw input is millions of pixels, and no single pixel means "cat". Text
            and audio have the same problem.
          </p>
          <p>
            A <strong>neural network</strong> learns the features too. Picture an assembly line.
            Early stations find simple things like edges. Later stations combine those into shapes,
            and the last ones combine shapes into objects. Nobody designs the stations. Training
            shapes them. "Deep" just means there are many stations, or <strong>layers</strong>.
          </p>
        </>
      ),
    },
    {
      id: "neurons",
      title: "Neurons, layers and parameters",
      body: (
        <>
          <p>
            A single <strong>neuron</strong> multiplies each input by a weight, adds them up, adds a{" "}
            <strong>bias</strong> term, and passes the result through an{" "}
            <strong>activation function</strong>.
          </p>
          <p>
            Take inputs 2 and 3, weights 0.5 and −1, and a bias of 1. The sum is (2 × 0.5) + (3 ×
            −1) + 1 = −1. The common <strong>ReLU</strong> activation returns the input if it's
            positive and 0 otherwise, so the output here is 0.
          </p>
          <p>
            The activation matters. Without a non-linear step, stacking layers collapses into one
            linear function, and depth adds nothing.
          </p>
          <p>
            In a fully connected layer, every input connects to every output. That makes parameter
            counts easy to work out:
          </p>
          <Formula>parameters = (inputs × outputs) + outputs</Formula>
          <p>The extra term is one bias per output. For a small digit classifier:</p>
          <pre>
            <code>{`Layer 1:  784 inputs → 128 outputs   (784 × 128) + 128 = 100,480
Layer 2:  128 inputs →  10 outputs   (128 × 10)  + 10  =   1,290
Total                                                   101,770`}</code>
          </pre>
          <p>
            At 4 bytes per parameter, that's about 407 KB. Count parameters and you can size the
            memory for much larger models too:
          </p>
          <Table
            head={["Precision", "Bytes per value", "7 billion parameters"]}
            rows={[
              ["32-bit float", "4", "28 GB"],
              ["16-bit float", "2", "14 GB"],
              ["8-bit integer", "1", "7 GB"],
            ]}
          />
          <p>
            Lower precision saves memory and can cost some accuracy, so test it before you adopt
            it. Storing weights at low precision is called <strong>quantization</strong>.
          </p>
        </>
      ),
    },
    {
      id: "training-loop",
      title: "The training loop",
      body: (
        <>
          <p>
            Deep learning trains with the same downhill idea as other models. The new piece is{" "}
            <strong>backpropagation</strong>, which computes gradients for all weights by working
            backward from the loss. Training uses small groups of examples called{" "}
            <strong>batches</strong>. Each weight update is a <strong>step</strong>.
          </p>
          <pre>
            <code>{`import torch
from torch import nn

model = nn.Sequential(
    nn.Linear(784, 128), nn.ReLU(), nn.Linear(128, 10)
).to("cuda")
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(10):
    model.train()
    for x, y in train_loader:
        x, y = x.to("cuda"), y.to("cuda")
        optimizer.zero_grad()            # clear old gradients
        loss = loss_fn(model(x), y)      # forward pass
        loss.backward()                  # backpropagation
        optimizer.step()                 # update the weights

    torch.save(
        {
            "epoch": epoch,
            "model": model.state_dict(),
            "optimizer": optimizer.state_dict(),
        },
        f"checkpoint-{epoch}.pt",
    )`}</code>
          </pre>
          <p>
            The file saved each epoch is a <strong>checkpoint</strong>. If the machine dies, you
            resume from the last one and lose little work. Note that it saves the optimizer state
            as well, because the Adam optimizer keeps running statistics that it needs in order to
            continue properly.
          </p>
          <p>Estimate run time before you start. Here's an illustrative job:</p>
          <pre>
            <code>{`Dataset:     1,000,000 examples
Batch size:  256
Steps/epoch: 1,000,000 ÷ 256 = 3,906.25, so 3,907 steps
Speed:       20 steps per second (measure yours)
One epoch:   3,907 ÷ 20 ≈ 195 seconds
10 epochs:   about 1,950 seconds, or roughly 33 minutes`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "architectures",
      title: "Common architectures",
      body: (
        <>
          <Table
            head={["Architecture", "Good at", "Key idea"]}
            rows={[
              ["CNN (convolutional)", "Images, some audio", "Small filters slide across the input"],
              ["RNN or LSTM", "Older sequence work", "Reads one step at a time and keeps a memory"],
              ["Transformer", "Text, code, many modern vision and audio models", "Attention lets each token look at the others"],
            ]}
          />
          <p>
            You rarely train these from nothing. <strong>Transfer learning</strong> starts from a
            model trained on a huge dataset and adjusts it for your task. This cuts data needs and
            GPU time sharply, and it's a common way teams get deep learning into production.
          </p>
        </>
      ),
    },
    {
      id: "running-it",
      title: "What goes wrong in practice",
      body: (
        <>
          <p>
            Training needs far more memory than inference. It holds weights, gradients, optimizer
            state and the intermediate values from each layer. Adam alone stores two extra values
            per parameter, so weights, gradients and Adam state take about four times the weight
            size before you count those intermediate values.
          </p>
          <Table
            head={["Symptom", "Likely cause", "First thing to try"]}
            rows={[
              ["CUDA out of memory", "Batch too large for the GPU", "Lower the batch size or use mixed precision"],
              ["GPU utilization is low", "Data loading can't keep up", "Add loader workers, move data closer"],
              ["Loss becomes NaN", "Learning rate too high or bad inputs", "Lower the rate and validate the data"],
              ["Worse results in serving", "Model left in training mode", "Call model.eval() before predicting"],
              ["Spot machine lost mid-run", "Cloud reclaimed the capacity", "Resume from the last checkpoint"],
            ]}
          />
          <p>
            <strong>Mixed precision</strong> runs parts of the work in 16-bit floats, which saves
            memory and often time.
          </p>
          <Callout tone="warn">
            Layers such as dropout and batch normalization behave differently in training and
            evaluation. Forgetting <code>model.eval()</code> gives noisy or wrong predictions with
            no error. Wrap inference in <code>torch.inference_mode()</code> too, so PyTorch doesn't
            track gradients and waste memory.
          </Callout>
          <pre>
            <code>{`model.eval()
with torch.inference_mode():
    scores = model(batch)`}</code>
          </pre>
          <Callout tone="tip">
            Watch GPU utilization and memory during training. An expensive GPU sitting idle because
            the data loader is slow is one of the easiest savings you'll find.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Neural networks learn their own features from raw data, layer by layer.",
    "Parameters times bytes per value gives you the size of the weights.",
    "Training repeats forward pass, backpropagation and weight update over batches.",
    "Save checkpoints with optimizer state so jobs can survive failures.",
    "Always switch to evaluation mode before serving.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why do neural networks need non-linear activation functions?",
      options: [
        "They make files smaller",
        "Without them, stacked layers collapse into a single linear function",
        "They replace the optimizer",
        "They are required for checkpoints",
      ],
      answer: 1,
      explain: "Non-linearity is what lets extra layers model more complex patterns.",
    },
    {
      kind: "mcq",
      q: "GPU utilization sits at 20% during training. What should you check first?",
      options: [
        "The data loading pipeline",
        "The model's license",
        "The number of output classes",
        "The registry's alias",
      ],
      answer: 0,
      explain: "A GPU that's waiting for batches sits idle, so a slow loader is the usual cause.",
    },
    {
      kind: "text",
      q: "A fully connected layer has 100 inputs and 10 outputs, with biases. How many parameters does it have?",
      format: "****",
      accept: ["1010", "1,010"],
      explain: "(100 × 10) + 10 = 1,010.",
    },
    {
      kind: "text",
      q: "A model has 1 billion parameters in 16-bit floats. How many GB do the weights take, where 1 GB is 1,000,000,000 bytes?",
      format: "*",
      accept: ["2", "2gb", "2 gb"],
      explain: "1,000,000,000 × 2 bytes = 2 GB.",
    },
  ],
};

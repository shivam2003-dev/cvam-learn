import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Easy",
  objectives: [
    "Explain why pickle-based checkpoints are a security risk",
    "Describe the safetensors file layout and read its header",
    "Explain how memory mapping speeds up loading, and what it can't fix",
  ],
  tasks: [
    {
      id: "pickle",
      title: "The problem: a checkpoint that can run code",
      body: (
        <>
          <p>
            For years, the usual way to save PyTorch weights was <code>torch.save</code>, which
            produces <code>.bin</code> or <code>.pt</code> files based on Python's{" "}
            <strong>pickle</strong> format. Pickle isn't just data. It's a small program that
            rebuilds Python objects, and that program can call any function, including ones that
            run shell commands.
          </p>
          <p>
            So loading an untrusted pickle file is like running an untrusted script. For a team
            that downloads open models, each new checkpoint is a security decision. Passing{" "}
            <code>weights_only=True</code> to <code>torch.load</code> restricts what can be loaded,
            and it's the default in recent PyTorch versions, but the format itself stays risky.
          </p>
          <p>
            Pickle also has a speed problem. Objects are rebuilt in Python, and bytes may be copied
            more than once on their way to the GPU.
          </p>
          <p>
            <strong>safetensors</strong> fixes both with a simple idea: a model file should hold
            only numbers and a description of them. A pickle file is a parcel that comes with a
            robot to unpack it. A safetensors file is a labeled shelf. You can read the labels and
            take what you need, and nothing on it can act.
          </p>
        </>
      ),
    },
    {
      id: "format",
      title: "The file format",
      body: (
        <>
          <p>A safetensors file has three parts, in this order:</p>
          <Table
            head={["Part", "Size", "Contents"]}
            rows={[
              ["Header length", "8 bytes", "Unsigned 64-bit little-endian integer, N"],
              ["Header", "N bytes", "JSON listing each tensor"],
              ["Data", "The rest", "Raw tensor bytes"],
            ]}
          />
          <p>The header is plain JSON. An entry looks like this:</p>
          <pre>
            <code>{`{
  "__metadata__": { "format": "pt" },
  "model.embed.weight": {
    "dtype": "F16",
    "shape": [1024, 768],
    "data_offsets": [4096, 1576960]
  }
}`}</code>
          </pre>
          <p>
            Offsets count from the start of the data section, not the start of the file. You can
            check that this entry is consistent:
          </p>
          <Formula>tensor bytes = product of shape × bytes per value</Formula>
          <pre>
            <code>{`1,024 × 768 × 2 = 1,572,864 bytes
4,096 + 1,572,864 = 1,576,960   (matches the end offset)`}</code>
          </pre>
          <p>
            To find the first byte in the file, add what comes before the data. With a 2,000-byte
            header, that's <code>8 + 2,000 + 4,096 = 6,104</code>. Because each location is simple
            arithmetic, a loader can jump straight to one tensor.
          </p>
          <p>Reading the header takes only the Python standard library:</p>
          <pre>
            <code>{`import json, struct

with open("model.safetensors", "rb") as f:
    header_len = struct.unpack("<Q", f.read(8))[0]
    header = json.loads(f.read(header_len))

for name, info in header.items():
    if name != "__metadata__":
        print(name, info["dtype"], info["shape"])`}</code>
          </pre>
          <p>
            This is handy: you can inspect a 100 GB model's structure, or check its precision,
            without loading any weights.
          </p>
        </>
      ),
    },
    {
      id: "loading",
      title: "Why it loads fast",
      body: (
        <>
          <p>
            safetensors uses <strong>memory mapping</strong>, or mmap. The operating system maps
            the file into the process's address space, and bytes are read from disk only when
            touched. Pages already read stay in the OS page cache, so several processes on one
            machine can share them rather than each making a copy. Tensor bytes are used in place,
            with no rebuilding step.
          </p>
          <pre>
            <code>{`from safetensors import safe_open

with safe_open("model.safetensors", framework="pt", device="cuda:0") as f:
    print(list(f.keys())[:5])
    tensor = f.get_tensor("model.embed.weight")`}</code>
          </pre>
          <p>
            Large models are split into <strong>shards</strong>, with names such as{" "}
            <code>model-00001-of-00004.safetensors</code>. A file called{" "}
            <code>model.safetensors.index.json</code> has a <code>weight_map</code> saying which
            shard holds each tensor.
          </p>
          <Callout tone="warn">
            Memory mapping removes copying, not physics. The bytes still have to come off storage.
            With 60 GB of weights, an illustrative 2 GB/s local disk takes 30 seconds, and a 200
            MB/s network volume takes 300 seconds. On cold starts, storage bandwidth is usually the
            real limit.
          </Callout>
        </>
      ),
    },
    {
      id: "comparison",
      title: "Formats side by side",
      body: (
        <>
          <Table
            head={["Format", "Can run code on load?", "Partial reads", "Common use"]}
            rows={[
              ["Pickle (.bin, .pt)", "Yes", "Not by design", "Older checkpoints"],
              ["safetensors", "No", "Yes", "Default for sharing weights"],
              ["GGUF", "No, by design", "Yes", "llama.cpp and local inference"],
              ["ONNX", "No", "Not the main goal", "Whole graph for a runtime"],
            ]}
          />
          <p>
            Note that safetensors stores only weights. It holds no model code, tokenizer or
            graph, so those live in other files beside it.
          </p>
          <p>Converting an old checkpoint is a short script:</p>
          <pre>
            <code>{`import torch
from safetensors.torch import save_file

state = torch.load("pytorch_model.bin", weights_only=True, map_location="cpu")
save_file(state, "model.safetensors")`}</code>
          </pre>
          <p>
            If two names share one tensor, as tied embeddings often do, <code>save_file</code> will
            refuse. The <code>save_model</code> function in the same module handles that case when
            you have the model object.
          </p>
          <Callout tone="warn" title="Safe format, unsafe repo">
            safetensors protects only the weights. Passing <code>trust_remote_code=True</code> in
            Transformers runs Python from the model repository, whatever format its weights use.
            Review that code, and pin the exact revision you reviewed.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Pickle checkpoints can run arbitrary code when loaded; safetensors holds only data.",
    "The layout is an 8-byte length, a JSON header, then raw tensor bytes.",
    "You can read a model's structure from the header without loading any weights.",
    "Memory mapping avoids copies and shares pages, but disk bandwidth still sets cold-start time.",
    "A safe weight format doesn't make the rest of a model repository safe.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why can loading a pickle-based checkpoint be dangerous?",
      options: [
        "It may be too large for memory",
        "Pickle rebuilds objects by running instructions, which can call arbitrary functions",
        "It only works on CPUs",
        "It stores weights in plain text",
      ],
      answer: 1,
      explain: "Pickle acts as a small program, so a malicious file can run code when it's loaded.",
    },
    {
      kind: "mcq",
      q: "What does memory mapping NOT remove?",
      options: [
        "Extra data copies",
        "Pickle's code execution",
        "The time to read bytes from slow storage on a cold start",
        "The need to rebuild objects in Python",
      ],
      answer: 2,
      explain: "The bytes still have to be read from storage the first time they're touched.",
    },
    {
      kind: "text",
      q: "A safetensors tensor is F16 with shape [100, 200]. How many bytes does it take?",
      format: "*****",
      accept: ["40000", "40,000"],
      explain: "100 × 200 × 2 bytes = 40,000 bytes.",
    },
    {
      kind: "text",
      q: "In what data format is the safetensors header stored?",
      format: "****",
      accept: ["json"],
      explain: "The header is JSON, so any language can parse it easily.",
    },
  ],
};

import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "Name the main kinds of agent tooling and what each is good at",
    "Write a minimal agent loop by hand with no framework",
    "Decide when a framework earns its place and when it adds friction",
    "Estimate the worst-case cost of a capped agent loop",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem: lots of choice, little clarity",
      body: (
        <>
          <p>
            Once you know the agent loop, you must decide how to build it. You could call a model
            provider's SDK directly, or adopt a framework that gives you ready-made pieces for
            memory, tools, retrieval, tracing and multi-step control. New engineers often pick a
            framework first and learn the loop second, which makes bugs very hard to read.
          </p>
          <p>
            A better order is: understand the loop, write it once by hand, then choose a framework
            only if it removes work you actually have.
          </p>
          <Callout tone="note">
            This space moves fast. Names, APIs and recommended styles change from month to month.
            Treat this lesson as a map of categories, and read the current docs before you start.
          </Callout>
        </>
      ),
    },
    {
      id: "landscape",
      title: "The landscape by category",
      body: (
        <>
          <Table
            head={["Option", "What it is", "Good fit"]}
            rows={[
              ["Direct provider SDK", "The model vendor's own client library with tool calling", "Simple agents, full control, easy debugging"],
              ["LangChain", "A broad library of components and integrations for LLM apps", "Wide choice of integrations and quick prototypes"],
              ["LangGraph", "A graph-based layer for stateful, multi-step agents, from the LangChain team", "Branching flows, retries, human approval steps"],
              ["LlamaIndex", "Centred on loading, indexing and querying your data, with agent features", "Retrieval-heavy apps over documents"],
              ["Haystack", "Pipelines built from connected components, aimed at search and retrieval", "Explicit, testable RAG pipelines"],
              ["Google ADK", "Google's Agent Development Kit, built around Gemini but not tied to it", "Teams already in the Google Cloud ecosystem"],
              ["Manual loop", "Your own while loop around a model call and a tool registry", "Learning, small agents, strict control"],
            ]}
          />
          <p>
            Other kits exist too, including SDKs from model providers that bundle the loop for you,
            and role-based multi-agent libraries. The same questions apply to all of them.
          </p>
        </>
      ),
    },
    {
      id: "manual",
      title: "The manual loop: about thirty lines",
      body: (
        <>
          <p>
            Here is a framework-free agent. It is illustrative, since SDK details differ, but the
            shape is the same everywhere.
          </p>
          <pre>
            <code>{`import json
import os

MAX_STEPS = 8

def run_agent(client, tools, registry, user_goal, system_prompt):
    model = os.environ["MODEL_NAME"]           # a current model, set by you
    messages = [{"role": "user", "content": user_goal}]

    for step in range(MAX_STEPS):
        resp = client.messages.create(
            model=model, max_tokens=1024,
            system=system_prompt, tools=tools, messages=messages,
        )
        messages.append({"role": "assistant", "content": resp.content})

        if resp.stop_reason != "tool_use":      # model gave a final answer
            return resp.content[-1].text

        results = []
        for block in resp.content:
            if block.type != "tool_use":
                continue
            try:
                out = registry[block.name](**block.input)
                content, is_error = json.dumps(out), False
            except Exception as exc:            # tell the model, do not crash
                content, is_error = str(exc), True
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": content, "is_error": is_error})
            print(f"step {step}: {block.name} error={is_error}")   # trace

        messages.append({"role": "user", "content": results})

    return "Stopped: step limit reached."`}</code>
          </pre>
          <p>
            That covers the loop, tool dispatch, error handling, a hard step cap and a trace line.
            Everything a framework adds sits on top of this.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "Budget the loop before you ship it",
      body: (
        <>
          <p>
            The step cap gives you a worst-case bill. Every step re-sends the history, so use the
            average input size for a rough figure:
          </p>
          <Formula>worst-case cost = max steps × avg input tokens × price per token</Formula>
          <p>
            Illustrative numbers: 8 steps, 5,000 input tokens per call on average, and a price of $3
            per million input tokens (check your provider for real prices).
          </p>
          <pre>
            <code>{`tokens = 8 × 5,000        = 40,000
cost   = 40,000 ÷ 1,000,000 × 3 = $0.12 per run (input only)`}</code>
          </pre>
          <p>
            Twelve cents is fine for a support agent and painful at ten million runs. Output tokens
            are billed too, usually at a higher rate, so add them. The point is that a cap turns an
            unbounded risk into a number you can plan around.
          </p>
        </>
      ),
    },
    {
      id: "choose",
      title: "How to choose",
      body: (
        <>
          <p>Ask these questions in order:</p>
          <ul>
            <li>
              <strong>Can a plain loop do it?</strong> If you need one model, a few tools and a step
              cap, stay with the direct SDK. There is less to learn and less to break.
            </li>
            <li>
              <strong>Is the hard part your data?</strong> If most of the work is loading,
              chunking and retrieving documents, a retrieval-focused library saves real time.
            </li>
            <li>
              <strong>Do you need control flow?</strong> Branches, loops with state, retries,
              pausing for human approval and resuming later are where graph-style tools pay off.
            </li>
            <li>
              <strong>Do you need observability?</strong> Tracing and evaluation hooks matter once
              the agent is in production. Check what each option gives you.
            </li>
            <li>
              <strong>What is your cloud and model setup?</strong> Some kits fit certain ecosystems
              more smoothly than others.
            </li>
          </ul>
          <Callout tone="warn">
            Abstraction has a price. When a framework hides the prompt it sends or the loop it runs,
            a bad answer becomes hard to explain. Make sure you can print the exact messages that
            reach the model. If you cannot, pick another tool.
          </Callout>
          <Callout tone="tip">
            Keep your tool functions plain and framework-independent. Then moving between a manual
            loop and any framework is a small change, not a rewrite.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Learn the agent loop first. Frameworks are shortcuts, not a replacement for understanding.",
    "Direct SDKs give control, LangChain and LangGraph give breadth and flow control, LlamaIndex and Haystack centre on retrieval.",
    "A manual loop with tools, error handling and a step cap fits in about thirty lines.",
    "A step cap turns an open-ended risk into a worst-case cost you can calculate.",
    "Pick a framework for the specific work it removes, and keep tools framework-independent.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which approach is the best starting point for a first agent?",
      options: [
        "The largest framework available",
        "A multi-agent system with five roles",
        "A hand-written loop around the provider SDK",
        "No tools at all",
      ],
      answer: 2,
      explain: "Writing the loop yourself shows you every message, which makes later framework choices informed.",
    },
    {
      kind: "mcq",
      q: "Which need most strongly suggests a graph-style tool such as LangGraph?",
      options: [
        "One question, one answer",
        "Branching flows with retries and a pause for human approval",
        "Counting tokens in a string",
        "Writing a system prompt",
      ],
      answer: 1,
      explain: "Stateful control flow with branches, retries and resumable steps is what graph-based tools are built for.",
    },
    {
      kind: "mcq",
      q: "What is the main risk of a framework that hides the messages it sends to the model?",
      options: [
        "It makes the model slower to download",
        "It stops you using tools",
        "It makes bad answers hard to diagnose",
        "It changes the model's training data",
      ],
      answer: 2,
      explain: "If you cannot see the exact prompt, you cannot tell whether the fault is in the prompt, tools or model.",
    },
    {
      kind: "text",
      q: "Illustrative: an agent has a step cap of 10, averages 2,000 input tokens per call, and input costs $2 per million tokens. What is the worst-case input cost per run in dollars?",
      format: "*.**",
      accept: ["0.04", "$0.04", ".04"],
      explain: "10 × 2,000 = 20,000 tokens. 20,000 ÷ 1,000,000 × 2 = $0.04.",
    },
  ],
};

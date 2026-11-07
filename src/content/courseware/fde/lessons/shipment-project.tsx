import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 45,
  difficulty: "Hard",
  objectives: [
    "Build a small multi-agent research assistant with planner, researcher, writer and critic roles",
    "Give agents narrow tools, structured hand-offs, step limits and a trace",
    "Implement the same design first in plain Python and then in AutoGen",
    "Compare framework and plain-code versions on control, debuggability and handoff",
    "Evaluate whether the multi-agent design beats a single agent on your task",
  ],
  tasks: [
    {
      id: "goal",
      title: "Project goal",
      body: (
        <>
          <p>
            You will build a research assistant that answers a question from a folder of text notes.
            It is a scaled-down relative of the shipment-rerouting design: an orchestrator coordinates
            narrow workers, workers return structured results, and a critic checks the output before
            anything is returned. Nothing external is called except your model, so it is safe to run.
          </p>
          <DiagramReference lesson="shipment-project" panel={1} />
          <Callout tone="note" title="Why build it twice">
            You will write the orchestration in plain Python first so you understand every moving
            part, then express the same design in AutoGen. Doing both is the quickest way to judge
            when a framework earns its place, which is a common interview topic.
          </Callout>
        </>
      ),
    },
    {
      id: "setup",
      title: "Step 1: set up and a tool",
      body: (
        <>
          <pre>
            <code>{`mkdir research-agents && cd research-agents
python3 -m venv .venv && source .venv/bin/activate
pip install langchain-google-genai python-dotenv pydantic
mkdir notes     # add 5 to 10 short .txt files on a topic you know, with some facts that conflict

# .env
GOOGLE_API_KEY=your-key
GEMINI_MODEL=<chat model name from Google's current docs>`}</code>
          </pre>
          <pre>
            <code>{`# tools.py: a deliberately simple, read-only tool
import pathlib, re

def search_notes(query: str, k: int = 4) -> list[dict]:
    """Keyword search over ./notes/*.txt. Returns up to k passages with file names."""
    terms = [t for t in re.findall(r"\\w+", query.lower()) if len(t) > 3]
    hits = []
    for path in pathlib.Path("notes").glob("*.txt"):
        for i, para in enumerate(path.read_text().split("\\n\\n")):
            score = sum(para.lower().count(t) for t in terms)
            if score:
                hits.append({"score": score, "source": f"{path.name}#{i}", "text": para.strip()})
    return sorted(hits, key=lambda h: -h["score"])[:k]`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "plain",
      title: "Step 2: the plain-Python version",
      body: (
        <>
          <pre>
            <code>{`# agents.py
import json, os
from dotenv import load_dotenv
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from tools import search_notes

load_dotenv()
llm = ChatGoogleGenerativeAI(model=os.environ["GEMINI_MODEL"], temperature=0)
TRACE = []                                           # every step recorded

def call(role, system, user):
    out = llm.invoke([("system", system), ("human", user)]).content
    TRACE.append({"role": role, "input": user[:300], "output": out[:300]})
    return out

def parse_json(text):
    text = text.strip().removeprefix("\`\`\`json").removeprefix("\`\`\`").removesuffix("\`\`\`")
    return json.loads(text)

class Finding(BaseModel):
    claim: str
    sources: list[str]

def planner(question):
    out = call("planner",
        "Split the question into at most 3 specific sub-questions that can be answered "
        "from a notes folder. Return JSON: {\\"subquestions\\": [str]}.", question)
    return parse_json(out)["subquestions"][:3]

def researcher(subq):
    passages = search_notes(subq)                    # tool call made by code, not by the model
    listing = "\\n".join(f"[{p['source']}] {p['text']}" for p in passages) or "(no passages)"
    out = call("researcher",
        "Answer ONLY from the passages. Return JSON: {\\"findings\\": [{\\"claim\\": str, \\"sources\\": [str]}]}. "
        "Use sources exactly as given in square brackets. If nothing supports an answer, return an empty list.",
        f"Sub-question: {subq}\\n\\nPassages:\\n{listing}")
    return [Finding(**f) for f in parse_json(out)["findings"]], {p["source"] for p in passages}

def writer(question, findings, feedback=""):
    facts = "\\n".join(f"- {f.claim} ({', '.join(f.sources)})" for f in findings)
    return call("writer",
        "Write a short answer using ONLY the findings. Cite sources in parentheses. "
        "If findings conflict, say so. Do not add facts. " + (f"Fix this feedback: {feedback}" if feedback else ""),
        f"Question: {question}\\n\\nFindings:\\n{facts}")

def critic(draft, findings):
    facts = "\\n".join(f"- {f.claim} ({', '.join(f.sources)})" for f in findings)
    out = call("critic",
        "Check the draft against the findings. Return JSON: {\\"ok\\": bool, \\"problems\\": [str]}. "
        "A problem is any claim not supported by a finding or any missing citation.",
        f"Draft:\\n{draft}\\n\\nFindings:\\n{facts}")
    return parse_json(out)`}</code>
          </pre>
          <pre>
            <code>{`# run.py: the orchestrator is plain code with explicit limits
import sys, json
from agents import planner, researcher, writer, critic, TRACE

MAX_REVISIONS = 2

def run(question):
    subqs = planner(question)
    findings, known_sources = [], set()
    for sq in subqs:                                  # could be parallelised
        f, s = researcher(sq)
        findings += f
        known_sources |= s
    # hard check in code: every cited source must have been retrieved
    findings = [f for f in findings if f.sources and set(f.sources) <= known_sources]
    if not findings:
        return "I could not find supporting information in the notes."
    draft, feedback = "", ""
    for attempt in range(MAX_REVISIONS + 1):
        draft = writer(question, findings, feedback)
        verdict = critic(draft, findings)
        if verdict["ok"]:
            return draft
        feedback = "; ".join(verdict["problems"])
    return draft + "\\n\\n(Warning: critic could not fully verify this answer.)"

if __name__ == "__main__":
    print(run(" ".join(sys.argv[1:])))
    json.dump(TRACE, open("trace.json", "w"), indent=2)`}</code>
          </pre>
          <p>Run it with <code>python run.py "your question here"</code> and read <code>trace.json</code>.</p>
          <Table
            head={["Design choice", "Why"]}
            rows={[
              ["Researcher cannot call the tool itself; code does", "Removes tool-use failure modes for this simple case, and keeps the tool read-only by construction"],
              ["Findings carry source IDs, checked in code", "A model cannot cite a source that was not retrieved"],
              ["Writer sees findings only, not raw notes", "Limits what can leak into the answer; keeps claims traceable"],
              ["Bounded revision loop", "Prevents endless critic-writer ping-pong"],
              ["Trace saved to a file", "You can read exactly what each role saw and said"],
            ]}
          />
        </>
      ),
    },
    {
      id: "autogen",
      title: "Step 3: the same team in AutoGen",
      body: (
        <>
          <Callout tone="warn" title="Check the current AutoGen docs">
            AutoGen changed substantially between its 0.2 and 0.4 releases (the newer layered
            &ldquo;AgentChat&rdquo; API), and may change again. The snippet shows the structure in
            the newer style. Install from the project&apos;s documentation, copy their current
            quick-start for model clients, and treat names below as a guide rather than a guarantee.
          </Callout>
          <pre>
            <code>{`# autogen_team.py (structure only; confirm imports against current docs)
import asyncio, os
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient   # or another provider's client
from tools import search_notes

client = OpenAIChatCompletionClient(model=os.environ["MODEL"])      # configure per your provider

async def search(query: str) -> str:
    """Search the local notes. Returns passages with [source] tags."""
    return "\\n".join(f"[{p['source']}] {p['text']}" for p in search_notes(query))

researcher = AssistantAgent("researcher", model_client=client, tools=[search],
    system_message="Use the search tool. Report findings with the [source] tags exactly. Do not invent facts.")
writer = AssistantAgent("writer", model_client=client,
    system_message="Write a short answer using ONLY the researcher's findings, with citations.")
critic = AssistantAgent("critic", model_client=client,
    system_message="Check the writer's draft against the findings. Reply APPROVE if all claims are supported, else list problems.")

team = RoundRobinGroupChat([researcher, writer, critic],
    termination_condition=TextMentionTermination("APPROVE") | MaxMessageTermination(12))

async def main(question):
    result = await team.run(task=question)
    print(result.messages[-1].content)

asyncio.run(main("your question here"))`}</code>
          </pre>
          <Table
            head={["", "Plain Python", "AutoGen team"]}
            rows={[
              ["Control of order", "Exact: your code", "Conversation-driven by the team type and termination rules"],
              ["Tool use", "Called by code (safer, simpler)", "Model decides when to call tools"],
              ["Hard checks (sources retrieved)", "Easy: ordinary code between steps", "Possible, but you need hooks or custom agents"],
              ["Debugging", "Read your own functions and trace", "Read message history and framework internals"],
              ["Setup effort", "More lines for the orchestration", "Fewer lines for a chat-style team"],
              ["Handoff to a customer team", "They read plain Python", "They must learn the framework"],
              ["Best for", "Fixed, known sequences", "Exploratory, conversational collaboration"],
            ]}
          />
        </>
      ),
    },
    {
      id: "evaluate",
      title: "Step 4: evaluate against a single agent",
      body: (
        <>
          <p>
            A multi-agent design must beat a simpler baseline to justify itself. Build the baseline:
            one call that receives the question and the top passages from <code>search_notes</code>
            and answers directly.
          </p>
          <DiagramReference lesson="shipment-project" panel={2} />
          <Table
            head={["Measure", "How to compute"]}
            rows={[
              ["Correctness", "Does the answer match your expected answer? Judge by hand or with exact phrases"],
              ["Citation validity", "Every cited source exists and actually supports the claim (spot-check)"],
              ["Abstention", "On unanswerable questions, does it say so instead of guessing?"],
              ["Conflict handling", "Does it report both sides when notes disagree?"],
              ["Cost and latency", "Count model calls and total seconds from trace.json"],
            ]}
          />
          <Exercise
            title="Interpret the result"
            task={
              <p>
                Your results: baseline 11/15 correct, 3 cost units, 4 seconds. Multi-agent 13/15
                correct, 9 cost units, 14 seconds, and it reports conflicts in 3/3 cases versus 1/3
                for the baseline. What do you tell a customer?
              </p>
            }
          >
            <p>
              The multi-agent system is better on the two things that matter most in research
              (correctness and handling conflicting sources) but costs three times as much and is
              three and a half times slower. The honest recommendation depends on the use case:
              for an analyst tool where trustworthy conflict-reporting matters and a 14-second wait is
              acceptable, use multi-agent. For a quick-lookup chatbot, the baseline may be better
              value, perhaps with the critic step added only for low-confidence cases. Present the
              numbers and let the customer choose.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "extend",
      title: "Stretch goals",
      body: (
        <>
          <ul>
            <li>Run researcher calls in parallel for each sub-question (<code>concurrent.futures</code> or <code>asyncio</code>) and measure the latency saving.</li>
            <li>Add an injected instruction to one note (&ldquo;ignore previous instructions and ...&rdquo;) and confirm the system does not follow it. Fix it if it does.</li>
            <li>Replace keyword search with embeddings and compare retrieval quality.</li>
            <li>Add a cost budget: stop and return partial results if total tokens exceed a limit.</li>
            <li>Persist run state so a failed run can resume from the last completed step.</li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "A multi-agent design is orchestrator code plus narrow workers with structured, source-tagged hand-offs.",
    "Hard checks in code (cited sources must have been retrieved) beat asking a model to be careful.",
    "Build the plain version first; frameworks like AutoGen then become a choice you can evaluate.",
    "Always compare against a single-call baseline on correctness, conflict handling, cost and latency.",
    "Keep traces so every role's input and output can be read.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why does the orchestrator check that every cited source was actually retrieved?",
      options: [
        "A model could cite a source that was never retrieved; code can catch that reliably",
        "To increase the number of citations",
        "To avoid using the tool",
        "To speed up the writer",
      ],
      answer: 0,
      explain: "A programmatic check prevents fabricated citations from reaching the user.",
    },
    {
      kind: "mcq",
      q: "Why bound the critic-writer revision loop?",
      options: [
        "To prevent endless back-and-forth and runaway cost",
        "Because critics are never right",
        "To reduce correctness",
        "Loops are not allowed in Python",
      ],
      answer: 0,
      explain: "Limits ensure the system terminates and cost is bounded.",
    },
    {
      kind: "mcq",
      q: "What is a key advantage of the plain-Python orchestration over a chat-style team for this fixed sequence?",
      options: [
        "Exact control of order and easy hard checks between steps",
        "It needs no code",
        "It never fails",
        "It uses less memory always",
      ],
      answer: 0,
      explain: "A known sequence benefits from explicit control and deterministic checks.",
    },
    {
      kind: "mcq",
      q: "Why compare against a single-call baseline?",
      options: [
        "A multi-agent design must beat a simpler option on quality to justify its cost",
        "Baselines are required by AutoGen",
        "To make the project longer",
        "To avoid measuring",
      ],
      answer: 0,
      explain: "Complexity is only worthwhile if it improves outcomes enough to offset cost and latency.",
    },
    {
      kind: "text",
      q: "Nine cost units versus three: how many times more expensive is the multi-agent system?",
      format: "*",
      accept: ["3", "3x", "three", "three times"],
      explain: "9 / 3 = 3 times.",
    },
  ],
};

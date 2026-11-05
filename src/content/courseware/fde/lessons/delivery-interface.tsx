import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Flow, Layers } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 16,
  difficulty: "Easy",
  objectives: [
    "Choose the lightest interface that lets a reviewer see the value in a minute",
    "Build a review screen that shows evidence and supports quick decisions",
    "Handle loading, empty, error and low-confidence states",
    "Avoid time sinks: polish, custom components and unnecessary frameworks",
  ],
  tasks: [
    {
      id: "choose",
      title: "The lightest thing that demonstrates value",
      body: (
        <>
          <p>
            You are not building a product; you are making the value visible. The best interface is
            the one that gets a reviewer from running the project to understanding what it does in
            under a minute, with the least code.
          </p>
          <Table
            head={["Interface", "Time to build", "Best when", "Watch out"]}
            rows={[
              ["CLI with readable output", "Minutes", "Technical user; batch work", "Non-technical users will be lost"],
              ["Notebook", "Minutes", "Analysis and exploration", "Hard to run in a clean environment; keep a script too"],
              ["Streamlit or Gradio page", "30 to 60 min", "A person must review and decide; demos", "Extra dependency; keep it a thin shell"],
              ["Static HTML report", "30 to 60 min", "Read-only results for a manager", "No interactivity"],
              ["Small web app (framework)", "Hours", "The brief demands it", "Easy to burn the whole budget on UI"],
              ["Spreadsheet or CSV export", "Minutes", "Users already live in spreadsheets", "Limited evidence display"],
            ]}
          />
          <Callout tone="tip" title="The review screen is the high-value UI">
            If a person must confirm or correct outputs, a simple two-pane screen (the source on one
            side, the extracted result with accept and edit controls on the other) shows more
            judgment than any dashboard.
          </Callout>
        </>
      ),
    },
    {
      id: "review",
      title: "Designing a review screen",
      body: (
        <>
          <Figure caption="Anatomy of a review screen. Evidence beside the answer lets the user verify in seconds, and the controls make the common decision one click.">
            <Layers
              layers={[
                { title: "Header: progress and filters", note: "'12 of 40 reviewed'; filter to show only flagged or low-confidence items first.", tone: "amber" },
                { title: "Left pane: the source", note: "The original document or message with the relevant passages highlighted.", tone: "sky" },
                { title: "Right pane: the result", note: "Extracted fields or suggested answer, each with a confidence cue and an edit box.", tone: "lime" },
                { title: "Why this result", note: "A short reason or the evidence text, so the user does not have to hunt.", tone: "lime" },
                { title: "Actions", note: "Accept, edit and accept, flag for later; keyboard shortcuts for speed.", tone: "amber" },
              ]}
            />
          </Figure>
          <pre>
            <code>{`# app.py (Streamlit sketch: a review queue in about 30 lines)
import json, streamlit as st
items = json.load(open("out/results.json"))
if "i" not in st.session_state: st.session_state.i = 0
flagged_first = sorted(items, key=lambda x: x["confidence"])
item = flagged_first[st.session_state.i]

st.progress((st.session_state.i) / len(items), text=f"{st.session_state.i} of {len(items)} reviewed")
left, right = st.columns(2)
left.subheader("Source"); left.text_area("", item["source_text"], height=320, disabled=True)
right.subheader("Suggested")
for field, value in item["fields"].items():
    item["fields"][field] = right.text_input(field, value, key=f"{item['id']}-{field}")
right.caption(f"Confidence: {item['confidence']:.0%}. Evidence: {item['evidence']}")
c1, c2 = right.columns(2)
if c1.button("Accept"):
    save_decision(item, "accepted"); st.session_state.i += 1; st.rerun()
if c2.button("Flag"):
    save_decision(item, "flagged"); st.session_state.i += 1; st.rerun()`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "states",
      title: "States that separate demos from products",
      body: (
        <>
          <Table
            head={["State", "What to show", "Why"]}
            rows={[
              ["Loading", "A spinner with what is happening ('Reading 40 invoices...')", "Avoids a frozen screen"],
              ["Empty", "A message and the next step ('No invoices yet. Add files to data/sample')", "Prevents confusion"],
              ["Error", "What failed and what to do; never a raw stack trace", "Builds trust"],
              ["Low confidence", "A clear marker and a reason, sorted to the top", "Directs human attention"],
              ["Success", "Confirmation and the next item", "Keeps flow"],
            ]}
          />
          <Figure caption="The lifecycle of one item in the review queue. Every item ends in a recorded decision, which also becomes feedback data.">
            <Flow
              numbered
              steps={[
                { title: "Queued", note: "Sorted by confidence", tone: "sky" },
                { title: "Shown", note: "Source and suggestion side by side", tone: "lime" },
                { title: "Decided", note: "Accept, edit or flag", tone: "amber" },
                { title: "Recorded", note: "Stored with who and when", tone: "amber" },
                { title: "Learned from", note: "Edits feed the next evaluation", tone: "rose" },
              ]}
            />
          </Figure>
          <Exercise
            title="Spot the time sinks"
            task={
              <p>
                A candidate spent three hours building a React front end with custom charts and a
                login screen for an invoice-matching take-home with a six-hour limit. What went wrong,
                and what should they have built?
              </p>
            }
          >
            <p>
              <strong>What went wrong:</strong> half the budget went to parts that did not improve the
              evidence (login, custom charts), leaving less time for correctness, evaluation and
              documentation, which carry most of the score.
            </p>
            <p>
              <strong>What to build instead:</strong> a 45-minute Streamlit review page with the
              two-pane layout above, flagged items first, and a downloadable CSV of decisions. Mention
              authentication and a production front end in the README as next steps. The saved two
              hours go into the evaluation and the error analysis.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Choose the lightest interface that shows the value within a minute, and keep it a thin shell over tested logic.",
    "A two-pane review screen with evidence, confidence and one-click decisions demonstrates judgment.",
    "Handle loading, empty, error, low-confidence and success states.",
    "Avoid time sinks such as login, custom charts and heavy frameworks unless the brief demands them.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A person must confirm extracted results. Which interface is a strong, cheap choice?",
      options: [
        "A two-pane review page with source and suggestions",
        "A login screen",
        "A 3D chart",
        "A command-line only tool with raw JSON",
      ],
      answer: 0,
      explain: "Showing the source beside the suggestion lets the user verify quickly.",
    },
    {
      kind: "mcq",
      q: "Why sort low-confidence items first in a review queue?",
      options: [
        "They need human attention most",
        "To make the list longer",
        "They are always wrong",
        "It is alphabetical",
      ],
      answer: 0,
      explain: "Directing attention to uncertain items makes review efficient.",
    },
    {
      kind: "mcq",
      q: "What should an error state show?",
      options: [
        "What failed and what to do next, not a raw stack trace",
        "A stack trace",
        "A blank page",
        "Nothing",
      ],
      answer: 0,
      explain: "Clear, actionable errors build trust.",
    },
    {
      kind: "text",
      q: "In the review screen, what do the two panes show? (source and ...)",
      format: "******",
      accept: ["result", "suggestion", "the result", "the suggestion", "extracted result", "output"],
      explain: "The source on one side and the suggested result on the other.",
    },
  ],
};

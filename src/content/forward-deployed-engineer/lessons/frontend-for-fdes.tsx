import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Explain the roles of HTML, CSS, JavaScript and React in a small internal tool",
    "Build a data-driven component with state and a fetch",
    "Decide when a quick UI is worth building during an engagement",
  ],
  tasks: [
    {
      id: "why",
      title: "Why FDEs build UIs",
      body: (
        <>
          <p>
            A model or pipeline that nobody can see or touch does not convince anyone. A simple
            screen that lets the customer's operator review and approve results often decides
            whether a pilot becomes a purchase. FDEs build review queues, dashboards and admin
            tools quickly, and they do not need to be design experts to do it.
          </p>
          <Table
            head={["Layer", "Job", "Know"]}
            rows={[
              ["HTML", "Structure and meaning", "Semantic tags, forms, labels, tables"],
              ["CSS", "Layout and appearance", "Flexbox, grid, spacing, responsive rules"],
              ["JavaScript", "Behaviour", "DOM events, fetch, promises, modules"],
              ["React", "Component-based UI", "Props, state, effects, lists, forms"],
            ]}
          />
        </>
      ),
    },
    {
      id: "react",
      title: "A small React component",
      body: (
        <>
          <p>
            Most internal tools are a list from an API plus an action. The pattern below is the
            core of it.
          </p>
          <pre>
            <code>{`import { useEffect, useState } from "react";

type Item = { id: string; vendor: string; amount: number; status: string };

export function ReviewQueue() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/invoices?status=needs_review")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(setItems)
      .catch((e) => setError(String(e)));
  }, []);

  async function approve(id: string) {
    await fetch(\`/api/invoices/\${id}/approve\`, { method: "POST" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (error) return <p role="alert">Could not load: {error}</p>;
  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>
          {i.vendor}: {i.amount}
          <button onClick={() => approve(i.id)}>Approve</button>
        </li>
      ))}
    </ul>
  );
}`}</code>
          </pre>
          <Callout tone="note">
            Always handle loading, empty and error states. A demo that shows a blank screen when
            the API is slow looks broken to a customer.
          </Callout>
        </>
      ),
    },
    {
      id: "judgment",
      title: "Keep it quick and useful",
      body: (
        <>
          <ul>
            <li>
              <strong>Use a component library</strong> (such as shadcn/ui or Material UI) instead
              of hand-styling every control.
            </li>
            <li>
              <strong>Show the evidence.</strong> For AI output, display the source document,
              confidence and a one-click correction. Trust grows when users can check.
            </li>
            <li>
              <strong>Design for the operator's speed.</strong> Keyboard shortcuts and bulk actions
              matter more than polish.
            </li>
            <li>
              <strong>Keep accessibility basics:</strong> labels, focus order, contrast.
            </li>
            <li>
              <strong>Know when not to build.</strong> If an existing tool can host the workflow,
              integrate there instead of adding another screen to learn.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "A simple UI often turns a hidden pipeline into a convincing, usable product.",
    "HTML gives structure, CSS layout, JavaScript behaviour, React reusable components.",
    "Handle loading, empty and error states, and show evidence next to AI output.",
    "Use component libraries and build only when no existing tool fits.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "In React, what do you use to hold a value that changes and re-renders the component?",
      options: ["A global variable", "State (useState)", "A CSS class", "A comment"],
      answer: 1,
      explain: "State changes trigger a re-render so the UI reflects the new value.",
    },
    {
      kind: "mcq",
      q: "Why show the source document next to an AI-extracted field?",
      options: [
        "To fill the screen",
        "So users can verify it and build trust",
        "To slow the page down",
        "It is required by HTML",
      ],
      answer: 1,
      explain: "Visible evidence lets reviewers check and correct, which drives adoption of AI features.",
    },
    {
      kind: "mcq",
      q: "Which states should a data-fetching component always handle?",
      options: [
        "Only success",
        "Loading, empty, error and success",
        "Only error",
        "None; the browser handles them",
      ],
      answer: 1,
      explain: "Real networks are slow and fail. Handling all four states avoids blank or crashing screens.",
    },
  ],
};

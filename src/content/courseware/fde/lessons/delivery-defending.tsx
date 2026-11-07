import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 18,
  difficulty: "Medium",
  objectives: [
    "Run a presentation and defence session of your take-home calmly and clearly",
    "Answer challenges with the acknowledge, reason, adapt pattern",
    "Distinguish a probing question from an attack and respond to each appropriately",
    "Admit gaps and mistakes gracefully",
    "Prepare a list of the questions you are most likely to be asked",
  ],
  tasks: [
    {
      id: "format",
      title: "What the session is",
      body: (
        <>
          <p>
            After submission, many companies hold a 45 to 60 minute session where you present your
            solution and the interviewers ask about it. It tests whether you really built and
            understood it, how you reason, and how you handle challenge. It is the closest simulation
            of a customer review you will get.
          </p>
          <DiagramReference lesson="delivery-defending" panel={1} />
        </>
      ),
    },
    {
      id: "pattern",
      title: "The answer pattern: acknowledge, reason, adapt",
      body: (
        <>
          <p>
            Most challenges are a request to see how you think. A reliable shape keeps you steady:
          </p>
          <ol>
            <li><strong>Acknowledge</strong> the point: it shows you listened.</li>
            <li><strong>Reason</strong> from the constraints you had and the evidence you gathered.</li>
            <li><strong>Adapt</strong>: say what you would change given the new information.</li>
          </ol>
          <DiagramReference lesson="delivery-defending" panel={2} />
        </>
      ),
    },
    {
      id: "types",
      title: "Types of challenge and how to respond",
      body: (
        <>
          <Table
            head={["Challenge", "What they want to know", "Response"]}
            rows={[
              ["'Why did you choose X?'", "Was it deliberate?", "Choice, alternative, reason, revisit condition"],
              ["'What would break first at 100x?'", "Do you understand scale?", "Name the bottleneck with a reason, and the fix"],
              ["'How do you know it works?'", "Evidence or hope?", "Evaluation numbers, sample size, limits"],
              ["'This seems over-engineered.'", "Can you take criticism and justify?", "Agree where fair; justify what earns its place; offer to simplify"],
              ["'Show me where this logic is.'", "Did you write it?", "Navigate your own code confidently"],
              ["'What would you do with another day?'", "Priorities", "Top two items with reasons, tied to the biggest risk"],
              ["'I think this is wrong.'", "Composure and honesty", "Check, and either explain with evidence or concede and fix"],
            ]}
          />
          <Callout tone="tip" title="Probing is not attacking">
            Interviewers ask hard questions to learn how you think, not to defeat you. Treat each as a
            small design conversation. If you disagree, do it with evidence and curiosity: &ldquo;I
            see it differently because of X; what am I missing?&rdquo;
          </Callout>
        </>
      ),
    },
    {
      id: "gaps",
      title: "Admitting gaps gracefully",
      body: (
        <>
          <ul>
            <li><strong>Say what you do not know</strong> plainly, then reason toward an answer: &ldquo;I have not used that service; I would approach it by...&rdquo;</li>
            <li><strong>Own mistakes quickly:</strong> &ldquo;You are right; that is a bug. The cause is X and the fix is Y.&rdquo; Offer to fix it live if there is time.</li>
            <li><strong>Do not bluff.</strong> Interviewers usually know the answer, and bluffing costs more trust than a gap.</li>
            <li><strong>Do not over-apologise.</strong> State it, correct it and move on.</li>
          </ul>
          <Exercise
            title="Prepare your defence list"
            task={
              <p>
                Write the six questions you would least like to be asked about your own take-home, and
                a two-line answer plan for each.
              </p>
            }
          >
            <p>
              A good list targets real weaknesses. Examples and answer plans:
            </p>
            <ol>
              <li><strong>&ldquo;Is 40 examples enough?&rdquo;</strong> No, not for strong claims; it indicates direction, and the interval is wide. I would grow the set to 300 with a second labeller.</li>
              <li><strong>&ldquo;Why this model?&rdquo;</strong> It met the target on my set at the lowest cost; I compared two. I would re-run if prices or quality change.</li>
              <li><strong>&ldquo;What if the PDF is a bad scan?&rdquo;</strong> It is flagged as low confidence and routed to review; 4 of 6 scans were caught that way.</li>
              <li><strong>&ldquo;Where is the injection risk?&rdquo;</strong> Invoice text goes into the prompt; output is schema-validated and grounded, and the model has no tools, so injection cannot trigger actions.</li>
              <li><strong>&ldquo;How would you deploy this?&rdquo;</strong> Containerised service behind SSO, a queue for bursts, secrets in a vault, monitoring of accuracy and cost.</li>
              <li><strong>&ldquo;What would you cut?&rdquo;</strong> The OCR fallback if time were tighter; flagging scans for review achieves most of the safety benefit.</li>
            </ol>
            <p>
              Rehearse them aloud. Many sessions are decided by how well you handle the two or three
              questions you feared.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "The defence session tests ownership, understanding and composure: present briefly, then discuss and extend.",
    "Answer challenges with acknowledge, reason, adapt, and state what would change your decision.",
    "Treat probing as a design conversation; disagree with evidence and curiosity.",
    "Admit gaps and mistakes plainly, do not bluff, and prepare answers to the questions you fear most.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "An interviewer challenges a design choice. What is the best first move?",
      options: [
        "Acknowledge the point, then reason from the constraints",
        "Argue immediately",
        "Abandon the design at once",
        "Stay silent",
      ],
      answer: 0,
      explain: "Acknowledging shows you listened; reasoning shows deliberate choices.",
    },
    {
      kind: "mcq",
      q: "You discover a bug while they probe. What should you do?",
      options: [
        "Own it, explain the cause and propose or make the fix",
        "Deny it",
        "Change the subject",
        "Blame the data",
      ],
      answer: 0,
      explain: "Quick ownership builds trust more than defensiveness.",
    },
    {
      kind: "mcq",
      q: "What should you do about a topic you do not know?",
      options: [
        "Say so and reason toward an answer from principles",
        "Bluff confidently",
        "Refuse to answer",
        "Ask to end the interview",
      ],
      answer: 0,
      explain: "Honest reasoning is valued over bluffing.",
    },
    {
      kind: "text",
      q: "What three-word pattern does the lesson recommend for answering challenges? (acknowledge, reason, ...)",
      format: "*****",
      accept: ["adapt"],
      explain: "Acknowledge, reason, adapt.",
    },
  ],
};

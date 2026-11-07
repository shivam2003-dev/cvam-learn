import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 14,
  difficulty: "Easy",
  objectives: [
    "Plan a three-to-five-minute walk-through that shows value, reasoning and honesty",
    "Write a short script with a clear structure and timing",
    "Record and edit with simple tools and good audio",
    "Avoid the mistakes that make walk-throughs hard to watch",
  ],
  tasks: [
    {
      id: "purpose",
      title: "What the video is for",
      body: (
        <>
          <p>
            Many take-homes ask for a short recorded walk-through. Reviewers use it to see the
            solution run without setting it up, and to hear you reason. It is your chance to show
            communication skill, the thing a written README cannot fully do. Keep it short: most
            reviewers stop caring after five minutes.
          </p>
          <DiagramReference lesson="delivery-walkthrough-video" panel={1} />
        </>
      ),
    },
    {
      id: "script",
      title: "Script it, then speak it naturally",
      body: (
        <>
          <p>
            Write a script of bullet points, not sentences, so you sound natural. Practise twice
            aloud, timing yourself.
          </p>
          <pre>
            <code>{`SCRIPT (about 4:30)

0:00  Hi, I'm ___. This is Invoice Checker. Finance clerks spend ~8 minutes per invoice
      keying fields and matching purchase orders. This reads the invoice and matches it,
      so the clerk only handles exceptions.

0:25  [DEMO] Run on the sample folder. Show the review page: 31 matched, 9 flagged.
      Open a matched one: source on the left, fields on the right, evidence highlighted.
      Open a flagged one: amount mismatch, shown with the PO line. Accept, edit, next.

1:45  [DIAGRAM] Extract text (OCR fallback) -> model returns JSON with evidence ->
      code validates and grounds it -> rules match -> review page.
      Key choice: the model reads, code decides. Totals and matching are plain code.

3:00  [EVIDENCE] 40 hand-labelled invoices: all fields right on 82%. Biggest failure:
      scanned pages. I added OCR fallback and a low-confidence flag; 4 of 6 scans now
      get flagged instead of silently wrong.

3:50  [LIMITS] Small test set, one labeller, no auth. Production would need SSO,
      a queue and drift monitoring. Trade-off: files not a database, for simple setup.

4:20  Thanks. README has the assumptions and the run instructions.`}</code>
          </pre>
          <Table
            head={["Habit", "Why"]}
            rows={[
              ["Show the product before the architecture", "Value first; architecture explains it"],
              ["Use a real input, not a toy", "Credibility"],
              ["Show one failure on purpose", "Honesty and error handling in one move"],
              ["Say numbers aloud", "'Eight minutes down to three seconds' sticks"],
              ["Keep the cursor still while talking", "Easier to follow"],
              ["Say what you chose not to build", "Judgment"],
            ]}
          />
        </>
      ),
    },
    {
      id: "record",
      title: "Recording and editing",
      body: (
        <>
          <ul>
            <li><strong>Audio matters more than video.</strong> Use a headset or a quiet room; do a ten-second test recording and listen on headphones.</li>
            <li><strong>Prepare the screen.</strong> Close notifications and unrelated tabs, enlarge fonts (terminal and browser at 125 to 150%), use a clean desktop and set the demo data in advance.</li>
            <li><strong>Use a simple recorder</strong> such as the built-in screen recorder, a meeting tool&apos;s recording or a free screen-capture app. Face video is optional unless the brief requests it.</li>
            <li><strong>Do not edit heavily.</strong> Re-record rather than splice. A trim at the start and end is enough.</li>
            <li><strong>Add captions or a short description</strong> if it is easy, since some reviewers watch without sound.</li>
            <li><strong>Check the file:</strong> plays on another device, correct permissions on the link, and the link works in a private window.</li>
          </ul>
          <Callout tone="warn" title="Check what is visible on screen">
            Before recording, make sure no secrets, tokens, personal emails or other clients&apos; data
            are visible in terminals, browser tabs or notifications. Use a demo environment and test
            accounts.
          </Callout>
        </>
      ),
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      body: (
        <>
          <Table
            head={["Mistake", "Effect", "Fix"]}
            rows={[
              ["Starts with setup instructions", "Loses the reviewer in 30 seconds", "Start with the problem and the demo"],
              ["Reads the README aloud", "Dull; no added information", "Show, do not read"],
              ["Ten-minute video", "Not watched to the end", "Aim for 4 to 5; cut ruthlessly"],
              ["Demo breaks live", "Hurts confidence", "Rehearse; keep a recorded fallback"],
              ["No evidence or numbers", "Claims unsupported", "Show the evaluation result"],
              ["Apologetic tone", "Undermines credibility", "State limits plainly, without apology"],
              ["Mumbling and rushing", "Hard to follow", "Slow slightly; pause between sections"],
            ]}
          />
          <Exercise
            title="Trim the script"
            task={
              <p>
                Your first recording is 9 minutes. List four things to cut or shorten to reach five.
              </p>
            }
          >
            <ol>
              <li>Remove setup and installation talk; the README covers it.</li>
              <li>Cut the code tour. Keep one diagram and one key design decision.</li>
              <li>Demo one normal case and one flagged case instead of five normal ones.</li>
              <li>Shorten the evaluation to the headline number and the largest failure group, and move details to the README.</li>
            </ol>
            <p>
              Then re-record from the script rather than editing the long version.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Keep the walk-through to about five minutes: problem, live demo, how it works, evidence, limits and next steps.",
    "Script in bullets, rehearse aloud, show real inputs and one deliberate failure, and say numbers out loud.",
    "Prioritise audio, prepare the screen, avoid heavy editing and check the link works for others.",
    "Never reveal secrets or personal data on screen, and cut anything that is not value, reasoning or evidence.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Where should the live demo appear in the walk-through?",
      options: [
        "Early, right after a short problem statement",
        "At the very end",
        "Never",
        "After a long architecture tour",
      ],
      answer: 0,
      explain: "Attention is highest early; show value first.",
    },
    {
      kind: "mcq",
      q: "Why show one failure on purpose?",
      options: [
        "It demonstrates honesty and how the system handles errors",
        "To fill time",
        "To confuse reviewers",
        "It is required",
      ],
      answer: 0,
      explain: "A handled failure builds trust more than a flawless-looking demo.",
    },
    {
      kind: "mcq",
      q: "What should you check on screen before recording?",
      options: [
        "That no secrets or personal data are visible",
        "The desktop wallpaper",
        "The battery icon",
        "Nothing",
      ],
      answer: 0,
      explain: "Leaked keys or personal data in a video are a serious mistake.",
    },
    {
      kind: "text",
      q: "About how many minutes should a take-home walk-through last? (a number)",
      format: "*",
      accept: ["5", "five", "4 to 5", "3 to 5"],
      explain: "Around five minutes keeps reviewers watching.",
    },
  ],
};

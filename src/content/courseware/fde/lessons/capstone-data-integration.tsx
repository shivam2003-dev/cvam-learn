import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 360,
  difficulty: "Hard",
  objectives: [
    "Complete a six-hour data integration take-home from brief to submission",
    "Produce a clean, reconciled dataset from three inconsistent sources",
    "Expose the result through a small API and a report, with tests and an evaluation of data quality",
    "Write the README, trade-offs and a short walk-through as you would for a real submission",
    "Self-review against the rubric from this chapter",
  ],
  tasks: [
    {
      id: "brief",
      title: "The brief",
      body: (
        <>
          <Callout tone="note" title="Brief: Harbor Retail customer data">
            Harbor Retail sells through a website, physical stores and a marketplace. Customer
            information lives in three exports: <code>web_customers.json</code> (website accounts),
            <code> store_loyalty.csv</code> (in-store loyalty sign-ups) and{" "}
            <code>marketplace_orders.csv</code> (orders from a marketplace, each with a buyer email
            and shipping name). Marketing wants one clean customer list, with duplicates identified,
            plus the total spend per customer, so they can plan a loyalty campaign. They also need to
            know how reliable the list is. Build a solution a marketing analyst can use. Budget: about
            six hours. Use any language. Do not use real personal data.
          </Callout>
          <p>
            This capstone is open-ended on purpose, as real briefs are. Because you do not have the
            files, create realistic <strong>synthetic data</strong> yourself in the first hour:
            around 500 web customers, 400 loyalty members and 1,500 marketplace orders, with a
            deliberate mixture of problems.
          </p>
          <Table
            head={["Problem to plant", "Example"]}
            rows={[
              ["Same person, different spelling", "'Jon Smith' / 'Jonathan Smith'; 'smith.jon@x.com' / 'jon.smith@x.com'"],
              ["Email case and whitespace", "' Ana@Example.com '"],
              ["Missing and placeholder values", "Empty emails, 'N/A', '0000-00-00' dates"],
              ["Inconsistent formats", "Phone numbers, date formats (03/04/2026), country names vs codes"],
              ["Exact duplicates and near-duplicates", "Same loyalty member entered twice"],
              ["Fan-out risk", "Many orders per customer; totals must not multiply"],
              ["Currency", "A few orders in EUR; most in USD"],
              ["Conflicting data", "Different addresses for the same email across sources"],
            ]}
          />
        </>
      ),
    },
    {
      id: "plan",
      title: "Plan and scope",
      body: (
        <>
          <DiagramReference lesson="capstone-data-integration" panel={1} />
          <ol>
            <li>Write the <strong>assumptions log</strong> first: what makes two records the same customer (email is the primary key; name and postcode as supporting evidence), how conflicts resolve (most recent wins, recorded), and how currencies are handled (detect and flag; convert only with an explicit rate).</li>
            <li>Decide the <strong>MVP</strong>: clean unified customer table, duplicate groups with confidence, spend per customer, a data quality report, a small API or HTML report.</li>
            <li>List what you will <strong>describe, not build</strong>: scheduled refresh, authentication, a database.</li>
          </ol>
        </>
      ),
    },
    {
      id: "build",
      title: "Build guide",
      body: (
        <>
          <DiagramReference lesson="capstone-data-integration" panel={2} />
          <pre>
            <code>{`# match.py: a defensible, explainable matching approach
import re, difflib

def norm_email(e):  return (e or "").strip().lower()
def norm_name(n):   return re.sub(r"[^a-z ]", "", (n or "").lower()).strip()

def same_customer(a, b):
    """Return (is_match, confidence, reason). Email is the strongest key."""
    ea, eb = norm_email(a["email"]), norm_email(b["email"])
    if ea and ea == eb:
        return True, 0.99, "same email"
    name_sim = difflib.SequenceMatcher(None, norm_name(a["name"]), norm_name(b["name"])).ratio()
    same_post = a.get("postcode") and a.get("postcode") == b.get("postcode")
    if name_sim > 0.9 and same_post:
        return True, 0.8, f"similar name ({name_sim:.2f}) and same postcode"
    if name_sim > 0.9:
        return False, 0.4, "similar name only: needs review"     # do not auto-merge
    return False, 0.0, "no evidence"`}</code>
          </pre>
          <ul>
            <li>Block candidate pairs (for example by postcode or email domain) rather than comparing every pair.</li>
            <li>Auto-merge only at high confidence; write medium-confidence pairs to a <code>review_pairs.csv</code>.</li>
            <li>Record survivorship rules: which source wins for each field, and why.</li>
            <li>Compute spend from order lines at the order level; assert row counts around joins.</li>
          </ul>
        </>
      ),
    },
    {
      id: "evaluate",
      title: "Evaluate your matching",
      body: (
        <>
          <p>
            You planted the duplicates, so you know the truth. Use that to measure the matcher.
          </p>
          <Table
            head={["Metric", "How", "Interpretation"]}
            rows={[
              ["Pair precision", "Of pairs you merged, the share that are truly the same", "Low means wrong merges (harmful)"],
              ["Pair recall", "Of true duplicate pairs, the share you found", "Low means missed duplicates (inefficient)"],
              ["Review rate", "Share of pairs sent for human review", "Workload for the analyst"],
              ["Row reconciliation", "input = unified + rejected + merged", "Nothing lost silently"],
              ["Spend check", "Sum of per-customer spend equals sum of source orders (by currency)", "No fan-out or loss"],
            ]}
          />
          <Callout tone="warn" title="Planted truth makes this easy; real data does not">
            On real data you would not know the truth. State this limitation in your README and
            describe how you would build a labelled sample with the analyst.
          </Callout>
          <Exercise
            title="Interpret your results"
            task={
              <p>
                Your matcher reaches precision 99% and recall 71%, with 6% of pairs sent to review.
                The analyst says wrong merges are much worse than missed duplicates. Is this good? What
                do you change?
              </p>
            }
          >
            <p>
              Given the analyst&apos;s preference, precision at 99% is appropriate. Recall of 71% means
              many duplicates are missed, but those are lower-harm. Look at the missed pairs: likely
              nicknames and email changes. Improve recall without hurting precision by adding a
              nickname dictionary, using phone numbers as additional evidence, and moving
              medium-confidence pairs to review rather than ignoring them (which is the 6% already).
              Report the trade-off and let the analyst choose the review workload they can handle.
            </p>
          </Exercise>
        </>
      ),
    },
    {
      id: "submit",
      title: "Package, then self-review",
      body: (
        <>
          <p>Your submission should contain:</p>
          <Table
            head={["Item", "Contents"]}
            rows={[
              ["Repository", "src/, tests/, eval/, data/synthetic/, Makefile, requirements.txt, .env.example if needed"],
              ["README", "What and why; quick start; demo; architecture diagram; data quality results; matching evaluation; assumptions; trade-offs; limitations; production path"],
              ["Outputs", "unified_customers.csv, duplicate_groups.csv, review_pairs.csv, rejected.csv, ledger.csv, quality_report.md"],
              ["Interface", "Small read-only API with pagination or a static HTML report for the analyst"],
              ["Video", "Five-minute walk-through following the script from the earlier lesson"],
            ]}
          />
          <p>
            Then score yourself on the rubric from the practice lesson. Anything below 3 on
            understanding, function, evidence or communication needs another pass. A
            suggested self-check: could a marketing analyst use the output tomorrow, and could a
            reviewer trust the numbers on the first page of your README?
          </p>
        </>
      ),
    },
  ],
  takeaways: [
    "Create realistic synthetic data with planted problems so you can measure your solution honestly.",
    "Define 'same customer' explicitly, merge only at high confidence, and send uncertain pairs for review.",
    "Reconcile rows and totals, avoid fan-out joins, and record every change in a ledger.",
    "Evaluate matching with precision, recall and review rate, tuned to the user's preference on error cost.",
    "Package with a README, outputs, tests, an interface and a short walk-through, then self-review.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "The analyst says wrong merges are far worse than missed duplicates. What should you prioritise?",
      options: [
        "High precision, sending uncertain pairs to review",
        "High recall at any cost",
        "Merging everything",
        "Ignoring duplicates",
      ],
      answer: 0,
      explain: "Error costs drive the operating point: protect precision and route uncertainty to humans.",
    },
    {
      kind: "mcq",
      q: "Why compute spend at the order level before joining to customers?",
      options: [
        "To avoid a fan-out join multiplying totals",
        "To make the code shorter",
        "Customers have no orders",
        "It avoids using email",
      ],
      answer: 0,
      explain: "Joining one-to-many first repeats parent values and inflates sums.",
    },
    {
      kind: "mcq",
      q: "What does row reconciliation verify here?",
      options: [
        "That every input row is unified, rejected or merged, with none lost",
        "That the file is pretty",
        "That emails are unique",
        "That the API is fast",
      ],
      answer: 0,
      explain: "It proves nothing was silently dropped.",
    },
    {
      kind: "text",
      q: "Of 100 pairs you merged, 99 were truly the same person. What is the pair precision?",
      format: "**%",
      accept: ["99", "99%", "0.99"],
      explain: "Precision = correct merges / all merges = 99/100 = 99%.",
    },
  ],
};

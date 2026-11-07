import { DiagramReference } from "@/components/FdeVisuals";
import { Callout, Table } from "@/components/Lesson";
import { Exercise } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 22,
  difficulty: "Medium",
  objectives: [
    "Profile an unfamiliar dataset quickly and find its main problems",
    "Clean and normalise data with every change recorded and reconcilable",
    "Detect and resolve duplicates and join problems without inflating totals",
    "Validate output with checks that would catch silent errors",
    "Report data quality honestly in the deliverable",
  ],
  tasks: [
    {
      id: "profile",
      title: "Profile before you clean",
      body: (
        <>
          <p>
            Messy data is the heart of FDE work, and take-homes love it. The first hour should be
            spent looking at the data, not transforming it. You are looking for the shapes of
            problems, so that you clean on purpose.
          </p>
          <DiagramReference lesson="takehome-messy-data" panel={1} />
          <pre>
            <code>{`import pandas as pd

df = pd.read_csv("orders.csv", dtype=str)           # read everything as text first
print(df.shape); print(df.head(10))
print(df.isna().mean().sort_values(ascending=False).head(10))          # null rate per column
print(df["order_id"].duplicated().sum(), "duplicate order_ids")
for col in ["status", "currency", "country"]:
    print(col, df[col].str.strip().str.lower().value_counts(dropna=False).head(15))
print(pd.to_datetime(df["created_at"], errors="coerce").isna().sum(), "unparseable dates")
print(df["total"].str.replace(r"[^\\d.\\-]", "", regex=True).astype(float).describe())`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "clean",
      title: "Clean with a ledger",
      body: (
        <>
          <p>
            The key habit: <strong>never change data without recording what you changed</strong>. A
            reviewer should be able to reconcile the output to the input: every input row is either
            kept, corrected, merged or rejected, and you can say how many of each.
          </p>
          <Table
            head={["Problem", "Typical fix", "Record"]}
            rows={[
              ["Mixed case and whitespace", "Strip and normalise case", "Count of values changed"],
              ["Inconsistent categories ('NY', 'New York')", "Mapping table, reviewed", "The mapping file, unmapped values listed"],
              ["Dates in multiple formats", "Parse with explicit formats; flag ambiguous ones (03/04/2026)", "Rows with ambiguity, the assumption used"],
              ["Currency symbols, thousands separators", "Parse to numbers and a separate currency column", "Rows with unparseable amounts"],
              ["Missing values", "Fill only when justified (a default); otherwise leave null and flag", "Per-column null counts before and after"],
              ["Impossible values (negative age, future dates)", "Reject or flag; do not clip silently", "Rejected rows with reason"],
              ["Hidden nulls ('N/A', '-', 0)", "Convert to proper nulls", "Counts converted"],
            ]}
          />
          <pre>
            <code>{`ledger = []                                             # (rule, rows_affected)

def step(name, df, fn):
    before = len(df)
    out = fn(df)
    ledger.append({"step": name, "rows_in": before, "rows_out": len(out)})
    return out

df = step("strip_and_lower_status", df, lambda d: d.assign(status=d["status"].str.strip().str.lower()))
df = step("drop_exact_duplicates", df, lambda d: d.drop_duplicates())
rejected = df[df["total"].isna() | (df["total"] < 0)]
df = step("reject_invalid_total", df, lambda d: d.drop(rejected.index))
rejected.assign(reason="invalid total").to_csv("out/rejected.csv", index=False)
pd.DataFrame(ledger).to_csv("out/ledger.csv", index=False)

# Reconciliation check that must always hold
assert n_input == len(df) + len(rejected) + n_merged, "rows unaccounted for"`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "dupes",
      title: "Duplicates and joins",
      body: (
        <>
          <p>
            Two traps account for most wrong answers in data take-homes: undetected duplicates and
            fan-out joins.
          </p>
          <DiagramReference lesson="takehome-messy-data" panel={2} />
          <ul>
            <li><strong>Exact duplicates:</strong> identical rows; drop and count.</li>
            <li><strong>Near duplicates:</strong> the same entity with different spelling (&ldquo;ACME Ltd&rdquo; and &ldquo;Acme Limited&rdquo;). Normalise (case, punctuation, suffixes), then compare with a similarity measure; surface uncertain groups for review rather than auto-merging.</li>
            <li><strong>Join checks:</strong> assert expected key uniqueness before joining, and assert the row count afterwards.</li>
            <li><strong>Survivorship:</strong> when merging duplicates, decide which value wins (most recent, most complete) and record the rule.</li>
          </ul>
          <pre>
            <code>{`assert customers["customer_id"].is_unique, "customers must be unique before join"
joined = orders.merge(customers, on="customer_id", how="left", validate="many_to_one")
assert len(joined) == len(orders), "join changed the row count"`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "validate",
      title: "Validate and report",
      body: (
        <>
          <Table
            head={["Check", "Example", "Catches"]}
            rows={[
              ["Row reconciliation", "input = output + rejected + merged", "Silently lost rows"],
              ["Totals comparison", "Sum of cleaned order totals vs sum from the source", "Parsing and fan-out errors"],
              ["Uniqueness", "No duplicate primary keys in output", "Failed deduplication"],
              ["Referential integrity", "Every order has a customer", "Bad joins and orphans"],
              ["Range checks", "Dates within expected window; amounts positive", "Parsing errors"],
              ["Spot checks", "Ten random rows traced from raw to clean", "Subtle mapping bugs"],
            ]}
          />
          <Callout tone="tip" title="Put a data quality section in your README">
            Include a small table: rows in, rows out, rows rejected with top reasons, duplicates
            merged, columns with notable null rates, and assumptions made. It signals care and answers
            the reviewer&apos;s first question about your data.
          </Callout>
          <Exercise
            title="Find the bug"
            task={
              <p>
                You join 1,200 orders to their 3,100 line items and then compute revenue per customer
                by summing <code>order_total</code>. Revenue looks about 2.5 times higher than finance
                expects. What went wrong, and what checks would have caught it?
              </p>
            }
          >
            <p>
              <strong>Cause:</strong> a fan-out join. After joining orders to lines, each
              order&apos;s total repeats once per line (an average of about 2.6 lines per order), so
              summing it multiplies revenue.
            </p>
            <p>
              <strong>Fix:</strong> sum <code>line_amount</code> across lines, or aggregate lines to
              order level before joining, or deduplicate to one row per order before summing.
            </p>
            <p>
              <strong>Checks that catch it:</strong> asserting row counts after the join (1,200 became
              3,100); using <code>validate=&quot;one_to_many&quot;</code> consciously; and a totals
              comparison against the source system&apos;s overall revenue figure.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Profile first: shape, missing, uniqueness, ranges, relationships and outliers.",
    "Clean with a ledger so every row is accounted for: kept, corrected, merged or rejected.",
    "Beware fan-out joins and duplicates; assert uniqueness before and row counts after joins.",
    "Validate with reconciliation, totals comparison, integrity and range checks, and include a data quality section in the README.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Why read all columns as text during profiling?",
      options: [
        "To avoid silent type coercion hiding problems such as hidden nulls and odd formats",
        "To save memory",
        "Because numbers cannot be profiled",
        "To speed up parsing",
      ],
      answer: 0,
      explain: "Auto-typing can convert or drop odd values silently; reading as text shows them.",
    },
    {
      kind: "mcq",
      q: "Revenue is 2.5 times too high after joining orders to line items. The likely cause is:",
      options: [
        "A fan-out join repeating order totals per line",
        "Missing data",
        "A time-zone error",
        "A slow disk",
      ],
      answer: 0,
      explain: "One-to-many joins repeat parent values, inflating sums.",
    },
    {
      kind: "mcq",
      q: "Which reconciliation must always hold?",
      options: [
        "Input rows = output + rejected + merged",
        "Output rows = input rows always",
        "Rejected rows = 0",
        "Merged rows = input rows",
      ],
      answer: 0,
      explain: "Every input row must be accounted for.",
    },
    {
      kind: "mcq",
      q: "How should uncertain near-duplicate groups be handled?",
      options: [
        "Surface them for review instead of auto-merging",
        "Merge all of them",
        "Delete all of them",
        "Ignore them",
      ],
      answer: 0,
      explain: "Wrong merges are hard to undo; uncertain cases need human judgment.",
    },
    {
      kind: "text",
      q: "A join of 1,200 orders and 3,100 lines produces 3,100 rows. What word describes this multiplication of parent rows? (two words)",
      format: "***-***",
      accept: ["fan-out", "fan out", "fanout"],
      explain: "Fan-out occurs when a one-to-many join repeats the parent row for each child.",
    },
  ],
};

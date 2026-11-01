import { Callout, Formula, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 13,
  difficulty: "Medium",
  objectives: [
    "Define true positive, false positive, true negative and false negative",
    "Calculate precision, recall and false positive rate from counts",
    "Explain why a very accurate detector can still bury analysts in false alarms",
    "Describe how tuning trades one kind of error for the other",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            Every detection tool, from antivirus to a log rule to an email filter, makes mistakes.
            It either raises an alert when nothing is wrong, or stays quiet when something is. You
            cannot judge a tool, or tune it, until you can count both kinds of mistake and say what
            each one costs.
          </p>
          <p>
            Think of a smoke alarm. If it screams every time you make toast, you will remove the
            battery. If it never sounds during a real fire, it is worse than useless. A good alarm
            balances the two, and so does a good detection rule.
          </p>
        </>
      ),
    },
    {
      id: "four-outcomes",
      title: "The four possible outcomes",
      body: (
        <>
          <p>
            For each event, two things are true or false: was it actually malicious, and did the
            tool alert? That gives four cells, often called a confusion matrix.
          </p>
          <Table
            head={["", "Tool alerts", "Tool stays quiet"]}
            rows={[
              [<strong key="m">Actually malicious</strong>, "True positive (TP): a real threat caught", "False negative (FN): a real threat missed"],
              [<strong key="b">Actually benign</strong>, "False positive (FP): a false alarm", "True negative (TN): normal activity left alone"],
            ]}
          />
          <p>The costs differ:</p>
          <ul>
            <li>
              <strong>False positive:</strong> wastes analyst time, can block a legitimate user or
              server, and slowly teaches people to ignore alerts (alert fatigue).
            </li>
            <li>
              <strong>False negative:</strong> an attacker goes unseen. This is usually the more
              dangerous error because nobody knows it happened.
            </li>
          </ul>
          <p>
            Memory trick: the second word says what the tool said about the event (positive means
            alert), and the first word says whether the tool was right.
          </p>
        </>
      ),
    },
    {
      id: "metrics",
      title: "The numbers that matter",
      body: (
        <>
          <Table
            head={["Metric", "Formula", "Question it answers"]}
            rows={[
              ["Precision", "TP ÷ (TP + FP)", "Of the alerts I got, how many were real?"],
              ["Recall (detection rate)", "TP ÷ (TP + FN)", "Of all real attacks, how many did I catch?"],
              ["False positive rate", "FP ÷ (FP + TN)", "Of all normal events, how many raised a false alarm?"],
              ["Accuracy", "(TP + TN) ÷ total", "How often was the tool right overall?"],
            ]}
          />
          <Formula>precision = TP ÷ (TP + FP)        recall = TP ÷ (TP + FN)</Formula>
          <p>
            Worked example with illustrative numbers. A rule watches 100,000 events in a day. Only
            100 are truly malicious. The rule flags 90 of those and also flags 500 harmless
            events.
          </p>
          <pre>
            <code>{`TP = 90                 (malicious, flagged)
FN = 100 - 90 = 10      (malicious, missed)
FP = 500                (harmless, flagged)
TN = 99,900 - 500 = 99,400   (harmless, ignored)

Recall    = 90 / (90 + 10)  = 90 / 100  = 90%
Precision = 90 / (90 + 500) = 90 / 590  = 15.3%
FP rate   = 500 / (500 + 99,400) = 500 / 99,900 = 0.5%
Accuracy  = (90 + 99,400) / 100,000 = 99.49%`}</code>
          </pre>
          <p>
            Look closely. The rule is 99.49% accurate and catches 90% of attacks, yet fewer than
            one alert in six is real (15.3%). Analysts see 590 alerts, and 500 of them are noise.
          </p>
        </>
      ),
    },
    {
      id: "base-rate",
      title: "Why accuracy misleads: the base rate problem",
      body: (
        <>
          <p>
            Attacks are rare compared with normal activity. In the example only 0.1% of events are
            malicious. When the thing you hunt is that rare, even a tiny false positive rate
            produces many more false alarms than real hits, because it applies to an enormous
            pile of harmless events.
          </p>
          <p>
            A tool that never alerts would have accuracy of 99.9% on this data (99,900 of 100,000
            correct), yet it catches nothing. That is why defenders watch precision and recall
            instead of accuracy alone.
          </p>
          <Callout tone="note">
            This is a general result about rare events, not a flaw in any one product. It is also
            why low-noise, high-confidence rules matter so much in a security operations centre.
          </Callout>
        </>
      ),
    },
    {
      id: "tuning",
      title: "Tuning: you cannot zero both errors",
      body: (
        <>
          <p>
            Most detectors have a threshold. Make it stricter and you get fewer false positives
            but more false negatives. Make it looser and the reverse happens.
          </p>
          <pre>
            <code>{`# Illustrative rule: possible password guessing
# Alert when one source has 10 or more failed logins for one account within 5 minutes.

failed_login window=5m by source_ip, username  count >= 10   -> alert

# Raise to 30  : fewer false alarms, may miss slow guessing
# Lower to 5   : catches more, but forgetful users will trigger it
# Example log line to match:
# 2026-11-02T09:14:07Z sshd[2211]: Failed password for alice from 192.0.2.44 port 52114 ssh2`}</code>
          </pre>
          <Table
            head={["Tuning move", "Effect on false positives", "Effect on false negatives"]}
            rows={[
              ["Stricter threshold", "Down", "Up"],
              ["Looser threshold", "Up", "Down"],
              ["Allow-list known-good behaviour (such as a vulnerability scanner)", "Down", "Slightly up, if the allow-list is abused"],
              ["Add context (only alert if the source is also new or external)", "Down", "Roughly flat when context is chosen well"],
            ]}
          />
          <p>
            Where you set the line depends on the stakes. For a bank&apos;s core payment system a
            missed attack is catastrophic, so you tolerate more false alarms and staff for them.
            For a low-value test server you favour fewer alerts. Tracking the share of alerts that
            turn out to be real, rule by rule, shows which ones to fix or retire.
          </p>
          <Callout tone="tip">
            Treat every false positive as a bug report for the rule. Record why it fired, then
            refine the rule or add a narrow exception. Never silence an alert without writing down
            the reason.
          </Callout>
          <Callout tone="warn">
            Test detections only against your own lab or data you are authorised to use. Do not
            generate attack traffic against systems you do not own.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Every detector has four outcomes: true positive, false positive, true negative and false negative.",
    "False positives waste time and cause alert fatigue; false negatives let attackers through unseen.",
    "Precision measures alert quality; recall measures how many attacks you catch.",
    "Accuracy misleads when attacks are rare, so check precision and recall.",
    "Tightening a rule trades one error type for the other; tune with context and written reasons.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "A rule stays silent while an attacker is active on a host. What is this outcome called?",
      options: ["True positive", "False positive", "True negative", "False negative"],
      answer: 3,
      explain: "A real threat was missed, so the tool produced a false negative.",
    },
    {
      kind: "mcq",
      q: "Which metric answers: of all the alerts raised, how many were real attacks?",
      options: ["Precision", "Recall", "Accuracy", "False positive rate"],
      answer: 0,
      explain: "Precision is TP divided by (TP + FP), the share of alerts that were true.",
    },
    {
      kind: "text",
      q: "A rule raises 100 alerts. 30 are real attacks (TP = 30) and 70 are false positives. What is the precision as a percentage?",
      format: "**",
      accept: ["30", "30%", "30 percent", "0.3"],
      explain: "Precision = 30 ÷ (30 + 70) = 30 ÷ 100 = 30%.",
    },
    {
      kind: "text",
      q: "A rule catches 20 real attacks and misses 5. What is its recall as a percentage?",
      format: "**",
      accept: ["80", "80%", "80 percent", "0.8"],
      explain: "Recall = TP ÷ (TP + FN) = 20 ÷ 25 = 80%.",
    },
  ],
};

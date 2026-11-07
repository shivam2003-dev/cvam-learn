import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const bank = JSON.parse(readFileSync(new URL("../../src/content/exams/gcp-pca/question-bank.json", import.meta.url), "utf8"));
assert.equal(bank.length, 253, "Every source question must be represented");
assert.equal(new Set(bank.map((q) => q.id)).size, 253, "IDs must be unique");
const retired = /Stackdriver|stack driver|gsutil|Container Registry|G Suite|Cloud Datalab|Cloud Dataprep|Cloud IoT Core|Deployment Manager|gcloud alpha|Google Container Engine|Anthos|second-generation|failover replica|Cloud Functions/i;
for (const [index, q] of bank.entries()) {
  assert.equal(q.sourceQuestion, index + 1);
  assert.equal(q.source, "pdf");
  assert.equal(q.updatedAt, "2026-11-07");
  assert.ok(q.section >= 1 && q.section <= 6, q.id);
  assert.ok(q.stem.length > 40 && q.explain.length > 80, q.id);
  assert.ok(q.options.length >= 4 && q.options.length <= 8, q.id);
  assert.equal(new Set(q.options).size, q.options.length, q.id);
  assert.ok(q.options.every((o) => typeof o === "string" && o.trim().length > 0), q.id);
  assert.ok(q.answer.length > 0, q.id);
  assert.equal(q.multi, q.answer.length > 1, q.id);
  assert.equal(new Set(q.answer).size, q.answer.length, q.id);
  assert.ok(q.answer.every((i) => Number.isInteger(i) && i >= 0 && i < q.options.length), q.id);
  assert.ok(!retired.test([q.stem, ...q.options, q.explain].join(" ")), `Outdated terminology: ${q.id}`);
  assert.ok(!/Option [ABCD]$|Dockerfile below|following code|following stack trace|technical requirements on Google Cloud/.test(q.stem), `Missing source context: ${q.id}`);
  for (const ref of q.references) {
    const url = new URL(ref.url);
    assert.equal(url.protocol, "https:");
    assert.ok(["cloud.google.com", "docs.cloud.google.com"].includes(url.hostname), q.id);
  }
}
// Guard against the source key conflicts that motivated the editorial review.
for (const n of [76, 252]) assert.match(bank[n - 1].options[bank[n - 1].answer[0]], /exponential backoff/i);
assert.match(bank[82].options[bank[82].answer[0]], /serverless VPC access/i);
assert.match(bank[131].options[bank[131].answer[0]], /regional Cloud SQL high availability/i);
assert.match(bank[184].options[bank[184].answer[0]], /readiness/i);
assert.match(bank[215].options[bank[215].answer[0]], /Artifact Registry/);
assert.match(bank[248].options[bank[248].answer[0]], /batch get/i);
console.log(`Validated ${bank.length} questions: contiguous source IDs, complete choices, scoring keys, explanations, current terminology, and reference domains.`);

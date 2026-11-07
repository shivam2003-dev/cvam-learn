import assert from "node:assert/strict";
import { gcpPcaExam } from "../../src/content/exams/gcp-pca/exam";
import { isCorrect, optionOrder, scoreAttempt, shuffled, type Active } from "../../src/lib/examStore";

assert.equal(gcpPcaExam.questions.length, 313);
assert.equal(gcpPcaExam.questions.filter((q) => q.source === "pdf").length, 253);
const multi = gcpPcaExam.questions.find((q) => q.sourceQuestion === 3)!;
assert.equal(isCorrect(multi, [...multi.answer].reverse()), true);
assert.equal(isCorrect(multi, [multi.answer[0]]), false);
assert.equal(isCorrect(multi, []), false);
assert.equal(isCorrect(multi, [...multi.answer, 5]), false);
for (const q of gcpPcaExam.questions) {
  const order = optionOrder(q, 20261107);
  assert.deepEqual([...order].sort((a, b) => a - b), q.options.map((_, i) => i));
  assert.deepEqual(optionOrder(q, 20261107), order);
}
const original = gcpPcaExam.questions.find((q) => !q.source)!;
const run: Active = {
  id: "scoring-verification", mode: "exam", seed: 1,
  qids: [multi.id, original.id], index: 0,
  answers: { [multi.id]: multi.answer }, flagged: [], checked: [], spent: {},
  startedAt: 1000, limitSec: 240,
};
const result = scoreAttempt(gcpPcaExam, run, 61000);
assert.equal(result.total, 2);
assert.equal(result.correct, 1);
assert.equal(result.answered, 1);
assert.equal(result.percent, 50);
assert.equal(result.durationSec, 60);
assert.equal(result.bySection.reduce((n, s) => n + s.total, 0), 2);
assert.equal(result.byTopic.reduce((n, t) => n + t.correct, 0), 1);
const pool = gcpPcaExam.questions.filter((q) => q.source === "pdf");
assert.deepEqual(shuffled(pool, 11), shuffled(pool, 11));
assert.equal(new Set(shuffled(pool, 11).map((q) => q.id)).size, 253);
console.log("Verified combined-bank scoring, unanswered questions, multi-select exact matches, report totals, and deterministic question/option shuffling.");

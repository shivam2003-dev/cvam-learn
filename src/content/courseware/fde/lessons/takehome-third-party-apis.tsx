import { Callout, Table } from "@/components/Lesson";
import { Exercise, Figure, Graph, Sequence } from "@/components/Diagram";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 20,
  difficulty: "Medium",
  objectives: [
    "Read third-party API documentation efficiently and pick the endpoints you need",
    "Write a robust client with authentication, pagination, retries and timeouts",
    "Respect rate limits and handle errors by category",
    "Test API code without live keys using fakes and recorded responses",
    "Document API usage so a reviewer can run your solution safely",
  ],
  tasks: [
    {
      id: "read",
      title: "Reading API docs under time pressure",
      body: (
        <>
          <p>
            A common take-home step is &ldquo;enrich this data using the X API&rdquo;. You will not
            have time to read every page of documentation, so read in a fixed order and take notes:
          </p>
          <Table
            head={["Look for", "Why it matters", "Typical place"]}
            rows={[
              ["Authentication method", "Decides your first call", "Quick start, auth section"],
              ["The one or two endpoints you need", "Avoid reading everything", "API reference"],
              ["Pagination style", "Missing it silently truncates data", "List endpoints (cursor, page number, link headers)"],
              ["Rate limits", "Shapes your throttling", "Limits page, response headers"],
              ["Error format and codes", "For handling failures", "Errors section"],
              ["Sandbox or test mode", "Safe experiments without real effects", "Environments"],
              ["Versioning and deprecations", "Avoid building on something being removed", "Changelog"],
            ]}
          />
          <p>
            Try each endpoint with <code>curl</code> or a notebook cell before writing the client.
            Save a few real responses to a <code>fixtures/</code> folder; you will reuse them in tests
            and in a no-key demo mode.
          </p>
        </>
      ),
    },
    {
      id: "client",
      title: "A robust client in one file",
      body: (
        <>
          <pre>
            <code>{`# client.py
import os, time, random, requests

class ApiError(Exception): ...

class Client:
    def __init__(self, base_url, token=None, timeout=10, max_retries=4, min_interval=0.1):
        self.base, self.timeout, self.max_retries = base_url.rstrip("/"), timeout, max_retries
        self.session = requests.Session()
        self.session.headers["Authorization"] = f"Bearer {token or os.environ['API_TOKEN']}"
        self.min_interval, self._last = min_interval, 0.0

    def _throttle(self):
        wait = self.min_interval - (time.monotonic() - self._last)
        if wait > 0:
            time.sleep(wait)
        self._last = time.monotonic()

    def get(self, path, **params):
        for attempt in range(self.max_retries):
            self._throttle()
            try:
                r = self.session.get(f"{self.base}{path}", params=params, timeout=self.timeout)
            except (requests.Timeout, requests.ConnectionError):
                r = None
            if r is not None and r.status_code == 429:
                time.sleep(float(r.headers.get("Retry-After", 2 ** attempt)))      # honour the server
                continue
            if r is None or r.status_code >= 500:
                time.sleep(random.uniform(0, 2 ** attempt))                        # backoff with jitter
                continue
            if r.status_code >= 400:
                raise ApiError(f"{r.status_code}: {r.text[:200]}")                 # permanent: do not retry
            return r.json()
        raise ApiError("gave up after retries")

    def paginate(self, path, **params):
        cursor = None
        while True:
            page = self.get(path, **params, **({"cursor": cursor} if cursor else {}))
            yield from page["items"]
            cursor = page.get("next_cursor")
            if not cursor:
                return`}</code>
          </pre>
          <Figure caption="How the client treats each response class. Retrying the wrong failures wastes time or hammers the service.">
            <Sequence
              label="Sequence of one paginated call showing a 429 handled by waiting, a 500 handled by backoff, a 400 raised immediately and success returned"
              actors={[
                { id: "app", label: "Your code" },
                { id: "cli", label: "Client wrapper" },
                { id: "api", label: "Third-party API" },
              ]}
              messages={[
                { from: "app", to: "cli", text: "paginate('/customers')" },
                { from: "cli", to: "api", text: "GET page 1" },
                { from: "api", to: "cli", text: "429 Retry-After: 2", dashed: true },
                { from: "cli", to: "cli", text: "Wait 2 seconds, retry" },
                { from: "cli", to: "api", text: "GET page 1 (retry)" },
                { from: "api", to: "cli", text: "200 items + next_cursor", dashed: true },
                { from: "cli", to: "app", text: "Yield items; fetch next page lazily", dashed: true },
                { note: "A 400 or 404 is raised at once: retrying cannot fix a bad request.", over: ["cli", "api"] },
              ]}
            />
          </Figure>
        </>
      ),
    },
    {
      id: "test",
      title: "Testing without live keys",
      body: (
        <>
          <p>
            A reviewer may not have your API key, and live APIs change. Test against fakes and
            recorded responses, and give your project a <strong>demo mode</strong> that runs from
            fixtures.
          </p>
          <pre>
            <code>{`# tests/test_client.py
import json, pathlib
from client import Client, ApiError

FIX = pathlib.Path("fixtures")

class FakeResponse:
    def __init__(self, status, body, headers=None):
        self.status_code, self._body, self.headers, self.text = status, body, headers or {}, json.dumps(body)
    def json(self): return self._body

def test_retries_on_429_then_succeeds(monkeypatch):
    calls = [FakeResponse(429, {}, {"Retry-After": "0"}), FakeResponse(200, {"items": [1], "next_cursor": None})]
    c = Client("http://x", token="t", min_interval=0)
    monkeypatch.setattr(c.session, "get", lambda *a, **k: calls.pop(0))
    assert list(c.paginate("/things")) == [1]

def test_permanent_error_is_not_retried(monkeypatch):
    c = Client("http://x", token="t", min_interval=0)
    monkeypatch.setattr(c.session, "get", lambda *a, **k: FakeResponse(404, {"error": "no"}))
    try:
        c.get("/missing"); assert False
    except ApiError:
        pass`}</code>
          </pre>
          <Table
            head={["Technique", "Use"]}
            rows={[
              ["Fakes and monkeypatching", "Unit tests of retry and error logic"],
              ["Recorded fixtures", "Realistic response shapes; demo mode without keys"],
              ["Contract check", "A test that validates fixture responses against your expected schema, so API drift is noticed"],
              ["Sandbox calls (optional)", "One integration test, skipped when no key is present"],
            ]}
          />
        </>
      ),
    },
    {
      id: "good",
      title: "Good citizenship and documentation",
      body: (
        <>
          <ul>
            <li><strong>Cache</strong> repeated lookups to reduce calls and cost, and mention cache invalidation.</li>
            <li><strong>Batch</strong> when the API supports bulk endpoints.</li>
            <li><strong>Never log secrets.</strong> Redact tokens and personal data in logs.</li>
            <li><strong>Be explicit about side effects.</strong> A read-only integration is safer to run than one that writes. If you write, default to a dry run.</li>
            <li><strong>Document usage in the README:</strong> required environment variables, how to run in demo mode, rate limit assumptions, and what happens on failure.</li>
          </ul>
          <Figure caption="Where third-party calls sit in a small solution. Everything outside your boundary is untrusted and fallible, so it is wrapped, cached and tested with fakes.">
            <Graph
              label="Your application calls a wrapped client with cache and throttle which talks to the third-party API; tests use fakes and fixtures instead"
              cellW={200}
              cellH={100}
              nodeW={164}
              nodes={[
                { id: "app", label: "Your logic", sub: "Business rules", col: 0, row: 0, tone: "lime" },
                { id: "cli", label: "API client", sub: "Throttle, retry, cache", col: 1, row: 0, tone: "lime" },
                { id: "api", label: "Third-party API", sub: "Untrusted, fallible", col: 2, row: 0, tone: "rose" },
                { id: "fix", label: "Fixtures + fakes", sub: "Used in tests and demo mode", col: 1, row: 1, tone: "sky", shape: "db" },
              ]}
              edges={[
                { from: "app", to: "cli" },
                { from: "cli", to: "api", label: "HTTPS" },
                { from: "fix", to: "cli", dashed: true, label: "replaces in tests" },
              ]}
            />
          </Figure>
          <Callout tone="warn" title="Do not hammer a live API in a loop">
            A bug that sends thousands of requests can get your key blocked, cost real money or
            disrupt a service. Add a global request cap and test with small inputs first.
          </Callout>
          <Exercise
            title="Handle the pagination bug"
            task={
              <p>
                Your enrichment returns exactly 100 customers though the source lists 1,430. What do
                you check?
              </p>
            }
          >
            <ol>
              <li><strong>Pagination:</strong> a default page size of 100 and no loop over pages is the classic cause. Check the response for <code>next_cursor</code>, <code>next</code> link or a total count.</li>
              <li><strong>Loop termination:</strong> ensure the loop follows the cursor until it is empty, and does not stop on the first short page incorrectly.</li>
              <li><strong>Add a check:</strong> compare the count returned with the API&apos;s reported total (if provided), and log a warning on mismatch.</li>
              <li><strong>Add a test</strong> with a fixture of three pages to prevent regression.</li>
            </ol>
            <p>
              Exactly round numbers such as 100, 50 or 1,000 are a strong hint of silent truncation.
            </p>
          </Exercise>
        </>
      ),
    },
  ],
  takeaways: [
    "Read docs in a fixed order: auth, needed endpoints, pagination, limits, errors, sandbox, versioning, and save real responses as fixtures.",
    "A robust client has timeouts, throttling, retries with backoff and jitter, Retry-After handling, permanent-error handling and pagination.",
    "Test with fakes and fixtures, provide a no-key demo mode and avoid live calls in unit tests.",
    "Cache, batch, redact secrets, default to read-only or dry runs, and document variables and failure behaviour.",
    "Suspiciously round result counts often mean silent pagination truncation.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "You receive HTTP 404 from the API for a requested resource. How should the client treat it?",
      options: [
        "As a permanent error: raise it, do not retry",
        "Retry forever",
        "Retry quickly in a loop",
        "Ignore it",
      ],
      answer: 0,
      explain: "Retrying cannot fix a missing resource; surface the error.",
    },
    {
      kind: "mcq",
      q: "Why create a demo mode running from fixtures?",
      options: [
        "A reviewer without your key can still run and see the solution",
        "It makes the code slower",
        "It avoids tests",
        "It hides the API",
      ],
      answer: 0,
      explain: "Fixtures keep the project runnable without secrets.",
    },
    {
      kind: "mcq",
      q: "You get exactly 100 records from a source with 1,430. The most likely cause is:",
      options: [
        "Pagination not followed",
        "A network cable",
        "Too many columns",
        "A compiler bug",
      ],
      answer: 0,
      explain: "Default page sizes often produce round-number truncation.",
    },
    {
      kind: "mcq",
      q: "Which header tells you how long to wait after a 429?",
      options: ["Retry-After", "Content-Type", "Accept", "Host"],
      answer: 0,
      explain: "Retry-After states the minimum wait before trying again.",
    },
    {
      kind: "text",
      q: "What random component added to backoff prevents synchronised retries? (one word)",
      format: "******",
      accept: ["jitter"],
      explain: "Jitter spreads retries so clients do not stampede together.",
    },
  ],
};

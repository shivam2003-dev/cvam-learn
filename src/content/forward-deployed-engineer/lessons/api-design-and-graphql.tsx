import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 11,
  difficulty: "Medium",
  objectives: [
    "Design a REST API with clear resources, status codes and pagination",
    "Explain what GraphQL adds and when it is a good choice",
    "Make integrations safe with idempotency, versioning and good errors",
  ],
  tasks: [
    {
      id: "rest",
      title: "REST done well",
      body: (
        <>
          <p>
            An API is a contract between two systems and often between two teams who do not talk
            daily. A predictable contract saves hours at every integration.
          </p>
          <Table
            head={["Action", "Request", "Success status"]}
            rows={[
              ["List invoices", "GET /invoices?status=open&limit=50&cursor=abc", "200"],
              ["Read one", "GET /invoices/42", "200, or 404 if missing"],
              ["Create", "POST /invoices", "201 with Location header"],
              ["Replace or update", "PUT or PATCH /invoices/42", "200 or 204"],
              ["Delete", "DELETE /invoices/42", "204"],
            ]}
          />
          <ul>
            <li>Name resources with nouns, and use plural collections consistently.</li>
            <li>Use proper status codes: 400 bad input, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict, 429 rate limited, 5xx server fault.</li>
            <li>Paginate lists with cursors; never return unbounded results.</li>
            <li>Return errors as JSON with a stable code and a human message.</li>
          </ul>
          <pre>
            <code>{`{ "error": { "code": "invoice_not_found", "message": "No invoice with id 42" } }`}</code>
          </pre>
        </>
      ),
    },
    {
      id: "graphql",
      title: "GraphQL",
      body: (
        <>
          <p>
            <strong>GraphQL</strong> exposes one endpoint and a typed schema. The client asks for
            exactly the fields it wants, across related objects, in one request.
          </p>
          <pre>
            <code>{`query {
  customer(id: "7") {
    name
    orders(last: 3) { id total status }
  }
}`}</code>
          </pre>
          <Table
            head={["", "REST", "GraphQL"]}
            rows={[
              ["Fetching related data", "Several requests or custom endpoints", "One query"],
              ["Over/under-fetching", "Common", "Client picks fields"],
              ["Caching", "Simple with HTTP caches", "Needs more work"],
              ["Learning curve", "Low", "Higher (schema, resolvers)"],
              ["Best for", "Simple resources, public APIs", "Many clients, complex related data"],
            ]}
          />
          <Callout tone="note">
            Do not choose GraphQL because it is fashionable. If the customer already exposes REST
            and you need three endpoints, use REST. If you are building a UI over a dozen related
            sources, GraphQL can simplify it.
          </Callout>
        </>
      ),
    },
    {
      id: "safe",
      title: "Making integrations safe",
      body: (
        <>
          <ul>
            <li>
              <strong>Idempotency.</strong> A retried <code>POST</code> must not create two
              invoices. Accept an <code>Idempotency-Key</code> header and return the original
              result for repeats.
            </li>
            <li>
              <strong>Versioning.</strong> Put a version in the path (<code>/v1/</code>) or header
              and avoid breaking changes inside a version.
            </li>
            <li>
              <strong>Rate limits and retries.</strong> Respect <code>429</code> and{" "}
              <code>Retry-After</code>, and back off exponentially with jitter.
            </li>
            <li>
              <strong>Webhooks over polling.</strong> When the other side can call you, verify the
              signature and process asynchronously.
            </li>
            <li>
              <strong>Document with OpenAPI.</strong> A machine-readable spec gives you docs,
              mocks and client code.
            </li>
          </ul>
        </>
      ),
    },
  ],
  takeaways: [
    "Design REST around nouns, correct status codes, cursor pagination and JSON errors.",
    "GraphQL fits many clients and related data; REST is fine and simpler otherwise.",
    "Make calls safe with idempotency keys, versioning, backoff, signed webhooks and OpenAPI.",
  ],
  quiz: [
    {
      kind: "mcq",
      q: "Which status code means the client is being rate limited?",
      options: ["200", "404", "429", "500"],
      answer: 2,
      explain: "429 Too Many Requests; respect Retry-After and back off.",
    },
    {
      kind: "mcq",
      q: "Why add an Idempotency-Key to a POST that creates a payment?",
      options: [
        "To make it faster",
        "So a retry does not create a duplicate payment",
        "To encrypt the body",
        "To change the HTTP method",
      ],
      answer: 1,
      explain: "Network retries are normal. The key lets the server return the first result instead of acting twice.",
    },
    {
      kind: "mcq",
      q: "When is GraphQL most helpful?",
      options: [
        "Serving one fixed static file",
        "A UI that needs related data from many sources with flexible field selection",
        "Replacing every database",
        "Avoiding any schema",
      ],
      answer: 1,
      explain: "One typed query across related objects reduces round trips and over-fetching for complex clients.",
    },
  ],
};

import { Callout, Table } from "@/components/Lesson";
import type { Lesson } from "@/lib/types";

export const lesson: Lesson = {
  minutes: 12,
  difficulty: "Medium",
  objectives: [
    "List the main threats to an inference service",
    "Choose an isolation level that fits each tenant's risk",
    "Control where prompts and outputs are stored",
    "Prepare the evidence that an audit requires",
  ],
  tasks: [
    {
      id: "problem",
      title: "The problem it solves",
      body: (
        <>
          <p>
            People put sensitive things into prompts: source code, contracts, health details,
            passwords by accident. An inference service sees all of it in plain text, because a model
            has to read the input to answer. That makes it an attractive target and a heavy
            responsibility.
          </p>
          <p>
            Enterprise customers know this. Many won't sign a contract until you can explain who can
            see their data, how long you keep it, and how it's kept apart from other customers. So
            security is also a sales requirement.
          </p>
          <p>
            Think of a hotel. Guests share a building, but each has a locked room. The staff keep
            keycard logs. A master key exists, but its use is limited and recorded. You need the same
            three ideas: <strong>isolation</strong> between tenants, <strong>data handling</strong>{" "}
            rules, and an <strong>audit trail</strong> to prove it.
          </p>
        </>
      ),
    },
    {
      id: "threats",
      title: "What can go wrong",
      body: (
        <>
          <p>LLM serving adds a few specific risks to the usual web security list.</p>
          <Table
            head={["Threat", "Example", "Defense"]}
            rows={[
              ["Data leak through logs", "Full prompts sit in a debug log", "Log metadata by default, and restrict any content logs"],
              ["Cross-tenant cache leak", "One tenant learns another's prompt from a cached-prefix timing difference", "Separate caches per tenant"],
              ["Malicious model files", "Weights in a pickle format run code on load", "Use safetensors, and pin exact versions"],
              ["Stolen API key", "A leaked key runs up a bill", "Hash keys, set per-key limits, rotate keys"],
              ["Resource abuse", "Huge prompts tie up GPUs", "Token limits, rate limits, per-tenant quotas"],
              ["Data exfiltration", "A compromised pod sends data out", "Block outbound traffic by default"],
            ]}
          />
          <p>
            Prefix caches deserve attention. If a request from tenant B returns its first token
            quickly, it suggests the prefix was already cached, perhaps by tenant A. That's a
            <strong> timing side channel</strong>: nobody reads the cache directly, but the speed
            itself reveals something. Keep cache keys separate per tenant. Some engines, including
            vLLM, can take a salt per request to keep caches apart. Check your version's docs.
          </p>
        </>
      ),
    },
    {
      id: "isolation",
      title: "Levels of isolation",
      body: (
        <>
          <p>Stronger isolation costs more. Match it to the data's risk.</p>
          <Table
            head={["Level", "What's shared", "Strength"]}
            rows={[
              ["Shared process", "Everything: GPU, memory, engine", "Weakest, relies on software"],
              ["Separate containers", "Host kernel, often the GPU", "Medium, with strong policy"],
              ["Hardware GPU partitions", "Physical GPU, split by NVIDIA MIG on supported models", "Strong memory and compute separation"],
              ["Dedicated nodes", "Network and control plane", "Strong"],
              ["Dedicated cluster or VPC", "Only the provider", "Very strong, and costly"],
              ["Confidential computing", "Hardware keeps data encrypted while in use", "Strong against host-level access, with limited support"],
            ]}
          />
          <p>
            A shared process can be perfectly reasonable for low-risk, public data. A hospital will
            want something much stronger.
          </p>
          <Callout tone="warn">
            GPU time-slicing isn't a security boundary. It shares a GPU between workloads, and it
            doesn't give them the memory isolation that MIG does. Treat it as a way to use
            hardware better, and don't use it to separate tenants who don't trust each other.
          </Callout>
          <p>
            Lock down the network too. A model server needs to accept requests from the gateway, but
            it rarely needs to reach the internet. A default-deny policy limits what a compromised
            pod can do:
          </p>
          <pre>
            <code>{`apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: model-server
spec:
  podSelector:
    matchLabels:
      app: model-server
  policyTypes: ["Ingress", "Egress"]
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: gateway
      ports:
        - port: 8000
  egress: []    # no outbound traffic`}</code>
          </pre>
          <p>
            With <code>egress: []</code>, the pod can't reach anything, including DNS. Allow only
            what it truly needs, such as your own object storage for weights.
          </p>
        </>
      ),
    },
    {
      id: "data-handling",
      title: "Handling prompts and outputs",
      body: (
        <>
          <p>
            Follow a prompt through your system and list everywhere it lands. Most leaks come from
            copies nobody remembered.
          </p>
          <Table
            head={["Stage", "Control"]}
            rows={[
              ["In transit", "TLS at the edge and between internal services"],
              ["In memory", "Clear caches of a tenant's data on a schedule, and restrict host access"],
              ["At rest", "Encrypt disks and object storage, and manage keys carefully"],
              ["Logs and traces", "Don't log content by default, and redact if you must"],
              ["Retention", "Set a written deletion period, and automate it"],
              ["Training use", "Never train on customer data without explicit agreement"],
            ]}
          />
          <p>
            Many providers offer <strong>zero data retention</strong>, meaning prompts and outputs
            aren't stored once the response is done. If you promise that, check every system,
            including queues, traces and support dashboards.
          </p>
          <p>
            Logging less is also a storage win. Here's a calculation for 50 requests per second,
            kept for 90 days, using illustrative sizes:
          </p>
          <pre>
            <code>{`Metadata only, 500 bytes per request:
  50 × 500 = 25,000 bytes/s
  25,000 × 86,400 s = 2.16 GB per day
  2.16 × 90 days ≈ 194 GB

Full prompts and outputs, 20 KB per request:
  50 × 20,000 = 1,000,000 bytes/s
  1,000,000 × 86,400 s = 86.4 GB per day
  86.4 × 90 days ≈ 7.8 TB`}</code>
          </pre>
          <p>
            That's 7.8 TB of the most sensitive data you own, all in one searchable place. Don't
            create it unless you need it.
          </p>
        </>
      ),
    },
    {
      id: "compliance",
      title: "Compliance and audits",
      body: (
        <>
          <p>
            <strong>Compliance</strong> means meeting a known standard and proving that you do. Which
            ones apply depends on your customers and region.
          </p>
          <Table
            head={["Framework", "Focus", "Typically needed by"]}
            rows={[
              ["SOC 2", "An auditor's report on security controls", "B2B software customers, mostly in the US"],
              ["ISO 27001", "A certified security management system", "Enterprise customers worldwide"],
              ["GDPR", "Protection of personal data of people in the EU", "Anyone handling such data"],
              ["HIPAA", "Protected health information in the US", "Healthcare, with a business associate agreement"],
            ]}
          />
          <p>
            These frameworks aren't technical checklists. Auditors want evidence that your controls
            work over time. So build it as you go:
          </p>
          <ul>
            <li>An access log for who reached production and customer data.</li>
            <li>An audit record per request: request ID, tenant, model version, token counts and time.</li>
            <li>A history of deployments and who approved them.</li>
            <li>Regular access reviews, and proof you acted on them.</li>
            <li>A written and rehearsed incident response plan.</li>
          </ul>
          <p>
            Recording the model version pays off in a very practical way. When a customer asks why
            an output changed, you can answer. Keep the model supply chain traceable too: store the
            source, hash and license for each set of weights. Avoid <code>--trust-remote-code</code>{" "}
            unless you've read that code, since it runs Python files from the model repository.
          </p>
          <Callout tone="note">
            This lesson is an engineering overview, not legal advice. Work with your legal and
            security teams on what your contracts and regulators require.
          </Callout>
        </>
      ),
    },
  ],
  takeaways: [
    "Prompts are sensitive by default, and you handle them in plain text.",
    "Match isolation to risk, from a shared process up to dedicated clusters.",
    "Cached prefixes can leak information across tenants, so keep caches separate.",
    "Log metadata by default, set deletion periods, and track every copy of a prompt.",
    "Compliance needs evidence over time, so collect it from day one.",
  ],
  quiz: [
    {
      kind: "text",
      q: "Which weights format avoids the code execution risk of pickle files? One word.",
      format: "***********",
      accept: ["safetensors"],
      explain: "safetensors holds tensor data only, so loading a file doesn't run code from it.",
    },
    {
      kind: "text",
      q: "You log 1,000 bytes for each of 100 requests per second. How many GB is that per day? (A day has 86,400 seconds.)",
      format: "****",
      accept: ["8.64"],
      explain: "100 × 1,000 × 86,400 = 8,640,000,000 bytes, which is 8.64 GB.",
    },
    {
      kind: "mcq",
      q: "Tenant B notices that a prompt returns unusually fast and infers tenant A sent it. What's this called?",
      options: ["A timing side channel", "A cold start", "A cache eviction", "Load shedding"],
      answer: 0,
      explain: "The response speed itself leaks information, even with no direct access to the cache.",
    },
    {
      kind: "mcq",
      q: "Which should you log by default for each request?",
      options: [
        "The full prompt and output",
        "Metadata such as tenant, model version and token counts",
        "The customer's password",
        "The KV cache contents",
      ],
      answer: 1,
      explain: "Metadata gives you an audit trail without storing sensitive content.",
    },
  ],
};
